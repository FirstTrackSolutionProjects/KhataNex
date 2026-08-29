import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
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

    // Backend registration can be added later
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          SIGNUP CONTENT
      ====================================================== */}

      <div className="px-3 py-6 sm:px-4 sm:py-10">

        <div className="mx-auto w-full max-w-lg">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="mb-6 text-center sm:mb-8">

            <Link
              to="/"
              className="mx-auto mb-4 flex w-fit items-center gap-2 sm:mb-5"
            >

              {/* Logo */}
              <div className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-600
                text-lg
                font-bold
                text-white
                shadow-sm
                sm:h-11
                sm:w-11
                sm:text-xl
              ">
                K
              </div>

              {/* Brand */}
              <span className="
                text-lg
                font-bold
                text-slate-900
                sm:text-xl
              ">
                KHATANEX
              </span>

            </Link>

            <h1 className="
              text-2xl
              font-bold
              leading-tight
              text-slate-900
              sm:text-3xl
            ">
              Create your account
            </h1>

            <p className="
              mt-2
              px-4
              text-xs
              leading-5
              text-slate-500
              sm:text-sm
            ">
              Start managing your business digitally.
            </p>

          </div>

          {/* =====================================================
              SIGNUP FORM
          ====================================================== */}

          <form
            onSubmit={handleSubmit}
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
              sm:p-6
              md:p-8
            "
          >

            {/* Name */}
            <div>

              <label className="
                mb-1.5
                block
                text-xs
                font-medium
                text-slate-700
                sm:mb-2
                sm:text-sm
              ">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    sm:h-12
                  "
                />

              </div>

            </div>

            {/* Business */}
            <div className="mt-4 sm:mt-5">

              <label className="
                mb-1.5
                block
                text-xs
                font-medium
                text-slate-700
                sm:mb-2
                sm:text-sm
              ">
                Business Name
              </label>

              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter business name"
                required
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-2.5
                  text-sm
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-100
                  sm:h-12
                "
              />

            </div>

            {/* Email */}
            <div className="mt-4 sm:mt-5">

              <label className="
                mb-1.5
                block
                text-xs
                font-medium
                text-slate-700
                sm:mb-2
                sm:text-sm
              ">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="
                    absolute
                    left-3
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
                  placeholder="Enter email"
                  required
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    sm:h-12
                  "
                />

              </div>

            </div>

            {/* Phone */}
            <div className="mt-4 sm:mt-5">

              <label className="
                mb-1.5
                block
                text-xs
                font-medium
                text-slate-700
                sm:mb-2
                sm:text-sm
              ">
                Phone Number
              </label>

              <div className="relative">

                <Phone
                  size={17}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    sm:h-12
                  "
                />

              </div>

            </div>

            {/* Password */}
            <div className="mt-4 sm:mt-5">

              <label className="
                mb-1.5
                block
                text-xs
                font-medium
                text-slate-700
                sm:mb-2
                sm:text-sm
              ">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={17}
                  className="
                    absolute
                    left-3
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
                  placeholder="Create password"
                  required
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    py-2.5
                    pl-10
                    pr-11
                    text-sm
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    sm:h-12
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    p-1
                    text-slate-400
                    transition
                    hover:text-slate-600
                  "
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>

            {/* =====================================================
                TERMS
            ====================================================== */}

            <label className="
              mt-4
              flex
              items-start
              gap-2
              text-[11px]
              leading-4
              text-slate-500
              sm:mt-5
              sm:text-xs
            ">

              <input
                type="checkbox"
                required
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  accent-emerald-600
                "
              />

              <span>
                I agree to the Terms & Conditions and Privacy Policy.
              </span>

            </label>

            {/* =====================================================
                SUBMIT
            ====================================================== */}

            <button
              type="submit"
              className="
                mt-5
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
                active:scale-[0.98]
                sm:mt-6
                sm:h-12
              "
            >
              Create Account
              <ArrowRight size={17} />

            </button>

          </form>

          {/* =====================================================
              LOGIN LINK
          ====================================================== */}

          <p className="
            mt-4
            text-center
            text-xs
            text-slate-500
            sm:mt-6
            sm:text-sm
          ">

            Already have an account?{" "}

            <Link
              to="/login"
              className="
                font-semibold
                text-emerald-600
                transition
                hover:text-emerald-700
              "
            >
              Login
            </Link>

          </p>

        </div>

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="mt-2 sm:mt-4">
        <Footer />
      </div>

    </div>
  );
};

export default Signup;