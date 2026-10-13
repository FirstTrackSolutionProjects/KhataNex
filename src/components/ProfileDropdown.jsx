import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, CreditCard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProfileDropdown = ({ variant = "default" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate("/settings");
  };

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          variant === "nav"
            ? "flex items-center gap-1 sm:gap-2 rounded-xl px-1 sm:px-2 py-1 transition hover:bg-white/10"
            : "ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 sm:ml-2 sm:h-9 sm:w-9 shadow-sm"
        }
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
      >
        {variant === "nav" ? (
          <>
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">
              <span className="text-xs sm:text-sm font-bold">{initial}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[60px] sm:max-w-[120px]">
                {user?.name || "User"}
              </p>
              <p className="hidden md:block text-[10px] sm:text-xs text-emerald-100 truncate max-w-[80px] sm:max-w-[120px]">
                {user?.role === "superadmin"
                  ? "Super Admin"
                  : user?.role === "employee"
                  ? "Employee"
                  : "Business Owner"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className="sm:w-4 sm:h-4 text-emerald-100 hidden xs:block"
            />
          </>
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleProfile}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition text-left font-medium"
          >
            <User size={16} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={handleSettings}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition text-left font-medium"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate(user?.role === "superadmin" ? "/billing" : "/subscription");
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition text-left font-medium"
          >
            <CreditCard size={16} />
            <span>{user?.role === "superadmin" ? "Billing Admin" : "Subscription"}</span>
          </button>

          <div className="border-t border-slate-100 my-1" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
