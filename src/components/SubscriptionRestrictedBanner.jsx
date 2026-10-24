import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Lock, Sparkles, ArrowRight } from "lucide-react";
import useSubscriptionAccess from "../hooks/useSubscriptionAccess";

export default function SubscriptionRestrictedBanner({ compact = false }) {
  const { isRestricted, hasActiveSubscription, isEnforced, isEmployee } = useSubscriptionAccess();

  if (!isRestricted) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-amber-600 shrink-0" />
          <span>
            {isEmployee
              ? "Write access restricted (Read-only mode). Owner's subscription needs renewal."
              : "Write access restricted (Read-only mode). Subscribe to unlock."}
          </span>
        </div>
        {isEmployee ? (
          <span className="inline-flex items-center rounded-lg bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-semibold shrink-0">
            Contact Owner
          </span>
        ) : (
          <Link
            to="/subscription"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700 shadow-xs shrink-0"
          >
            <span>Upgrade</span>
            <ArrowRight size={12} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-500/20 p-2 text-amber-700 shrink-0 mt-0.5">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>
                {isEmployee
                  ? "Write Access Restricted (Owner's Subscription Required)"
                  : "Write Access Restricted (Read-Only Mode)"}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {isEmployee ? "Renewal Needed" : "Subscription Required"}
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {isEmployee
                ? "Your account is currently in read-only mode because your business owner's subscription has expired or is inactive. Employees inherit subscription access from their business owner. Please contact your account owner to renew."
                : "Your account is currently in read-only mode because platform write enforcement is active. You can review existing transactions, but an active subscription plan is required to add or edit records."}
            </p>
          </div>
        </div>

        {!isEmployee && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/subscription"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <Sparkles size={14} />
              <span>Choose a Plan</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
