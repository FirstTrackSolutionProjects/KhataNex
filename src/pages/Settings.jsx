import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Moon,
  Globe,
  Lock,
  Menu,
  Save,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [settings, setSettings] = useState({
    notifications: true,
    paymentReminder: true,
    darkMode: false,
    twoFactor: false,
  });

  const toggleSetting = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
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
          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

      </div>

      <button
        onClick={() => toggleSetting(setting)}
        className={`relative h-6 w-11 rounded-full transition ${
          settings[setting]
            ? "bg-emerald-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            settings[setting]
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">

        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6">

          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-3 rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-lg font-bold">
              Settings
            </h1>

            <p className="text-xs text-slate-400">
              Customize your KHATANEX account
            </p>
          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="mx-auto max-w-3xl">

            {/* General */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <SettingsIcon size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    General Settings
                  </h2>

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

            {/* Security */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Shield size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Security
                  </h2>

                  <p className="text-xs text-slate-400">
                    Protect your KHATANEX account
                  </p>
                </div>

              </div>

              <div className="mt-5">

                <SettingRow
                  icon={Lock}
                  title="Two-Factor Authentication"
                  description="Add an additional layer of account security"
                  setting="twoFactor"
                />

              </div>

              <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                <Lock size={16} />
                Change Password
              </button>

            </div>

            {/* Language */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Globe size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Language & Region
                  </h2>

                  <p className="text-xs text-slate-400">
                    Choose your preferred language
                  </p>
                </div>

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium">
                  Language
                </label>

                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 sm:max-w-sm">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Odia</option>
                </select>

              </div>

              <div className="mt-5 flex justify-end">
                <Button icon={Save}>
                  Save Settings
                </Button>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Settings;
