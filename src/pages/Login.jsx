import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(formData.email, formData.password);
      navigate(user.role === "superadmin" ? "/dashboard" : "/customers");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left */}
      <div className="hidden w-1/2 bg-emerald-600 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md px-10 text-white">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-emerald-600">
            K
          </div>
          <h1 className="text-4xl font-bold">
            Welcome back to KHATANEX
          </h1>
          <p className="mt-5 leading-7 text-emerald-50">
            Manage your customers, khata, payments, invoices and business
            records from one simple platform.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
            >
              <Home size={18} />
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white lg:hidden">
              K
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Login
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage your business.
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

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
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
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Forgot Password?
                </button>
              </div>
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
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Login"}
              <ArrowRight size={17} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;