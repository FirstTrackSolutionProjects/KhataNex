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
  ArrowUpRight,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-sky-700/40 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 shadow-lg">

      {/* =========================================
          NAVBAR CONTAINER
      ========================================== */}
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =====================================
            BRAND
        ====================================== */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
        >

          {/* Logo */}
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
            <img
              src="/images/Logo.jpeg"
              className="h-full w-full object-cover"
              alt="KHATANEX Logo"
            />
          </div>

          {/* Brand Name */}
          <div>
            <h1 className="bg-gradient-to-r from-white via-yellow-300 to-yellow-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
              KHATANEX
            </h1>

            <p className="hidden text-[10px] font-medium text-emerald-100 sm:block">
              Smart Khata. Simple Business.
            </p>
          </div>

        </Link>

        {/* =====================================
            DESKTOP NAVIGATION
        ====================================== */}
        <div className="hidden items-center space-x-8 md:flex">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative cursor-pointer font-bold text-white transition duration-300 hover:text-yellow-200
              after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-yellow-300
              after:transition-all after:duration-300
              hover:after:w-full
              ${isActive ? "after:w-full" : "after:w-0"}`
            }
          >
            HOME
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `relative cursor-pointer font-bold text-white transition duration-300 hover:text-yellow-200
              after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-yellow-300
              after:transition-all after:duration-300
              hover:after:w-full
              ${isActive ? "after:w-full" : "after:w-0"}`
            }
          >
            DASHBOARD
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `relative cursor-pointer font-bold text-white transition duration-300 hover:text-yellow-200
              after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-yellow-300
              after:transition-all after:duration-300
              hover:after:w-full
              ${isActive ? "after:w-full" : "after:w-0"}`
            }
          >
            CUSTOMERS
          </NavLink>

          <NavLink
            to="/khata"
            className={({ isActive }) =>
              `relative cursor-pointer font-bold text-white transition duration-300 hover:text-yellow-200
              after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-yellow-300
              after:transition-all after:duration-300
              hover:after:w-full
              ${isActive ? "after:w-full" : "after:w-0"}`
            }
          >
            KHATA
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `relative cursor-pointer font-bold text-white transition duration-300 hover:text-yellow-200
              after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-yellow-300
              after:transition-all after:duration-300
              hover:after:w-full
              ${isActive ? "after:w-full" : "after:w-0"}`
            }
          >
            REPORTS
          </NavLink>

        </div>

        {/* =====================================
            RIGHT SECTION
        ====================================== */}
        <div className="hidden items-center gap-3 md:flex">

          {/* Notification */}
          <button
            className="relative rounded-xl p-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={20} />

            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-emerald-600" />
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/10">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
              <User size={18} />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                Admin
              </p>

              <p className="text-xs text-emerald-100">
                Business Owner
              </p>
            </div>

            <ChevronDown
              size={16}
              className="text-emerald-100"
            />

          </button>

        </div>

        {/* =====================================
            MOBILE MENU BUTTON
        ====================================== */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-xl p-2 text-white transition hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </div>

      {/* =========================================
          MOBILE MENU
      ========================================== */}
      {isMenuOpen && (
        <div
          className="
            absolute right-0 top-full z-50
            w-1/2 min-w-[250px]
            border-t border-white/10
            bg-emerald-800
            px-4 py-4
            shadow-xl
            md:hidden
          "
        >

          {/* Mobile Navigation */}
          <div className="flex flex-col gap-1">

          <Link
              to="/home"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-1 py-2 text-white transition-colors hover:text-emerald-300"
            >
              Home

              <ArrowUpRight
                size={13}
                className="opacity-0 transition group-hover:opacity-100"
              />
            </Link>

            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-1 py-2 text-white transition-colors hover:text-emerald-300"
            >
              About

              <ArrowUpRight
                size={13}
                className="opacity-0 transition group-hover:opacity-100"
              />
            </Link>

            <Link
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-1 py-2 text-white transition-colors hover:text-emerald-300"
            >
              Blog

              <ArrowUpRight
                size={13}
                className="opacity-0 transition group-hover:opacity-100"
              />
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-1 py-2 text-white transition-colors hover:text-emerald-300"
            >
              Contact

              <ArrowUpRight
                size={13}
                className="opacity-0 transition group-hover:opacity-100"
              />
            </Link>

            <Link
              to="/services"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-1 py-2 text-white transition-colors hover:text-emerald-300"
            >
              Services

              <ArrowUpRight
                size={13}
                className="opacity-0 transition group-hover:opacity-100"
              />
            </Link>

          </div>

          {/* Divider */}
          <div className="my-3 border-t border-slate-700" />

          {/* Profile */}
          <div
            className="
              flex items-center gap-3
              rounded-xl
              border border-slate-700
              bg-slate-900
              px-3 py-2.5
            "
          >

            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full
                bg-cyan-500
                text-white
              "
            >
              <User size={18} />
            </div>

            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-semibold text-white transition hover:text-yellow-300"
            >
              Login
            </Link>

            {/* <div>
              <p className="text-sm font-semibold text-white">
                Admin
              </p>

              <p className="text-xs text-slate-400">
                Business Owner
              </p>
            </div> */}

          </div>

        </div>
      )}

    </nav>
  );
};

export default Navbar;