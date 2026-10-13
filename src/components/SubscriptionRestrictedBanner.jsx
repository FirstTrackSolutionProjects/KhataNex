import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowRight, Sparkles, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SubscriptionRestrictedBanner() {
  const { user, subscription } = useAuth();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  // Gating conditions:
  // 1. Not logged in
  // 2. Superadmins have unrestricted access
  // 3. User has an active subscription
  // 4. Currently on the subscription page
  // 5. User dismissed the banner for this session
  if (!user || user.role === "superadmin") return null;
  if (subscription?.active) return null;
  if (location.pathname.startsWith("/subscription")) return null;
  if (dismissed) return null;

  return (
    <aside
      aria-label="Subscription status"
      className="sticky top-0 z-30 lg:pl-64 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 border-b border-amber-600/30 shadow-sm"
    >
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-amber-300 font-bold">
            <AlertTriangle size={14} />
          </span>
          <div>
            <span className="font-bold text-slate-950">Restricted / Read-Only Mode: </span>
            <span className="text-slate-900">
              You are exploring KhataNex without an active subscription. Unlock unlimited khata transactions, customer management, and GST invoicing anytime.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/subscription"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-slate-900 hover:text-amber-200 shadow-sm"
          >
            <Sparkles size={13} />
            <span>Choose Plan &amp; Activate</span>
            <ArrowRight size={13} />
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="rounded-lg p-1 text-slate-900 hover:bg-amber-600/20 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

