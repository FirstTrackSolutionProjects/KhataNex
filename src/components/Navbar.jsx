





import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  Search,
  LogOut,
  Settings,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const isLoggedIn = !!user;

  // =========================================
  // LOGOUT
  // =========================================
  const handleLogout = () => {
    logout();

    navigate("/login");

    setIsMenuOpen(false);
    setShowProfileDropdown(false);
  };

  // =========================================
  // NOTIFICATION
  // =========================================
  const handleNotificationClick = () => {
    alert("📬 No new notifications at this time.");
  };

  // =========================================
  // SEARCH
  // =========================================
  const handleSearchClick = () => {
    const searchInput = document.querySelector(
      'input[type="text"], input[placeholder*="Search"]'
    );

    if (searchInput) {
      searchInput.focus();

      searchInput.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      alert(
        "🔍 Search functionality is available on the Customers page."
      );
    }
  };

  // =========================================
  // PROFILE
  // =========================================
  const handleProfileClick = () => {
    navigate("/profile");

    setShowProfileDropdown(false);
  };

  // =========================================
  // SETTINGS
  // =========================================
  const handleSettingsClick = () => {
    navigate("/settings");

    setShowProfileDropdown(false);
  };

  // =========================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================
  // CLOSE MENU ON ESCAPE
  // =========================================
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowProfileDropdown(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-sky-700/40 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 shadow-lg">

      {/* =========================================
          NAVBAR MAIN
      ========================================== */}
      <div className="flex h-16 w-full items-center justify-between px-2 sm:px-4 lg:px-8">

        {/* =========================================
            BRAND
        ========================================== */}
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex shrink-0 items-center gap-1.5 sm:gap-3"
        >
          {/* Logo */}
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-md overflow-hidden">
            <img
              src="/images/Logo.jpeg"
              className="h-full w-full object-cover"
              alt="KHATANEX Logo"
            />
          </div>

          {/* Brand Name */}
          <div>
            <h1 className="text-sm sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-yellow-300 to-yellow-500 bg-clip-text text-transparent whitespace-nowrap">
              KHATANEX
            </h1>

            <p className="hidden sm:block text-[10px] font-medium text-emerald-100">
              Smart Khata. Simple Business.
            </p>
          </div>
        </Link>

        {/* =========================================
            DESKTOP NAVIGATION
        ========================================== */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">

          {/* HOME */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative text-white font-bold cursor-pointer
              hover:text-yellow-200
              transition duration-300
              after:content-['']
              after:absolute
              after:left-0
              after:-bottom-1
              after:h-[2px]
              after:bg-yellow-300
              after:transition-all
              after:duration-300
              hover:after:w-full
              ${
                isActive
                  ? "after:w-full"
                  : "after:w-0"
              }
              text-sm xl:text-base`
            }
          >
            HOME
          </NavLink>

          {/* ABOUT */}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `relative text-white font-bold cursor-pointer
              hover:text-yellow-200
              transition duration-300
              after:content-['']
              after:absolute
              after:left-0
              after:-bottom-1
              after:h-[2px]
              after:bg-yellow-300
              after:transition-all
              after:duration-300
              hover:after:w-full
              ${
                isActive
                  ? "after:w-full"
                  : "after:w-0"
              }
              text-sm xl:text-base`
            }
          >
            ABOUT
          </NavLink>

          {/* BLOG */}
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `relative text-white font-bold cursor-pointer
              hover:text-yellow-200
              transition duration-300
              after:content-['']
              after:absolute
              after:left-0
              after:-bottom-1
              after:h-[2px]
              after:bg-yellow-300
              after:transition-all
              after:duration-300
              hover:after:w-full
              ${
                isActive
                  ? "after:w-full"
                  : "after:w-0"
              }
              text-sm xl:text-base`
            }
          >
            BLOG
          </NavLink>

          {/* CONTACT */}
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `relative text-white font-bold cursor-pointer
              hover:text-yellow-200
              transition duration-300
              after:content-['']
              after:absolute
              after:left-0
              after:-bottom-1
              after:h-[2px]
              after:bg-yellow-300
              after:transition-all
              after:duration-300
              hover:after:w-full
              ${
                isActive
                  ? "after:w-full"
                  : "after:w-0"
              }
              text-sm xl:text-base`
            }
          >
            CONTACT
          </NavLink>

          {/* SERVICES */}
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `relative text-white font-bold cursor-pointer
              hover:text-yellow-200
              transition duration-300
              after:content-['']
              after:absolute
              after:left-0
              after:-bottom-1
              after:h-[2px]
              after:bg-yellow-300
              after:transition-all
              after:duration-300
              hover:after:w-full
              ${
                isActive
                  ? "after:w-full"
                  : "after:w-0"
              }
              text-sm xl:text-base`
            }
          >
            SERVICES
          </NavLink>

          {/* =====================================
              LOGGED-IN DESKTOP LINKS
          ====================================== */}
          {isLoggedIn && (
            <>
              {/* DASHBOARD */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer
                  hover:text-yellow-200
                  transition duration-300
                  after:content-['']
                  after:absolute
                  after:left-0
                  after:-bottom-1
                  after:h-[2px]
                  after:bg-yellow-300
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                  ${
                    isActive
                      ? "after:w-full"
                      : "after:w-0"
                  }
                  text-sm xl:text-base`
                }
              >
                DASHBOARD
              </NavLink>

              {/* CUSTOMERS */}
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer
                  hover:text-yellow-200
                  transition duration-300
                  after:content-['']
                  after:absolute
                  after:left-0
                  after:-bottom-1
                  after:h-[2px]
                  after:bg-yellow-300
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                  ${
                    isActive
                      ? "after:w-full"
                      : "after:w-0"
                  }
                  text-sm xl:text-base`
                }
              >
                CUSTOMERS
              </NavLink>

              {/* KHATA */}
              <NavLink
                to="/khata"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer
                  hover:text-yellow-200
                  transition duration-300
                  after:content-['']
                  after:absolute
                  after:left-0
                  after:-bottom-1
                  after:h-[2px]
                  after:bg-yellow-300
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                  ${
                    isActive
                      ? "after:w-full"
                      : "after:w-0"
                  }
                  text-sm xl:text-base`
                }
              >
                KHATA
              </NavLink>

              {/* REPORTS */}
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer
                  hover:text-yellow-200
                  transition duration-300
                  after:content-['']
                  after:absolute
                  after:left-0
                  after:-bottom-1
                  after:h-[2px]
                  after:bg-yellow-300
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                  ${
                    isActive
                      ? "after:w-full"
                      : "after:w-0"
                  }
                  text-sm xl:text-base`
                }
              >
                REPORTS
              </NavLink>
            </>
          )}
        </div>

        {/* =========================================
            RIGHT SECTION
        ========================================== */}
        <div className="flex items-center gap-0.5 sm:gap-3">

          {/* =====================================
              LOGGED-IN USER
          ====================================== */}
          {isLoggedIn ? (
            <>
              {/* SEARCH */}
              <button
                onClick={handleSearchClick}
                className="rounded-xl p-1.5 sm:p-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                aria-label="Search"
                title="Search"
              >
                <Search
                  size={17}
                  className="sm:w-5 sm:h-5"
                />
              </button>

              {/* NOTIFICATION */}
              <button
                onClick={handleNotificationClick}
                className="relative rounded-xl p-1.5 sm:p-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell
                  size={17}
                  className="sm:w-5 sm:h-5"
                />

                <span className="absolute right-1 top-1 h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full bg-red-400 ring-2 ring-sky-600" />
              </button>

              {/* PROFILE DROPDOWN */}
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  onClick={() =>
                    setShowProfileDropdown(
                      !showProfileDropdown
                    )
                  }
                  className="flex items-center gap-1 sm:gap-2 rounded-xl px-1 sm:px-2 py-1 transition hover:bg-white/10"
                  aria-label="Profile"
                  title="Profile"
                >
                  {/* PROFILE ICON */}
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm">
                    <span className="text-xs sm:text-sm font-bold">
                      {user?.name
                        ? user.name
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </span>
                  </div>

                  {/* USER NAME */}
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
                </button>

                {/* PROFILE DROPDOWN MENU */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-50">

                    {/* PROFILE */}
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <User size={16} />
                      Profile
                    </button>

                    {/* SETTINGS */}
                    <button
                      onClick={handleSettingsClick}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <Settings size={16} />
                      Settings
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    {/* LOGOUT */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* =====================================
               LOGGED-OUT DESKTOP BUTTONS
            ====================================== */
            <div className="flex gap-1 sm:gap-3">

              {/* LOGIN */}
              {/* <Link
                to="/login"
                className="rounded-xl bg-white/20 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/30"
              >
                Login
              </Link> */}

              {/* SIGN UP */}
              {/* <Link
                to="/signup"
                className="rounded-xl bg-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
              >
                Sign Up
              </Link> */}
            </div>
          )}

          {/* =========================================
              MOBILE MENU BUTTON
          ========================================== */}
          <button
            onClick={() =>
              setIsMenuOpen(!isMenuOpen)
            }
            className="rounded-xl p-1.5 sm:p-2 text-white transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>

      {/* =========================================
          MOBILE MENU
      ========================================== */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full z-50 w-3/4 min-w-[220px] max-w-[320px] max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-emerald-800 px-4 py-4 shadow-xl lg:hidden">

          <div className="flex flex-col gap-1">

            {/* =====================================
                PUBLIC LINKS
            ====================================== */}

            {/* HOME */}
            <Link
              to="/"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
            >
              HOME
            </Link>

            {/* ABOUT */}
            <Link
              to="/about"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
            >
              ABOUT
            </Link>

            {/* BLOG */}
            <Link
              to="/blog"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
            >
              BLOG
            </Link>

            {/* CONTACT */}
            <Link
              to="/contact"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
            >
              CONTACT
            </Link>

            {/* SERVICES */}
            <Link
              to="/services"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
            >
              SERVICES
            </Link>

            {/* =====================================
                LOGGED-IN LINKS
            ====================================== */}
            {isLoggedIn && (
              <>
                <div className="my-2 border-t border-white/20" />

                {/* DASHBOARD */}
                <Link
                  to="/dashboard"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
                >
                  Dashboard
                </Link>

                {/* CUSTOMERS */}
                <Link
                  to="/customers"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
                >
                  Customers
                </Link>

                {/* KHATA */}
                <Link
                  to="/khata"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
                >
                  Khata
                </Link>

                {/* PAYMENTS */}
                <Link
                  to="/payments"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
                >
                  Payments
                </Link>

                {/* REPORTS */}
                <Link
                  to="/reports"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
                >
                  Reports
                </Link>

                {/* PROFILE */}
                <Link
                  to="/profile"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-cyan-300"
                >
                  Profile
                </Link>

                {/* =================================
                    USER INFORMATION
                ================================== */}
                <div className="my-2 border-t border-white/20" />

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5">

                  {/* USER AVATAR */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm">
                    {user?.name
                      ? user.name
                          .charAt(0)
                          .toUpperCase()
                      : "U"}
                  </div>

                  {/* USER DETAILS */}
                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-white truncate">
                      {user?.name || "User"}
                    </p>

                    <p className="text-xs text-slate-400 truncate">
                      {user?.role === "superadmin"
                        ? "Super Admin"
                        : user?.role === "employee"
                        ? "Employee"
                        : "Business Owner"}
                    </p>

                  </div>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-900/30 text-left"
                >
                  Logout
                </button>
              </>
            )}

            {/* =====================================
                LOGGED-OUT LINKS
            ====================================== */}
            {!isLoggedIn && (
              <>
                <div className="my-2 border-t border-white/20" />

                {/* LOGIN */}
                <Link
                  to="/login"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500">
                    <User size={17} />
                  </div>

                  Login
                </Link>

                {/* SIGN UP */}
                {/* <Link
                  to="/signup"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="mt-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 text-center transition hover:bg-slate-100"
                >
                  Sign Up
                </Link> */}
              </>
            )}

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;