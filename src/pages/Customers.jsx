import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Menu,
  IndianRupee,
  CheckCircle2,
  Home,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import CustomerCard from "../components/CustomerCard";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const Customers = () => {
  const { user } = useAuth(); // FIXED: Added this line
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/customers");
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
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
      alert("🔍 Search functionality is available on this page.");
    }
  };

  const handleNotificationClick = () => {
    alert("📬 No new notifications at this time.");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.phone || "").includes(search)
  );

  const totalReceivable = customers.reduce((sum, c) => sum + Number(c.total_due || 0), 0);
  const settledCount = customers.filter((c) => Number(c.total_due || 0) <= 0).length;

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      await api.post("/api/customers", form);
      setShowAddModal(false);
      setForm({ name: "", phone: "", email: "" });
      loadCustomers();
    } catch (err) {
      setSaveError(err.message || "Could not add customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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
                Customers
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your customer accounts
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

            {/* Profile Button */}
            <button
              onClick={handleProfileClick}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 sm:ml-2 sm:h-9 sm:w-9"
              aria-label="Profile"
              title="Go to Profile"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            <Button
              icon={Plus}
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="ml-1"
            >
              Add
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Users size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : customers.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <IndianRupee size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Total Receivable
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {loading ? "..." : `₹${totalReceivable.toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <CheckCircle2 size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Settled Accounts
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : settledCount}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Search */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">

            <div className="relative">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer by name or phone..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

          </div>

          {/* Customers */}
          {loading ? (
            <p className="mt-8 text-center text-sm text-slate-400">Loading customers...</p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  id={customer.id}
                  name={customer.name}
                  phone={customer.phone}
                  balance={Number(customer.total_due || 0)}
                />
              ))}
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users
                size={35}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold">
                No customers found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {customers.length === 0
                  ? "Add your first customer to get started."
                  : "Try searching with another name or phone number."}
              </p>
            </div>
          )}

        </main>

      </div>

      {/* ADD CUSTOMER MODAL */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Customer">
        <form onSubmit={handleAddCustomer} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Customer name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone number"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Used to email invoices (optional)"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Customer"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;