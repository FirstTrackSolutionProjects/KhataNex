import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Menu,
  Save,
  Upload,
  Image as ImageIcon,
  Pencil,
  X,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { api, fileUrl } from "../lib/api";

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [deletingSignature, setDeletingSignature] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const logoInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    business_name: "",
    business_type: "",
    gstin: "",
    pan: "",
    website: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    currency: "INR",
    tax_type: "standard",
    tcs_enabled: false,
    tds_enabled: false,
    payment_terms: "",
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      business_name: user.business_name || "",
      business_type: user.business_type || "",
      gstin: user.gstin || "",
      pan: user.pan || "",
      website: user.website || "",
      address_line1: user.address_line1 || "",
      address_line2: user.address_line2 || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      country: user.country || "India",
      currency: user.currency || "INR",
      tax_type: user.tax_type || "standard",
      tcs_enabled: Boolean(user.tcs_enabled),
      tds_enabled: Boolean(user.tds_enabled),
      payment_terms: user.payment_terms || "",
    });
  }, [user]);

  const completion = useMemo(() => {
    const importantFields = [
      formData.name,
      formData.phone,
      formData.business_name,
      formData.business_type,
      formData.gstin,
      formData.pan,
      formData.address_line1,
      formData.city,
      formData.state,
      formData.pincode,
      formData.country,
      user?.logo_path,
      user?.signature_path,
    ];

    const completed = importantFields.filter(
      (value) => value !== null && value !== undefined && String(value).trim() !== ""
    ).length;

    return Math.round((completed / importantFields.length) * 100);
  }, [formData, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = () => {
    setMessage("");
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      business_name: user.business_name || "",
      business_type: user.business_type || "",
      gstin: user.gstin || "",
      pan: user.pan || "",
      website: user.website || "",
      address_line1: user.address_line1 || "",
      address_line2: user.address_line2 || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      country: user.country || "India",
      currency: user.currency || "INR",
      tax_type: user.tax_type || "standard",
      tcs_enabled: Boolean(user.tcs_enabled),
      tds_enabled: Boolean(user.tds_enabled),
      payment_terms: user.payment_terms || "",
    });

    setEditing(false);
    setMessage("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateProfile(formData);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingLogo(true);
    setMessage("");
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("logo", file);

      await api.postForm("/api/auth/me/logo", uploadData);

      setMessage("Logo uploaded successfully.");

      window.location.reload();
    } catch (err) {
      setError(err.message || "Could not upload logo.");
      setUploadingLogo(false);
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingSignature(true);
    setMessage("");
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("signature", file);

      await api.postForm("/api/auth/me/signature", uploadData);

      setMessage("Authorized signature uploaded.");

      window.location.reload();
    } catch (err) {
      setError(err.message || "Could not upload signature.");
      setUploadingSignature(false);
    }
  };

  const handleDeleteSignature = async () => {
    setDeletingSignature(true);
    setMessage("");
    setError("");

    try {
      await api.del("/api/auth/me/signature");

      setMessage("Authorized signature removed.");

      window.location.reload();
    } catch (err) {
      setError(err.message || "Could not remove signature.");
      setDeletingSignature(false);
    }
  };

  const inputClass = `w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ${
    editing
      ? "bg-white focus:border-emerald-500"
      : "cursor-default bg-slate-50 text-slate-600"
  }`;

  const logoUrl = fileUrl(user?.logo_path);
  const signatureUrl = fileUrl(user?.signature_path);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <main className="min-h-screen">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

            {/* Mobile Header */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 hover:bg-white"
              >
                <Menu size={22} />
              </button>

              <h1 className="text-xl font-bold">Profile</h1>
            </div>

            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Business logo"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <User size={32} className="text-slate-400" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      {formData.name || "Your Name"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {user?.role === "employee"
                        ? "Employee"
                        : user?.role === "superadmin"
                        ? "Super Admin"
                        : "Business Owner"}
                    </p>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ImageIcon size={16} />

                      {uploadingLogo
                        ? "Uploading..."
                        : user?.logo_path
                        ? "Change Logo"
                        : "Upload Logo"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!editing ? (
                    <Button
                      icon={Pencil}
                      type="button"
                      onClick={handleEdit}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <X size={16} />
                        Cancel
                      </button>

                      <Button
                        icon={Save}
                        type="submit"
                        form="profile-form"
                        loading={saving}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Completion */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      Profile completion
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {completion === 100
                        ? "Your profile is complete."
                        : `Complete your profile to ${completion}% and keep your business details ready for documents.`}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-emerald-600">
                    {completion}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={18} />
                {message}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              id="profile-form"
              onSubmit={handleSave}
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"
            >
              {/* Personal Information */}
              <div>
                <h2 className="font-bold">Personal Information</h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

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
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={user?.email || ""}
                        disabled
                        className="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-600"
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Email cannot be changed here.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Phone
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="font-bold">Business Information</h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Business Name
                    </label>

                    <div className="relative">
                      <Building2
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Business Type
                    </label>

                    <input
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g. Retail, Services"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      GSTIN
                    </label>

                    <input
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Enter GSTIN"
                      className={`${inputClass} uppercase`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      PAN
                    </label>

                    <input
                      name="pan"
                      value={formData.pan}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Enter PAN"
                      className={`${inputClass} uppercase`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Website{" "}
                      <span className="text-slate-400">(Optional)</span>
                    </label>

                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="https://example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="font-bold">Business Address</h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Address Line 1
                    </label>

                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-3 top-3.5 text-slate-400"
                      />

                      <input
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Street / Building / Area"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Address Line 2
                    </label>

                    <input
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Apartment / Landmark (Optional)"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      City
                    </label>

                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!editing}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      State
                    </label>

                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!editing}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      PIN Code
                    </label>

                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={!editing}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Country
                    </label>

                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={!editing}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Authorized Signature */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold">Authorized Signature</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      This signature can be automatically used on invoices and other documents.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  {signatureUrl ? (
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex h-32 w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-4 sm:w-72">
                        <img
                          src={signatureUrl}
                          alt="Authorized signature"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <input
                          ref={signatureInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => signatureInputRef.current?.click()}
                          disabled={uploadingSignature}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Upload size={16} />
                          {uploadingSignature ? "Uploading..." : "Replace"}
                        </button>

                        <button
                          type="button"
                          onClick={handleDeleteSignature}
                          disabled={deletingSignature}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {deletingSignature ? "Removing..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-4">
                      <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                        No signature uploaded
                      </div>

                      <input
                        ref={signatureInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => signatureInputRef.current?.click()}
                        disabled={uploadingSignature}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Upload size={16} />
                        {uploadingSignature ? "Uploading..." : "Upload Signature"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Defaults */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="font-bold">Document Defaults</h2>

                <p className="mt-1 text-xs text-slate-500">
                  These settings are used as defaults when creating documents.
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Currency
                    </label>

                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="INR">₹ INR — Indian Rupee</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Tax Type
                    </label>

                    <select
                      name="tax_type"
                      value={formData.tax_type}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="standard">Standard GST</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Payment Terms
                    </label>

                    <input
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g. Payment due within 30 days"
                      className={inputClass}
                    />
                  </div>

                  <label
                    className={`flex items-center justify-between rounded-xl border border-slate-200 p-4 ${
                      editing ? "cursor-pointer" : "cursor-default bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">TCS</p>
                      <p className="text-xs text-slate-400">
                        Apply TCS on documents
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="tcs_enabled"
                      checked={formData.tcs_enabled}
                      onChange={handleChange}
                      disabled={!editing}
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between rounded-xl border border-slate-200 p-4 ${
                      editing ? "cursor-pointer" : "cursor-default bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">TDS</p>
                      <p className="text-xs text-slate-400">
                        Apply TDS on documents
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="tds_enabled"
                      checked={formData.tds_enabled}
                      onChange={handleChange}
                      disabled={!editing}
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </label>
                </div>
              </div>

              {/* Bottom Save */}
              {editing && (
                <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                  <Button
                    icon={Save}
                    type="submit"
                    loading={saving}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;