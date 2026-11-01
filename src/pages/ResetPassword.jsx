import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Home,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError("Missing password reset token. Please request a new link.");
      return;
    }

    let isMounted = true;
    const verifyToken = async () => {
      try {
        const res = await api.get(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        if (isMounted) {
          if (res?.valid) {
            setTokenValid(true);
          } else {
            setTokenValid(false);
            setTokenError(res?.message || "This password reset link is invalid or has expired.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(err.message || "This password reset link is invalid or has expired.");
        }
      } finally {
        if (isMounted) setVerifying(false);
      }
    };

    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Branding Hero (Desktop) */}
      <div className="hidden w-1/2 bg-emerald-600 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md px-10 text-white">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-emerald-600">
            K
          </div>
          <h1 className="text-4xl font-bold">
            Set Your New Password
          </h1>
          <p className="mt-5 leading-7 text-emerald-50">
            Create a secure, strong password to protect your KhataNex business data and documents.
            Once updated, all previous login sessions will be safely signed out.
          </p>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
              title="Home"
            >
              <Home size={18} />
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white lg:hidden">
              K
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter and confirm your new password below.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {verifying ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 size={36} className="animate-spin text-emerald-600" />
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Verifying reset link...
                </p>
              </div>
            ) : success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Password Reset Complete
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Your password has been successfully reset. All previous sessions have been logged out for security.
                  You can now log in with your new credentials.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Go to Login
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            ) : !tokenValid ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Invalid or Expired Link
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {tokenError || "This password reset link is invalid, expired, or has already been used."}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to="/forgot-password"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Request New Reset Link
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="At least 6 characters"
                      autoFocus
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Re-enter your new password"
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? "Resetting Password..." : "Reset Password"}
                  <ArrowRight size={17} />
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your credentials?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

