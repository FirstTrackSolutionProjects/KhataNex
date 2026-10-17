import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  Camera,
  Layers,
  MessageSquare,
  FileText,
  Activity,
  History,
  Building,
  Menu,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
} from "lucide-react";
import api, { fileUrl } from "../lib/api";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

const AVAILABLE_MODULES = [
  { id: "users", label: "My Users", description: "View customer accounts & profiles" },
  { id: "customers", label: "Customers", description: "Manage customer directory" },
  { id: "khata", label: "Khata", description: "Digital ledger & balance entries" },
  { id: "invoices", label: "Invoices", description: "Create & view GST invoices" },
  { id: "quotations", label: "Quotations", description: "Estimates & quotation records" },
  { id: "payments", label: "Payments", description: "Payment receipts & ledger entries" },
  { id: "inventory", label: "Inventory", description: "Stock items & purchase bills" },
  { id: "vehicles", label: "Vehicles", description: "Fleet trips & waybill records" },
  { id: "banking", label: "Banking", description: "Bank accounts & statements" },
  { id: "reports", label: "Reports", description: "Financial reporting & P&L" },
  { id: "billing", label: "Billing & Subscriptions", description: "Read-only access to customer plans & tax invoices" },
  { id: "help_centre", label: "Help Centre", description: "Customer support tickets & chat" },
];

const MODULE_OPERATIONS = {
  users: ["view", "create", "edit"],
  customers: ["view", "create", "edit", "delete"],
  khata: ["view", "create", "edit", "delete"],
  invoices: ["view", "create", "edit", "delete", "download"],
  quotations: ["view", "create", "edit", "delete", "download"],
  payments: ["view", "create", "edit", "delete"],
  inventory: ["view", "create", "edit", "delete"],
  vehicles: ["view", "create", "edit", "delete"],
  banking: ["view", "create", "edit", "delete"],
  reports: ["view", "download"],
  billing: ["view", "download"],
  help_centre: ["view", "create", "edit"],
};

export default function MyEmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusToggling, setStatusToggling] = useState(false);

  // Drill-down expanded log state
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    secondary_phone: "",
    employee_code: "",
    employee_title: "",
    employee_role_type: "staff",
    joining_date: "",
    emergency_contact: "",
    notes: "",
    date_of_birth: "",
    employee_age: "",
    address: "",
    pan: "",
    aadhaar_number: "",
    passport_number: "",
    assigned_modules: [],
    permissions: [],
  });

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/api/superadmin/employees/${id}`);
      if (res?.success && res.employee) {
        setEmployee(res.employee);
      } else {
        throw new Error(res?.message || "Employee record not found.");
      }
    } catch (err) {
      console.error("Failed to load employee:", err);
      setError(err.message || "Failed to load employee details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const handleOpenEdit = () => {
    if (!employee) return;

    let empPerms = [];
    if (Array.isArray(employee.permissions)) {
      empPerms = employee.permissions;
    } else if (typeof employee.permissions === "string") {
      try { empPerms = JSON.parse(employee.permissions); } catch (_) { empPerms = []; }
    }
    const empAssigned = Array.isArray(employee.assigned_modules)
      ? employee.assigned_modules
      : typeof employee.assigned_modules === "string"
      ? (() => { try { return JSON.parse(employee.assigned_modules); } catch (_) { return []; } })()
      : [];

    if (empPerms.length === 0 && empAssigned.length > 0) {
      empAssigned.forEach((mId) => {
        const ops = MODULE_OPERATIONS[mId] || ["view", "create", "edit"];
        ops.forEach((op) => empPerms.push(`${mId}:${op}`));
      });
    }

    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      password: "",
      phone: employee.phone || "",
      secondary_phone: employee.secondary_phone || "",
      employee_code: employee.employee_code || "",
      employee_title: employee.employee_title || "",
      employee_role_type: employee.employee_role_type || "staff",
      joining_date: employee.joining_date ? employee.joining_date.slice(0, 10) : "",
      emergency_contact: employee.emergency_contact || "",
      notes: employee.notes || "",
      date_of_birth: employee.date_of_birth ? employee.date_of_birth.slice(0, 10) : "",
      employee_age: employee.employee_age || "",
      address: employee.address || "",
      pan: employee.pan || "",
      aadhaar_number: employee.aadhaar_number || "",
      passport_number: employee.passport_number || "",
      assigned_modules: empAssigned,
      permissions: empPerms,
    });
    setPhotoFile(null);
    setPhotoPreview(employee.profile_photo_path ? fileUrl(employee.profile_photo_path) : null);
    setEditError("");
    setShowPassword(false);
    setShowEditModal(true);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setEditError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditError("Image size must be less than 5MB.");
      return;
    }

    setPhotoFile(file);
    if (photoPreview && !photoPreview.startsWith("http")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(URL.createObjectURL(file));
    setEditError("");
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleModuleToggle = (modId) => {
    const current = formData.assigned_modules || [];
    const ops = MODULE_OPERATIONS[modId] || ["view", "create", "edit"];
    if (current.includes(modId)) {
      setFormData({
        ...formData,
        assigned_modules: current.filter((m) => m !== modId),
        permissions: (formData.permissions || []).filter((p) => !p.startsWith(`${modId}:`)),
      });
    } else {
      const defaultPerms = ops.filter((op) => op !== "delete").map((op) => `${modId}:${op}`);
      setFormData({
        ...formData,
        assigned_modules: [...current, modId],
        permissions: [...new Set([...(formData.permissions || []), ...defaultPerms])],
      });
    }
  };

  const handleOperationToggle = (modId, op) => {
    const permKey = `${modId}:${op}`;
    const current = formData.permissions || [];
    if (current.includes(permKey)) {
      setFormData({
        ...formData,
        permissions: current.filter((p) => p !== permKey),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...current, permKey],
      });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      if (photoFile) {
        const fd = new FormData();
        Object.keys(formData).forEach((k) => {
          if (k === "password" && !formData[k]) return;
          if (k === "assigned_modules") {
            fd.append(k, JSON.stringify(formData[k]));
          } else if (k === "permissions") {
            fd.append(k, JSON.stringify(formData[k]));
          } else {
            fd.append(k, formData[k]);
          }
        });
        fd.append("profile_photo", photoFile);
        const res = await api.patchForm(`/api/superadmin/employees/${id}`, fd);
        if (res?.success) {
          setShowEditModal(false);
          await loadEmployee();
        }
      } else {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const res = await api.patch(`/api/superadmin/employees/${id}`, payload);
        if (res?.success) {
          setShowEditModal(false);
          await loadEmployee();
        }
      }
    } catch (err) {
      setEditError(err.message || "Failed to update employee.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!employee || statusToggling) return;
    try {
      setStatusToggling(true);
      const nextStatus = employee.status === "active" ? "inactive" : "active";
      const res = await api.patch(`/api/superadmin/employees/${employee.id}`, { status: nextStatus });
      if (res?.success) {
        await loadEmployee();
      }
    } catch (err) {
      alert(err.message || "Failed to update employee status.");
    } finally {
      setStatusToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center lg:pl-64">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-4xl text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Failed to Load Employee</h2>
          <p className="mt-1 text-sm text-slate-500">{error || "Employee not found."}</p>
          <button
            type="button"
            onClick={() => navigate("/my-employees")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-700"
          >
            <ArrowLeft size={14} />
            <span>Back to My Employees</span>
          </button>
        </div>
      </div>
    );
  }

  const assignedMods = Array.isArray(employee.assigned_modules) ? employee.assigned_modules : [];
  const ratingDist = employee.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = Number(employee.rating_count || 0);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-7xl space-y-6">
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
            <span className="font-bold text-slate-900 text-sm">Employee Details</span>
            <div className="w-8" />
          </div>

          {/* Breadcrumb & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/my-employees")}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition"
                title="Back to My Employees"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {employee.name || "Employee Profile"}
                  </h1>
                  {employee.employee_code && (
                    <span className="rounded-md bg-purple-100 px-2 py-0.5 font-mono text-xs font-bold text-purple-800">
                      {employee.employee_code}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      employee.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        employee.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {employee.employee_title || "KhataNex Operations Staff"} · Registered {new Date(employee.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusToggling}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition ${
                  employee.status === "active"
                    ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                {employee.status === "active" ? "Deactivate Account" : "Activate Account"}
              </button>

              <Button
                variant="primary"
                icon={Edit}
                size="sm"
                onClick={handleOpenEdit}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2"
              >
                Edit Details & Access
              </Button>
            </div>
          </div>

          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rating Average Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Customer Satisfaction</span>
                <Star size={16} className="text-amber-500 fill-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {employee.rating_avg > 0 ? employee.rating_avg.toFixed(1) : "—"}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 5.0</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Based on {totalReviews} verified {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Tickets Handled Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Support Tickets Handled</span>
                <MessageSquare size={16} className="text-purple-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {employee.tickets_handled || 0}
                </span>
                <span className="text-xs font-medium text-emerald-600">
                  ({employee.tickets_resolved || 0} resolved)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Help Centre tickets claimed & supported
              </p>
            </div>

            {/* Modules Permitted Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Module Authorizations</span>
                <Layers size={16} className="text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {assignedMods.includes("all") ? "All 12" : assignedMods.length}
                </span>
                <span className="text-xs font-medium text-slate-400">of 12 active</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Granular tenant access permissions
              </p>
            </div>

            {/* Online Activity Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Roster Activity</span>
                <Activity size={16} className="text-blue-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    employee.activity_status === "logged_in"
                      ? "bg-emerald-500 animate-ping"
                      : "bg-slate-300"
                  }`}
                />
                <span className="text-lg font-bold text-slate-900">
                  {employee.activity_status === "logged_in" ? "Online Now" : "Offline"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {employee.last_active_at
                  ? `Last active ${new Date(employee.last_active_at).toLocaleString("en-IN")}`
                  : "No recorded activity yet"}
              </p>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Profile & Assigned Modules) */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
                  <div className="relative mb-3">
                    {employee.profile_photo_path ? (
                      <img
                        src={fileUrl(employee.profile_photo_path)}
                        alt={employee.name || "Employee photo"}
                        className="h-24 w-24 rounded-2xl object-cover border-2 border-purple-200 shadow"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-24 w-24 rounded-2xl bg-purple-100 text-purple-700 font-black text-2xl flex items-center justify-center border-2 border-purple-200 shadow ${
                        employee.profile_photo_path ? "hidden" : "flex"
                      }`}
                    >
                      {employee.name ? employee.name.charAt(0).toUpperCase() : "E"}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg">{employee.name || "Staff Member"}</h3>
                  <p className="text-xs font-semibold text-purple-700">{employee.employee_title || "Operations Executive"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{employee.email}</p>
                </div>

                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Employee Code:</span>
                    <span className="font-mono font-bold text-slate-800">{employee.employee_code || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Primary Phone:</span>
                    <span className="font-medium text-slate-800">{employee.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Secondary Phone:</span>
                    <span className="font-medium text-slate-800">{employee.secondary_phone || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Emergency Contact:</span>
                    <span className="font-medium text-slate-800">{employee.emergency_contact || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Joining Date:</span>
                    <span className="font-medium text-slate-800">
                      {employee.joining_date
                        ? new Date(employee.joining_date).toLocaleDateString("en-IN")
                        : "—"}
                    </span>
                  </div>
                  {employee.address && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-medium text-slate-800 max-w-[180px] text-right truncate">
                        {employee.address}
                      </span>
                    </div>
                  )}
                  {employee.notes && (
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1">Internal Notes:</span>
                      <p className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 italic">
                        "{employee.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Module Access Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">Assigned Modules</h3>
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    Edit Access
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isAssigned = assignedMods.includes("all") || assignedMods.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={`flex items-center gap-2 rounded-xl p-2.5 border transition ${
                          isAssigned
                            ? "border-emerald-200 bg-emerald-50/50 text-slate-900"
                            : "border-slate-100 bg-slate-50/60 text-slate-400"
                        }`}
                      >
                        {isAssigned ? (
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-slate-300 shrink-0" />
                        )}
                        <span className={`text-[11px] font-semibold truncate ${isAssigned ? "text-slate-800" : "text-slate-400"}`}>
                          {mod.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (Customer Feedback & Audit History) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Customer Feedback & Ratings Summary Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Customer Feedback & Performance Ratings</h3>
                    <p className="text-xs text-slate-500">
                      Ratings submitted by business owners following resolved Help Centre support tickets.
                    </p>
                  </div>
                </div>

                {/* Rating Distribution Breakdown */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-4xl font-black text-slate-900">
                      {employee.rating_avg > 0 ? employee.rating_avg.toFixed(1) : "0.0"}
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= Math.round(employee.rating_avg || 0)
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 mt-1">
                      {totalReviews} {totalReviews === 1 ? "verified review" : "verified reviews"}
                    </span>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = ratingDist[stars] || 0;
                      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 text-xs">
                          <span className="w-12 font-medium text-slate-600 flex items-center gap-1">
                            {stars} <Star size={11} className="text-amber-500 fill-amber-400" />
                          </span>
                          <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-[11px] text-slate-400 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Reviews List */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                    Recent Customer Feedback
                  </h4>

                  {!employee.recent_feedback || employee.recent_feedback.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">
                      No customer reviews submitted for this employee yet. Ratings are recorded automatically after ticket resolution.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {employee.recent_feedback.map((fb) => (
                        <div
                          key={fb.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {fb.customer_name || "Customer"}
                              </span>
                              <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                {fb.ticket_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={12}
                                  className={s <= fb.rating ? "fill-amber-400 text-amber-500" : "text-slate-300"}
                                />
                              ))}
                            </div>
                          </div>

                          {fb.comment && (
                            <p className="text-xs text-slate-600 italic">
                              "{fb.comment}"
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Subject: {fb.ticket_subject || "Support Request"}</span>
                            <span>{new Date(fb.created_at).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Audit History Timeline Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-purple-600" />
                    <h3 className="font-bold text-slate-900 text-base">Account Audit History</h3>
                  </div>
                  <span className="text-xs text-slate-400">Expand any event for drill-down breakdown</span>
                </div>

                {!employee.audit_logs || employee.audit_logs.length === 0 ? (
                  <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">
                    No audit records logged for this employee account.
                  </div>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {employee.audit_logs.map((log) => {
                      let logDetails = {};
                      if (typeof log.details === "string") {
                        try { logDetails = JSON.parse(log.details); } catch (_) { logDetails = {}; }
                      } else if (log.details && typeof log.details === "object") {
                        logDetails = log.details;
                      }

                      const isExpanded = expandedLogId === log.id;
                      const hasDocPdf = Boolean(log.invoice_pdf || log.quotation_pdf || log.receipt_pdf || logDetails.pdf_path);
                      const docPdfUrl = log.invoice_pdf || log.quotation_pdf || log.receipt_pdf || logDetails.pdf_path;
                      const docNumber = log.invoice_number || log.quotation_number || log.receipt_number || logDetails.invoice_number || logDetails.bill_number;
                      const partyName = log.invoice_recipient || log.quotation_recipient || log.receipt_recipient || logDetails.customer_name || logDetails.party_name || logDetails.name;
                      const totalAmount = log.invoice_total || log.quotation_total || log.receipt_amount || logDetails.amount || logDetails.total_amount;
                      const itemsList = Array.isArray(logDetails.items)
                        ? logDetails.items
                        : (typeof logDetails.items === "string" ? (() => { try { return JSON.parse(logDetails.items); } catch (_) { return null; } })() : null);

                      return (
                        <div
                          key={log.id}
                          className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:border-purple-200 transition space-y-2.5"
                        >
                          <div
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="rounded-lg bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                                {log.action.replace(/_/g, " ")}
                              </span>
                              {log.target_type && (
                                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
                                  {log.target_type.replace(/_/g, " ")} #{log.target_id}
                                </span>
                              )}
                              {docNumber && (
                                <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                                  {docNumber}
                                </span>
                              )}
                              {partyName && (
                                <span className="text-xs font-semibold text-slate-700">
                                  {partyName}
                                </span>
                              )}
                              {totalAmount !== undefined && totalAmount !== null && Number(totalAmount) > 0 && (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  ₹{Number(totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-slate-400">
                                {new Date(log.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                              <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>

                          {/* Expandable Drill-Down Details Card */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-slate-100 space-y-3 text-xs animate-in fade-in-50">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Actor</span>
                                  <span className="font-semibold text-slate-800 capitalize">{log.actor_role} #{log.actor_id}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Target ID</span>
                                  <span className="font-mono text-slate-800 font-semibold">{log.target_id || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">IP Address</span>
                                  <span className="font-mono text-slate-800">{log.ip_address || "Internal"}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Exact Timestamp</span>
                                  <span className="text-slate-800">{new Date(log.created_at).toLocaleString("en-IN")}</span>
                                </div>
                              </div>

                              {/* Attributes Drilldown */}
                              {Object.keys(logDetails).length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Event Attributes</span>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(logDetails)
                                      .filter(([k]) => k !== "items")
                                      .map(([k, v]) => (
                                        <div key={k} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px]">
                                          <span className="text-slate-500 capitalize">{k.replace(/_/g, " ")}: </span>
                                          <span className="font-semibold text-slate-800">
                                            {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Items Breakdown if items exist */}
                              {Array.isArray(itemsList) && itemsList.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Itemized Breakdown</span>
                                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-[11px] text-slate-600">
                                      <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                                        <tr>
                                          <th className="py-2 px-3">Item / Product</th>
                                          <th className="py-2 px-3">Qty</th>
                                          <th className="py-2 px-3">Price</th>
                                          <th className="py-2 px-3 text-right">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {itemsList.map((it, idx) => (
                                          <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="py-1.5 px-3 font-semibold text-slate-800">
                                              {it.product_name || it.item_name || it.name || "Item"}
                                            </td>
                                            <td className="py-1.5 px-3">{it.quantity || it.qty || 1}</td>
                                            <td className="py-1.5 px-3">₹{Number(it.price || it.rate || 0).toFixed(2)}</td>
                                            <td className="py-1.5 px-3 text-right font-bold text-slate-800">
                                              ₹{Number((Number(it.quantity || 1) * Number(it.price || 0))).toFixed(2)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Document Action Button */}
                              {hasDocPdf && (
                                <div className="flex items-center justify-end pt-2">
                                  <a
                                    href={fileUrl(docPdfUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition"
                                  >
                                    <FileText size={14} />
                                    <span>View Official PDF</span>
                                    <ExternalLink size={12} className="opacity-70 ml-0.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Edit Employee: {employee.name || employee.email}
                </h3>
                <p className="text-xs text-slate-500">
                  Update profile information, contact info, and granular module permissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto text-xs">
              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  {editError}
                </div>
              )}

              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-xl object-cover border border-purple-300 shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl border border-purple-200">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : "E"}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-800">
                    Employee Profile Photo (Optional)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    JPG, PNG, or WEBP up to 5MB.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
                      <Camera size={13} />
                      <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Credentials & Contact */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-purple-700">
                  1. Credentials & Contact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-purple-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-slate-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <label className="block font-semibold text-slate-700 mb-1">Reset Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to keep"
                      className="w-full rounded-xl border border-slate-300 p-2.5 pr-9 focus:border-purple-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-8 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Mobile number"
                      className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Contact name & number"
                      className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Identification */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-purple-700">
                  2. Role & Identification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employee Code</label>
                    <input
                      type="text"
                      value={formData.employee_code}
                      onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Job Title (Optional)</label>
                    <input
                      type="text"
                      value={formData.employee_title}
                      onChange={(e) => setFormData({ ...formData, employee_title: e.target.value })}
                      placeholder="e.g. Support Specialist"
                      className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Module Permissions */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-purple-700">
                  3. Module Access & Operation Permissions
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = formData.assigned_modules.includes(mod.id);
                    const ops = MODULE_OPERATIONS[mod.id] || ["view", "create", "edit"];

                    return (
                      <div
                        key={mod.id}
                        className={`rounded-xl border p-3 transition ${
                          isChecked
                            ? "border-purple-200 bg-purple-50/50 text-purple-950"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div
                          onClick={() => handleModuleToggle(mod.id)}
                          className="flex items-start gap-2.5 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 pointer-events-none"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">{mod.label}</span>
                              {isChecked && (
                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                                  Enabled
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{mod.description}</span>
                          </div>
                        </div>

                        {/* Granular Operation Checkboxes when module is checked */}
                        {isChecked && (
                          <div className="mt-2.5 pt-2.5 border-t border-purple-100 pl-6 flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 self-center mr-1">
                              Operations:
                            </span>
                            {ops.map((op) => {
                              const permKey = `${mod.id}:${op}`;
                              const opChecked = (formData.permissions || []).includes(permKey);
                              return (
                                <label
                                  key={op}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer select-none transition ${
                                    opChecked
                                      ? "bg-white border-purple-300 text-purple-800 shadow-2xs"
                                      : "bg-purple-50/30 border-purple-100 text-slate-400 hover:text-slate-600"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={opChecked}
                                    onChange={() => handleOperationToggle(mod.id, op)}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="capitalize">{op}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={editLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2"
                >
                  {editLoading ? <RefreshCw size={14} className="animate-spin inline mr-1" /> : null}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
