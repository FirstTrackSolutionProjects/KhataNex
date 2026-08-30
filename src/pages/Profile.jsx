import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Menu,
  Save,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    business_name: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        business_name: user.business_name || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile(formData);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-lg font-bold">Profile</h1>
            <p className="text-xs text-slate-400">Manage your personal and business information</p>
          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="mx-auto max-w-3xl">

            {/* Profile Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
                  {(formData.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-xl font-bold">{formData.name || "Your Name"}</h2>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {user?.role === "employee"
                      ? user?.employee_role_type
                        ? `Employee · ${user.employee_role_type}`
                        : "Employee"
                      : user?.role === "superadmin"
                      ? "Super Admin"
                      : "Business Owner"}
                  </p>
                </div>

              </div>

            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="font-bold">Personal Information</h2>

              {message && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                  {message}
                </div>
              )}
              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">Full Name</label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={user?.email || ""}
                      disabled
                      title="Email cannot be changed here"
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Phone</label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Business Name</label>

                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Business Address</label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

              </div>

              <div className="mt-6 flex justify-end">
                <Button icon={Save} type="submit" loading={saving}>
                  Save Changes
                </Button>
              </div>

            </form>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Profile;
