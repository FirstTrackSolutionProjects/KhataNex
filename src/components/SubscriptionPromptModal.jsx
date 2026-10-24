import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X, ShieldCheck, ShieldAlert, Building2 } from "lucide-react";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";

export default function SubscriptionPromptModal({ isOpen, onClose, featureName }) {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const isEmployee = user?.role === "employee";

  if (!isOpen) return null;

  const handleViewPlans = () => {
    onClose();
    navigate("/subscription");
  };

  const ownerName = subscription?.owner?.business_name || subscription?.owner?.name || "your business owner";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Badge / Icon */}
          <div className={`w-14 h-14 rounded-2xl ${isEmployee ? "bg-gradient-to-tr from-amber-600 to-amber-400" : "bg-gradient-to-tr from-amber-500 to-amber-300"} text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4`}>
            {isEmployee ? <ShieldAlert className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isEmployee ? "Owner's Subscription Renewal Needed" : "Unlock this feature with KhataNex"}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {isEmployee ? (
              featureName ? (
                <>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{featureName}</span> requires an active subscription from your business owner (<span className="font-medium text-slate-900 dark:text-slate-100">{ownerName}</span>). Please contact your account owner to renew.
                </>
              ) : (
                <>
                  This action requires an active KhataNex subscription. As an employee, you inherit subscription access from your business owner (<span className="font-medium text-slate-900 dark:text-slate-100">{ownerName}</span>). Please contact them to renew their plan.
                </>
              )
            ) : featureName ? (
              <>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{featureName}</span> requires an active KhataNex subscription. Unlock unlimited digital bookkeeping, professional invoicing, and real-time ledger tracking today.
              </>
            ) : (
              "An active subscription is required to create, edit, or delete records. Pick a plan to unlock all tools and run your business with complete freedom."
            )}
          </p>

          {/* Value Highlights */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-6 border border-slate-100 dark:border-slate-700/50 text-left space-y-2">
            {isEmployee ? (
              <>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Linked Business: {ownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Employees automatically inherit access once the owner renews</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Full access to Invoicing, Khata, Inventory & Banking</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Introductory discount available for eligible accounts</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {isEmployee ? (
              <Button
                variant="primary"
                onClick={onClose}
                fullWidth
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold"
              >
                Understood
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  fullWidth
                  className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Maybe Later
                </Button>
                <Button
                  variant="primary"
                  onClick={handleViewPlans}
                  fullWidth
                  icon={ArrowRight}
                  className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 text-slate-950 font-bold"
                >
                  View Plans
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

