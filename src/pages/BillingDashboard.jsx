import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Tag,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Gift,
  Edit,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  DollarSign,
  BarChart3,
  X,
  Trash2,
  Settings,
  Sliders,
  Lock,
  Check,
  RotateCcw,
  ShieldAlert,
  Key,
  FileText,
  Info,
  Menu,
  Sparkles,
  Crown,
} from "lucide-react";
import api, { getToken } from "../lib/api";
import DeleteUserModal from "../components/DeleteUserModal";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

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

export default function BillingDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'cohorts', 'plans', 'coupons', 'promotions', 'orders', 'lookup', 'settings'

  // Overview metrics
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Cohorts
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortMonth, setSelectedCohortMonth] = useState(null);
  const [cohortUsers, setCohortUsers] = useState([]);
  const [loadingCohortUsers, setLoadingCohortUsers] = useState(false);

  // Plans
  const [plans, setPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [planForm, setPlanForm] = useState({
    id: null,
    code: "",
    name: "",
    description: "",
    summary: "",
    duration_months: 1,
    billing_interval: "monthly",
    price_rupees: "",
    introductory_price_rupees: "",
    promotional_badge: "",
    display_order: 1,
    is_highlighted: 0,
    features: [],
    is_active: 1,
  });

  // Coupons
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState("all");
  const [couponForm, setCouponForm] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percent",
    discount_value: "",
    max_discount_rupees: "",
    min_order_rupees: "0",
    max_redemptions: "",
    per_user_limit: "1",
    plan_code: "",
    valid_until: "",
    target_cohort: "",
  });

  // Promotions & Seasonal Flash Sales
  const [promotions, setPromotions] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({
    id: null,
    name: "",
    code: "",
    discount_type: "percent",
    discount_value: "",
    max_discount_rupees: "",
    plan_code: "",
    starts_at: "",
    ends_at: "",
    target_cohort: "",
    user_eligibility: "all",
    max_redemptions: "",
    can_stack_with_coupon: 0,
    is_active: 1,
  });

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [orderPagination, setOrderPagination] = useState({ total: 0, pages: 1 });

  // User Lookup & Alerts
  const [lookupUserId, setLookupUserId] = useState("");
  const [lookedUpUser, setLookedUpUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [alerts, setAlerts] = useState({
    expiringToday: [],
    expiringSoon: [],
    expiredRecently: [],
    summary: { todayCount: 0, soonCount: 0, expiredCount: 0 },
  });
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [grantForm, setGrantForm] = useState({ plan_code: "monthly", notes: "" });

  // Global Subscription Settings & Payment Gateway
  const [settings, setSettings] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    intro_offers_enabled: 1,
    tax_percent: 18,
    tax_inclusive: 1,
    subscription_enforcement: "off",
    reminders_enabled: 1,
    reminder_days: "7,3,1",
  });
  const [showEnforcementModal, setShowEnforcementModal] = useState(false);

  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Load Overview KPIs
  const loadOverview = async () => {
    try {
      setLoadingMetrics(true);
      const res = await api.get("/api/superadmin/billing/overview");
      if (res?.success) setMetrics(res.metrics);
    } catch (err) {
      console.error("Overview load failed:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // 2. Load Cohorts
  const loadCohorts = async (month = null) => {
    try {
      const path = month ? `/api/superadmin/billing/expiry-cohorts?month=${month}` : "/api/superadmin/billing/expiry-cohorts";
      const res = await api.get(path);
      if (res?.success) {
        setCohorts(res.cohorts || []);
        if (month) {
          setCohortUsers(res.users || []);
        }
      }
    } catch (err) {
      console.error("Cohort load failed:", err);
    }
  };

  // 3. Load Plans
  const loadPlans = async () => {
    try {
      const res = await api.get("/api/superadmin/billing/plans");
      if (res?.success) setPlans(res.plans || []);
    } catch (err) {
      console.error("Plans load failed:", err);
    }
  };

  // 4. Load Coupons
  const loadCoupons = async () => {
    try {
      const res = await api.get("/api/superadmin/billing/coupons");
      if (res?.success) setCoupons(res.coupons || []);
    } catch (err) {
      console.error("Coupons load failed:", err);
    }
  };

  // 4b. Load Promotions
  const loadPromotions = async () => {
    try {
      const res = await api.get("/api/superadmin/billing/promotions");
      if (res?.success) setPromotions(res.promotions || []);
    } catch (err) {
      console.error("Promotions load failed:", err);
    }
  };

  // 4c. Load Subscription Alerts
  const loadAlerts = async () => {
    try {
      const res = await api.get("/api/superadmin/billing/alerts");
      if (res?.success) setAlerts(res.alerts);
    } catch (err) {
      console.error("Alerts load failed:", err);
    }
  };

  // 5. Load Orders
  const loadOrders = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (orderStatusFilter) params.set("status", orderStatusFilter);
      if (orderSearch) params.set("search", orderSearch);

      const res = await api.get(`/api/superadmin/billing/orders?${params.toString()}`);
      if (res?.success) {
        setOrders(res.orders || []);
        setOrderPagination(res.pagination || { total: 0, pages: 1 });
        setOrderPage(page);
      }
    } catch (err) {
      console.error("Orders load failed:", err);
    }
  };

  // 6. Load Settings & Gateway Status
  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await api.get("/api/superadmin/billing/settings");
      if (res?.success) {
        setSettings(res.settings);
        setGatewayStatus(res.paymentGateway);
        setAuditHistory(res.auditHistory || []);
        if (res.settings) {
          setSettingsForm({
            intro_offers_enabled: res.settings.intro_offers_enabled ? 1 : 0,
            tax_percent: res.settings.tax_percent !== undefined ? res.settings.tax_percent : 18,
            tax_inclusive: res.settings.tax_inclusive !== undefined ? (res.settings.tax_inclusive ? 1 : 0) : 1,
            subscription_enforcement: res.settings.subscription_enforcement || "off",
            reminders_enabled: res.settings.reminders_enabled !== undefined ? (res.settings.reminders_enabled ? 1 : 0) : 1,
            reminder_days: res.settings.reminder_days || "7,3,1",
          });
        }
      }
    } catch (err) {
      console.error("Settings load failed:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (confirmEnforce = false) => {
    if (settingsForm.subscription_enforcement === "on" && settings?.subscription_enforcement !== "on" && !confirmEnforce) {
      setShowEnforcementModal(true);
      return;
    }
    try {
      const res = await api.patch("/api/superadmin/billing/settings", {
        ...settingsForm,
        confirm_enforcement: confirmEnforce ? true : undefined,
      });
      if (res?.success) {
        setMessage({ type: "success", text: "Subscription settings saved successfully!" });
        setShowEnforcementModal(false);
        await loadSettings();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update settings." });
    }
  };

  useEffect(() => {
    loadOverview();
    loadCohorts();
    loadPlans();
    loadCoupons();
    loadPromotions();
    loadAlerts();
    loadOrders(1);
  }, []);

  const handleSelectCohortMonth = async (month) => {
    setSelectedCohortMonth(month);
    setLoadingCohortUsers(true);
    await loadCohorts(month);
    setLoadingCohortUsers(false);
  };

  // Quick campaign generator for cohort
  const handleOpenCohortCampaign = (month) => {
    setCouponForm({
      code: `RENEW-${month.replace("-", "")}`,
      discount_type: "percent",
      discount_value: "20",
      max_discount_rupees: "500",
      min_order_rupees: "0",
      max_redemptions: "100",
      per_user_limit: "1",
      plan_code: "",
      valid_until: "",
      target_cohort: month,
    });
    setActiveTab("coupons");
    setShowCouponModal(true);
  };

  // Plan Create & Edit
  const handleStartCreatePlan = () => {
    setPlanForm({
      id: null,
      code: "",
      name: "",
      description: "",
      summary: "",
      duration_months: 1,
      billing_interval: "monthly",
      price_rupees: "",
      introductory_price_rupees: "",
      promotional_badge: "",
      display_order: 1,
      is_highlighted: 0,
      features: [
        "Unlimited Invoices & Quotations",
        "Customer Khata & Digital Ledgers",
        "Standard Email & In-App Support",
      ],
      is_active: 1,
    });
    setNewFeatureInput("");
    setShowPlanModal(true);
  };

  const handleStartEditPlan = (plan) => {
    let feats = [];
    if (Array.isArray(plan.features)) feats = plan.features;
    else if (typeof plan.features === "string") {
      try { feats = JSON.parse(plan.features); } catch (_) { feats = []; }
    }

    setPlanForm({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description || "",
      summary: plan.summary || "",
      duration_months: plan.duration_months,
      billing_interval: plan.billing_interval || "monthly",
      price_rupees: (plan.price_paise / 100).toString(),
      introductory_price_rupees: (plan.introductory_price_paise / 100).toString(),
      promotional_badge: plan.promotional_badge || "",
      display_order: plan.display_order !== undefined ? plan.display_order : 0,
      is_highlighted: plan.is_highlighted ? 1 : 0,
      features: feats,
      is_active: plan.is_active,
    });
    setNewFeatureInput("");
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: planForm.name,
        description: planForm.description || null,
        summary: planForm.summary || null,
        duration_months: Number(planForm.duration_months),
        billing_interval: planForm.billing_interval || "monthly",
        price_paise: Math.round(Number(planForm.price_rupees) * 100),
        introductory_price_paise: Math.round(Number(planForm.introductory_price_rupees) * 100),
        promotional_badge: planForm.promotional_badge || null,
        display_order: Number(planForm.display_order) || 0,
        is_highlighted: planForm.is_highlighted ? 1 : 0,
        features: planForm.features || [],
        is_active: planForm.is_active,
      };

      let res;
      if (planForm.id) {
        res = await api.put(`/api/superadmin/billing/plans/${planForm.id}`, payload);
      } else {
        payload.code = planForm.code.trim().toLowerCase();
        res = await api.post("/api/superadmin/billing/plans", payload);
      }

      if (res?.success) {
        setMessage({
          type: "success",
          text: planForm.id ? "Plan updated successfully!" : "Plan created successfully!",
        });
        setShowPlanModal(false);
        await loadPlans();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save plan." });
    }
  };

  // Revoke User Subscription
  const handleRevokeSubscription = async (userId) => {
    const reason = prompt("Enter the reason for revoking this user's subscription:", "Administrative cancellation");
    if (reason === null) return;
    try {
      const res = await api.post(`/api/superadmin/billing/users/${userId}/revoke`, { reason });
      if (res?.success) {
        setMessage({ type: "success", text: res.message || "Subscription revoked successfully." });
        const refresh = await api.get(`/api/superadmin/billing/users/${userId}`);
        if (refresh?.success) setLookedUpUser(refresh);
        loadOverview();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to revoke subscription." });
    }
  };

  // Reset Introductory Offer Eligibility
  const handleResetIntroOffer = async (userId) => {
    if (!window.confirm("Are you sure you want to restore one-time introductory offer eligibility for this user?")) return;
    try {
      const res = await api.post(`/api/superadmin/billing/users/${userId}/reset-intro`);
      if (res?.success) {
        setMessage({ type: "success", text: res.message || "Introductory offer eligibility reset successfully." });
        const refresh = await api.get(`/api/superadmin/billing/users/${userId}`);
        if (refresh?.success) setLookedUpUser(refresh);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to reset introductory offer." });
    }
  };

  // Coupon Create
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const isFlat = couponForm.discount_type === "flat";
      const res = await api.post("/api/superadmin/billing/coupons", {
        code: couponForm.code,
        name: couponForm.name || null,
        description: couponForm.description || null,
        discount_type: couponForm.discount_type,
        discount_value: isFlat ? Math.round(Number(couponForm.discount_value) * 100) : Number(couponForm.discount_value),
        max_discount_paise: couponForm.max_discount_rupees ? Math.round(Number(couponForm.max_discount_rupees) * 100) : null,
        min_order_paise: couponForm.min_order_rupees ? Math.round(Number(couponForm.min_order_rupees) * 100) : 0,
        max_redemptions: couponForm.max_redemptions ? Number(couponForm.max_redemptions) : null,
        per_user_limit: couponForm.per_user_limit ? Number(couponForm.per_user_limit) : 1,
        plan_code: couponForm.plan_code || null,
        valid_until: couponForm.valid_until || null,
        target_cohort: couponForm.target_cohort || null,
      });

      if (res?.success) {
        setMessage({ type: "success", text: `Coupon ${res.coupon.code} created!` });
        setShowCouponModal(false);
        await loadCoupons();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to create coupon." });
    }
  };

  // Coupon Edit & Delete
  const handleStartEditCoupon = (c) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      name: c.name || "",
      description: c.description || "",
      discount_type: c.discount_type,
      discount_value: c.discount_type === "flat" ? (Number(c.discount_value) / 100).toString() : c.discount_value.toString(),
      max_discount_rupees: c.max_discount_paise ? (Number(c.max_discount_paise) / 100).toString() : "",
      min_order_rupees: c.min_order_paise ? (Number(c.min_order_paise) / 100).toString() : "0",
      max_redemptions: c.max_redemptions ? c.max_redemptions.toString() : "",
      per_user_limit: c.per_user_limit ? c.per_user_limit.toString() : "1",
      plan_code: c.plan_code || "",
      valid_until: c.valid_until ? c.valid_until.split("T")[0] : "",
      target_cohort: c.target_cohort || "",
    });
    setShowEditCouponModal(true);
  };

  const handleSaveEditCoupon = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    try {
      const isFlat = couponForm.discount_type === "flat";
      const res = await api.put(`/api/superadmin/billing/coupons/${editingCoupon.id}`, {
        name: couponForm.name || null,
        description: couponForm.description || null,
        discount_type: couponForm.discount_type,
        discount_value: isFlat ? Math.round(Number(couponForm.discount_value) * 100) : Number(couponForm.discount_value),
        max_discount_paise: couponForm.max_discount_rupees ? Math.round(Number(couponForm.max_discount_rupees) * 100) : null,
        min_order_paise: couponForm.min_order_rupees ? Math.round(Number(couponForm.min_order_rupees) * 100) : 0,
        max_redemptions: couponForm.max_redemptions ? Number(couponForm.max_redemptions) : null,
        per_user_limit: couponForm.per_user_limit ? Number(couponForm.per_user_limit) : 1,
        plan_code: couponForm.plan_code || null,
        valid_until: couponForm.valid_until || null,
        target_cohort: couponForm.target_cohort || null,
      });

      if (res?.success) {
        setMessage({ type: "success", text: `Coupon ${editingCoupon.code} updated successfully!` });
        setShowEditCouponModal(false);
        setEditingCoupon(null);
        await loadCoupons();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update coupon." });
    }
  };

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${c.code}"? This will disable it from future redemptions while preserving past records.`)) return;
    try {
      const res = await api.delete(`/api/superadmin/billing/coupons/${c.id}`);
      if (res?.success) {
        setMessage({ type: "success", text: res.message || `Coupon ${c.code} deleted.` });
        await loadCoupons();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to delete coupon." });
    }
  };

  // Toggle Coupon Active
  const handleToggleCouponActive = async (coupon) => {
    try {
      await api.put(`/api/superadmin/billing/coupons/${coupon.id}`, {
        is_active: coupon.is_active ? 0 : 1,
      });
      await loadCoupons();
    } catch (err) {
      alert("Failed to update coupon status.");
    }
  };

  // Promotions Handlers
  const handleStartCreatePromo = () => {
    setEditingPromo(null);
    setPromoForm({
      id: null,
      name: "",
      code: "",
      discount_type: "percent",
      discount_value: "",
      max_discount_rupees: "",
      plan_code: "",
      starts_at: "",
      ends_at: "",
      target_cohort: "",
      user_eligibility: "all",
      max_redemptions: "",
      can_stack_with_coupon: 0,
      is_active: 1,
    });
    setShowPromoModal(true);
  };

  const handleStartEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      id: promo.id,
      name: promo.name || "",
      code: promo.code || "",
      discount_type: promo.discount_type,
      discount_value: promo.discount_type === "flat" ? (Number(promo.discount_value) / 100).toString() : promo.discount_value.toString(),
      max_discount_rupees: promo.max_discount_paise ? (Number(promo.max_discount_paise) / 100).toString() : "",
      plan_code: promo.plan_code || "",
      starts_at: promo.starts_at ? new Date(promo.starts_at).toISOString().slice(0, 16) : "",
      ends_at: promo.ends_at ? new Date(promo.ends_at).toISOString().slice(0, 16) : "",
      target_cohort: promo.target_cohort || "",
      user_eligibility: promo.user_eligibility || "all",
      max_redemptions: promo.max_redemptions ? promo.max_redemptions.toString() : "",
      can_stack_with_coupon: promo.can_stack_with_coupon ? 1 : 0,
      is_active: promo.is_active ? 1 : 0,
    });
    setShowPromoModal(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    try {
      const isFlat = promoForm.discount_type === "flat";
      const payload = {
        name: promoForm.name,
        code: promoForm.code || null,
        discount_type: promoForm.discount_type,
        discount_value: isFlat ? Math.round(Number(promoForm.discount_value) * 100) : Number(promoForm.discount_value),
        max_discount_paise: promoForm.max_discount_rupees ? Math.round(Number(promoForm.max_discount_rupees) * 100) : null,
        plan_code: promoForm.plan_code || null,
        starts_at: promoForm.starts_at || null,
        ends_at: promoForm.ends_at || null,
        target_cohort: promoForm.target_cohort || null,
        user_eligibility: promoForm.user_eligibility,
        max_redemptions: promoForm.max_redemptions ? Number(promoForm.max_redemptions) : null,
        can_stack_with_coupon: promoForm.can_stack_with_coupon ? 1 : 0,
        is_active: promoForm.is_active ? 1 : 0,
      };

      let res;
      if (promoForm.id) {
        res = await api.put(`/api/superadmin/billing/promotions/${promoForm.id}`, payload);
      } else {
        res = await api.post("/api/superadmin/billing/promotions", payload);
      }

      if (res?.success) {
        setMessage({ type: "success", text: promoForm.id ? "Promotion updated!" : "Promotion campaign created!" });
        setShowPromoModal(false);
        setEditingPromo(null);
        await loadPromotions();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save promotion." });
    }
  };

  const handleTogglePromoActive = async (promo) => {
    try {
      await api.put(`/api/superadmin/billing/promotions/${promo.id}`, {
        is_active: promo.is_active ? 0 : 1,
      });
      await loadPromotions();
    } catch (err) {
      alert("Failed to toggle promotion status.");
    }
  };

  const handleDeletePromo = async (promo) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${promo.name}"?`)) return;
    try {
      const res = await api.delete(`/api/superadmin/billing/promotions/${promo.id}`);
      if (res?.success) {
        setMessage({ type: "success", text: res.message || "Promotion campaign deleted." });
        await loadPromotions();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to delete promotion." });
    }
  };

  // User Search & Selection
  const handleSearchUsers = async (e) => {
    if (e) e.preventDefault();
    if (!userSearchQuery.trim()) {
      setUserSearchResults([]);
      return;
    }
    try {
      setIsSearchingUsers(true);
      const res = await api.get(`/api/superadmin/billing/users-search?q=${encodeURIComponent(userSearchQuery.trim())}`);
      if (res?.success) {
        setUserSearchResults(res.users || []);
      }
    } catch (err) {
      console.error("User search failed:", err);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const res = await api.get(`/api/superadmin/billing/users/${userId}`);
      if (res?.success) {
        setLookedUpUser(res);
        setLookupUserId(String(userId));
      }
    } catch (err) {
      alert(err.message || "Failed to load user details.");
    }
  };

  // Lookup User
  const handleLookupUser = async (e) => {
    e.preventDefault();
    if (!lookupUserId.trim()) return;
    try {
      const res = await api.get(`/api/superadmin/billing/users/${lookupUserId.trim()}`);
      if (res?.success) {
        setLookedUpUser(res);
      }
    } catch (err) {
      alert(err.message || "User not found.");
      setLookedUpUser(null);
    }
  };

  // Grant Subscription
  const handleGrantSubscription = async (e) => {
    e.preventDefault();
    if (!lookedUpUser?.user?.id) return;
    try {
      const res = await api.post("/api/superadmin/billing/grant", {
        user_id: lookedUpUser.user.id,
        plan_code: grantForm.plan_code,
        notes: grantForm.notes,
      });
      if (res?.success) {
        alert(res.message || "Subscription granted!");
        setShowGrantModal(false);
        // Refresh lookup
        const refresh = await api.get(`/api/superadmin/billing/users/${lookedUpUser.user.id}`);
        if (refresh?.success) setLookedUpUser(refresh);
        loadOverview();
      }
    } catch (err) {
      alert(err.message || "Failed to grant subscription.");
    }
  };

  // Download Invoice
  const handleDownloadInvoice = async (orderId, invoiceNumber) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/subscriptions/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download invoice.");
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:pl-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header Blueprint */}
      <PageHeader
        title="Billing Administration"
        subtitle="Revenue metrics, expiry cohorts, plan configuration & coupons"
        onMenuClick={() => setSidebarOpen(true)}
        showHome={true}
        showSearch={false}
        showProfile={true}
      >
        <button
          type="button"
          onClick={() => {
            loadOverview();
            loadCohorts();
            loadPlans();
            loadCoupons();
            loadPromotions();
            loadAlerts();
            loadOrders(orderPage);
            loadSettings();
          }}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* Global Alert */}
        {message.text && (
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })} className="text-slate-500 hover:text-slate-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "overview", label: "Overview & KPIs", icon: TrendingUp },
            { id: "cohorts", label: "Expiry Cohorts & Campaigns", icon: Calendar },
            { id: "plans", label: "Plans Management", icon: CreditCard },
            { id: "coupons", label: "Coupons & Discounts", icon: Tag },
            { id: "promotions", label: "Promotions & Flash Sales", icon: Sparkles },
            { id: "orders", label: "Orders & Payments", icon: DollarSign },
            { id: "lookup", label: "User Lookup & Controls", icon: Users },
            { id: "settings", label: "Settings & Gateway", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW & KPIS
        ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Subscriptions</span>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">{metrics.activeSubscriptions}</p>
                  <p className="mt-1 text-xs text-slate-500">Users with valid current access</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Expiring in 7 Days</span>
                    <Clock size={18} className="text-amber-500" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-amber-600">{metrics.expiringWithin7Days}</p>
                  <p className="mt-1 text-xs text-slate-500">Need immediate renewal outreach</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Expiring This Month</span>
                    <Calendar size={18} className="text-sky-500" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">{metrics.expiringThisMonth}</p>
                  <p className="mt-1 text-xs text-slate-500">Scheduled to expire in current month</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Expired Subscriptions</span>
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-slate-700">{metrics.expiredSubscriptions}</p>
                  <p className="mt-1 text-xs text-slate-500">Lapsed past accounts</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Renewed Accounts</span>
                    <TrendingUp size={18} className="text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-emerald-600">{metrics.renewedSubscriptions}</p>
                  <p className="mt-1 text-xs text-slate-500">Customers with &gt; 1 term</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Collected Revenue</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Verified Paid</span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-emerald-600">
                    ₹{formatRupees(metrics.collectedRevenuePaise)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Actual collected cash revenue (excl. manual grants)</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Expected Renewal Revenue</span>
                    <Clock size={18} className="text-indigo-500" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-indigo-600">
                    ₹{formatRupees(metrics.expectedRenewalRevenuePaise)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">30-day forecasted renewal pipeline</p>
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: EXPIRY COHORTS & RENEWAL CAMPAIGNS
        ======================================================== */}
        {activeTab === "cohorts" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Monthly Expiry Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">
                Click any month to inspect the customer cohort expiring in that window or generate a renewal coupon campaign.
              </p>

              {cohorts.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No expiring cohort records available.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {cohorts.map((c) => {
                    const isSelected = selectedCohortMonth === c.month;
                    return (
                      <div
                        key={c.month}
                        onClick={() => handleSelectCohortMonth(c.month)}
                        className={`rounded-xl p-4 text-center cursor-pointer border-2 transition ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:border-emerald-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-500 uppercase">{c.month}</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{c.user_count}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Expiring users</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCohortMonth && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Cohort: {selectedCohortMonth} ({cohortUsers.length} Users)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Users whose effective subscription ends in this month.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCohortCampaign(selectedCohortMonth)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    <Gift size={14} />
                    <span>Create Campaign Coupon</span>
                  </button>
                </div>

                {loadingCohortUsers ? (
                  <div className="flex h-24 items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                ) : cohortUsers.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No users found for this month.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="py-2.5 px-3">User</th>
                          <th className="py-2.5 px-3">Business</th>
                          <th className="py-2.5 px-3">Plan</th>
                          <th className="py-2.5 px-3">Expires On</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cohortUsers.map((u) => (
                          <tr key={u.user_id}>
                            <td className="py-3 px-3">
                              <p className="font-bold text-slate-900">{u.user_name}</p>
                              <p className="text-[11px] text-slate-400">{u.user_email || u.user_phone}</p>
                            </td>
                            <td className="py-3 px-3">{u.business_name || "—"}</td>
                            <td className="py-3 px-3 font-semibold text-slate-800">{u.plan_name}</td>
                            <td className="py-3 px-3">{formatDate(u.ends_at)}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  u.subscription_status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {u.subscription_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: PLANS MANAGEMENT
        ======================================================== */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configured Subscription Plans</h3>
                  <p className="text-xs text-slate-500">
                    Manage regular prices, introductory rates, descriptions, and durations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCreatePlan}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  <Plus size={14} />
                  <span>Create Plan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Plan Name & Description</th>
                      <th className="py-3 px-4">Interval & Duration</th>
                      <th className="py-3 px-4">Regular Price</th>
                      <th className="py-3 px-4">Intro Price</th>
                      <th className="py-3 px-4">Badge / Highlight</th>
                      <th className="py-3 px-4">Sort</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plans.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.code}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            {p.is_highlighted === 1 && <Crown size={14} className="text-amber-500 fill-amber-400" />}
                          </div>
                          {p.summary && <span className="text-[11px] font-semibold text-emerald-700 block line-clamp-1">{p.summary}</span>}
                          {p.description && <span className="text-[11px] text-slate-400 block line-clamp-1">{p.description}</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize font-semibold text-slate-800">{p.billing_interval || "monthly"}</span>
                          <span className="block text-[11px] text-slate-400">{p.duration_months} Month(s)</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">₹{formatRupees(p.price_paise)}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          ₹{formatRupees(p.introductory_price_paise)}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.promotional_badge ? (
                            <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                              {p.promotional_badge}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">{p.display_order || 0}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {p.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleStartEditPlan(p)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create / Edit Plan Modal with Live Card Preview */}
            {showPlanModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {planForm.id ? `Edit Plan: ${planForm.name || planForm.code}` : "Create New Subscription Plan"}
                      </h4>
                      <p className="text-xs text-slate-500">Configure duration, pricing, promotional tags, and dynamic features with instant live preview</p>
                    </div>
                    <button onClick={() => setShowPlanModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Body: Two-column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
                    {/* Left Column: Configuration Form */}
                    <form id="plan-config-form" onSubmit={handleSavePlan} className="lg:col-span-7 space-y-4 text-xs">
                      {!planForm.id && (
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Plan Code (Unique Identifier)</label>
                          <input
                            type="text"
                            value={planForm.code}
                            onChange={(e) => setPlanForm({ ...planForm, code: e.target.value.toLowerCase() })}
                            placeholder="e.g. quarterly or lifetime"
                            className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-emerald-600 focus:outline-none"
                            required
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Plan Display Name</label>
                          <input
                            type="text"
                            value={planForm.name}
                            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                            placeholder="e.g. Monthly Plan"
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none font-medium"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Billing Interval</label>
                          <select
                            value={planForm.billing_interval}
                            onChange={(e) => setPlanForm({ ...planForm, billing_interval: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none font-medium"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="half_yearly">Half-Yearly (6 Months)</option>
                            <option value="yearly">Yearly (Annual)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Duration (Months)</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={planForm.duration_months}
                            onChange={(e) => setPlanForm({ ...planForm, duration_months: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Regular Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={planForm.price_rupees}
                            onChange={(e) => setPlanForm({ ...planForm, price_rupees: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none font-semibold text-slate-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Intro Offer Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={planForm.introductory_price_rupees}
                            onChange={(e) => setPlanForm({ ...planForm, introductory_price_rupees: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none font-semibold text-emerald-600"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Promotional Badge</label>
                          <input
                            type="text"
                            value={planForm.promotional_badge}
                            onChange={(e) => setPlanForm({ ...planForm, promotional_badge: e.target.value })}
                            placeholder="e.g. Save 46% or Best Value"
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Summary Tagline</label>
                          <input
                            type="text"
                            value={planForm.summary}
                            onChange={(e) => setPlanForm({ ...planForm, summary: e.target.value })}
                            placeholder="e.g. Includes 1 Extra Month Free"
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                        <input
                          type="text"
                          value={planForm.description}
                          onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                          placeholder="e.g. Full ledger access with multi-device sync"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      {/* Display Order and Highlight */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Display Sort Order</label>
                          <input
                            type="number"
                            value={planForm.display_order}
                            onChange={(e) => setPlanForm({ ...planForm, display_order: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div className="pt-4">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={planForm.is_highlighted === 1}
                              onChange={(e) => setPlanForm({ ...planForm, is_highlighted: e.target.checked ? 1 : 0 })}
                              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                            />
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Crown size={14} className="text-amber-500 fill-amber-400" />
                              Highlight Card
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Plan Status</label>
                          <select
                            value={planForm.is_active}
                            onChange={(e) => setPlanForm({ ...planForm, is_active: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none font-medium"
                          >
                            <option value={1}>Active</option>
                            <option value={0}>Disabled</option>
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Features List Manager */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
                        <label className="block font-bold text-slate-800">Plan Features List</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFeatureInput}
                            onChange={(e) => setNewFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (newFeatureInput.trim()) {
                                  setPlanForm({
                                    ...planForm,
                                    features: [...(planForm.features || []), newFeatureInput.trim()],
                                  });
                                  setNewFeatureInput("");
                                }
                              }
                            }}
                            placeholder="Type feature (e.g. Unlimited GST Invoices) and press Add"
                            className="flex-1 rounded-xl border border-slate-300 p-2 bg-white focus:border-emerald-600 focus:outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newFeatureInput.trim()) {
                                setPlanForm({
                                  ...planForm,
                                  features: [...(planForm.features || []), newFeatureInput.trim()],
                                });
                                setNewFeatureInput("");
                              }
                            }}
                            className="rounded-xl bg-slate-900 text-white px-3 py-2 font-bold hover:bg-slate-800 transition"
                          >
                            Add
                          </button>
                        </div>

                        {/* Features chips */}
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {(planForm.features || []).map((feat, index) => (
                            <div key={index} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                              <span className="text-slate-800 flex-1 truncate">{feat}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = planForm.features.filter((_, i) => i !== index);
                                  setPlanForm({ ...planForm, features: updated });
                                }}
                                className="text-red-500 hover:text-red-700 p-0.5"
                                title="Remove feature"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                          {(!planForm.features || planForm.features.length === 0) && (
                            <p className="text-[11px] text-slate-400 italic">No features added yet. Add key bullet points above.</p>
                          )}
                        </div>
                      </div>
                    </form>

                    {/* Right Column: Live Card Preview */}
                    <div className="lg:col-span-5 flex flex-col">
                      <h5 className="font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" />
                        Live Card Preview
                      </h5>

                      <div className="flex-1 rounded-2xl bg-slate-950 p-5 text-white flex flex-col justify-between border-2 border-slate-800 relative shadow-xl overflow-hidden">
                        {/* Preview Top Badge */}
                        {planForm.is_highlighted === 1 ? (
                          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow">
                            <Crown size={12} className="fill-amber-300 text-slate-950" />
                            <span>{planForm.promotional_badge || "BEST VALUE"}</span>
                          </div>
                        ) : planForm.promotional_badge ? (
                          <div className="absolute top-3 right-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                            {planForm.promotional_badge}
                          </div>
                        ) : null}

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-white">{planForm.name || "Plan Name"}</h4>
                            {planForm.is_highlighted === 1 && <Crown size={16} className="text-amber-400 fill-amber-400" />}
                          </div>

                          <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                            Billed {planForm.billing_interval || "monthly"} · {planForm.duration_months} mo
                          </p>

                          {planForm.summary && (
                            <div className="mt-2 rounded-lg bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                              {planForm.summary}
                            </div>
                          )}

                          <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">
                              ₹{planForm.introductory_price_rupees || planForm.price_rupees || "0"}
                            </span>
                            {Number(planForm.introductory_price_rupees) < Number(planForm.price_rupees) && (
                              <span className="text-sm font-semibold text-slate-500 line-through">
                                ₹{planForm.price_rupees}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              /{planForm.duration_months === 1 ? "mo" : `${planForm.duration_months} mos`}
                            </span>
                          </div>

                          <p className="text-[11px] font-semibold text-emerald-400 mt-1">
                            No hidden fees
                          </p>

                          {/* Dynamic Features List */}
                          <ul className="mt-4 space-y-2 text-xs text-slate-300">
                            {(planForm.features || []).map((feat, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                <span className="line-clamp-1">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-6 pt-3 border-t border-slate-800">
                          <div
                            className={`w-full py-2.5 text-center text-xs font-bold rounded-xl transition ${
                              planForm.is_highlighted === 1
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            Choose {planForm.name || "Plan"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-2 px-6 py-3 border-t border-slate-100 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setShowPlanModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="plan-config-form"
                      className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 text-xs shadow-sm transition"
                    >
                      {planForm.id ? "Save & Publish Changes" : "Create Plan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: COUPONS & DISCOUNTS
        ======================================================== */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Promo & Campaign Coupons</h3>
                  <p className="text-xs text-slate-500">
                    Create percentage or flat discount codes with limits, cohort targeting, and soft deletion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <Plus size={15} />
                  <span>Create Coupon</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <div className="relative flex-1 w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    placeholder="Search by code, campaign name, or description..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={couponStatusFilter}
                    onChange={(e) => setCouponStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="disabled">Disabled Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Code & Name</th>
                      <th className="py-3 px-3">Discount</th>
                      <th className="py-3 px-3">Max Cap</th>
                      <th className="py-3 px-3">Redemptions</th>
                      <th className="py-3 px-3">Expiry Date</th>
                      <th className="py-3 px-3">Target Cohort</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons
                      .filter((c) => {
                        if (couponStatusFilter === "active" && !c.is_active) return false;
                        if (couponStatusFilter === "disabled" && c.is_active) return false;
                        if (couponSearch) {
                          const term = couponSearch.toLowerCase();
                          const matchCode = c.code?.toLowerCase().includes(term);
                          const matchName = c.name?.toLowerCase().includes(term);
                          const matchDesc = c.description?.toLowerCase().includes(term);
                          if (!matchCode && !matchName && !matchDesc) return false;
                        }
                        return true;
                      })
                      .map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-emerald-700 block">{c.code}</span>
                            {c.name && <span className="font-semibold text-slate-800 text-[11px] block">{c.name}</span>}
                            {c.description && (
                              <span className="text-[10px] text-slate-400 block line-clamp-1">{c.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {c.discount_type === "percent"
                              ? `${c.discount_value}% OFF`
                              : `₹${formatRupees(c.discount_value)} OFF`}
                          </td>
                          <td className="py-3 px-3">
                            {c.max_discount_paise ? `₹${formatRupees(c.max_discount_paise)}` : "No Cap"}
                          </td>
                          <td className="py-3 px-3">
                            {c.redemptions_count} {c.max_redemptions ? `/ ${c.max_redemptions}` : "(unlimited)"}
                          </td>
                          <td className="py-3 px-3">{c.valid_until ? formatDate(c.valid_until) : "Never"}</td>
                          <td className="py-3 px-3">
                            {c.target_cohort ? (
                              <span className="rounded bg-sky-50 text-sky-700 px-1.5 py-0.5 text-[10px] font-bold">
                                {c.target_cohort}
                              </span>
                            ) : (
                              "All Users"
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {c.is_active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleCouponActive(c)}
                                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                              >
                                {c.is_active ? "Disable" : "Enable"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartEditCoupon(c)}
                                className="rounded-lg bg-slate-100 p-1 text-slate-700 hover:bg-slate-200 transition"
                                title="Edit Coupon"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(c)}
                                className="rounded-lg bg-red-50 p-1 text-red-600 hover:bg-red-100 transition"
                                title="Delete Coupon"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Coupon Modal */}
            {showCouponModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900">Create New Coupon</h4>
                    <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-slate-700">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Coupon Code</label>
                        <input
                          type="text"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. FESTIVE50"
                          className="w-full rounded-xl border border-slate-300 p-2.5 uppercase font-medium focus:border-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                        <select
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        >
                          <option value="percent">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Campaign Name (Optional)</label>
                        <input
                          type="text"
                          value={couponForm.name}
                          onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                          placeholder="e.g. Diwali Super Saver"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Campaign Description</label>
                        <input
                          type="text"
                          value={couponForm.description}
                          onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                          placeholder="e.g. Applicable on all 1-year plans"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {couponForm.discount_type === "percent" ? "Percentage Value (1-100)" : "Flat Rupees (₹)"}
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                          placeholder={couponForm.discount_type === "percent" ? "20" : "120"}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Max Cap (₹, optional)</label>
                        <input
                          type="number"
                          step="1"
                          value={couponForm.max_discount_rupees}
                          onChange={(e) => setCouponForm({ ...couponForm, max_discount_rupees: e.target.value })}
                          placeholder="e.g. 500"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Total Max Redemptions</label>
                        <input
                          type="number"
                          value={couponForm.max_redemptions}
                          onChange={(e) => setCouponForm({ ...couponForm, max_redemptions: e.target.value })}
                          placeholder="e.g. 100 (blank = unlimited)"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Per User Limit</label>
                        <input
                          type="number"
                          value={couponForm.per_user_limit}
                          onChange={(e) => setCouponForm({ ...couponForm, per_user_limit: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Expiry Date (optional)</label>
                        <input
                          type="date"
                          value={couponForm.valid_until}
                          onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Target Cohort (optional)</label>
                        <input
                          type="text"
                          value={couponForm.target_cohort}
                          onChange={(e) => setCouponForm({ ...couponForm, target_cohort: e.target.value })}
                          placeholder="e.g. 2026-10"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowCouponModal(false)}
                        className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
                      >
                        Create Coupon
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Coupon Modal */}
            {showEditCouponModal && editingCoupon && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900">Edit Coupon: {editingCoupon.code}</h4>
                    <button onClick={() => setShowEditCouponModal(false)} className="text-slate-400 hover:text-slate-700">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditCoupon} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Coupon Code (Read-Only)</label>
                        <input
                          type="text"
                          value={couponForm.code}
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-bold text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                        <select
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        >
                          <option value="percent">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Campaign Name</label>
                        <input
                          type="text"
                          value={couponForm.name}
                          onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Campaign Description</label>
                        <input
                          type="text"
                          value={couponForm.description}
                          onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {couponForm.discount_type === "percent" ? "Percentage Value (1-100)" : "Flat Rupees (₹)"}
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Max Cap (₹, optional)</label>
                        <input
                          type="number"
                          step="1"
                          value={couponForm.max_discount_rupees}
                          onChange={(e) => setCouponForm({ ...couponForm, max_discount_rupees: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Total Max Redemptions</label>
                        <input
                          type="number"
                          value={couponForm.max_redemptions}
                          onChange={(e) => setCouponForm({ ...couponForm, max_redemptions: e.target.value })}
                          placeholder="Blank = unlimited"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Per User Limit</label>
                        <input
                          type="number"
                          value={couponForm.per_user_limit}
                          onChange={(e) => setCouponForm({ ...couponForm, per_user_limit: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={couponForm.valid_until}
                          onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Target Cohort</label>
                        <input
                          type="text"
                          value={couponForm.target_cohort}
                          onChange={(e) => setCouponForm({ ...couponForm, target_cohort: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowEditCouponModal(false)}
                        className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4B: PROMOTIONS & SEASONAL FLASH SALES
        ======================================================== */}
        {activeTab === "promotions" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    <span>Seasonal Promotions & Flash Sales</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Time-bounded promotional campaigns (hourly/daily/festival) with non-stacking rules and cohort targeting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCreatePromo}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <Plus size={15} />
                  <span>Create Campaign</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Campaign Name & Code</th>
                      <th className="py-3 px-3">Discount</th>
                      <th className="py-3 px-3">Active Window</th>
                      <th className="py-3 px-3">Audience</th>
                      <th className="py-3 px-3">Redemptions</th>
                      <th className="py-3 px-3">Stacking</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promotions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-400">
                          No promotional campaigns configured yet. Click "Create Campaign" to launch a flash sale or seasonal discount.
                        </td>
                      </tr>
                    ) : (
                      promotions.map((p) => {
                        const now = new Date();
                        const starts = new Date(p.starts_at);
                        const ends = new Date(p.ends_at);
                        const isExpired = ends < now;
                        const isPending = starts > now;
                        const isLive = p.is_active && !isExpired && !isPending;

                        return (
                          <tr key={p.id}>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block">{p.name}</span>
                              {p.code && (
                                <span className="font-mono text-emerald-700 text-[11px] font-semibold">{p.code}</span>
                              )}
                              {p.plan_code && (
                                <span className="text-[10px] text-slate-400 block">Plan: {p.plan_code}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {p.discount_type === "percent"
                                ? `${p.discount_value}% OFF`
                                : `₹${formatRupees(p.discount_value)} OFF`}
                              {p.max_discount_paise && (
                                <span className="text-[10px] text-slate-400 block">
                                  Cap: ₹{formatRupees(p.max_discount_paise)}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="block">{formatDate(p.starts_at)}</span>
                              <span className="text-[10px] text-slate-400 block">to {formatDate(p.ends_at)}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 capitalize">
                                {p.user_eligibility.replace("_", " ")}
                              </span>
                              {p.target_cohort && (
                                <span className="block text-[10px] text-sky-600 mt-0.5">Cohort: {p.target_cohort}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {p.redemptions_count} {p.max_redemptions ? `/ ${p.max_redemptions}` : ""}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  p.can_stack_with_coupon
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {p.can_stack_with_coupon ? "Stackable" : "Non-stacking"}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  isLive
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isPending
                                    ? "bg-amber-100 text-amber-800"
                                    : isExpired
                                    ? "bg-slate-100 text-slate-500"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {isLive ? "Live" : isPending ? "Scheduled" : isExpired ? "Expired" : "Disabled"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePromoActive(p)}
                                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                                >
                                  {p.is_active ? "Disable" : "Enable"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPromo(p)}
                                  className="rounded-lg bg-slate-100 p-1 text-slate-700 hover:bg-slate-200 transition"
                                  title="Edit Campaign"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePromo(p)}
                                  className="rounded-lg bg-red-50 p-1 text-red-600 hover:bg-red-100 transition"
                                  title="Delete Campaign"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create / Edit Promotion Modal */}
            {showPromoModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900">
                      {promoForm.id ? "Edit Promotion Campaign" : "Create Promotional Campaign"}
                    </h4>
                    <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-slate-700">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSavePromo} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Campaign Name</label>
                        <input
                          type="text"
                          value={promoForm.name}
                          onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                          placeholder="e.g. Diwali Flash Sale"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Campaign Code (Optional)</label>
                        <input
                          type="text"
                          value={promoForm.code}
                          onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. DIWALI2026"
                          className="w-full rounded-xl border border-slate-300 p-2.5 uppercase font-medium focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                        <select
                          value={promoForm.discount_type}
                          onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        >
                          <option value="percent">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {promoForm.discount_type === "percent" ? "Percentage (1-100)" : "Flat Rupees (₹)"}
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={promoForm.discount_value}
                          onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                          placeholder={promoForm.discount_type === "percent" ? "30" : "500"}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Max Cap (₹, optional)</label>
                        <input
                          type="number"
                          step="1"
                          value={promoForm.max_discount_rupees}
                          onChange={(e) => setPromoForm({ ...promoForm, max_discount_rupees: e.target.value })}
                          placeholder="e.g. 1000"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Applicable Plan</label>
                        <select
                          value={promoForm.plan_code}
                          onChange={(e) => setPromoForm({ ...promoForm, plan_code: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        >
                          <option value="">All Subscription Plans</option>
                          {plans.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name} ({p.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Starts At (Date & Time)</label>
                        <input
                          type="datetime-local"
                          value={promoForm.starts_at}
                          onChange={(e) => setPromoForm({ ...promoForm, starts_at: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Ends At (Date & Time)</label>
                        <input
                          type="datetime-local"
                          value={promoForm.ends_at}
                          onChange={(e) => setPromoForm({ ...promoForm, ends_at: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">User Eligibility</label>
                        <select
                          value={promoForm.user_eligibility}
                          onChange={(e) => setPromoForm({ ...promoForm, user_eligibility: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        >
                          <option value="all">All Users</option>
                          <option value="new_user">New Users Only</option>
                          <option value="renewal">Renewing Users Only</option>
                          <option value="cohort">Target Cohort Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Target Cohort (if cohort)</label>
                        <input
                          type="text"
                          value={promoForm.target_cohort}
                          onChange={(e) => setPromoForm({ ...promoForm, target_cohort: e.target.value })}
                          placeholder="e.g. 2026-10"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Total Max Redemptions</label>
                        <input
                          type="number"
                          value={promoForm.max_redemptions}
                          onChange={(e) => setPromoForm({ ...promoForm, max_redemptions: e.target.value })}
                          placeholder="Blank = unlimited"
                          className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={promoForm.can_stack_with_coupon === 1}
                            onChange={(e) =>
                              setPromoForm({ ...promoForm, can_stack_with_coupon: e.target.checked ? 1 : 0 })
                            }
                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-slate-700">Allow Stacking with Coupons</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowPromoModal(false)}
                        className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
                      >
                        {promoForm.id ? "Save Changes" : "Launch Promotion"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: ORDERS & PAYMENTS
        ======================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payment & Order Records</h3>
                  <p className="text-xs text-slate-500">
                    Audit all subscription orders, provider transactions, and generated invoices.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order or customer..."
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => {
                      setOrderStatusFilter(e.target.value);
                      loadOrders(1);
                    }}
                    className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="created">Created</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button
                    onClick={() => loadOrders(1)}
                    className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900"
                  >
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Order / Invoice</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Plan</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Provider</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 px-3">
                          <p className="font-mono font-bold text-slate-900">{o.order_number}</p>
                          {o.invoice_number && <p className="text-[10px] text-emerald-600 font-semibold">{o.invoice_number}</p>}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{o.user_name}</p>
                          <p className="text-[10px] text-slate-400">{o.user_email}</p>
                        </td>
                        <td className="py-3 px-3">{o.plan_name}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">₹{formatRupees(o.total_paise)}</td>
                        <td className="py-3 px-3 font-mono text-[11px] uppercase">{o.provider}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              o.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "created"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">{formatDate(o.created_at)}</td>
                        <td className="py-3 px-3 text-right">
                          {o.status === "paid" && (
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(o.id, o.invoice_number)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              <Download size={12} />
                              <span>PDF</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {orderPagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    Page {orderPage} of {orderPagination.pages} ({orderPagination.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={orderPage <= 1}
                      onClick={() => loadOrders(orderPage - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      disabled={orderPage >= orderPagination.pages}
                      onClick={() => loadOrders(orderPage + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: USER LOOKUP, ALERTS & COMPLIMENTARY GRANTS
        ======================================================== */}
        {activeTab === "lookup" && (
          <div className="space-y-6">
            {/* Subscription Alerts Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-500" />
                    <span>Real-Time Subscription Alerts</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Accounts requiring renewal outreach or immediate attention.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAlerts}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Refresh Alerts
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Expiring Today */}
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700">Expiring Today</span>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                      {alerts.summary?.todayCount || 0}
                    </span>
                  </div>
                  {alerts.expiringToday?.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No subscriptions expiring today.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {alerts.expiringToday.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-xs border border-red-100 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.phone || u.email} · {u.plan_name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectUser(u.id)}
                            className="rounded bg-red-100 px-2 py-1 text-[10px] font-bold text-red-800 hover:bg-red-200"
                          >
                            Inspect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expiring Soon (Next 7 Days) */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Next 7 Days</span>
                    <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-black text-white">
                      {alerts.summary?.soonCount || 0}
                    </span>
                  </div>
                  {alerts.expiringSoon?.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No subscriptions expiring in next 7 days.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {alerts.expiringSoon.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-xs border border-amber-100 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-amber-700 font-semibold">{u.days_left}d left · {u.plan_name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectUser(u.id)}
                            className="rounded bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800 hover:bg-amber-200"
                          >
                            Inspect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expired in Last 14 Days */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Expired (14 Days)</span>
                    <span className="rounded-full bg-slate-600 px-2 py-0.5 text-xs font-black text-white">
                      {alerts.summary?.expiredCount || 0}
                    </span>
                  </div>
                  {alerts.expiredRecently?.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No recent expirations recorded.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {alerts.expiredRecently.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-xs border border-slate-200 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.days_ago}d ago · {u.plan_name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectUser(u.id)}
                            className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                          >
                            Inspect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Multi-field User Search Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Multi-Field User Lookup</h3>
                <p className="text-xs text-slate-500">
                  Search across User ID, Full Name, Business Name, Phone Number, or Email address.
                </p>
              </div>

              <form onSubmit={handleSearchUsers} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Enter ID, Name, Business, Phone, or Email..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingUsers}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition disabled:opacity-50"
                >
                  {isSearchingUsers ? "Searching..." : "Search Users"}
                </button>
              </form>

              {/* Search Results Dropdown/List */}
              {userSearchResults.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden mt-3">
                  <div className="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    Matching Users ({userSearchResults.length})
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {userSearchResults.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{u.name}</span>
                            <span className="font-mono text-slate-400 text-[11px]">#{u.id}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                u.subscription_display_status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : u.subscription_display_status === "expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {u.subscription_display_status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            {u.email} · {u.phone || "No phone"} · {u.business_name || "No Business"}
                          </p>
                          {u.subscription_plan_name && (
                            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                              Plan: {u.subscription_plan_name} (Expires: {formatDate(u.subscription_ends_at)})
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectUser(u.id)}
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-xs"
                        >
                          Inspect & Manage
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lookedUpUser && (
                <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
                  {/* User Profile Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{lookedUpUser.user.name} (ID: #{lookedUpUser.user.id})</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            lookedUpUser.user.has_used_intro_offer
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {lookedUpUser.user.has_used_intro_offer ? "Intro Offer: Used" : "Intro Offer: Eligible"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{lookedUpUser.user.email} · {lookedUpUser.user.phone || "No phone"}</p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{lookedUpUser.user.business_name || "No Business Name"}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {lookedUpUser.user.has_used_intro_offer === 1 && (
                        <button
                          type="button"
                          onClick={() => handleResetIntroOffer(lookedUpUser.user.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 shadow-sm"
                        >
                          <RotateCcw size={14} />
                          <span>Reset Intro Offer</span>
                        </button>
                      )}

                      {lookedUpUser.subscriptions?.some((s) => new Date(s.ends_at) > new Date()) && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSubscription(lookedUpUser.user.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 shadow-sm"
                        >
                          <ShieldAlert size={14} />
                          <span>Revoke Subscription</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowGrantModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                      >
                        <Gift size={14} />
                        <span>Grant Complimentary Plan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 shadow-sm"
                      >
                        <Trash2 size={14} />
                        <span>Delete User</span>
                      </button>
                    </div>
                  </div>

                  {/* Subscriptions */}
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Subscription History</h5>
                    {lookedUpUser.subscriptions?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No subscriptions recorded.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                              <th className="py-2.5 px-3">Plan</th>
                              <th className="py-2.5 px-3">Starts At</th>
                              <th className="py-2.5 px-3">Ends At</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {lookedUpUser.subscriptions.map((s) => (
                              <tr key={s.id}>
                                <td className="py-2.5 px-3 font-semibold text-slate-800">{s.plan_name}</td>
                                <td className="py-2.5 px-3">{formatDate(s.starts_at)}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{formatDate(s.ends_at)}</td>
                                <td className="py-2.5 px-3">
                                  {s.is_complimentary ? (
                                    <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-bold">
                                      Complimentary
                                    </span>
                                  ) : (
                                    <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                                      Paid
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                      new Date(s.ends_at) > new Date()
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {new Date(s.ends_at) > new Date() ? "Active" : "Expired"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Grant Modal */}
            {showGrantModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-900">Grant Complimentary Subscription</h4>
                    <button onClick={() => setShowGrantModal(false)} className="text-slate-400 hover:text-slate-700">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleGrantSubscription} className="space-y-3 text-xs">
                    <div>
                      <p className="text-slate-500 mb-2">
                        Granting for: <strong className="text-slate-800">{lookedUpUser.user.name}</strong> (#{lookedUpUser.user.id})
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Select Plan Duration</label>
                      <select
                        value={grantForm.plan_code}
                        onChange={(e) => setGrantForm({ ...grantForm, plan_code: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                      >
                        {plans.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name} ({p.duration_months} Months)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Notes / Reason</label>
                      <textarea
                        rows={2}
                        value={grantForm.notes}
                        onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
                        placeholder="e.g. Grandfathered legacy user or customer care support"
                        className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowGrantModal(false)}
                        className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
                      >
                        Confirm Grant
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 7: SUBSCRIPTION SETTINGS & PAYMENT GATEWAY
        ======================================================== */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Payment Provider & Gateway Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Key size={18} className="text-emerald-600" />
                    <span>Payment Gateway Provider Status</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live production status and credentials security diagnostics. Secrets are never exposed.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      gatewayStatus?.isConfigured
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${gatewayStatus?.isConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span>{gatewayStatus?.mode?.toUpperCase() || "UNCONFIGURED"}</span>
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gateway Provider</span>
                  <p className="mt-1 text-base font-extrabold text-slate-900 capitalize">
                    {gatewayStatus?.provider || "Not Configured"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {gatewayStatus?.provider === "razorpay" ? "Official Razorpay Node.js SDK" : "Development Mock Adapter"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Public Key Preview</span>
                  <p className="mt-1 text-base font-mono font-bold text-slate-900">
                    {gatewayStatus?.keyIdPreview || "Not Configured"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Safe frontend identifier
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Webhook Secret</span>
                  <p className="mt-1 text-base font-bold text-slate-900 flex items-center gap-1.5">
                    {gatewayStatus?.hasWebhookSecret ? (
                      <>
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span className="text-emerald-700">Configured (Protected)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-amber-600" />
                        <span className="text-amber-700">Not Configured</span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    HMAC signature verification
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-100 p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Security Guard:</strong> Live production environments strictly reject mock payment adapters. Razorpay secrets and webhook secrets are stored in protected environment variables and are never displayed or exposed over API.
                </span>
              </div>
            </div>

            {/* Global Subscription Settings Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders size={18} className="text-emerald-600" />
                  <span>Platform Subscription Rules & Enforcement</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure tax treatment, introductory offer access, reminder triggers, and write enforcement.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSettings(false);
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Introductory Offer Toggle */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 text-xs">Platform-wide Introductory Offers</label>
                      <input
                        type="checkbox"
                        checked={settingsForm.intro_offers_enabled === 1}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            intro_offers_enabled: e.target.checked ? 1 : 0,
                          })
                        }
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      When enabled, first-time registered users can purchase plans at discounted introductory prices. When disabled, standard regular prices apply to everyone.
                    </p>
                  </div>

                  {/* Subscription Write Enforcement */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <label className="block font-bold text-slate-900 text-xs">
                      Subscription Write Access Enforcement
                    </label>
                    <select
                      value={settingsForm.subscription_enforcement}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          subscription_enforcement: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="off">Off — Standard Free Access (Soft Banners Only)</option>
                      <option value="on">On — Strict Enforcement (Read-Only Writes for Unsubscribed)</option>
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Default is <strong>Off</strong> to ensure existing users are never blocked. Turning this <strong>On</strong> blocks unsubscribed users from creating customers, invoices, debit/credit entries, and collections.
                    </p>
                  </div>

                  {/* Tax Percentage */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <label className="block font-bold text-slate-900 text-xs">GST Tax Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="50"
                      value={settingsForm.tax_percent}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          tax_percent: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      Default standard rate is 18.00%. Used for official tax breakdown and reverse calculation.
                    </p>
                  </div>

                  {/* Tax Inclusive Pricing */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 text-xs">Tax-Inclusive Advertised Pricing</label>
                      <input
                        type="checkbox"
                        checked={settingsForm.tax_inclusive === 1}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            tax_inclusive: e.target.checked ? 1 : 0,
                          })
                        }
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      When checked, displayed checkout totals include GST (no surprise charges). The taxable amount is automatically back-calculated to the single paisa.
                    </p>
                  </div>

                  {/* Expiry Reminders */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 text-xs">Automated Renewal Notifications</label>
                      <input
                        type="checkbox"
                        checked={settingsForm.reminders_enabled === 1}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            reminders_enabled: e.target.checked ? 1 : 0,
                          })
                        }
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Send scheduled renewal alerts and reminder emails before subscription expiration.
                    </p>
                  </div>

                  {/* Reminder Schedule */}
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <label className="block font-bold text-slate-900 text-xs">
                      Reminder Days Schedule (Days Before Expiry)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.reminder_days}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          reminder_days: e.target.value,
                        })
                      }
                      placeholder="e.g. 7,3,1"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500">
                      Comma-separated list of days before expiration to trigger automated notifications (e.g. "7,3,1").
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loadingSettings}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {loadingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={14} />}
                    <span>Save Platform Settings</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Audit Log Trail */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <FileText size={18} className="text-emerald-600" />
                <span>Subscription Settings Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Immutable chronological log of all administrative updates, price revisions, and complimentary grants.
              </p>

              {auditHistory.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No administrative changes recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Admin</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Details / Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {auditHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-slate-500 font-sans">{formatDate(item.created_at)}</td>
                          <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                            {item.superadmin_name || `Admin #${item.superadmin_id}`}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="rounded-md bg-slate-100 text-slate-800 px-2 py-0.5 text-[10px] font-bold">
                              {item.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate text-slate-600" title={item.new_value}>
                            {item.new_value || item.previous_value || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Confirmation Modal for Activating Enforcement */}
            {showEnforcementModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-3 text-amber-600">
                    <AlertCircle size={24} className="shrink-0" />
                    <h4 className="font-bold text-slate-900 text-base">Confirm Write Access Enforcement</h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Activating subscription write enforcement will immediately restrict all users without an active subscription to <strong>read-only mode</strong>. They will not be able to create new customers, invoices, debit/credit records, or collections.
                  </p>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                    Are you sure you want to enforce subscription restrictions platform-wide?
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEnforcementModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveSettings(true)}
                      className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow"
                    >
                      Yes, Enable Write Enforcement
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        user={lookedUpUser?.user}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={(res) => {
          alert(res.message || "User account updated successfully.");
          setLookedUpUser(null);
          setLookupUserId("");
          loadOverview();
        }}
      />
    </div>
  );
}

