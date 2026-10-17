import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, Home, HelpCircle, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAuthorizedModules, getDefaultLandingPath } from "../utils/navigation";

export default function AccessDeniedNotice({
  moduleName = "",
  title = "Access Restricted",
  message = "",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const authorized = getAuthorizedModules(user);
  const defaultPath = getDefaultLandingPath(user);

  const formatModuleName = (name) => {
    if (!name) return "this module";
    return name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6 lg:pl-64">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
          <ShieldAlert size={32} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {message ||
            `Your employee account has not been assigned permissions to access ${formatModuleName(
              moduleName
            )}. Please contact your business owner or Superadmin to request module access.`}
        </p>

        {authorized.length > 0 ? (
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Your Available Modules:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {authorized.map((mod) => (
                <Link
                  key={mod.module}
                  to={mod.path}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-emerald-500 hover:text-emerald-700 transition"
                >
                  <span>{mod.label}</span>
                  <ArrowRight size={12} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-amber-50/60 p-4 text-xs text-amber-800 border border-amber-200/60 text-left">
            <p className="font-semibold">No operational modules assigned</p>
            <p className="mt-1 text-slate-600">
              An administrator must grant you access to one or more modules before you can manage transactions or records.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {defaultPath !== window.location.pathname && (
            <Link
              to={defaultPath}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Home size={16} />
              <span>Go to Available Module</span>
            </Link>
          )}

          <Link
            to="/help-centre"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <HelpCircle size={16} />
            <span>Help Centre</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-xs hover:bg-red-50 transition"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
