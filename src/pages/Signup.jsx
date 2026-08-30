import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({
        name: formData.name,
        business_name: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      // New self-registered accounts are always the 'user' role, which
      // lands on Customers — the normal operational dashboard.
      navigate("/customers");
    } catch (err) {
      setError(err.message || "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-lg">

        <div className="mb-8 text-center">

          <Link
            to="/"
            className="mx-auto mb-5 flex w-fit items-center gap-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
              K
            </div>

            <span className="text-xl font-bold text-slate-900">
              KHATANEX
            </span>
          </Link>

          <h1 className="text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Start managing your business digitally.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Business */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Business Name
            </label>

            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Enter business name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Email */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Phone Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </div>

          <label className="mt-5 flex items-start gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              className="mt-0.5 accent-emerald-600"
            />

            <span>
              I agree to the Terms & Conditions and Privacy Policy.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create Account"}
            <ArrowRight size={17} />
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
