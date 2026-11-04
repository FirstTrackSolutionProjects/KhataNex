import React from "react";
import { Link } from "react-router-dom";
import { Menu, Home, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { getDefaultLandingPath } from "../utils/navigation";

export default function MobileHeader() {
  const { user } = useAuth();
  const { openSidebar } = useSidebar();
  const homePath = getDefaultLandingPath(user);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
      {/* Left: Hamburger Button + KhataNex Branding */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={openSidebar}
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          aria-label="Open navigation menu"
          title="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link
          to={homePath}
          className="flex items-center gap-2.5 min-w-0 transition hover:opacity-90"
        >
          {/* Logo */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-700 shadow-sm">
            <img
              src="/images/Logo.jpeg"
              alt="KhataNex Logo"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Brand Titles */}
          <div className="flex flex-col min-w-0">
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-yellow-400 to-yellow-600 bg-clip-text text-transparent leading-none truncate">
              KHATANEX
            </span>
            <span className="text-[8px] font-semibold text-slate-400 leading-tight">
              Smart Khata. Simple Business.
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Home & Profile Navigation Shortcuts */}
      <div className="flex shrink-0 items-center gap-1.5">
        {/* Role-Aware Home Shortcut */}
        <Link
          to={homePath}
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600 active:scale-95"
          aria-label="Dashboard Home"
          title="Dashboard Home"
        >
          <Home size={20} />
        </Link>

        {/* Profile Shortcut */}
        <Link
          to="/profile"
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600 active:scale-95"
          aria-label="User Profile"
          title="User Profile"
        >
          <User size={20} />
        </Link>
      </div>
    </header>
  );
}

