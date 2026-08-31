// import React, { useState } from "react";
// import { Link, NavLink } from "react-router-dom";
// import {
//   Menu,
//   X,
//   Bell,
//   User,
//   ChevronDown,
// } from "lucide-react";

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <nav className="sticky top-0 z-50 w-full border-b border-sky-700/40 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 shadow-lg">
//     {/* // <nav className="sticky top-0 z-50 w-full border-b border-emerald-700/40 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-lg"> */}

//       {/* =========================================
//           NAVBAR CONTAINER
//       ========================================== */}
//       <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">

//         {/* =====================================
//             BRAND - FULL LEFT SIDE
//         ====================================== */}
//         <Link
//           to="/"
//           className="flex shrink-0 items-center gap-3"
//         >
//           {/* Logo */}
//           {/* <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-emerald-700 shadow-md">
//           <img
//               src="/images/Logo.png"
//               className="h-16 object-contain transition-transform duration-300 group-hover:scale-110"
//               alt="logo"
//             />
//           </div> */}

// <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md overflow-hidden">
//   <img
//     src="/images/Logo.jpeg"
//     className="h-full w-full object-cover"
//     alt="KHATANEX Logo"
//   />
// </div>

//           {/* Brand Name */}
//           <div>
//           <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
//             KHATANEX
//           </h1>
//             <p className="hidden text-[10px] font-medium text-emerald-100 sm:block">
//               Smart Khata. Simple Business.
//             </p>
//           </div>
//         </Link>

//         {/* =====================================
//             DESKTOP NAVIGATION
//         ====================================== */}
//        {/* Desktop Navigation */}
// <div className="hidden md:flex items-center space-x-8">

//   {/* HOME */}
//   <NavLink
//     to="/"
//     className={({ isActive }) =>
//       `relative text-white font-bold cursor-pointer
//       hover:text-yellow-200 transition duration-300
//       after:content-[''] after:absolute after:left-0 after:-bottom-1
//       after:h-[2px] after:bg-yellow-300
//       after:transition-all after:duration-300
//       hover:after:w-full
//       ${isActive ? "after:w-full" : "after:w-0"}`
//     }
//   >
//     HOME
//   </NavLink>

//   {/* DASHBOARD */}
//   <NavLink
//     to="/dashboard"
//     className={({ isActive }) =>
//       `relative text-white font-bold cursor-pointer
//       hover:text-yellow-200 transition duration-300
//       after:content-[''] after:absolute after:left-0 after:-bottom-1
//       after:h-[2px] after:bg-yellow-300
//       after:transition-all after:duration-300
//       hover:after:w-full
//       ${isActive ? "after:w-full" : "after:w-0"}`
//     }
//   >
//     DASHBOARD
//   </NavLink>

//   {/* CUSTOMERS */}
//   <NavLink
//     to="/customers"
//     className={({ isActive }) =>
//       `relative text-white font-bold cursor-pointer
//       hover:text-yellow-200 transition duration-300
//       after:content-[''] after:absolute after:left-0 after:-bottom-1
//       after:h-[2px] after:bg-yellow-300
//       after:transition-all after:duration-300
//       hover:after:w-full
//       ${isActive ? "after:w-full" : "after:w-0"}`
//     }
//   >
//     CUSTOMERS
//   </NavLink>

//   {/* KHATA */}
//   <NavLink
//     to="/khata"
//     className={({ isActive }) =>
//       `relative text-white font-bold cursor-pointer
//       hover:text-yellow-200 transition duration-300
//       after:content-[''] after:absolute after:left-0 after:-bottom-1
//       after:h-[2px] after:bg-yellow-300
//       after:transition-all after:duration-300
//       hover:after:w-full
//       ${isActive ? "after:w-full" : "after:w-0"}`
//     }
//   >
//     KHATA
//   </NavLink>

//   {/* REPORTS */}
//   <NavLink
//     to="/reports"
//     className={({ isActive }) =>
//       `relative text-white font-bold cursor-pointer
//       hover:text-yellow-200 transition duration-300
//       after:content-[''] after:absolute after:left-0 after:-bottom-1
//       after:h-[2px] after:bg-yellow-300
//       after:transition-all after:duration-300
//       hover:after:w-full
//       ${isActive ? "after:w-full" : "after:w-0"}`
//     }
//   >
//     REPORTS
//   </NavLink>

// </div>

//         {/* =====================================
//             RIGHT SECTION
//         ====================================== */}
//         <div className="hidden items-center gap-3 md:flex">

//           {/* Notification */}
//           <button
//             className="relative rounded-xl p-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
//             aria-label="Notifications"
//           >
//             <Bell size={20} />

//             {/* Notification Dot */}
//             <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-emerald-600" />
//           </button>

//           {/* Profile */}
//           <button
//             className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10"
//           >

//             {/* Profile Icon */}
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
//               <User size={18} />
//             </div>

//             {/* Profile Information */}
//             <div className="text-left">
//               <p className="text-sm font-semibold text-white">
//                 Admin
//               </p>

//               <p className="text-xs text-emerald-100">
//                 Business Owner
//               </p>
//             </div>

//             <ChevronDown
//               size={16}
//               className="text-emerald-100"
//             />

//           </button>

//         </div>

//         {/* =====================================
//             MOBILE MENU BUTTON
//         ====================================== */}
//         <button
//           onClick={() => setIsMenuOpen(!isMenuOpen)}
//           className="rounded-xl p-2 text-white transition hover:bg-white/10 md:hidden"
//           aria-label="Toggle menu"
//         >
//           {isMenuOpen ? (
//             <X size={25} />
//           ) : (
//             <Menu size={25} />
//           )}
//         </button>

//       </div>

//       {/* =========================================
//     MOBILE MENU
// ========================================== */}
// {isMenuOpen && (
//  <div
//  className="
//    absolute right-0 top-full z-50
//    w-1/2
//    min-w-[250px]
//    border-t border-white/10
//    bg-emerald-800
//    px-4 py-4
//    shadow-xl
//    md:hidden
//  "
// >

//     {/* Mobile Navigation */}
//     <div className="flex flex-col gap-1">

//     <li>
//                 <Link
//                   to="/about"
//                   className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
//                 >
//                   About

//                   <ArrowUpRight
//                     size={13}
//                     className="opacity-0 transition group-hover:opacity-100"
//                   />
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/blog"
//                   className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
//                 >
//                   Blog

//                   <ArrowUpRight
//                     size={13}
//                     className="opacity-0 transition group-hover:opacity-100"
//                   />
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/contact"
//                   className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
//                 >
//                   Contact

//                   <ArrowUpRight
//                     size={13}
//                     className="opacity-0 transition group-hover:opacity-100"
//                   />
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/services"
//                   className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
//                 >
//                   Services

//                   <ArrowUpRight
//                     size={13}
//                     className="opacity-0 transition group-hover:opacity-100"
//                   />
//                 </Link>
//               </li>

     

//     </div>

//     {/* Divider */}
//     <div className="my-3 border-t border-slate-800" />

//     {/* Profile */}
//     <div
//       className="
//         flex items-center gap-3
//         rounded-xl
//         border border-slate-800
//         bg-slate-900
//         px-3 py-2.5
//       "
//     >

//       <div
//         className="
//           flex h-9 w-9 shrink-0
//           items-center justify-center
//           rounded-full
//           bg-cyan-500
//           text-white
//         "
//       >
//         <User size={18} />
//       </div>

//       <div>
//         <p className="text-sm font-semibold text-white">
//           Admin
//         </p>

//         <p className="text-xs text-slate-400">
//           Business Owner
//         </p>
//       </div>

//     </div>

//   </div>
// )}
//     </nav>
//   );
// };

// export default Navbar;



import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  Search,
  LogOut,
  Home,
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

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
    setShowProfileDropdown(false);
  };

  const handleNotificationClick = () => {
    alert("📬 No new notifications at this time.");
  };

  const handleSearchClick = () => {
    const searchInput = document.querySelector('input[type="text"], input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      alert("🔍 Search functionality is available on the Customers page.");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowProfileDropdown(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setShowProfileDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowProfileDropdown(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-sky-700/40 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 shadow-lg">
      <div className="flex h-16 w-full items-center justify-between px-2 sm:px-4 lg:px-8">

        {/* Brand */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1.5 sm:gap-3"
        >
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-md overflow-hidden">
            <img
              src="/images/Logo.jpeg"
              className="h-full w-full object-cover"
              alt="KHATANEX Logo"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-yellow-300 to-yellow-500 bg-clip-text text-transparent whitespace-nowrap">
              KHATANEX
            </h1>
            <p className="hidden sm:block text-[10px] font-medium text-emerald-100">
              Smart Khata. Simple Business.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation - NO HOME button in navbar, just links */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative text-white font-bold cursor-pointer hover:text-yellow-200 transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-yellow-300 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "after:w-full" : "after:w-0"} text-sm xl:text-base`
            }
          >
            HOME
          </NavLink>
          {isLoggedIn && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer hover:text-yellow-200 transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-yellow-300 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "after:w-full" : "after:w-0"} text-sm xl:text-base`
                }
              >
                DASHBOARD
              </NavLink>
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer hover:text-yellow-200 transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-yellow-300 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "after:w-full" : "after:w-0"} text-sm xl:text-base`
                }
              >
                CUSTOMERS
              </NavLink>
              <NavLink
                to="/khata"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer hover:text-yellow-200 transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-yellow-300 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "after:w-full" : "after:w-0"} text-sm xl:text-base`
                }
              >
                KHATA
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `relative text-white font-bold cursor-pointer hover:text-yellow-200 transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-yellow-300 after:transition-all after:duration-300 hover:after:w-full ${isActive ? "after:w-full" : "after:w-0"} text-sm xl:text-base`
                }
              >
                REPORTS
              </NavLink>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-0.5 sm:gap-3">
          {isLoggedIn ? (
            <>
              {/* Search Button */}
              <button
                onClick={handleSearchClick}
                className="rounded-xl p-1.5 sm:p-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                aria-label="Search"
                title="Search"
              >
                <Search size={17} className="sm:w-5 sm:h-5" />
              </button>

              {/* Notification Button */}
              <button
                onClick={handleNotificationClick}
                className="relative rounded-xl p-1.5 sm:p-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={17} className="sm:w-5 sm:h-5" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full bg-red-400 ring-2 ring-emerald-600" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-1 sm:gap-2 rounded-xl px-1 sm:px-2 py-1 transition hover:bg-white/10"
                  aria-label="Profile"
                  title="Profile"
                >
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                    <span className="text-xs sm:text-sm font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[60px] sm:max-w-[120px]">
                      {user?.name || "User"}
                    </p>
                    <p className="hidden md:block text-[10px] sm:text-xs text-emerald-100 truncate max-w-[80px] sm:max-w-[120px]">
                      {user?.role === "superadmin" ? "Super Admin" : user?.role === "employee" ? "Employee" : "Business Owner"}
                    </p>
                  </div>
                  <ChevronDown size={14} className="sm:w-4 sm:h-4 text-emerald-100 hidden xs:block" />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-50">
                    <button
                      onClick={handleProfileClick}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      onClick={handleSettingsClick}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <div className="border-t border-slate-100 my-1" />
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
            <div className="flex gap-1 sm:gap-3">
              <Link
                to="/login"
                className="rounded-xl bg-white/20 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/30"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl p-1.5 sm:p-2 text-white transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full z-50 w-3/4 min-w-[200px] max-w-[300px] border-t border-white/10 bg-emerald-800 px-4 py-4 shadow-xl lg:hidden">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Dashboard
                </Link>
                <Link
                  to="/customers"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Customers
                </Link>
                <Link
                  to="/khata"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Khata
                </Link>
                <Link
                  to="/payments"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Payments
                </Link>
                <Link
                  to="/reports"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Reports
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Profile
                </Link>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-cyan-400"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {isLoggedIn && (
            <>
              <div className="my-3 border-t border-slate-800" />
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.role === "superadmin" ? "Super Admin" : user?.role === "employee" ? "Employee" : "Business Owner"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-900/30"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;