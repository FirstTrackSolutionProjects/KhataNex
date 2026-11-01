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
  ShieldCheck,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDefaultLandingPath } from "../utils/navigation";

const Login = () => {
  const navigate = useNavigate();
  const { login, login2FA } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [mfaChallenge, setMfaChallenge] = useState({
    active: false,
    mfaToken: "",
    code: "",
    recoveryCode: "",
    useRecovery: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMfaChange = (e) => {
    setMfaChallenge((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result?.mfa_required) {
        setMfaChallenge({
          active: true,
          mfaToken: result.mfa_token,
          code: "",
          recoveryCode: "",
          useRecovery: false,
        });
        return;
      }
      const target = getDefaultLandingPath(result);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login2FA(mfaChallenge.mfaToken, {
        code: mfaChallenge.useRecovery ? undefined : mfaChallenge.code,
        recovery_code: mfaChallenge.useRecovery ? mfaChallenge.recoveryCode : undefined,
      });
      const target = getDefaultLandingPath(user);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelMfa = () => {
    setMfaChallenge({
      active: false,
      mfaToken: "",
      code: "",
      recoveryCode: "",
      useRecovery: false,
    });
    setError("");
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

          {mfaChallenge.active ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Two-Step Verification
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {mfaChallenge.useRecovery
                    ? "Enter one of your emergency backup recovery codes."
                    : "Enter the 6-digit verification code from your authenticator app (Google Authenticator or Microsoft Authenticator)."}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handle2FASubmit} className="space-y-4">
                {!mfaChallenge.useRecovery ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      6-Digit Security Code
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        name="code"
                        autoFocus
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        value={mfaChallenge.code}
                        onChange={handleMfaChange}
                        placeholder="123456"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-center font-mono text-lg font-bold tracking-widest outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Emergency Backup Recovery Code
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        name="recoveryCode"
                        autoFocus
                        autoComplete="off"
                        value={mfaChallenge.recoveryCode}
                        onChange={handleMfaChange}
                        placeholder="e.g. A1B2-C3D4"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 font-mono text-sm uppercase tracking-wider outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Each backup recovery code is single-use and will be permanently consumed upon entry.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || (!mfaChallenge.useRecovery && mfaChallenge.code.length < 6) || (mfaChallenge.useRecovery && !mfaChallenge.recoveryCode.trim())}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? "Verifying..." : "Verify & Continue"}
                  <ArrowRight size={17} />
                </button>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMfaChallenge((prev) => ({
                        ...prev,
                        useRecovery: !prev.useRecovery,
                        code: "",
                        recoveryCode: "",
                      }));
                      setError("");
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    {mfaChallenge.useRecovery
                      ? "← Use authenticator app code instead"
                      : "Lost access? Use a backup recovery code →"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelMfa}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    <RotateCcw size={13} />
                    Back to email & password
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
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
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Forgot Password?
                    </Link>
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
            </>
          )}

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