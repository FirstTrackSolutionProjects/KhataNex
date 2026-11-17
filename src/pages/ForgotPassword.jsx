import React, { useState } from "react";
import BrandLogo from "../components/BrandLogo";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Home,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "../lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email: trimmedEmail });
      setConfirmationMessage(
        res?.message ||
          "If an eligible account exists for this email, you will receive password reset instructions."
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit password reset request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Branding Hero (Desktop) */}
      <div className="hidden w-1/2 bg-brand-radial lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md px-10 text-white">
          <BrandLogo size={72} className="mb-6 shadow-brand-lg ring-4 ring-white/25" />
          <h1 className="text-4xl font-bold">
            Account Security & Recovery
          </h1>
          <p className="mt-5 leading-7 text-brand-50">
            Recover access to your KhataNex business account quickly and securely.
            We will send single-use, encrypted password reset instructions to your email.
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
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition hover:text-brand-700"
              title="Home"
            >
              <Home size={18} />
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex items-center justify-center gap-3 lg:hidden">
              <BrandLogo size={48} rounded="rounded-xl" className="shadow-brand" />
              <span className="font-display text-xl font-extrabold text-slate-900">KhataNex</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Forgot Password
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your registered email and we'll send you instructions to reset your password.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {submitted ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Check Your Inbox
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {confirmationMessage}
                </p>
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                  Didn't receive an email? Please check your spam folder or try again in a few minutes.
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Send to Another Email
                  </button>
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Return to Login
                    <ArrowRight size={16} />
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="name@business.com"
                      autoFocus
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {submitting ? "Sending Reset Link..." : "Send Reset Link"}
                  <ArrowRight size={17} />
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

