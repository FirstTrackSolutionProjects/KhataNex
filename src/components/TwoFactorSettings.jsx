import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  KeyRound,
  CheckCircle2,
  X,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RefreshCw,
  Lock,
  ArrowRight,
  Shield,
} from "lucide-react";
import api from "../lib/api";

export default function TwoFactorSettings() {
  const [statusLoading, setStatusLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [enabledAt, setEnabledAt] = useState(null);
  const [remainingCodes, setRemainingCodes] = useState(0);
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalError, setGlobalError] = useState("");

  // Setup Modal State
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: QR & Key, 2: Verification, 3: Recovery Codes
  const [setupData, setSetupData] = useState(null);
  const [setupCode, setSetupCode] = useState("");
  const [issuedRecoveryCodes, setIssuedRecoveryCodes] = useState([]);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable Modal State
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disableRecoveryCode, setDisableRecoveryCode] = useState("");
  const [useRecoveryForDisable, setUseRecoveryForDisable] = useState(false);
  const [disableSubmitting, setDisableSubmitting] = useState(false);
  const [disableError, setDisableError] = useState("");

  // Regenerate Recovery Codes Modal State
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenPassword, setRegenPassword] = useState("");
  const [regenCode, setRegenCode] = useState("");
  const [regenSubmitting, setRegenSubmitting] = useState(false);
  const [regenError, setRegenError] = useState("");

  // Fetch 2FA status from server
  const fetchStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await api.get("/api/auth/2fa/status");
      if (res?.success) {
        setTwoFactorEnabled(Boolean(res.two_factor_enabled));
        setEnabledAt(res.enabled_at);
        setRemainingCodes(res.remaining_recovery_codes || 0);
      }
    } catch (err) {
      console.warn("Could not load 2FA status:", err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Handlers for Setup Flow
  const handleStartSetup = async () => {
    setSetupError("");
    setSetupStep(1);
    setSetupCode("");
    setSetupSubmitting(true);
    setShowSetupModal(true);

    try {
      const res = await api.post("/api/auth/2fa/setup");
      if (res?.success) {
        setSetupData(res);
      } else {
        throw new Error(res?.message || "Failed to initiate two-step verification setup.");
      }
    } catch (err) {
      setSetupError(err.message || "Failed to initiate setup. Please check your network.");
    } finally {
      setSetupSubmitting(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    if (!setupCode || setupCode.trim().length !== 6) {
      setSetupError("Please enter the 6-digit code from your authenticator app.");
      return;
    }

    setSetupError("");
    setSetupSubmitting(true);
    try {
      const res = await api.post("/api/auth/2fa/verify-setup", { code: setupCode.trim() });
      if (res?.success && Array.isArray(res.recovery_codes)) {
        setIssuedRecoveryCodes(res.recovery_codes);
        setTwoFactorEnabled(true);
        setRemainingCodes(res.recovery_codes.length);
        setSetupStep(3); // Move to recovery codes step
        fetchStatus();
      } else {
        throw new Error(res?.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      setSetupError(err.message || "Invalid 6-digit code. Please verify your app and time.");
    } finally {
      setSetupSubmitting(false);
    }
  };

  const handleCopySecret = () => {
    if (!setupData?.manual_entry_key) return;
    navigator.clipboard.writeText(setupData.manual_entry_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyRecoveryCodes = (codes) => {
    const text = codes.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadRecoveryCodes = (codes) => {
    const text =
      `KHATANEX TWO-STEP VERIFICATION EMERGENCY BACKUP RECOVERY CODES\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `Treat these codes like your password. Each code can be used exactly once to log in if you lose access to your authenticator app.\n\n` +
      codes.map((c, i) => `${i + 1}. ${c}`).join("\n") +
      `\n\nStore this file in a secure location (e.g. encrypted vault, offline drive, or safe).`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `khatanex-backup-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFinishSetup = () => {
    setShowSetupModal(false);
    setSetupStep(1);
    setSetupData(null);
    setSetupCode("");
    setIssuedRecoveryCodes([]);
    setGlobalMessage("Two-Step Verification has been successfully activated on your account.");
    setTimeout(() => setGlobalMessage(""), 5000);
  };

  // Handlers for Disable Flow
  const handleDisableSubmit = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError("Your password is required to disable two-step verification.");
      return;
    }
    if (!useRecoveryForDisable && (!disableCode || disableCode.trim().length !== 6)) {
      setDisableError("Please enter your current 6-digit authenticator code.");
      return;
    }
    if (useRecoveryForDisable && !disableRecoveryCode.trim()) {
      setDisableError("Please enter a backup recovery code.");
      return;
    }

    setDisableError("");
    setDisableSubmitting(true);
    try {
      const res = await api.post("/api/auth/2fa/disable", {
        password: disablePassword,
        code: useRecoveryForDisable ? undefined : disableCode.trim(),
        recovery_code: useRecoveryForDisable ? disableRecoveryCode.trim() : undefined,
      });

      if (res?.success) {
        setTwoFactorEnabled(false);
        setRemainingCodes(0);
        setShowDisableModal(false);
        setDisablePassword("");
        setDisableCode("");
        setDisableRecoveryCode("");
        setGlobalMessage("Two-Step Verification has been disabled.");
        setTimeout(() => setGlobalMessage(""), 5000);
        fetchStatus();
      } else {
        throw new Error(res?.message || "Failed to disable two-step verification.");
      }
    } catch (err) {
      setDisableError(err.message || "Failed to disable two-step verification.");
    } finally {
      setDisableSubmitting(false);
    }
  };

  // Handlers for Regenerating Recovery Codes
  const handleRegenSubmit = async (e) => {
    e.preventDefault();
    if (!regenPassword) {
      setRegenError("Password is required to regenerate recovery codes.");
      return;
    }
    if (!regenCode || regenCode.trim().length !== 6) {
      setRegenError("Please enter your current 6-digit authenticator code.");
      return;
    }

    setRegenError("");
    setRegenSubmitting(true);
    try {
      const res = await api.post("/api/auth/2fa/recovery-codes/regenerate", {
        password: regenPassword,
        code: regenCode.trim(),
      });

      if (res?.success && Array.isArray(res.recovery_codes)) {
        setIssuedRecoveryCodes(res.recovery_codes);
        setRemainingCodes(res.recovery_codes.length);
        setRegenPassword("");
        setRegenCode("");
        setShowRegenModal(false);
        setShowSetupModal(true);
        setSetupStep(3); // Show recovery codes view
        fetchStatus();
      } else {
        throw new Error(res?.message || "Failed to regenerate recovery codes.");
      }
    } catch (err) {
      setRegenError(err.message || "Failed to regenerate recovery codes.");
    } finally {
      setRegenSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Two-Step Verification (2FA)</h2>
              {!statusLoading && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    twoFactorEnabled
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      twoFactorEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {twoFactorEnabled ? "Active" : "Disabled"}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Protect your KhataNex account with an extra layer of security using Google Authenticator or Microsoft Authenticator.
            </p>
          </div>
        </div>

        {/* Action Toggle / Button */}
        <div>
          {statusLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
          ) : twoFactorEnabled ? (
            <button
              type="button"
              onClick={() => {
                setDisableError("");
                setDisablePassword("");
                setDisableCode("");
                setDisableRecoveryCode("");
                setShowDisableModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            >
              Turn Off 2FA
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSetup}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Smartphone size={14} />
              Set Up Two-Step Verification
            </button>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {globalMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>{globalMessage}</span>
        </div>
      )}

      {globalError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
          <AlertTriangle size={16} className="shrink-0 text-red-600" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Detailed Status Box if Enabled */}
      {twoFactorEnabled && (
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">Authentication Method:</span>
                <span className="text-xs text-slate-600">Time-based One-Time Password (TOTP)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">Emergency Backup Codes:</span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                    remainingCodes > 3
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {remainingCodes} of 10 remaining
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRegenError("");
                  setRegenPassword("");
                  setRegenCode("");
                  setShowRegenModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={13} />
                Regenerate Backup Codes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SETUP / ACTIVATION MODAL                                            */}
      {/* ==================================================================== */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {setupStep === 3 ? "Save Backup Recovery Codes" : "Set Up Two-Step Verification"}
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    {setupStep === 1
                      ? "Step 1 of 2: Scan QR Code with Authenticator App"
                      : setupStep === 2
                      ? "Step 2 of 2: Verify 6-Digit Authenticator Code"
                      : "Important Security Step"}
                  </p>
                </div>
              </div>

              {setupStep !== 3 && (
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {setupError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  {setupError}
                </div>
              )}

              {/* STEP 1: QR CODE & MANUAL KEY */}
              {setupStep === 1 && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Open your authenticator app (such as <strong>Google Authenticator</strong>,{" "}
                    <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong>) on your mobile device and scan the QR code below:
                  </p>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4">
                    {setupData?.qr_code ? (
                      <img
                        src={setupData.qr_code}
                        alt="Two-Step Verification QR Code"
                        className="h-48 w-48 rounded-lg shadow-sm border border-slate-200 bg-white p-2"
                      />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center text-xs text-slate-400">
                        {setupSubmitting ? "Generating QR code..." : "Loading..."}
                      </div>
                    )}

                    <div className="mt-4 w-full text-center">
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Can't scan the QR code? Enter this setup key manually:
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="rounded-lg bg-white px-3 py-1 font-mono text-xs font-bold text-slate-800 border border-slate-200 select-all">
                          {setupData?.formatted_key || setupData?.manual_entry_key}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          title="Copy setup key"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          {copiedKey ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSetupModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSetupError("");
                        setSetupStep(2);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                      Next: Verify Code
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ENTER CODE */}
              {setupStep === 2 && (
                <form onSubmit={handleVerifySetup} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the current 6-digit verification code displayed in your authenticator app for <strong>KhataNex</strong>:
                  </p>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                      6-Digit Security Code
                    </label>
                    <input
                      type="text"
                      autoFocus
                      inputMode="numeric"
                      maxLength={6}
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value)}
                      placeholder="123456"
                      className="w-full rounded-xl border border-slate-300 py-3 text-center font-mono text-xl font-bold tracking-widest text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSetupError("");
                        setSetupStep(1);
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      ← Back to QR Code
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSetupModal(false)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={setupSubmitting || setupCode.length !== 6}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {setupSubmitting ? "Activating..." : "Verify & Activate 2FA"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* STEP 3: RECOVERY CODES DISPLAY */}
              {setupStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                      <AlertTriangle size={15} /> Save these recovery codes now!
                    </p>
                    These 10 single-use emergency backup codes allow you to log in if you lose access to your phone or authenticator app.
                    <strong> You will not be shown these codes again.</strong>
                  </div>

                  {/* 10 Codes Grid */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    {issuedRecoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 border border-slate-200 font-mono text-xs font-bold text-slate-800 select-all"
                      >
                        <span className="text-slate-400 font-normal w-4 text-[10px]">{idx + 1}.</span>
                        <span>{code}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions: Copy & Download */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyRecoveryCodes(issuedRecoveryCodes)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        {copiedCodes ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        {copiedCodes ? "Copied!" : "Copy All"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadRecoveryCodes(issuedRecoveryCodes)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        <Download size={13} />
                        Download (.txt)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleFinishSetup}
                      className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                      I have saved my backup codes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DISABLE 2FA MODAL                                                   */}
      {/* ==================================================================== */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-red-50/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Disable Two-Step Verification</h3>
                  <p className="text-xs text-red-700 font-medium">Re-authentication Required</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDisableModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDisableSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                To turn off Two-Step Verification, verify your current KhataNex password and provide a security code:
              </p>

              {disableError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  {disableError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {!useRecoveryForDisable ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Authenticator Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono tracking-widest outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseRecoveryForDisable(true);
                      setDisableCode("");
                    }}
                    className="mt-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Use a backup recovery code instead
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Backup Recovery Code
                  </label>
                  <input
                    type="text"
                    value={disableRecoveryCode}
                    onChange={(e) => setDisableRecoveryCode(e.target.value)}
                    placeholder="e.g. A1B2-C3D4"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseRecoveryForDisable(false);
                      setDisableRecoveryCode("");
                    }}
                    className="mt-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Use 6-digit authenticator code instead
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableSubmitting || !disablePassword}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {disableSubmitting ? "Disabling..." : "Confirm & Disable 2FA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* REGENERATE RECOVERY CODES MODAL                                      */}
      {/* ==================================================================== */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Regenerate Recovery Codes</h3>
                  <p className="text-xs text-slate-500 font-medium">Replaces all previous backup codes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegenSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Generating new backup codes will <strong>permanently invalidate</strong> any existing recovery codes.
                Verify your identity to proceed:
              </p>

              {regenError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  {regenError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={regenPassword}
                  onChange={(e) => setRegenPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={regenCode}
                  onChange={(e) => setRegenCode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono tracking-widest outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegenModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regenSubmitting || !regenPassword || regenCode.length !== 6}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {regenSubmitting ? "Generating..." : "Generate New Codes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

