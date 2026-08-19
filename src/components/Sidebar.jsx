import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen = false, onClose }) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
    },
    {
      name: "Khata",
      path: "/khata",
      icon: BookOpen,
    },
    {
      name: "Payments",
      path: "/payments",
      icon: CreditCard,
    },
    {
      name: "Invoices",
      path: "/invoices",
      icon: FileText,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Package,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* =========================================
          MOBILE OVERLAY
      ========================================== */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px]
          transition-opacity duration-300 lg:hidden
          ${isOpen ? "visible opacity-100" : "invisible opacity-0"}
        `}
      />

      {/* =========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[280px] flex-col
          border-r border-slate-200 bg-white
          shadow-xl
          transition-transform duration-300 ease-in-out

          lg:w-64
          lg:translate-x-0
          lg:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* =====================================
            LOGO / HEADER
        ====================================== */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">

          <NavLink
            to="/"
            onClick={onClose}
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
            onClick={onClose}
            className="
              rounded-lg p-2
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
            Business
          </p>

          <p className="mt-1 truncate text-base font-semibold text-slate-900">
            My Business Store
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Owner Account
          </p>

        </div>

        {/* =====================================
            NAVIGATION
        ====================================== */}
        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-4">

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
                  onClick={onClose}
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
            to="/settings"
            onClick={onClose}
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
            <Settings
              size={20}
              strokeWidth={1.9}
            />

            <span>Settings</span>
          </NavLink>

        </nav>

        {/* =====================================
            LOGOUT
        ====================================== */}
        <div className="shrink-0 border-t border-slate-200 p-3">

          <button
            type="button"
            className="
              flex w-full items-center gap-3
              rounded-xl px-3 py-3
              text-sm font-semibold text-red-600
              transition
              hover:bg-red-50
            "
          >
            <LogOut
              size={20}
              strokeWidth={1.9}
            />

            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;