import React, { useEffect, useState } from "react";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Menu,
  Bell,
  Search,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import TransactionCard from "../components/TransactionCard";
import ProfileDropdown from "../components/ProfileDropdown";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// This is the SUPER ADMIN's overview dashboard — the "main dashboard" that
// only the super admin sees, per the app's architecture. Regular users and
// employees land on /customers instead.
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalBalance: 0,
    toReceive: 0,
    toPay: 0,
    customerCount: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, customersRes, expenseSummaryRes, khataRes] = await Promise.all([
        api.get("/api/collections/summary"),
        api.get("/api/customers"),
        api.get("/api/expenses/summary"),
        api.get("/api/khata"),
      ]);

      const totalDue = (customersRes.customers || []).reduce(
        (sum, c) => sum + Number(c.total_due || 0),
        0
      );

      setStats({
        totalBalance: Number(summaryRes.this_month?.grand_total || 0) - Number(expenseSummaryRes.this_month?.total || 0),
        toReceive: totalDue,
        toPay: Number(expenseSummaryRes.this_month?.total || 0),
        customerCount: (customersRes.customers || []).length,
      });

      setTransactions((khataRes.entries || []).slice(0, 6));
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Handler functions for header buttons
  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSearchClick = () => {
    const searchInput = document.querySelector('input[type="text"], input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      alert("🔍 Search functionality is available on the Customers page.");
    }
  };

  const handleNotificationClick = () => {
    alert("📬 No new notifications at this time.");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">

        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                Dashboard
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Business overview
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Home Button */}
            <button
              onClick={handleHomeClick}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Home"
              title="Go to Home"
            >
              <Home size={19} />
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Search"
              title="Search"
            >
              <Search size={19} />
            </button>

            {/* Notification Button */}
            <button
              onClick={handleNotificationClick}
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </header>

        <main className="w-full p-3 sm:p-6 lg:p-8">

          <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Welcome, {user?.name || "Super Admin"} 👋
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Here's the full business overview across every account.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

            <StatCard
              title="Net This Month"
              value={loading ? "..." : formatMoney(stats.totalBalance)}
              icon={Wallet}
              type="blue"
              description="sales minus expenses"
            />

            <StatCard
              title="To Receive"
              value={loading ? "..." : formatMoney(stats.toReceive)}
              icon={ArrowDownToLine}
              type="success"
              description="total outstanding dues"
            />

            <StatCard
              title="To Pay"
              value={loading ? "..." : formatMoney(stats.toPay)}
              icon={ArrowUpFromLine}
              type="danger"
              description="expenses this month"
            />

            <StatCard
              title="Customers"
              value={loading ? "..." : stats.customerCount}
              icon={Users}
              type="warning"
              description="total customers"
            />

          </div>

          {/* CONTENT */}
          <div className="mt-5 sm:mt-6">

            {/* RECENT TRANSACTIONS */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">
                    Recent Activity
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Latest business transactions, across all accounts
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 sm:mt-5">
                {loading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-slate-400">No activity yet.</p>
                ) : (
                  transactions.map((t) => (
                    <TransactionCard
                      key={`${t.type}-${t.id}`}
                      name={t.name}
                      type={t.type}
                      amount={Number(t.amount).toLocaleString("en-IN")}
                      date={new Date(t.date).toLocaleDateString("en-IN")}
                      description={t.description}
                    />
                  ))
                )}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;