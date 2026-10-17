import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Moon,
  Globe,
  Lock,
  Menu,
  Save,
  FileText,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import { useTheme } from "../context/ThemeContext";
import api from "../lib/api";
import { useSubscriptionAccess, subscriptionRequiredMessage } from "../hooks/useSubscriptionAccess";

const Settings = () => {
  const { canWrite, isRestricted } = useSubscriptionAccess();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const [settings, setSettings] = useState({
    notifications: true,
    paymentReminder: true,
    darkMode: isDark,
  });

  const [watermarkEnabled, setWatermarkEnabled] = useState(false); // Default OFF
  const [watermarkLoading, setWatermarkLoading] = useState(false);
  const [watermarkStatusMsg, setWatermarkStatusMsg] = useState("");
  const [regeneratingDocs, setRegeneratingDocs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/api/settings");
        const setts = res?.settings || res || {};
        if (setts.remove_watermark !== undefined) {
          setWatermarkEnabled(Boolean(Number(setts.remove_watermark)));
        } else if (setts.watermark_enabled !== undefined) {
          // watermark_enabled === 1 means watermark is ON, so "Remove Watermark" is OFF (false)
          // watermark_enabled === 0 means watermark is OFF, so "Remove Watermark" is ON (true)
          setWatermarkEnabled(Number(setts.watermark_enabled) === 0);
        } else {
          // Default OFF for "Remove Watermark" = watermark ON
          setWatermarkEnabled(false);
        }
      } catch (_) {
        // Fallback default: OFF
        setWatermarkEnabled(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleSetting = (key) => {
    if (key === "darkMode") {
      toggleTheme();
    }
    setSettings((prev) => ({
      ...prev,
      [key]: key === "darkMode" ? !isDark : !prev[key],
    }));
  };

  const handleToggleWatermark = async () => {
    if (!canWrite) {
      setWatermarkStatusMsg(subscriptionRequiredMessage);
      return;
    }
    const nextVal = !watermarkEnabled;
    setWatermarkEnabled(nextVal);
    setWatermarkLoading(true);
    setWatermarkStatusMsg("");
    try {
      await api.patch("/api/settings", {
        watermark_enabled: nextVal ? 0 : 1,
        remove_watermark: nextVal ? 1 : 0,
      });

      if (nextVal) {
        // Automatically attempt to regenerate existing documents cleanly in the background
        api.post("/api/documents/regenerate", { remove_watermark: 1 }).catch(() => null);
      }

      setWatermarkStatusMsg(
        nextVal
          ? "Remove Watermark is ON (Clean documents generated without KhataNex branding; your business logo is preserved)"
          : "Remove Watermark is OFF (KhataNex watermark will appear on documents)"
      );
    } catch (err) {
      setWatermarkEnabled(!nextVal);
      setWatermarkStatusMsg(err.message || "Could not sync watermark preference to server.");
    } finally {
      setWatermarkLoading(false);
    }
  };

  const handleRegenerateDocuments = async () => {
    if (!canWrite) {
      setWatermarkStatusMsg(subscriptionRequiredMessage);
      return;
    }
    setRegeneratingDocs(true);
    setWatermarkStatusMsg("");
    try {
      await api.post("/api/documents/regenerate", { remove_watermark: watermarkEnabled ? 1 : 0 });
      setWatermarkStatusMsg(
        watermarkEnabled
          ? "Documents successfully regenerated without KhataNex watermark. Your business logo remains intact."
          : "Documents regenerated with standard watermark."
      );
    } catch (err) {
      setWatermarkStatusMsg(err.message || "Could not regenerate documents.");
    } finally {
      setRegeneratingDocs(false);
    }
  };

  const handleSaveAll = async () => {
    if (!canWrite) return;
    setSaveSuccess(true);
    try {
      await api.patch("/api/settings", {
        watermark_enabled: watermarkEnabled ? 0 : 1,
        remove_watermark: watermarkEnabled ? 1 : 0,
      });
    } catch (_) {}
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const SettingRow = ({
    icon: Icon,
    title,
    description,
    setting,
  }) => (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon size={19} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleSetting(setting)}
        className={`relative h-6 w-11 rounded-full transition ${
          settings[setting] ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            settings[setting] ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <PageHeader
          title="Settings"
          subtitle="Customize your KHATANEX account"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showProfile={true}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* General */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <SettingsIcon size={20} />
                </div>
                <div>
                  <h2 className="font-bold">General Settings</h2>
                  <p className="text-xs text-slate-400">
                    Manage your application preferences
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <SettingRow
                  icon={Bell}
                  title="Notifications"
                  description="Receive important account notifications"
                  setting="notifications"
                />
                <SettingRow
                  icon={Bell}
                  title="Payment Reminders"
                  description="Get reminders for pending payments"
                  setting="paymentReminder"
                />
                <SettingRow
                  icon={Moon}
                  title="Dark Mode"
                  description="Use dark appearance for the dashboard"
                  setting="darkMode"
                />
              </div>
            </div>

            {/* Document Watermark Setting */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="font-bold">Document Branding & Watermark</h2>
                  <p className="text-xs text-slate-400">
                    Control watermark on invoices, quotations, and receipts
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                      <FileText size={19} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Remove Watermark
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        When enabled, exported PDFs will be generated without the "Powered by KhataNex" watermark.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={watermarkLoading || !canWrite}
                    title={!canWrite ? subscriptionRequiredMessage : undefined}
                    onClick={handleToggleWatermark}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      !canWrite ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      watermarkEnabled ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                    aria-label="Toggle remove watermark"
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        watermarkEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      watermarkEnabled ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="font-medium text-slate-700">
                    Status:{" "}
                    {watermarkEnabled
                      ? "Remove Watermark is ON (Clean documents without watermark)"
                      : "Remove Watermark is OFF (KhataNex watermark will appear on documents)"}
                  </span>
                </div>

                {watermarkEnabled && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Regenerate Existing Documents
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Regenerate all invoices, receipts, and quotations without KhataNex watermark. Your business logo remains intact.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={regeneratingDocs || !canWrite}
                      title={!canWrite ? subscriptionRequiredMessage : undefined}
                      onClick={handleRegenerateDocuments}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={13} className={regeneratingDocs ? "animate-spin" : ""} />
                      {regeneratingDocs ? "Regenerating..." : "Regenerate Documents"}
                    </button>
                  </div>
                )}

                {watermarkStatusMsg && (
                  <p className="mt-2 text-xs font-semibold text-emerald-600">
                    {watermarkStatusMsg}
                  </p>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="font-bold">Security</h2>
                  <p className="text-xs text-slate-400">
                    Protect your KHATANEX account
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Lock size={16} />
                  Change Password
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="font-bold">Language & Region</h2>
                  <p className="text-xs text-slate-400">
                    Application interface language
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Language
                </label>
                <select
                  value="English"
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none sm:max-w-sm cursor-not-allowed"
                >
                  <option value="English">English</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  Currently only English is supported.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                {saveSuccess ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle size={15} /> Settings saved successfully
                  </span>
                ) : (
                  <span />
                )}
                <Button
                  icon={Save}
                  onClick={handleSaveAll}
                  disabled={!canWrite}
                  title={!canWrite ? subscriptionRequiredMessage : undefined}
                >
                  Save Settings
                </Button>
              </div>
            </div>

            {/* Powered by KhataNex Footer (visible for all users including normal users & superadmin) */}
            <div className="mt-12 flex flex-col items-center justify-center gap-2 pb-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
                <img
                  src="/images/Logo.jpeg"
                  alt="KhataNex Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm font-extrabold tracking-tight text-slate-800">
                Powered by KhataNex
              </p>
              <p className="text-xs font-medium text-slate-400">
                Smart Khata. Simple Business.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
