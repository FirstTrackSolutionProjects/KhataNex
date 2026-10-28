import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Search,
  Users,
  Trash2,
  CheckCircle2,
  Menu,
  Archive,
  RotateCcw,
  Eye,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DeleteUserModal from "../components/DeleteUserModal";
import RestoreUserModal from "../components/RestoreUserModal";
import Sidebar from "../components/Sidebar";

const formatNumber = (value) => {
  const number = Number(value || 0);
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const MyUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [counts, setCounts] = useState({ active: 0, deleted: 0, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successNotification, setSuccessNotification] = useState("");
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserForRestore, setSelectedUserForRestore] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/superadmin/users?tab=${activeTab}`);
      const userList = response?.users || response?.data?.users || [];
      setUsers(userList);

      if (response?.counts) {
        setCounts(response.counts);
      } else {
        // Fallback calculation if counts object not provided
        const activeCount = userList.filter((u) => !u.is_deleted && u.status !== "deleted").length;
        const deletedCount = userList.filter((u) => u.is_deleted || u.status === "deleted").length;
        setCounts({
          active: activeTab === "active" ? activeCount : counts.active,
          deleted: activeTab === "deleted" ? deletedCount : counts.deleted,
          total: userList.length,
        });
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      user.id,
      user.name,
      user.email,
      user.phone,
      user.business_name,
      user.business_type,
      user.gstin,
      user.pan,
      user.deletion_reason,
      user.deleted_by_name,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="space-y-6 lg:pl-64">
        {/* Mobile Top Header */}
        <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-slate-900 text-sm">My Users</span>
          <div className="w-8" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="text-emerald-600" size={24} />
              <h1 className="text-2xl font-bold text-slate-800">My Users</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              View, monitor, and manage user accounts registered on KhataNex.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Tab Toggle: Active Users vs Deleted Users */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "active"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Users size={17} />
            <span>Active Users</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                activeTab === "active"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deleted")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "deleted"
                ? "border-red-600 text-red-700 bg-red-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Archive size={17} />
            <span>Deleted Users</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                activeTab === "deleted"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {counts.deleted}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                activeTab === "deleted"
                  ? "Search deleted users by name, email, phone, business, reason, or deleted by..."
                  : "Search active users by name, email, phone, business, GSTIN or PAN..."
              }
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Success Alert */}
        {successNotification && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotification("")}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[1650px] w-full text-left text-sm">
            <thead>
              <tr className={activeTab === "deleted" ? "bg-slate-800 text-white" : "bg-emerald-600 text-white"}>
                <th className="px-4 py-3 font-semibold">Account ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Merchant Details</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {activeTab === "deleted" ? (
                  <>
                    <th className="px-4 py-3 font-semibold">Deleted At</th>
                    <th className="px-4 py-3 font-semibold">Deleted By</th>
                    <th className="px-4 py-3 font-semibold">Deletion Reason</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold">Subscription</th>
                    <th className="px-4 py-3 font-semibold">Net Profit</th>
                    <th className="px-4 py-3 font-semibold">Debit</th>
                    <th className="px-4 py-3 font-semibold">Used Credits</th>
                  </>
                )}
                <th className="px-4 py-3 font-semibold">Total Revenue</th>
                <th className="px-4 py-3 font-semibold text-center">Customers</th>
                <th className="px-4 py-3 font-semibold text-center">Invoices</th>
                <th className="px-4 py-3 font-semibold text-center">Quotations</th>
                <th className="px-4 py-3 font-semibold text-center">Receipts</th>
                <th className="px-4 py-3 font-semibold text-center">Stock</th>
                <th className="px-4 py-3 font-semibold text-center">Vehicles</th>
                {activeTab !== "deleted" && (
                  <th className="px-4 py-3 font-semibold">Activity</th>
                )}
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="20"
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Loading {activeTab === "deleted" ? "deleted users" : "users"}...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="20"
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    {activeTab === "deleted"
                      ? "No deleted users in the archive."
                      : "No active users found."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/my-users/${user.id}`)}
                    className="cursor-pointer transition hover:bg-emerald-50/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                      #{user.id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                      {user.name || "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {user.email || "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {user.phone || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                        {user.role || "user"}
                      </span>
                    </td>

                    <td className="min-w-[220px] px-4 py-3">
                      <div className="font-medium text-slate-700">
                        {user.business_name || "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {user.business_type || ""}
                      </div>
                      {user.gstin && (
                        <div className="text-xs text-slate-500">
                          GSTIN: {user.gstin}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {user.is_deleted || user.status === "deleted" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                          DELETED
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {user.status || "active"}
                        </span>
                      )}
                    </td>

                    {activeTab === "deleted" ? (
                      <>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                          {formatDateTime(user.deleted_at)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700 font-medium">
                          {user.deleted_by_name || (user.deleted_by ? `Admin #${user.deleted_by}` : "Superadmin")}
                        </td>
                        <td className="min-w-[200px] px-4 py-3 text-xs text-slate-600 italic">
                          {user.deletion_reason || "Superadmin initiated account deletion"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="whitespace-nowrap px-4 py-3">
                          {user.subscription?.status === "active" ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {user.subscription.plan_name || "Active"}
                                  {user.subscription.is_complimentary ? " (Complimentary)" : ""}
                                </span>
                                {user.subscription.remaining_days !== undefined && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                    {user.subscription.remaining_days}d left
                                  </span>
                                )}
                              </div>
                              {user.subscription.ends_at && (
                                <span className="text-[11px] text-slate-500 mt-0.5">
                                  Expires {new Date(user.subscription.ends_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                              )}
                            </div>
                          ) : user.subscription?.status === "expired" ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                                Expired ({user.subscription.plan_name || "Plan"})
                              </span>
                              {user.subscription.ends_at && (
                                <span className="text-[11px] text-slate-400 mt-0.5">
                                  Ended {new Date(user.subscription.ends_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                              No Subscription
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 font-medium text-emerald-700">
                          ₹{formatNumber(user.profit_or_loss ?? user.financials?.profit_or_loss ?? user.net_profit ?? user.net_credit)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          ₹{formatNumber(user.debit)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          ₹{formatNumber(user.used_credits)}
                        </td>
                      </>
                    )}

                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                      ₹{formatNumber(user.total_revenue)}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-700">
                      {user.customer_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-700">
                      {user.invoice_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-700">
                      {user.quotation_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-700">
                      {user.money_receipt_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-700">
                      {user.stock_item_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-700">
                      {user.vehicle_trip_count ?? 0}
                    </td>

                    {activeTab !== "deleted" && (
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.activity_status === "logged_in"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {user.activity_status === "logged_in"
                            ? "Logged in"
                            : "Logged out"}
                        </span>
                      </td>
                    )}

                    {/* Actions Column */}
                    <td
                      className="px-4 py-3 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => navigate(`/my-users/${user.id}`)}
                          title="View Historical Ledger & Overview"
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Active tab: Delete button */}
                        {activeTab === "active" && currentUser?.role === "superadmin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForDelete(user);
                              setDeleteModalOpen(true);
                            }}
                            title="Soft Delete User Account"
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* Deleted tab: Restore button */}
                        {activeTab === "deleted" && currentUser?.role === "superadmin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForRestore(user);
                              setRestoreModalOpen(true);
                            }}
                            title="Restore User Account"
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            Showing {filteredUsers.length} of {users.length} {activeTab === "deleted" ? "deleted" : "active"} users
          </div>
        </div>

        {/* Delete User Modal */}
        <DeleteUserModal
          isOpen={deleteModalOpen}
          user={selectedUserForDelete}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedUserForDelete(null);
          }}
          onSuccess={(res) => {
            setSuccessNotification(res.message || "User account moved to archive successfully.");
            loadUsers();
          }}
        />

        {/* Restore User Modal */}
        <RestoreUserModal
          isOpen={restoreModalOpen}
          user={selectedUserForRestore}
          onClose={() => {
            setRestoreModalOpen(false);
            setSelectedUserForRestore(null);
          }}
          onSuccess={(res) => {
            setSuccessNotification(res.message || "User account restored successfully.");
            loadUsers();
          }}
        />
      </div>
    </>
  );
};

export default MyUsers;
