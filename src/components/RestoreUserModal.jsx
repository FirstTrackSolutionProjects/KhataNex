import React, { useState } from "react";
import { RotateCcw, X, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import api from "../lib/api";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function RestoreUserModal({ isOpen, onClose, user, onSuccess }) {
  const [reason, setReason] = useState("Superadmin restored account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const handleRestore = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post(`/api/superadmin/users/${user.id}/restore`, {
        reason: reason.trim() || "Superadmin restored account",
      });

      if (res?.success) {
        if (onSuccess) {
          onSuccess(res);
        }
        onClose();
      } else {
        throw new Error(res?.message || "Failed to restore user account.");
      }
    } catch (err) {
      console.error("Restore user failed:", err);
      setError(err.message || "Failed to restore user account. Please check server logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <RotateCcw size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Restore User Account</h3>
              <p className="text-xs text-emerald-700 font-medium">Reactivate Account &amp; Restore Access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleRestore} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* User Details Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Account ID:</span>
              <span className="font-bold text-slate-900">#{user.id}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">User Name:</span>
              <span className="font-bold text-slate-900">{user.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Email Address:</span>
              <span className="font-semibold text-slate-800">{user.email || "—"}</span>
            </div>
            {user.business_name && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Business Name:</span>
                <span className="text-slate-800">{user.business_name}</span>
              </div>
            )}
            {user.deleted_at && (
              <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2 mt-2">
                <span className="font-medium text-red-600">Deleted On:</span>
                <span className="text-slate-700 font-medium">{formatDateTime(user.deleted_at)}</span>
              </div>
            )}
            {user.deletion_reason && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Deletion Reason:</span>
                <span className="text-slate-700 italic">{user.deletion_reason}</span>
              </div>
            )}
          </div>

          {/* Policy Information */}
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 text-xs text-emerald-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
              Restoration Behavior
            </p>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Restoring this user will change their status back to <strong>Active</strong>, reinstate login permissions, and automatically reactivate any staff employee accounts belonging to this business owner. All historical financial records, invoices, and ledger entries remain intact.
            </p>
          </div>

          {/* Restoration Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Restoration <span className="font-normal text-slate-400">(logged in audit trail)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Account reinstated upon customer request / verification complete"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <RotateCcw size={14} />
                  <span>Confirm Restore</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

