import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  X,
  Truck,
  Landmark,
  UserRound,
  User,
  Sparkles,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { hasModuleAccess } from "../utils/navigation";

const Sidebar = ({ isOpen = false, open, onClose, onCancel }) => {
  const isSidebarOpen = open !== undefined ? Boolean(open) : Boolean(isOpen);
  const handleClose = onClose || onCancel;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperadmin = user?.role === "superadmin";
  const isEmployee = user?.role === "employee";
  const isNormalUser = user?.role === "user";

  const canAccessModule = (modId) => hasModuleAccess(user, modId);

  const menuItems = [
    // 1. Dashboard is always the first item for Superadmin, Normal Users, and Employees with reports/dashboard access
    ...(isSuperadmin || isNormalUser || canAccessModule("reports") || canAccessModule("dashboard")
      ? [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }]
      : []),
    // Administrative Superadmin / Delegation items
    ...(isSuperadmin || (isEmployee && canAccessModule("users")) ? [{ name: "My Users", path: "/my-users", icon: UserRound }] : []),
    ...(isSuperadmin ? [{ name: "My Employees", path: "/my-employees", icon: Briefcase }] : []),
    ...(isSuperadmin ? [{ name: "Billing", path: "/billing", icon: CreditCard }] : []),
    // Operational business modules
    ...(canAccessModule("customers") ? [{ name: "Customers", path: "/customers", icon: Users }] : []),
    ...(canAccessModule("khata") ? [{ name: "Khata", path: "/khata", icon: BookOpen }] : []),
    ...(canAccessModule("payments") ? [{ name: "Payments", path: "/payments", icon: CreditCard }] : []),
    ...(canAccessModule("invoices") ? [{ name: "Invoices", path: "/invoices", icon: FileText }] : []),
    ...(canAccessModule("quotations") ? [{ name: "Quotations", path: "/quotations", icon: FileText }] : []),
    ...(canAccessModule("receipts") || canAccessModule("money_receipts") || canAccessModule("invoices")
      ? [{ name: "Receipts", path: "/money-receipts", icon: FileText }]
      : []),
    ...(canAccessModule("inventory") ? [{ name: "Inventory", path: "/inventory", icon: Package }] : []),
    // Purchases placed immediately below Inventory
    ...(canAccessModule("purchases") ? [{ name: "Purchases", path: "/purchases", icon: ShoppingBag }] : []),
    ...(canAccessModule("banking") ? [{ name: "Banking", path: "/banking", icon: Landmark }] : []),
    ...(canAccessModule("vehicles") ? [{ name: "Vehicles", path: "/vehicles", icon: Truck }] : []),
    // Separate Reports page retained only for Superadmin platform analytics
    ...(isSuperadmin ? [{ name: "Reports", path: "/reports", icon: BarChart3 }] : []),
    { name: "Help Centre", path: "/help-centre", icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (handleClose) handleClose();
  };

  return (
    <>
      {/* =========================================
          MOBILE OVERLAY
      ========================================== */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 z-[55] bg-slate-950/40 backdrop-blur-[1px]
          transition-opacity duration-300 lg:hidden
          ${isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"}
        `}
      />

      {/* =========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-[60]
          flex h-screen w-[280px] flex-col
          border-r border-slate-200 bg-white
          shadow-xl
          transition-transform duration-300 ease-in-out

          lg:w-64
          lg:translate-x-0
          lg:shadow-none

          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* =====================================
            LOGO / HEADER
        ====================================== */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">

          <NavLink
            to="/"
            onClick={handleClose}
            className="flex items-center gap-3"
          >

            {/* Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-700 shadow-sm">
              <img
                src="/images/Logo.jpeg"
                alt="KHATANEX Logo"
                className="h-full w-full object-cover"
              />
            </div>
            

            {/* Brand */}
            <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              KHATANEX
             </h1>

              <p className="text-[9px] font-medium text-slate-400">
                Smart Khata. Simple Business.
              </p>
            </div>

          </NavLink>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="
              flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-800
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>

        </div>

        {/* =====================================
            BUSINESS CARD
        ====================================== */}
        <div className="mx-4 mt-5 shrink-0 rounded-2xl bg-emerald-50 p-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {isSuperadmin ? "Super Admin" : "Business"}
          </p>

          <p className="mt-1 truncate text-base font-semibold text-slate-900">
            {user?.business_name || user?.name || "My Business Store"}
          </p>

          <p className="mt-1 text-xs capitalize text-slate-500">
            {user?.role === "employee"
              ? user?.employee_role_type
                ? `Employee · ${user.employee_role_type}`
                : "Employee"
              : user?.role === "superadmin"
              ? "Owner Account"
              : "Owner Account"}
          </p>

        </div>

        {/* =====================================
            NAVIGATION
        ====================================== */}
        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-36 lg:pb-6">

          {/* Main Menu */}
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={handleClose}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-semibold
                    transition-all duration-200

                    ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }
                    `
                  }
                >
                  <Icon
                    size={20}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200" />

          {/* Account */}
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <NavLink
            to="/profile"
            onClick={handleClose}
            className={({ isActive }) =>
              `
              flex items-center gap-3
              rounded-xl px-3 py-3
              text-sm font-semibold
              transition-all duration-200

              ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }
              `
            }
          >
            <User
              size={20}
              strokeWidth={1.9}
            />

            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={handleClose}
            className={({ isActive }) =>
              `
              mt-1 flex items-center gap-3
              rounded-xl px-3 py-3
              text-sm font-semibold
              transition-all duration-200

              ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }
              `
            }
          >
            <Settings
              size={20}
              strokeWidth={1.9}
            />

            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/subscription"
            onClick={handleClose}
            className={({ isActive }) =>
              `
              mt-1 flex items-center gap-3
              rounded-xl px-3 py-3
              text-sm font-semibold
              transition-all duration-200

              ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }
              `
            }
          >
            <Sparkles
              size={20}
              strokeWidth={1.9}
            />

            <span>Subscription</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 text-left"
          >
            <LogOut
              size={20}
              strokeWidth={1.9}
            />

            <span>Logout</span>
          </button>

        </nav>

      </aside>
    </>
  );
};

export default Sidebar;