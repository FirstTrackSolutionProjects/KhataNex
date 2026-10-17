import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  Phone,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  Menu,
  Briefcase,
  Layers,
  Camera,
  Star,
  MoreVertical,
  ChevronDown,
  Check,
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

export default function MyEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Accessible Action Dropdown State
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Photo State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form Fields
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
    assigned_modules: ["users", "help_centre"],
    permissions: ["users:view", "users:create", "users:edit", "help_centre:view", "help_centre:create", "help_centre:edit"],
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", page);
      params.append("limit", 20);

      const res = await api.get(`/api/superadmin/employees?${params.toString()}`);
      if (res?.success) {
        setEmployees(res.employees || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [search, statusFilter, page]);

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      secondary_phone: "",
      employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      employee_title: "",
      employee_role_type: "staff",
      joining_date: new Date().toISOString().slice(0, 10),
      emergency_contact: "",
      notes: "",
      assigned_modules: ["users", "help_centre"],
      permissions: ["users:view", "users:create", "users:edit", "help_centre:view", "help_centre:create", "help_centre:edit"],
    });
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setPhotoFile(null);
    setPhotoPreview(emp.profile_photo_path ? fileUrl(emp.profile_photo_path) : null);
    setPhotoError("");

    let empPerms = [];
    if (Array.isArray(emp.permissions)) {
      empPerms = emp.permissions;
    } else if (typeof emp.permissions === "string") {
      try { empPerms = JSON.parse(emp.permissions); } catch (_) { empPerms = []; }
    }
    const empAssigned = Array.isArray(emp.assigned_modules)
      ? emp.assigned_modules
      : typeof emp.assigned_modules === "string"
      ? (() => { try { return JSON.parse(emp.assigned_modules); } catch (_) { return []; } })()
      : ["users", "help_centre"];

    if (empPerms.length === 0 && empAssigned.length > 0) {
      empAssigned.forEach((mId) => {
        const ops = MODULE_OPERATIONS[mId] || ["view", "create", "edit"];
        ops.forEach((op) => empPerms.push(`${mId}:${op}`));
      });
    }

    setFormData({
      name: emp.name || "",
      email: emp.email || "",
      password: "",
      phone: emp.phone || "",
      secondary_phone: emp.secondary_phone || "",
      employee_code: emp.employee_code || "",
      employee_title: emp.employee_title || "",
      employee_role_type: emp.employee_role_type || "staff",
      joining_date: emp.joining_date ? emp.joining_date.slice(0, 10) : "",
      emergency_contact: emp.emergency_contact || "",
      notes: emp.notes || "",
      assigned_modules: empAssigned,
      permissions: empPerms,
    });
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    setPhotoError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Only JPG, PNG, and WEBP formats are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo file size cannot exceed 5MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError("");
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
      const defaultPerms = ops
        .filter((op) => op !== "delete")
        .map((op) => `${modId}:${op}`);
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

  const handleSelectAllModules = () => {
    const allMods = AVAILABLE_MODULES.map((m) => m.id);
    const allPerms = [];
    allMods.forEach((mId) => {
      const ops = MODULE_OPERATIONS[mId] || ["view", "create", "edit"];
      ops.filter((op) => op !== "delete").forEach((op) => allPerms.push(`${mId}:${op}`));
    });
    setFormData({
      ...formData,
      assigned_modules: allMods,
      permissions: allPerms,
    });
  };

  const handleClearAllModules = () => {
    setFormData({
      ...formData,
      assigned_modules: [],
      permissions: [],
    });
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setFormError("");
    setModalLoading(true);

    try {
      if (editingEmployee) {
        // Update employee
        if (photoFile) {
          const fd = new FormData();
          fd.append("profile_photo", photoFile);
          Object.keys(formData).forEach((k) => {
            if (k === "password" && !formData.password) return;
            if (k === "assigned_modules") {
              fd.append("assigned_modules", JSON.stringify(formData.assigned_modules));
            } else if (k === "permissions") {
              fd.append("permissions", JSON.stringify(formData.permissions));
            } else if (formData[k] !== undefined && formData[k] !== null) {
              fd.append(k, formData[k]);
            }
          });
          const res = await api.patchForm(`/api/superadmin/employees/${editingEmployee.id}`, fd);
          if (res?.success) {
            setSuccessMessage("Employee updated successfully.");
            setShowModal(false);
            await loadEmployees();
          }
        } else {
          const payload = { ...formData };
          if (!payload.password) delete payload.password;
          const res = await api.patch(`/api/superadmin/employees/${editingEmployee.id}`, payload);
          if (res?.success) {
            setSuccessMessage("Employee updated successfully.");
            setShowModal(false);
            await loadEmployees();
          }
        }
      } else {
        // Create employee
        if (!formData.email || !formData.password) {
          setFormError("Email and temporary password are required.");
          setModalLoading(false);
          return;
        }

        if (photoFile) {
          const fd = new FormData();
          fd.append("profile_photo", photoFile);
          Object.keys(formData).forEach((k) => {
            if (k === "assigned_modules") {
              fd.append("assigned_modules", JSON.stringify(formData.assigned_modules));
            } else if (k === "permissions") {
              fd.append("permissions", JSON.stringify(formData.permissions));
            } else if (formData[k] !== undefined && formData[k] !== null) {
              fd.append(k, formData[k]);
            }
          });
          const res = await api.postForm("/api/superadmin/employees", fd);
          if (res?.success) {
            setSuccessMessage("Employee created successfully.");
            setShowModal(false);
            await loadEmployees();
          }
        } else {
          const res = await api.post("/api/superadmin/employees", formData);
          if (res?.success) {
            setSuccessMessage("Employee created successfully.");
            setShowModal(false);
            await loadEmployees();
          }
        }
      }
    } catch (err) {
      setFormError(err.message || "Failed to save employee.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    try {
      const nextStatus = emp.status === "active" ? "inactive" : "active";
      const res = await api.patch(`/api/superadmin/employees/${emp.id}`, { status: nextStatus });
      if (res?.success) {
        setSuccessMessage(`Employee ${emp.name || emp.email} set to ${nextStatus}.`);
        await loadEmployees();
      }
    } catch (err) {
      alert(err.message || "Failed to change employee status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/api/superadmin/employees/${deleteTarget.id}`);
      if (res?.success) {
        setSuccessMessage(res.message || "Employee deactivated successfully.");
        setDeleteTarget(null);
        await loadEmployees();
      }
    } catch (err) {
      alert(err.message || "Failed to delete employee.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-slate-900 text-sm">Employee Roster</span>
            <div className="w-8" />
          </div>

          {/* Page Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Employees</h1>
                  <p className="text-xs text-slate-500">
                    Manage team accounts, role titles, and granular module access permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadEmployees}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>

              <Button
                variant="primary"
                icon={Plus}
                size="sm"
                onClick={handleOpenCreate}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2"
              >
                Add Employee
              </Button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, employee code, or title..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs outline-none focus:border-purple-600 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 shrink-0">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-purple-600 focus:bg-white transition"
              >
                <option value="all">All Employees</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Employees Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Role & Code</th>
                    <th className="py-3.5 px-4">Assigned Modules</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <RefreshCw size={20} className="animate-spin inline-block mr-2" />
                        Loading employee roster...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        No employees found matching the current search or filters.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => {
                      const assigned = Array.isArray(emp.assigned_modules) ? emp.assigned_modules : [];
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {emp.profile_photo_path ? (
                                <img
                                  src={fileUrl(emp.profile_photo_path)}
                                  alt={emp.name || "Employee"}
                                  className="h-10 w-10 shrink-0 rounded-xl object-cover border border-slate-200 shadow-sm"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-sm">
                                  {emp.name ? emp.name.charAt(0).toUpperCase() : "E"}
                                </div>
                              )}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/my-employees/${emp.id}`)}
                                  className="font-bold text-slate-900 hover:text-purple-700 block text-left transition"
                                >
                                  {emp.name || "Staff Member"}
                                </button>
                                <span className="text-[11px] text-slate-400">ID #{emp.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="block font-medium text-slate-800">{emp.email}</span>
                            {emp.phone && <span className="text-[11px] text-slate-400 block">{emp.phone}</span>}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">{emp.employee_title || "Staff Member"}</span>
                            {emp.employee_code && (
                              <span className="font-mono text-[10px] text-purple-700 bg-purple-50 rounded px-1.5 py-0.5 inline-block mt-0.5 font-bold">
                                {emp.employee_code}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[240px]">
                              {assigned.includes("all") ? (
                                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                                  All Modules
                                </span>
                              ) : assigned.length > 0 ? (
                                assigned.slice(0, 3).map((mod) => (
                                  <span key={mod} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 capitalize">
                                    {mod.replace(/_/g, " ")}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No modules assigned</span>
                              )}
                              {assigned.length > 3 && (
                                <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                  +{assigned.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {emp.rating_count > 0 ? (
                              <div className="flex items-center gap-1 text-slate-800 font-semibold">
                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                <span>{Number(emp.rating_avg).toFixed(1)}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({emp.rating_count})</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(emp)}
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                                emp.status === "active"
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                              title="Click to toggle status"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                              {emp.status === "active" ? "Active" : "Inactive"}
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="block text-[11px] text-slate-700 font-medium">
                              {emp.activity_status === "logged_in" ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                  Online Now
                                </span>
                              ) : emp.last_active_at ? (
                                `Active ${new Date(emp.last_active_at).toLocaleDateString("en-IN")}`
                              ) : (
                                "Never"
                              )}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(activeDropdownId === emp.id ? null : emp.id);
                                }}
                                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                                aria-label="Actions"
                                title="Employee Actions"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {activeDropdownId === emp.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20 cursor-default"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownId(null);
                                    }}
                                  />
                                  <div className="absolute right-0 z-30 mt-1.5 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 text-left">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        navigate(`/my-employees/${emp.id}`);
                                      }}
                                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                                    >
                                      <Eye size={15} />
                                      <span>View Profile</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        handleOpenEdit(emp);
                                      }}
                                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                                    >
                                      <Edit size={15} />
                                      <span>Edit Details & Access</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        handleToggleStatus(emp);
                                      }}
                                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                                    >
                                      <RefreshCw size={15} />
                                      <span>{emp.status === "active" ? "Deactivate Account" : "Activate Account"}</span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        setDeleteTarget(emp);
                                      }}
                                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                                    >
                                      <Trash2 size={15} />
                                      <span>Remove Employee</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/60 text-xs text-slate-500">
                <span>Total {total} employee accounts</span>
                <div className="flex gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-slate-200 px-3 py-1 font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 font-bold text-slate-700">Page {page} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-slate-200 px-3 py-1 font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingEmployee ? `Edit Employee: ${editingEmployee.name || editingEmployee.email}` : "Add New Employee Account"}
                </h3>
                <p className="text-xs text-slate-500">
                  Assign login credentials and configure delegated module permissions.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form id="employee-form" onSubmit={handleSaveEmployee} className="p-6 space-y-4 overflow-y-auto text-xs">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  {formError}
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-purple-700">1. Account Credentials & Contact</h4>

                {/* Optional Profile Photo */}
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
                  <label className="block font-semibold text-slate-700 mb-2">
                    Profile / Passport Photo (Optional)
                  </label>
                  <div className="flex items-center gap-3.5">
                    {photoPreview ? (
                      <div className="relative group h-14 w-14 rounded-xl overflow-hidden border border-purple-300 shadow-sm shrink-0">
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          title="Remove photo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-purple-50 border border-purple-200 flex flex-col items-center justify-center text-purple-400 shrink-0">
                        <Camera size={20} />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition">
                        <Camera size={13} className="text-purple-600" />
                        <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="block text-[11px] text-red-500 hover:underline"
                        >
                          Remove photo
                        </button>
                      )}
                      <p className="text-[10px] text-slate-400">JPG, PNG, or WEBP. Max size 5MB.</p>
                      {photoError && <p className="text-[11px] text-red-600 font-medium">{photoError}</p>}
                    </div>
                  </div>
                </div>

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
                    <label className="block font-semibold text-slate-700 mb-1">Email Address (Login Username)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@khatanex.com"
                      className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-purple-600 focus:outline-none"
                      required
                      disabled={Boolean(editingEmployee)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <label className="block font-semibold text-slate-700 mb-1">
                      {editingEmployee ? "Reset Password (optional)" : "Password"}
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingEmployee ? "Leave blank to keep" : "Minimum 6 characters"}
                      className="w-full rounded-xl border border-slate-300 p-2.5 pr-9 focus:border-purple-600 focus:outline-none"
                      required={!editingEmployee}
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
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
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
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-purple-700">2. Role & Identification</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employee Code</label>
                    <input
                      type="text"
                      value={formData.employee_code}
                      onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                      placeholder="e.g. EMP-1001"
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Job Title (Optional)</label>
                    <input
                      type="text"
                      value={formData.employee_title}
                      onChange={(e) => setFormData({ ...formData, employee_title: e.target.value })}
                      placeholder="e.g. Invoicing Executive"
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

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Responsibilities, department notes, or onboarding remarks..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-purple-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Granular Module Permission Matrix */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                      <Shield size={14} />
                      3. Delegated Module Access Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Employees only see the navigation links and data for modules checked below.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleClearAllModules}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = (formData.assigned_modules || []).includes(mod.id);
                    const ops = MODULE_OPERATIONS[mod.id] || ["view", "create", "edit"];

                    return (
                      <div
                        key={mod.id}
                        className={`rounded-xl border p-3 transition ${
                          isChecked
                            ? "bg-purple-50/50 border-purple-200 text-purple-950"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 pointer-events-none"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">{mod.label}</span>
                              {isChecked && (
                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                                  Enabled
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                              {mod.description}
                            </span>
                          </div>
                        </div>

                        {/* Granular Operation Checkboxes when module is checked */}
                        {isChecked && (
                          <div className="mt-2.5 pt-2.5 border-t border-purple-100/80 pl-6 flex flex-wrap gap-2 sm:gap-3">
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
                                      ? "bg-white border-purple-300 text-purple-800 shadow-xs"
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
            </form>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="employee-form"
                disabled={modalLoading}
                className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700 text-xs shadow-sm transition disabled:opacity-60 flex items-center gap-1.5"
              >
                {modalLoading && <RefreshCw size={13} className="animate-spin" />}
                <span>{editingEmployee ? "Save Changes" : "Create Account"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Deactivate Employee</h3>
                <p className="text-xs text-slate-500">Revoke access for this employee account</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to deactivate and remove <strong>{deleteTarget.name || deleteTarget.email}</strong>? Their login session will be immediately terminated.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60 flex items-center gap-1.5"
              >
                {deleteLoading && <RefreshCw size={13} className="animate-spin" />}
                <span>Deactivate Employee</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
