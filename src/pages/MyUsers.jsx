import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Users, Trash2, CheckCircle2 } from "lucide-react";
import api from "../lib/api";
import DeleteUserModal from "../components/DeleteUserModal";

const formatNumber = (value) => {
  const number = Number(value || 0);
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const MyUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successNotification, setSuccessNotification] = useState("");
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/superadmin/users");
      setUsers(response?.users || response?.data?.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 lg:pl-64">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-emerald-600" size={24} />
            <h1 className="text-2xl font-bold text-slate-800">My Users</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            View and monitor users registered on KhataNex.
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
            placeholder="Search by name, email, phone, business, GSTIN or PAN..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[1550px] w-full text-left text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="px-4 py-3 font-semibold">Account ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Merchant Details</th>
                <th className="px-4 py-3 font-semibold">Net Profit</th>
                <th className="px-4 py-3 font-semibold">Debit</th>
                <th className="px-4 py-3 font-semibold">Used Credits</th>
                <th className="px-4 py-3 font-semibold">Total Revenue</th>
                <th className="px-4 py-3 font-semibold">Customers</th>
                <th className="px-4 py-3 font-semibold">Invoices</th>
                <th className="px-4 py-3 font-semibold">Quotations</th>
                <th className="px-4 py-3 font-semibold">Receipts</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Vehicles</th>
                <th className="px-4 py-3 font-semibold">Activity</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="18"
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="18"
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                     onClick={() => navigate(`/my-users/${user.id}`)}
                    className="transition hover:bg-emerald-50/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                      #{user.id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
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

                    <td className="whitespace-nowrap px-4 py-3 font-medium text-emerald-700">
                      ₹{formatNumber(user.profit_or_loss ?? user.financials?.profit_or_loss ?? user.net_profit ?? user.net_credit)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      ₹{formatNumber(user.debit)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      ₹{formatNumber(user.used_credits)}
                    </td>

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

                    <td
                      className="px-4 py-3 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForDelete(user);
                          setDeleteModalOpen(true);
                        }}
                        title="Delete User Account"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <DeleteUserModal
        isOpen={deleteModalOpen}
        user={selectedUserForDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }}
        onSuccess={(res) => {
          setSuccessNotification(res.message || "User account updated successfully.");
          loadUsers();
        }}
      />
    </div>
  );
};

export default MyUsers;
