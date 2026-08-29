// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Footer from "../components/Footer";
// import {
//   Eye,
//   EyeOff,
//   Lock,
//   Mail,
//   ArrowRight,
// } from "lucide-react";

// const Login = () => {
//   const navigate = useNavigate();

//   const [showPassword, setShowPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Backend authentication can be added later
//     navigate("/dashboard");
//   };

//   return (
    
//       <div className="flex min-h-screen bg-slate-50">

//         {/* Left */}
//         <div className="hidden w-1/2 bg-emerald-600 lg:flex lg:items-center lg:justify-center">

//           <div className="max-w-md px-10 text-white">

//             <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-emerald-600">
//               K
//             </div>

//             <h1 className="text-4xl font-bold">
//               Welcome back to KHATANEX
//             </h1>

//             <p className="mt-5 leading-7 text-emerald-50">
//               Manage your customers, khata, payments, invoices and business
//               records from one simple platform.
//             </p>

//           </div>

//         </div>

//         {/* Form */}
//         <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">

//           <div className="w-full max-w-md">

//             <div className="mb-8 text-center lg:text-left">

//               <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white lg:hidden">
//                 K
//               </div>

//               <h2 className="text-3xl font-bold text-slate-900">
//                 Login
//               </h2>

//               <p className="mt-2 text-sm text-slate-500">
//                 Sign in to manage your business.
//               </p>

//             </div>

//             <form
//               onSubmit={handleSubmit}
//               className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
//             >

//               {/* Email */}
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-slate-700">
//                   Email Address
//                 </label>

//                 <div className="relative">

//                   <Mail
//                     size={18}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email"
//                     required
//                     className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
//                   />

//                 </div>
//               </div>

//               {/* Password */}
//               <div className="mt-5">

//                 <div className="mb-2 flex items-center justify-between">

//                   <label className="text-sm font-medium text-slate-700">
//                     Password
//                   </label>

//                   <button
//                     type="button"
//                     className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
//                   >
//                     Forgot Password?
//                   </button>

//                 </div>

//                 <div className="relative">

//                   <Lock
//                     size={18}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     required
//                     className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
//                   />

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setShowPassword(!showPassword)
//                     }
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                   >
//                     {showPassword ? (
//                       <EyeOff size={18} />
//                     ) : (
//                       <Eye size={18} />
//                     )}
//                   </button>

//                 </div>

//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
//               >
//                 Login
//                 <ArrowRight size={17} />
//               </button>

//             </form>

//             <p className="mt-6 text-center text-sm text-slate-500">
//               Don't have an account?{" "}
//               <Link
//                 to="/signup"
//                 className="font-semibold text-emerald-600 hover:text-emerald-700"
//               >
//                 Create Account
//               </Link>
//             </p>

//           </div>

//         </div>
        
//       </div>
   
//   );
// };

// export default Login;




import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend authentication can be added later
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          LOGIN SECTION
      ====================================================== */}
      <div className="flex min-h-[calc(100vh-1px)] w-full">

        {/* =====================================================
            LEFT DESKTOP SECTION
        ====================================================== */}
        <div className="hidden w-1/2 bg-emerald-600 lg:flex lg:items-center lg:justify-center">

          <div className="w-full max-w-md px-10">

            {/* Logo */}
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-emerald-600 shadow-sm">
              K
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold leading-tight text-white">
              Welcome back to KHATANEX
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-lg leading-7 text-emerald-50">
              Manage your customers, khata, payments, invoices and
              business records from one simple platform.
            </p>

          </div>
        </div>

        {/* =====================================================
            RIGHT LOGIN SECTION
        ====================================================== */}
        <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:w-1/2 lg:px-10">

          <div className="w-full max-w-md">

            {/* =================================================
                MOBILE BRANDING
            ================================================== */}
            <div className="mb-7 text-center lg:hidden">

              {/* Mobile Logo */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-md">
                K
              </div>

              {/* Brand Name */}
              <h1 className="mt-3 text-xl font-bold text-slate-900">
                KHATANEX
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Smart Business Management
              </p>

            </div>

            {/* =================================================
                LOGIN HEADING
            ================================================== */}
            <div className="mb-6 text-center lg:text-left">

              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Login
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to manage your business.
              </p>

            </div>

            {/* =================================================
                LOGIN FORM
            ================================================== */}
            <form
              onSubmit={handleSubmit}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
                sm:p-7
              "
            >

              {/* =================================================
                  EMAIL
              ================================================== */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      py-3.5
                      pl-11
                      pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />

                </div>

              </div>

              {/* =================================================
                  PASSWORD
              ================================================== */}
              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="
                      text-xs
                      font-medium
                      text-emerald-600
                      transition
                      hover:text-emerald-700
                    "
                  >
                    Forgot Password?
                  </button>

                </div>

                <div className="relative">

                  <Lock
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      py-3.5
                      pl-11
                      pr-12
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />

                  {/* Show / Hide Password */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="
                      absolute
                      right-2
                      top-1/2
                      flex
                      h-9
                      w-9
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-slate-100
                      hover:text-slate-600
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================== */}
              <button
                type="submit"
                className="
                  mt-6
                  flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-600
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-emerald-700
                  active:scale-[0.99]
                "
              >
                Login
                <ArrowRight size={17} />
              </button>

            </form>

            {/* =================================================
                SIGNUP LINK
            ================================================== */}
            <p className="mt-6 px-2 text-center text-sm text-slate-500">

              Don't have an account?{" "}

              <Link
                to="/signup"
                className="
                  font-semibold
                  text-emerald-600
                  transition
                  hover:text-emerald-700
                "
              >
                Create Account
              </Link>

            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <Footer />

    </div>
  );
};

export default Login;

