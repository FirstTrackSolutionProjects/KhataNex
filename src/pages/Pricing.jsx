import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Crown, Loader2, RefreshCw } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

/* ------------------------------------------------------------------
   PUBLIC pricing page — reachable WITHOUT logging in (see the
   /pricing route in App.jsx). Plans come live from the backend:
   GET /api/subscriptions/plans  (public endpoint), so prices here
   always match what the Subscription page and checkout charge.
------------------------------------------------------------------- */

const formatRupees = (paise) => {
  const rupees = Number(paise || 0) / 100;
  return rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const DEFAULT_FEATURES = [
  "Complete digital Khata ledger",
  "Unlimited GST invoices & receipts",
  "Customer dues & payment tracking",
  "Official GST tax invoice receipt",
];

const FAQS = [
  {
    q: "Are there any setup or hidden fees?",
    a: "No. The price shown on a plan is the price you pay.",
  },
  {
    q: "What happens if I renew early?",
    a: "Renewing early adds days to the end of your existing subscription, so you don't lose any remaining time.",
  },
  {
    q: "Where can I read the refund and cancellation terms?",
    a: "See the Refund & Cancellation page linked in the footer for the full policy.",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/subscriptions/plans");
      if (res?.success) {
        setPlans(res.plans || []);
      } else {
        setError("Plans are unavailable right now.");
      }
    } catch (err) {
      setError(err?.message || "Could not load plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Logged-in users buy from the dashboard; visitors create an account first.
  const ctaTo = user ? "/subscription" : "/signup";
  const ctaLabel = user ? "Choose this plan" : "Get started";

  return (
    <div className="bg-white text-slate-800">
      {/* Header */}
      <section className="relative overflow-hidden bg-brand-radial">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="section-pad relative mx-auto max-w-4xl text-center text-white">
          <span className="eyebrow-on-dark">
            <Sparkles size={14} /> Pricing
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Simple plans for every business
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-100">
            Pick the plan that fits how long you want to run KhataNex. No setup
            fees and no hidden charges.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="section-pad bg-brand-soft">
        <div className="mx-auto max-w-6xl">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-600">
              <Loader2 className="animate-spin" size={22} /> Loading plans…
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto max-w-md rounded-2xl border border-brand-100 bg-white p-8 text-center">
              <p className="font-display text-lg font-bold text-slate-900">We couldn't load the plans</p>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <p className="mt-2 text-xs text-slate-500">
                Plans are loaded live from our server. If this keeps happening, please contact us.
              </p>
              <button type="button" onClick={loadPlans} className="btn-brand mt-5">
                <RefreshCw size={16} /> Try again
              </button>
            </div>
          )}

          {!loading && !error && plans.length === 0 && (
            <p className="py-16 text-center text-slate-600">No plans are available right now. Please check back soon.</p>
          )}

          {!loading && !error && plans.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((p) => {
                const featured =
                  p.is_highlighted === 1 || p.is_highlighted === true || p.duration_months >= 12 || p.code === "yearly";
                const monthlyPaise =
                  p.duration_months > 1 ? Math.round(p.price_paise / p.duration_months) : null;
                const features =
                  Array.isArray(p.features) && p.features.length > 0 ? p.features : DEFAULT_FEATURES;

                return (
                  <div
                    key={p.code}
                    className={`relative flex flex-col rounded-3xl p-8 ${
                      featured
                        ? "bg-brand-gradient text-white shadow-brand-lg"
                        : "border border-brand-100 bg-white text-slate-800"
                    }`}
                  >
                    {(featured || p.promotional_badge) && (
                      <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent-400 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-950">
                        {featured && <Crown size={12} />}
                        {p.promotional_badge || "Best value"}
                      </span>
                    )}

                    <h2 className={`font-display text-xl font-extrabold ${featured ? "text-white" : "text-slate-900"}`}>
                      {p.name}
                    </h2>
                    {(p.summary || p.description) && (
                      <p className={`mt-2 text-sm ${featured ? "text-brand-100" : "text-slate-600"}`}>
                        {p.summary || p.description}
                      </p>
                    )}

                    <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                      <span className={`font-display text-4xl font-extrabold ${featured ? "text-white" : "text-slate-900"}`}>
                        ₹{formatRupees(p.price_paise)}
                      </span>
                      <span className={`text-sm ${featured ? "text-brand-100" : "text-slate-500"}`}>
                        / {p.duration_months === 1 ? "month" : `${p.duration_months} months`}
                      </span>
                    </p>
                    {monthlyPaise && (
                      <p className={`mt-1 text-sm font-semibold ${featured ? "text-accent-300" : "text-brand-700"}`}>
                        Just ₹{formatRupees(monthlyPaise)}/month equivalent
                      </p>
                    )}

                    <ul className="mt-6 flex-1 space-y-3">
                      {features.map((f, i) => (
                        <li key={i} className={`flex items-start gap-2.5 text-sm ${featured ? "text-white" : "text-slate-700"}`}>
                          <Check size={17} className={`mt-0.5 shrink-0 ${featured ? "text-emerald-300" : "text-emerald-500"}`} />
                          <span>{typeof f === "string" ? f : f?.text || f?.label || f?.name || ""}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={ctaTo} className={`mt-8 ${featured ? "btn-accent" : "btn-brand"}`}>
                      {ctaLabel} <ArrowRight size={18} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-extrabold text-slate-900">Pricing questions</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4">
                <p className="font-display text-base font-bold text-slate-900">{f.q}</p>
                <p className="mt-1.5 text-sm text-slate-700">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
