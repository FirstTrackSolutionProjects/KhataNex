import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Tag,
  Mail,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  X,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building,
  Phone,
  Home,
  Bell,
  Menu,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import { useAuth } from "../context/AuthContext";
import api, { getToken } from "../lib/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter period: "all" | "today" | "this_week" | "this_month" | "this_year"
  const [period, setPeriod] = useState("this_month");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Drilldown Modal State
  const [drilldownModal, setDrilldownModal] = useState({
    open: false,
    type: "total_users",
    title: "",
    subtitle: "",
  });
  const [drilldownSearch, setDrilldownSearch] = useState("");
  const [drilldownPage, setDrilldownPage] = useState(1);
  const [drilldownData, setDrilldownData] = useState({ rows: [], pagination: {} });
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownError, setDrilldownError] = useState("");

  // User Detail Modal State
  const [userDetailModal, setUserDetailModal] = useState({
    open: false,
    userId: null,
    loading: false,
    data: null,
    error: "",
  });

  // Action feedback
  const [actionFeedback, setActionFeedback] = useState(null);

  // Redirect non-superadmin users to /customers
  useEffect(() => {
    if (user && user.role !== "superadmin") {
      navigate("/customers", { replace: true });
    }
  }, [user, navigate]);

  // Load SaaS Business Owner metrics
  const loadStats = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError("");
      try {
        const res = await api.get(`/api/superadmin/dashboard/stats?period=${period}`);
        if (res?.success) {
          setStats(res.metrics || {});
        } else {
          setError(res?.message || "Failed to load dashboard metrics.");
        }
      } catch (err) {
        setError(err.message || "Could not connect to dashboard service.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Load drilldown records
  const loadDrilldown = useCallback(
    async (type, page = 1, search = "") => {
      setDrilldownLoading(true);
      setDrilldownError("");
      try {
        const queryParams = new URLSearchParams({
          type,
          page: String(page),
          limit: "15",
          search: search.trim(),
          period: period || "all",
        });
        const res = await api.get(`/api/superadmin/dashboard/drilldown?${queryParams.toString()}`);
        if (res?.success) {
          setDrilldownData({
            rows: res.rows || [],
            pagination: res.pagination || {},
          });
        } else {
          setDrilldownError(res?.message || "Failed to load records.");
        }
      } catch (err) {
        setDrilldownError(err.message || "Failed to load drilldown details.");
      } finally {
        setDrilldownLoading(false);
      }
    },
    [period]
  );

  const openDrilldown = (type, title, subtitle = "") => {
    setDrilldownModal({ open: true, type, title, subtitle });
    setDrilldownSearch("");
    setDrilldownPage(1);
    loadDrilldown(type, 1, "");
  };

  const handleDrilldownSearch = (e) => {
    e.preventDefault();
    setDrilldownPage(1);
    loadDrilldown(drilldownModal.type, 1, drilldownSearch);
  };

  const handleDrilldownPageChange = (newPage) => {
    setDrilldownPage(newPage);
    loadDrilldown(drilldownModal.type, newPage, drilldownSearch);
  };

  // Open User Detail Drawer/Modal
  const openUserDetail = async (userId) => {
    setUserDetailModal({
      open: true,
      userId,
      loading: true,
      data: null,
      error: "",
    });
    try {
      const res = await api.get(`/api/superadmin/dashboard/user-detail/${userId}`);
      if (res?.success) {
        setUserDetailModal((prev) => ({
          ...prev,
          loading: false,
          data: res,
        }));
      } else {
        setUserDetailModal((prev) => ({
          ...prev,
          loading: false,
          error: res?.message || "User details not found.",
        }));
      }
    } catch (err) {
      setUserDetailModal((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to load user profile.",
      }));
    }
  };

  // Retry Outbox Email
  const handleRetryEmail = async (emailId) => {
    try {
      setActionFeedback({ type: "info", message: `Retrying email delivery #${emailId}...` });
      const res = await api.post(`/api/superadmin/dashboard/email-retry/${emailId}`);
      if (res?.success) {
        setActionFeedback({ type: "success", message: `Email #${emailId} delivered successfully!` });
        // Refresh drilldown if open
        if (drilldownModal.open) {
          loadDrilldown(drilldownModal.type, drilldownPage, drilldownSearch);
        }
        // Refresh user detail if open
        if (userDetailModal.open && userDetailModal.userId) {
          openUserDetail(userDetailModal.userId);
        }
        // Refresh stats
        loadStats(true);
      } else {
        setActionFeedback({ type: "error", message: res?.message || "Email retry failed." });
      }
    } catch (err) {
      setActionFeedback({ type: "error", message: err.message || "Failed to retry email delivery." });
    }
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // Download Invoice PDF
  const handleDownloadInvoice = async (orderId, invoiceNumber) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/subscriptions/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download invoice.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber || "Invoice"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || "Could not download invoice.");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2 sm:h-16 sm:py-0 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 py-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 sm:text-lg sm:truncate break-words leading-tight">
                  SaaS Owner Dashboard
                </h1>
                <span className="hidden rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 sm:inline-block">
                  KhataNex Platform
                </span>
              </div>
              <p className="hidden text-xs text-slate-400 sm:block truncate">
                Platform-wide subscription revenue, subscribers, and system health
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Live Online Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span>
                {loading ? "..." : `${stats?.onlineUsers ?? 0} Online`}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadStats(true)}
              disabled={refreshing || loading}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              title="Refresh Metrics"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin text-emerald-600" : ""} />
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </header>

        <main className="w-full p-4 sm:p-6 lg:p-8">
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div
              className={`mb-5 flex items-center justify-between rounded-xl border p-4 text-sm font-medium ${
                actionFeedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : actionFeedback.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {actionFeedback.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{actionFeedback.message}</span>
              </div>
              <button
                onClick={() => setActionFeedback(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Welcome & Period Selection Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl break-words leading-snug">
                Welcome, {user?.name || "Super Admin"} 👋
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm break-words">
                Real-time operational intelligence and financial performance of KhataNex SaaS.
              </p>
            </div>

            {/* Period Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {[
                { id: "today", label: "Today" },
                { id: "this_week", label: "This Week" },
                { id: "this_month", label: "This Month" },
                { id: "this_year", label: "This Year" },
                { id: "all", label: "All Time" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPeriod(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    period === tab.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle size={18} />
                <span>Unable to load dashboard data</span>
              </div>
              <p className="mt-1 text-xs">{error}</p>
              <button
                onClick={() => loadStats()}
                className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* 12 SUMMARY KPI CARDS GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Card 1: Total Users */}
            <div
              onClick={() =>
                openDrilldown(
                  "total_users",
                  "Total Registered Users",
                  "All registered business owner accounts"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Users
                </span>
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : (stats?.totalRegisteredUsers ?? 0).toLocaleString("en-IN")}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Registered accounts</span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-semibold group-hover:underline">
                    View list <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Online Users (Live 15m) */}
            <div
              onClick={() =>
                openDrilldown(
                  "online_users",
                  "Active Online Users",
                  "Users active within the last 15 minutes"
                )
              }
              className="group cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Online Presence
                </span>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                  </span>
                  <span>15m Active</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-emerald-800">
                  {loading ? "..." : stats?.onlineUsers ?? 0}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-emerald-700">
                  <span>Currently active users</span>
                  <span className="flex items-center gap-0.5 font-semibold group-hover:underline">
                    Drilldown <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Subscribed Users */}
            <div
              onClick={() =>
                openDrilldown(
                  "active_subscribers",
                  "Subscribed Users",
                  "Users with an active subscription"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Subscribed Users
                </span>
                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : (stats?.activeSubscribedUsers ?? 0).toLocaleString("en-IN")}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {stats?.totalRegisteredUsers
                      ? `${Math.round(
                          ((stats.activeSubscribedUsers || 0) / stats.totalRegisteredUsers) * 100
                        )}% adoption rate`
                      : "Active subscriptions"}
                  </span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-semibold group-hover:underline">
                    View <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Unsubscribed Users */}
            <div
              onClick={() =>
                openDrilldown(
                  "unsubscribed_users",
                  "Unsubscribed Users",
                  "Users without an active subscription"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Unsubscribed
                </span>
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                  <UserX size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : (stats?.unsubscribedUsers ?? 0).toLocaleString("en-IN")}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Expired / Never subscribed</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold group-hover:underline">
                    Target <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 5: Active Paid Subscriptions */}
            <div
              onClick={() =>
                openDrilldown(
                  "active_paid",
                  "Active Paid Subscriptions",
                  "Subscriptions paid via payment gateway"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Paid Plans
                </span>
                <div className="rounded-xl bg-teal-100 p-2.5 text-teal-700">
                  <CreditCard size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : stats?.activePaidSubscriptions ?? 0}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Paying customer plans</span>
                  <span className="flex items-center gap-0.5 text-teal-600 font-semibold group-hover:underline">
                    View <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 6: Complimentary / Trial */}
            <div
              onClick={() =>
                openDrilldown(
                  "complimentary",
                  "Complimentary Subscriptions",
                  "Admin-granted or zero-cost promotional subscriptions"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Complimentary / Free
                </span>
                <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-700">
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : stats?.complimentarySubscriptions ?? 0}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Free grants & trials</span>
                  <span className="flex items-center gap-0.5 text-indigo-600 font-semibold group-hover:underline">
                    View <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 7: Subscription Revenue */}
            <div
              onClick={() =>
                openDrilldown(
                  "revenue",
                  "Subscription Collections",
                  `Paid order revenue for period: ${period.replace("_", " ")}`
                )
              }
              className="group cursor-pointer rounded-2xl border-2 border-emerald-500 bg-white p-5 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Collections ({period.replace("_", " ")})
                </span>
                <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-sm shadow-emerald-500/20">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-emerald-700">
                  {loading ? "..." : formatMoney(stats?.subscriptionRevenue || 0)}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Verified gateway collections</span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-semibold group-hover:underline">
                    Orders <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 8: Successful Payments */}
            <div
              onClick={() =>
                openDrilldown(
                  "successful_payments",
                  "Successful Payments",
                  "All completed and fulfilled subscription orders"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Successful Orders
                </span>
                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : stats?.successfulPayments ?? 0}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>All-time: {stats?.allTimeSuccessfulPayments ?? 0}</span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-semibold group-hover:underline">
                    History <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 9: Failed / Pending Payments */}
            <div
              onClick={() =>
                openDrilldown(
                  "failed_pending",
                  "Failed & Pending Payments",
                  "Orders that failed or were abandoned at checkout"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-rose-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Failed / Pending
                </span>
                <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : (stats?.failedPayments ?? 0) + (stats?.pendingPayments ?? 0)}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {stats?.failedPayments ?? 0} failed · {stats?.pendingPayments ?? 0} pending
                  </span>
                  <span className="flex items-center gap-0.5 text-rose-600 font-semibold group-hover:underline">
                    Inspect <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 10: Upcoming Expirations */}
            <div
              onClick={() =>
                openDrilldown(
                  "upcoming_expirations",
                  "Upcoming Expirations (7 Days)",
                  "Subscriptions expiring in the next 7 calendar days"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expiring in 7 Days
                </span>
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                  <Clock size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : stats?.upcomingExpirations ?? 0}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Due for renewal</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold group-hover:underline">
                    Cohorts <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 11: Active Campaigns & Coupons */}
            <div
              onClick={() =>
                openDrilldown(
                  "campaigns_coupons",
                  "Campaigns & Coupons",
                  "Active discount coupons and flash sale promotions"
                )
              }
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-purple-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Discounts
                </span>
                <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700">
                  <Tag size={20} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {loading ? "..." : stats?.activeCouponsAndCampaigns ?? 0}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {stats?.activeCoupons ?? 0} coupons · {stats?.activePromotions ?? 0} promos
                  </span>
                  <span className="flex items-center gap-0.5 text-purple-600 font-semibold group-hover:underline">
                    Manage <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 12: Email Delivery Outbox */}
            <div
              onClick={() =>
                openDrilldown(
                  "email_outbox",
                  "Email Delivery Outbox",
                  "Transactional invoice and system email delivery queue"
                )
              }
              className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                (stats?.failedEmailDeliveries || 0) > 0
                  ? "border-rose-300 bg-rose-50/30 hover:border-rose-500"
                  : "border-slate-200 bg-white hover:border-emerald-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Outbox
                </span>
                <div
                  className={`rounded-xl p-2.5 ${
                    (stats?.failedEmailDeliveries || 0) > 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <Mail size={20} />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-900">
                    {loading ? "..." : stats?.sentEmailDeliveries ?? 0}
                  </p>
                  <span className="text-xs text-emerald-600 font-bold">sent</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span
                    className={
                      (stats?.failedEmailDeliveries || 0) > 0
                        ? "text-rose-600 font-bold"
                        : "text-slate-500"
                    }
                  >
                    {stats?.failedEmailDeliveries || 0} failed · {stats?.pendingEmailDeliveries || 0} pending
                  </span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-semibold group-hover:underline">
                    Queue <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER SECTION: RECENT SUBSCRIPTION ORDERS & QUICK MANAGEMENT */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Subscription Orders Table (2 Columns) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Recent Subscription Orders
                  </h3>
                  <p className="text-xs text-slate-500">
                    Latest SaaS subscription purchases and fulfilled orders
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openDrilldown(
                      "revenue",
                      "All Subscription Orders",
                      "Complete historical subscription orders"
                    )
                  }
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  View All Orders
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Order / Customer</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          Loading orders...
                        </td>
                      </tr>
                    ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No subscription orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      stats.recentOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-900 block">
                              {ord.order_number}
                            </span>
                            <span
                              onClick={() => ord.user_id && navigate(`/my-users/${ord.user_id}`)}
                              className={`text-[11px] block truncate max-w-[160px] ${
                                ord.user_id
                                  ? "text-slate-600 hover:text-emerald-600 hover:underline cursor-pointer font-medium"
                                  : "text-slate-500"
                              }`}
                              title={ord.user_id ? "View Customer in My Users" : undefined}
                            >
                              {ord.user_name} ({ord.user_email})
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {ord.plan_name}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {formatMoney(Number(ord.total_paise || 0) / 100)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                ord.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.status === "created"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                            {ord.user_id && (
                              <button
                                type="button"
                                onClick={() => navigate(`/my-users/${ord.user_id}`)}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition"
                                title="View User Profile"
                              >
                                <UserRound size={12} />
                                <span>User</span>
                              </button>
                            )}
                            {ord.status === "paid" && (
                              <button
                                type="button"
                                onClick={() => handleDownloadInvoice(ord.id, ord.invoice_number)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                                title="Download GST Invoice"
                              >
                                <Download size={12} />
                                <span>Invoice</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions & Navigation (1 Column) */}
            <div className="space-y-4">
              {/* Quick Links Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Superadmin Controls
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Quick navigation to platform administration modules
                </p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => navigate("/my-users")}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">My Users</p>
                        <p className="text-[11px] text-slate-500">Manage business accounts</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/billing-admin")}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Billing Admin</p>
                        <p className="text-[11px] text-slate-500">Plans, coupons & campaigns</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/payments")}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Payment Accounting</p>
                        <p className="text-[11px] text-slate-500">Gateway verified collections</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/reports")}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Financial Reports</p>
                        <p className="text-[11px] text-slate-500">Subscription & business analytics</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* System Outbox Health Status */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Email Outbox Health
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      (stats?.failedEmailDeliveries || 0) === 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {(stats?.failedEmailDeliveries || 0) === 0 ? "Operational" : "Attention Needed"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Durable queue worker with exponential backoff and retry guarantees.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <p className="font-bold text-slate-900">{stats?.sentEmailDeliveries || 0}</p>
                    <p className="text-[10px] text-slate-400">Delivered</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <p className="font-bold text-slate-900">{stats?.pendingEmailDeliveries || 0}</p>
                    <p className="text-[10px] text-slate-400">In Queue</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <p
                      className={`font-bold ${
                        (stats?.failedEmailDeliveries || 0) > 0 ? "text-rose-600" : "text-slate-900"
                      }`}
                    >
                      {stats?.failedEmailDeliveries || 0}
                    </p>
                    <p className="text-[10px] text-slate-400">Failed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          DRILLDOWN MODAL
          ========================================================================= */}
      {drilldownModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex h-full max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{drilldownModal.title}</h3>
                {drilldownModal.subtitle && (
                  <p className="text-xs text-slate-500">{drilldownModal.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDrilldownModal((prev) => ({ ...prev, open: false }))}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3">
              <form onSubmit={handleDrilldownSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={drilldownSearch}
                    onChange={(e) => setDrilldownSearch(e.target.value)}
                    placeholder="Search by name, email, order ID, phone..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Search
                </button>
                {drilldownSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrilldownSearch("");
                      loadDrilldown(drilldownModal.type, 1, "");
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {/* Modal Table Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {drilldownLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw size={24} className="animate-spin text-emerald-600 mb-2" />
                  <p className="text-xs">Loading records...</p>
                </div>
              ) : drilldownError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                  {drilldownError}
                </div>
              ) : drilldownData.rows.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <p className="text-sm font-semibold">No records match this criterion.</p>
                  <p className="text-xs mt-1">Try adjusting your search query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        {/* Dynamic Columns based on Type */}
                        {["total_users", "online_users", "active_subscribers", "unsubscribed_users", "active_paid", "complimentary"].includes(
                          drilldownModal.type
                        ) ? (
                          <>
                            <th className="py-2.5 px-3">User & Contact</th>
                            <th className="py-2.5 px-3">Business</th>
                            <th className="py-2.5 px-3">Subscription</th>
                            <th className="py-2.5 px-3">Last Active</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </>
                        ) : ["revenue", "successful_payments", "failed_pending"].includes(
                            drilldownModal.type
                          ) ? (
                          <>
                            <th className="py-2.5 px-3">Order Number</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Plan</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </>
                        ) : drilldownModal.type === "upcoming_expirations" ? (
                          <>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Plan</th>
                            <th className="py-2.5 px-3">Expiry Date</th>
                            <th className="py-2.5 px-3">Days Left</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </>
                        ) : drilldownModal.type === "campaigns_coupons" ? (
                          <>
                            <th className="py-2.5 px-3">Code / Name</th>
                            <th className="py-2.5 px-3">Discount</th>
                            <th className="py-2.5 px-3">Redemptions</th>
                            <th className="py-2.5 px-3">Validity</th>
                            <th className="py-2.5 px-3">Status</th>
                          </>
                        ) : (
                          /* Email Outbox */
                          <>
                            <th className="py-2.5 px-3">Recipient</th>
                            <th className="py-2.5 px-3">Subject / Purpose</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Attempts</th>
                            <th className="py-2.5 px-3">Created</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {drilldownData.rows.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-slate-50/70">
                          {/* User Rows */}
                          {["total_users", "online_users", "active_subscribers", "unsubscribed_users", "active_paid", "complimentary"].includes(
                            drilldownModal.type
                          ) && (
                            <>
                              <td className="py-3 px-3">
                                <span
                                  onClick={() => navigate(`/my-users/${row.id || row.user_id}`)}
                                  className="font-bold text-slate-900 block hover:text-emerald-600 hover:underline cursor-pointer"
                                  title="View Account in My Users"
                                >
                                  {row.name || row.user_name}
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  {row.email || row.user_email} {row.phone ? `· ${row.phone}` : ""}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-700">
                                {row.business_name || "—"}
                              </td>
                              <td className="py-3 px-3">
                                {row.plan_name ? (
                                  <div>
                                    <span className="font-semibold text-emerald-700">
                                      {row.plan_name}
                                    </span>
                                    <span className="block text-[10px] text-slate-400">
                                      Ends: {formatDate(row.ends_at)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">No active plan</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {row.minutes_ago !== undefined && row.minutes_ago !== null ? (
                                  <span className="font-semibold text-emerald-700">
                                    {row.minutes_ago === 0 ? "Just now" : `${row.minutes_ago}m ago`}
                                  </span>
                                ) : (
                                  formatDateTime(row.last_active_at)
                                )}
                              </td>
                              <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => openUserDetail(row.id || row.user_id)}
                                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                                >
                                  Overview
                                </button>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/my-users/${row.id || row.user_id}`)}
                                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                  Profile
                                </button>
                              </td>
                            </>
                          )}

                          {/* Order Rows */}
                          {["revenue", "successful_payments", "failed_pending"].includes(
                            drilldownModal.type
                          ) && (
                            <>
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-slate-900 block">
                                  {row.order_number}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatDateTime(row.paid_at || row.created_at)}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  onClick={() => (row.user_id || row.id) && navigate(`/my-users/${row.user_id || row.id}`)}
                                  className={`font-semibold block ${(row.user_id || row.id) ? "text-slate-800 hover:text-emerald-600 hover:underline cursor-pointer" : "text-slate-800"}`}
                                  title="View Account in My Users"
                                >
                                  {row.user_name || row.name}
                                </span>
                                <span className="text-[11px] text-slate-500">{row.user_email || row.email}</span>
                              </td>
                              <td className="py-3 px-3 font-medium text-slate-700">
                                {row.plan_name}
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-900">
                                {formatMoney(Number(row.total_paise || 0) / 100)}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    row.status === "paid"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : row.status === "created"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => (row.user_id || row.id) && navigate(`/my-users/${row.user_id || row.id}`)}
                                  className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                                >
                                  User
                                </button>
                                {row.status === "paid" && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadInvoice(row.id, row.invoice_number)}
                                    className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                                  >
                                    Invoice
                                  </button>
                                )}
                              </td>
                            </>
                          )}

                          {/* Upcoming Expirations */}
                          {drilldownModal.type === "upcoming_expirations" && (
                            <>
                              <td className="py-3 px-3">
                                <span
                                  onClick={() => (row.user_id || row.id) && navigate(`/my-users/${row.user_id || row.id}`)}
                                  className="font-bold text-slate-900 block hover:text-emerald-600 hover:underline cursor-pointer"
                                  title="View Account in My Users"
                                >
                                  {row.user_name || row.name}
                                </span>
                                <span className="text-[11px] text-slate-500">{row.user_email || row.email}</span>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-700">
                                {row.plan_name}
                              </td>
                              <td className="py-3 px-3 font-medium text-slate-800">
                                {formatDate(row.ends_at)}
                              </td>
                              <td className="py-3 px-3">
                                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                                  {row.days_left ?? row.days_remaining} {(row.days_left ?? row.days_remaining) === 1 ? "day" : "days"} left
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => (row.user_id || row.id) && navigate(`/my-users/${row.user_id || row.id}`)}
                                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                  View Account
                                </button>
                              </td>
                            </>
                          )}

                          {/* Campaigns & Coupons */}
                          {drilldownModal.type === "campaigns_coupons" && (
                            <>
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-purple-700 block">
                                  {row.code}
                                </span>
                                <span className="text-[11px] text-slate-500">{row.name}</span>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-900">
                                {row.discount_type === "percent"
                                  ? `${row.discount_value}% OFF`
                                  : `₹${Number(row.discount_value || 0) / 100} OFF`}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                {row.redemptions_count || 0}
                                {row.max_redemptions ? ` / ${row.max_redemptions}` : " (unlimited)"}
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {row.valid_until ? formatDate(row.valid_until) : "Never expires"}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    row.is_active
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {row.is_active ? "Active" : "Disabled"}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Email Outbox */}
                          {drilldownModal.type === "email_outbox" && (
                            <>
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900 block">
                                  {row.recipient_email}
                                </span>
                                {row.recipient_name && (
                                  <span className="text-[11px] text-slate-500">
                                    {row.recipient_name}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-semibold text-slate-800 block">
                                  {row.subject}
                                </span>
                                {row.last_error && (
                                  <span className="text-[10px] text-rose-600 block line-clamp-1">
                                    {row.last_error}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    row.status === "sent"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : row.status === "failed"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                {row.attempts || 0} / {row.max_attempts || 5}
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {formatDateTime(row.created_at)}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {row.status === "failed" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryEmail(row.id)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
                                  >
                                    <RotateCcw size={12} />
                                    <span>Retry</span>
                                  </button>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Pagination Footer */}
            {drilldownData.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Page {drilldownData.pagination.currentPage} of {drilldownData.pagination.totalPages} ·{" "}
                  {drilldownData.pagination.totalCount} records
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={drilldownPage <= 1}
                    onClick={() => handleDrilldownPageChange(drilldownPage - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={drilldownPage >= drilldownData.pagination.totalPages}
                    onClick={() => handleDrilldownPageChange(drilldownPage + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          USER DETAIL DRAWER / MODAL
          ========================================================================= */}
      {userDetailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/50 backdrop-blur-sm">
          <div className="h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    User Platform Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    SaaS Account #{userDetailModal.userId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserDetailModal((prev) => ({ ...prev, open: false }))}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {userDetailModal.loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <RefreshCw size={24} className="animate-spin text-emerald-600 mb-2" />
                  <p className="text-xs">Loading complete account dossier...</p>
                </div>
              ) : userDetailModal.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                  {userDetailModal.error}
                </div>
              ) : userDetailModal.data?.user ? (
                <>
                  {/* User Profile Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {userDetailModal.data.user.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {userDetailModal.data.user.email}
                        </p>
                        {userDetailModal.data.user.phone && (
                          <p className="text-xs text-slate-500">
                            Phone: {userDetailModal.data.user.phone}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                        Role: {userDetailModal.data.user.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block">Business Name</span>
                        <span className="font-semibold text-slate-800">
                          {userDetailModal.data.user.business_name || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Registration Date</span>
                        <span className="font-semibold text-slate-800">
                          {formatDateTime(userDetailModal.data.user.created_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Last Active</span>
                        <span className="font-semibold text-emerald-700">
                          {formatDateTime(userDetailModal.data.user.last_active_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Intro Offer Eligible</span>
                        <span className="font-semibold text-slate-800">
                          {userDetailModal.data.user.introductory_offer_claimed ? "Claimed" : "Eligible"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Subscriptions Section */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Subscription Validity
                      </h4>
                      <button
                        type="button"
                        onClick={() => navigate("/billing-admin")}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Manage in Billing Admin
                      </button>
                    </div>

                    {(!userDetailModal.data.subscriptions ||
                      userDetailModal.data.subscriptions.length === 0) ? (
                      <p className="text-xs text-slate-400 py-2">
                        No active subscription found for this user.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {userDetailModal.data.subscriptions.map((sub) => (
                          <div
                            key={sub.id}
                            className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-900">{sub.plan_name}</span>
                              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase">
                                {sub.status}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                              <span>
                                {formatDate(sub.starts_at)} → {formatDate(sub.ends_at)}
                              </span>
                              {sub.is_complimentary ? (
                                <span className="font-bold text-indigo-700">Complimentary Grant</span>
                              ) : (
                                <span className="font-bold text-emerald-700">Paid Plan</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order History Table */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Subscription Orders ({userDetailModal.data.orders?.length || 0})
                    </h4>

                    {(!userDetailModal.data.orders ||
                      userDetailModal.data.orders.length === 0) ? (
                      <p className="text-xs text-slate-400 py-2">No subscription orders recorded.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                            <tr>
                              <th className="py-2">Order #</th>
                              <th className="py-2">Plan</th>
                              <th className="py-2">Amount</th>
                              <th className="py-2">Status</th>
                              <th className="py-2 text-right">Invoice</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {userDetailModal.data.orders.map((ord) => (
                              <tr key={ord.id}>
                                <td className="py-2 font-mono font-bold text-slate-800">
                                  {ord.order_number}
                                </td>
                                <td className="py-2">{ord.plan_name}</td>
                                <td className="py-2 font-bold text-slate-900">
                                  {formatMoney(Number(ord.total_paise || 0) / 100)}
                                </td>
                                <td className="py-2">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                      ord.status === "paid"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="py-2 text-right">
                                  {ord.status === "paid" && (
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadInvoice(ord.id, ord.invoice_number)}
                                      className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                                    >
                                      PDF
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Outbox Email Delivery History for this User */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Email Delivery Logs ({userDetailModal.data.emailLogs?.length || 0})
                    </h4>

                    {(!userDetailModal.data.emailLogs ||
                      userDetailModal.data.emailLogs.length === 0) ? (
                      <p className="text-xs text-slate-400 py-2">
                        No transactional emails recorded in the outbox for this user.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {userDetailModal.data.emailLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">{log.subject}</p>
                              <p className="text-[10px] text-slate-400">
                                {formatDateTime(log.created_at)} · Attempts: {log.attempts}
                                {log.last_error && (
                                  <span className="text-rose-600 block">{log.last_error}</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  log.status === "sent"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : log.status === "failed"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {log.status}
                              </span>
                              {log.status === "failed" && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryEmail(log.id)}
                                  className="rounded bg-rose-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700"
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserDetailModal((prev) => ({ ...prev, open: false }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              {userDetailModal.data?.user && (
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/my-users/${userDetailModal.data.user.id}`);
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Open in My Users
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}