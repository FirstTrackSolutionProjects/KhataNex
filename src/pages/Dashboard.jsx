import React, { useEffect, useState } from "react";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Plus,
  Menu,
  Bell,
  Search,
  UserPlus,
  Ban,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import TransactionCard from "../components/TransactionCard";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// This is the SUPER ADMIN's overview dashboard — the "main dashboard" that
// only the super admin sees, per the app's architecture. Regular users and
// employees land on /customers instead.
const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalBalance: 0,
    toReceive: 0,
    toPay: 0,
    customerCount: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    employee_role_type: "",
  });
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [employeeError, setEmployeeError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, customersRes, expenseSummaryRes, khataRes, employeesRes] = await Promise.all([
        api.get("/api/collections/summary"),
        api.get("/api/customers"),
        api.get("/api/expenses/summary"),
        api.get("/api/khata"),
        api.get("/api/superadmin/employees"),
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
      setEmployees(employeesRes.employees || []);
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setEmployeeError("");
    setCreatingEmployee(true);
    try {
      await api.post("/api/superadmin/employees", employeeForm);
      setShowEmployeeModal(false);
      setEmployeeForm({ name: "", email: "", password: "", phone: "", employee_role_type: "" });
      loadDashboard();
    } catch (err) {
      setEmployeeError(err.message || "Could not create employee.");
    } finally {
      setCreatingEmployee(false);
    }
  };

  const toggleEmployeeStatus = async (employee) => {
    const nextStatus = employee.status === "active" ? "inactive" : "active";
    try {
      await api.patch(`/api/superadmin/users/${employee.id}/status`, { status: nextStatus });
      loadDashboard();
    } catch (err) {
      setError(err.message || "Could not update employee status.");
    }
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

            <button
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            <button
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 sm:ml-2 sm:h-9 sm:w-9">
              {(user?.name || "S").charAt(0).toUpperCase()}
            </div>

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

            <div className="w-full sm:w-auto">
              <Button
                icon={UserPlus}
                onClick={() => setShowEmployeeModal(true)}
              >
                Add Employee
              </Button>
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
          <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">

            {/* RECENT TRANSACTIONS */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-2">

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

            {/* EMPLOYEES */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

              <h3 className="font-bold text-slate-900">
                Employees
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Accounts you've created for your team
              </p>

              <div className="mt-4 space-y-2">
                {loading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : employees.length === 0 ? (
                  <p className="text-sm text-slate-400">No employees added yet.</p>
                ) : (
                  employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {emp.name || emp.email}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {emp.employee_role_type || "Employee"} · {emp.status}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleEmployeeStatus(emp)}
                        className={`shrink-0 rounded-lg p-2 transition ${
                          emp.status === "active"
                            ? "text-red-500 hover:bg-red-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={emp.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {emp.status === "active" ? <Ban size={17} /> : <CheckCircle2 size={17} />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      <Modal open={showEmployeeModal} onClose={() => setShowEmployeeModal(false)} title="Add Employee">
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          {employeeError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {employeeError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              placeholder="Employee name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              placeholder="employee@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password (you assign this)</label>
            <input
              type="text"
              value={employeeForm.password}
              onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
              placeholder="Set a login password for them"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <input
              type="tel"
              value={employeeForm.phone}
              onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              placeholder="Phone number"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
            <input
              type="text"
              value={employeeForm.employee_role_type}
              onChange={(e) => setEmployeeForm({ ...employeeForm, employee_role_type: e.target.value })}
              placeholder="e.g. Accountant, Manager, Stock Keeper"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={creatingEmployee}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {creatingEmployee ? "Creating..." : "Create Employee"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
