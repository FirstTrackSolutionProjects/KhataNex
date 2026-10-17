import React, { useState } from "react";
import { AlertTriangle, Trash2, X, RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";
import api from "../lib/api";

export default function DeleteUserModal({ isOpen, onClose, user, onSuccess }) {
  const [reason, setReason] = useState("Superadmin initiated account deletion");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.del(`/api/superadmin/users/${user.id}`, {
        reason: reason.trim() || "Superadmin initiated account deletion",
      });

      if (res?.success) {
        if (onSuccess) {
          onSuccess(res);
        }
        onClose();
      } else {
        throw new Error(res?.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Delete user failed:", err);
      setError(err.message || "Failed to delete user. Please check server logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-red-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950">Confirm User Deletion</h3>
              <p className="text-xs text-red-700/80">Superadmin Account Administration</p>
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
        <form onSubmit={handleDelete} className="p-6 space-y-4">
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
          </div>

          {/* Policy Information */}
          <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              Ledger Safety &amp; Audit Compliance
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              If this account has existing financial transactions (khata, invoices, payments, stock, or subscriptions), it will be <strong>safely deactivated and soft-deleted</strong> with encrypted credentials to preserve statutory audit history. If the account is completely empty, it will be cleanly deleted.
            </p>
          </div>

          {/* Deletion Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Deletion <span className="font-normal text-slate-400">(logged in audit trail)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. User requested account closure / test account cleanup"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

