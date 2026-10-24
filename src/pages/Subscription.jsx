import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Tag,
  ArrowRight,
  Download,
  Mail,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Check,
  HelpCircle,
  Menu,
  Crown,
} from "lucide-react";
import api, { getToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const formatRupees = (paise) => {
  const rupees = Number(paise || 0) / 100;
  return rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function Subscription() {
  const { user, refreshSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnboarding = searchParams.get("onboarding") === "true";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState("monthly");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [activeSub, setActiveSub] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const [isIntroEligible, setIsIntroEligible] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Load plans & current subscription status
  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, meRes] = await Promise.all([
        api.get("/api/subscriptions/plans"),
        api.get("/api/subscriptions/me"),
      ]);

      if (plansRes?.success) {
        setPlans(plansRes.plans || []);
        setIsIntroEligible(plansRes.isIntroductoryEligible);
        if (plansRes.plans?.length && !selectedPlanCode) {
          setSelectedPlanCode(plansRes.plans[0].code);
        }
      }

      if (meRes?.success) {
        setActiveSub(meRes.activeSubscription);
        setRemainingDays(meRes.remainingDays || 0);
        setBillingHistory(meRes.billingHistory || []);
        setOwnerInfo(meRes.owner || null);
      }
    } catch (err) {
      console.error("Failed to load subscription data:", err);
      setStatusMessage({ type: "error", text: err.message || "Failed to load subscription details." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculate price whenever selected plan or applied coupon changes
  const updatePriceBreakdown = async (planCode, coupon = null) => {
    if (!planCode) return;
    try {
      setPricingLoading(true);
      setCouponError("");
      const res = await api.post("/api/subscriptions/price", {
        plan_code: planCode,
        coupon_code: coupon || undefined,
      });

      if (res?.success) {
        setPricing(res.pricing);
        if (coupon) {
          if (res.couponApplied) {
            setAppliedCoupon(coupon);
            setCouponError("");
          } else {
            setAppliedCoupon(null);
            setCouponError(res.couponError || "Coupon could not be applied.");
          }
        }
      }
    } catch (err) {
      if (coupon) {
        setCouponError(err.message || "Invalid coupon code.");
        setAppliedCoupon(null);
        // Fallback calculation without coupon safely without recursive race
        try {
          const fallback = await api.post("/api/subscriptions/price", { plan_code: planCode });
          if (fallback?.success) setPricing(fallback.pricing);
        } catch (_) {}
      } else {
        setStatusMessage({ type: "error", text: err.message || "Failed to calculate pricing." });
      }
    } finally {
      setPricingLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPlanCode) {
      updatePriceBreakdown(selectedPlanCode, appliedCoupon);
    }
  }, [selectedPlanCode]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    updatePriceBreakdown(selectedPlanCode, couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
    updatePriceBreakdown(selectedPlanCode, null);
  };

  // Razorpay Checkout flow
  const handleSubscribe = async () => {
    try {
      setCheckoutLoading(true);
      setStatusMessage({ type: "", text: "" });

      const res = await api.post("/api/subscriptions/orders", {
        plan_code: selectedPlanCode,
        coupon_code: appliedCoupon || undefined,
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to create order.");
      }

      // Zero-amount order (100% discount) fulfilled instantly
      if (res.free) {
        setStatusMessage({
          type: "success",
          text: "Subscription activated successfully! Enjoy KhataNex.",
        });
        await loadData();
        await refreshSubscription();
        if (isOnboarding) {
          setTimeout(() => navigate("/customers"), 1500);
        }
        return;
      }

      const orderData = res.order;

      // Check if Mock Provider or simulated local test order
      const isMockOrder =
        orderData.provider === "mock" ||
        orderData.providerOrderId?.startsWith("mock_") ||
        orderData.providerOrderId?.startsWith("order_test_") ||
        (orderData.keyId && orderData.keyId.includes("mock"));

      if (isMockOrder) {
        const verifyRes = await api.post(`/api/subscriptions/orders/${orderData.id}/verify`, {
          provider_payment_id: `mock_pay_${Date.now()}`,
          provider_signature: "mock_sig_dev",
        });

        if (verifyRes?.success) {
          setStatusMessage({
            type: "success",
            text: "Payment verified successfully! Your subscription is active. Taking you to your dashboard...",
          });
          await loadData();
          await refreshSubscription();
          if (isOnboarding) {
            setTimeout(() => navigate("/customers"), 1500);
          }
        }
        return;
      }

      // Validate gateway credentials before launching external Razorpay SDK
      if (!orderData.keyId || !orderData.providerOrderId) {
        throw new Error("Payment gateway configuration error: missing Razorpay key or order ID.");
      }

      if (!orderData.keyId.startsWith("rzp_test_") && !orderData.keyId.startsWith("rzp_live_")) {
        throw new Error("Invalid Razorpay Key ID received from server.");
      }

      // Load Razorpay script dynamically
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const logoUrl =
        typeof window !== "undefined" && window.location.protocol === "https:"
          ? `${window.location.origin}/images/Logo.jpeg`
          : undefined;

      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency || "INR",
        name: "FIRST TRACK KHATANEX",
        description: `${orderData.planName} Subscription`,
        ...(logoUrl ? { image: logoUrl } : {}),
        order_id: orderData.providerOrderId,
        prefill: {
          name: orderData.userName || user?.name || "",
          email: orderData.userEmail || user?.email || "",
          contact: orderData.userPhone || user?.phone || "",
        },
        theme: {
          color: "#059669",
        },
        handler: async function (response) {
          try {
            setCheckoutLoading(true);
            const verifyRes = await api.post(`/api/subscriptions/orders/${orderData.id}/verify`, {
              provider_payment_id: response.razorpay_payment_id,
              provider_signature: response.razorpay_signature,
            });

            if (verifyRes?.success) {
              setStatusMessage({
                type: "success",
                text: "Payment verified successfully! Your subscription is active. Taking you to your dashboard...",
              });
              await loadData();
              await refreshSubscription();
              if (isOnboarding) {
                setTimeout(() => navigate("/customers"), 1500);
              }
            }
          } catch (err) {
            console.error("Verification error:", err);
            setStatusMessage({
              type: "error",
              text: err.message || "Payment verification failed. Please contact support.",
            });
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
            setStatusMessage({
              type: "error",
              text: "Checkout was closed before payment completion. You can retry anytime.",
            });
            api.post(`/api/subscriptions/orders/${orderData.id}/cancel`).catch(() => {});
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setStatusMessage({
          type: "error",
          text: response.error?.description || "Payment failed. Please verify card details or try a different payment method.",
        });
        setCheckoutLoading(false);
        api.post(`/api/subscriptions/orders/${orderData.id}/fail`, {
          error_code: response.error?.code,
          error_description: response.error?.description,
        }).catch(() => {});
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout initialization failed:", err);
      const isAuthError =
        err.status === 401 ||
        err.code === 401 ||
        err.message?.toLowerCase().includes("session") ||
        err.message?.toLowerCase().includes("authenticated");
      setStatusMessage({
        type: "error",
        text: isAuthError
          ? "Your session has expired. Please log in again to complete your subscription."
          : err.message || "Failed to start checkout.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Download Invoice PDF via authenticated fetch
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

  // Resend Invoice Email
  const handleResendInvoice = async (orderId) => {
    try {
      const res = await api.post(`/api/subscriptions/orders/${orderId}/invoice/resend`, {});
      alert(res.message || "Invoice has been sent to your registered email.");
    } catch (err) {
      alert(err.message || "Could not resend invoice email.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center lg:pl-64">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:pl-72 lg:pr-8 transition-colors">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Mobile Top Header */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">Subscription & Billing</span>
            <div className="w-8" />
          </div>

          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Sparkles size={14} />
              <span>KhataNex Premium Membership</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Subscription & Billing
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage your KhataNex plan, unlock unlimited invoices, and review tax invoices.
            </p>
          </div>

          {/* Status Alerts */}
          {statusMessage.text && (
          <div
            className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Onboarding Welcome Hero */}
        {isOnboarding && (
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <Sparkles size={14} /> Welcome to KhataNex
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                  Welcome, {user?.name || "Partner"}! Set up your membership plan
                </h2>
                <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                  Choose a subscription plan below to unlock full access to business ledger operations, GST invoicing, customer balances, and real-time reports.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate("/customers")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <span>Skip to Dashboard (Restricted Mode)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-center gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>
                <strong>Restricted Mode:</strong> You can explore your dashboard in read-only mode first. When you are ready to add customers or record transactions, you can activate your subscription anytime.
              </span>
            </div>
          </div>
        )}

        {/* Active Subscription Banner / Employee View */}
        {user?.role === "employee" ? (
          <div className="space-y-6">
            {activeSub ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        {activeSub.status === "active" ? "Active Plan" : "Expired"}
                      </span>
                      <span className="rounded-md bg-amber-400 text-slate-900 px-2 py-0.5 text-xs font-bold uppercase">
                        Employee Entitlement
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{activeSub.plan_name}</h2>
                    <p className="text-xs text-emerald-100">
                      Covered by Business Owner: <span className="font-semibold text-white">{ownerInfo?.business_name || ownerInfo?.name || "Your Account Owner"}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Started: {formatDate(activeSub.starts_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> Expires: {formatDate(activeSub.ends_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
                      <p className="text-2xl font-extrabold">{remainingDays}</p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-100">
                        Days Remaining
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/customers")}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow transition hover:bg-emerald-50"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-6 w-6 text-amber-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-950 text-base">Owner's Subscription Renewal Needed</p>
                    <p className="text-sm text-amber-800">
                      Your business owner's subscription has expired or is inactive. Employees inherit subscription access directly from their business owner (<span className="font-semibold">{ownerInfo?.business_name || ownerInfo?.name || "your business owner"}</span>).
                    </p>
                    <p className="text-xs text-amber-700 pt-1">
                      Please contact your account owner to renew their subscription plan so you can regain write access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Employee Account Status</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                As an employee, you do not need to purchase or maintain an individual subscription. All feature access and digital ledger limits are inherited directly from your business owner's active plan according to your assigned module permissions.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Active Subscription Banner */}
            {activeSub ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        {activeSub.status === "active" ? "Active Plan" : "Expired"}
                      </span>
                  {activeSub.is_complimentary === 1 && (
                    <span className="rounded-md bg-amber-400 text-slate-900 px-2 py-0.5 text-xs font-bold uppercase">
                      Complimentary
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{activeSub.plan_name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Started: {formatDate(activeSub.starts_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Expires: {formatDate(activeSub.ends_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
                  <p className="text-2xl font-extrabold">{remainingDays}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-100">
                    Days Remaining
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/customers")}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow transition hover:bg-emerald-50"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : !isOnboarding ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-amber-950">No active subscription found</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Choose a subscription plan below to unlock full access to invoices, payments, Khata entries, and reports.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Plan Cards Selection */}
        <div>
          <h2 className="text-lg font-bold text-slate-900">Choose Your Plan</h2>
          <p className="text-xs text-slate-500 mb-4">
            Renewing early adds days seamlessly to the end of your existing subscription without losing any remaining time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p) => {
              const isSelected = selectedPlanCode === p.code;
              const hasIntro = p.is_eligible_for_introductory && p.savings_paise > 0;
              const isYearly = p.duration_months >= 12 || p.code === "yearly" || p.is_highlighted === 1;
              const monthlyPaise = p.duration_months > 1 ? Math.round(p.effective_price_paise / p.duration_months) : null;

              return (
                <div
                  key={p.code}
                  onClick={() => setSelectedPlanCode(p.code)}
                  className={`relative flex flex-col justify-between rounded-2xl p-6 cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? isYearly
                        ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 shadow-xl shadow-amber-500/10 scale-[1.02] ring-2 ring-amber-400/50"
                        : "border-emerald-600 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-600/10 scale-[1.02]"
                      : isYearly
                      ? "border-amber-300 dark:border-amber-500/40 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 hover:border-amber-400 hover:shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md"
                  }`}
                >
                  {/* Badges */}
                  {isYearly ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                      <Crown size={13} className="text-slate-950 fill-amber-300 shrink-0" />
                      <span>{p.promotional_badge || "BEST VALUE · 13 MONTHS"}</span>
                    </div>
                  ) : p.promotional_badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                      {p.promotional_badge}
                    </div>
                  ) : hasIntro ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                      Introductory Offer · Save ₹{formatRupees(p.savings_paise)}
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{p.name}</h3>
                        {isYearly && <Crown size={16} className="text-amber-500 fill-amber-400" />}
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? isYearly
                              ? "border-amber-500 bg-amber-500 text-slate-950"
                              : "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                      {p.billing_interval
                        ? `Billed ${p.billing_interval.replace(/_/g, " ")} (${p.duration_months} mo)`
                        : p.duration_months === 1
                        ? "Billed monthly"
                        : p.duration_months === 6
                        ? "Billed every 6 months"
                        : "Billed annually"}
                    </p>

                    {/* Plan Summary or Description */}
                    {p.summary ? (
                      <div className="mt-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                        {p.summary}
                      </div>
                    ) : p.description ? (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                        {p.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        ₹{formatRupees(p.effective_price_paise)}
                      </span>
                      {hasIntro && (
                        <span className="text-sm font-semibold text-slate-400 line-through">
                          ₹{formatRupees(p.price_paise)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        /{p.duration_months === 1 ? "month" : `${p.duration_months} mos`}
                      </span>
                    </div>

                    {/* Monthly Equivalent */}
                    {monthlyPaise && (
                      <div className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                        <Sparkles size={12} className="text-amber-500" />
                        <span>Just ₹{formatRupees(monthlyPaise)}/month equivalent</span>
                      </div>
                    )}

                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                      No hidden fees
                    </p>

                    {/* Dynamic Features List */}
                    {Array.isArray(p.features) && p.features.length > 0 ? (
                      <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                        {p.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Complete digital Khata ledger</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Unlimited GST invoices & receipts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Customer dues & payment tracking</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Official GST tax invoice receipt</span>
                        </li>
                      </ul>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span
                      className={`block w-full py-2.5 text-center text-xs font-bold rounded-xl transition ${
                        isSelected
                          ? isYearly
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow"
                            : "bg-emerald-600 text-white"
                          : isYearly
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 hover:bg-amber-200"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {isSelected ? "Selected Plan" : "Choose Plan"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contextual Recommendation Prompt for Monthly plan */}
          {selectedPlanCode === "monthly" && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Crown size={20} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Save 55% on Yearly:</strong> The <strong>Yearly Plan</strong> breaks down to just <strong>₹108/month</strong> and saves you over <strong>₹1,400 per year</strong> compared to paying monthly!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanCode("yearly")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 font-bold text-slate-950 shadow hover:from-amber-600 hover:to-amber-700 transition shrink-0"
              >
                <Sparkles size={13} />
                <span>Switch to Yearly & Save</span>
              </button>
            </div>
          )}
        </div>

        {/* Pricing Summary & Checkout */}
        {pricing && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Payment Summary</h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coupon Form */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Have a Promo / Referral Coupon?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <Tag size={16} />
                      <span>Coupon applied: {appliedCoupon}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON CODE"
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs uppercase font-medium text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={pricingLoading || !couponCode.trim()}
                      className="rounded-xl bg-slate-800 dark:bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-900 dark:hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{couponError}</p>
                )}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Safe & Instant Activation</span>
                  </p>
                  <p>
                    Payments are securely processed via Razorpay. Your access and downloadable tax invoice activate immediately upon verified receipt.
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 border-t md:border-t-0 md:border-l md:pl-8 border-slate-200 dark:border-slate-800 pt-4 md:pt-0">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>List Price:</span>
                  <span>₹{formatRupees(pricing.listPricePaise)}</span>
                </div>

                {pricing.introductoryDiscountPaise > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Introductory Discount:</span>
                    <span>- ₹{formatRupees(pricing.introductoryDiscountPaise)}</span>
                  </div>
                )}

                {pricing.couponDiscountPaise > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Coupon Discount ({pricing.couponCode}):</span>
                    <span>- ₹{formatRupees(pricing.couponDiscountPaise)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Taxable Value:</span>
                  <span>₹{formatRupees(pricing.taxablePaise)}</span>
                </div>

                {pricing.taxPercent > 0 && (
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>GST ({pricing.taxPercent}% included):</span>
                    <span>₹{formatRupees(pricing.taxPaise)}</span>
                  </div>
                )}

                <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total Payable:</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Final checkout price · All taxes included</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{formatRupees(pricing.totalPaise)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={checkoutLoading || pricingLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )}

        {/* Billing History Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Billing & Invoice History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Download your official computer-generated GST subscription invoices for accounting.
          </p>

          {billingHistory.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No payment records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Invoice / Order</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {billingHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {item.invoice_number || item.order_number}
                      </td>
                      <td className="py-3.5 px-4">{formatDate(item.paid_at || item.created_at)}</td>
                      <td className="py-3.5 px-4">{item.plan_name}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        ₹{formatRupees(item.total_paise)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            item.status === "paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : item.status === "created"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {item.status === "paid" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(item.id, item.invoice_number)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                            >
                              <Download size={13} />
                              <span>Invoice</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResendInvoice(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                              title="Resend to registered email"
                            >
                              <Mail size={13} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);
}


