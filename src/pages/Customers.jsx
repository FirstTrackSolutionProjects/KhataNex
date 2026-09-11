import React, { useEffect, useState } from "react";
import { Plus, Search, Users, Menu, X, ChevronDown } from "lucide-react";

import Sidebar from "../components/Sidebar";
import CustomerCard from "../components/CustomerCard";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";

const titles = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

const entities = [
  "Individual",
  "Partnership",
  "Proprietorship",
  "Private Ltd Company",
  "Public Limited Company",
  "One Person Company",
  "Society / Club / Trust / Association / NGO",
  "Government Department",
  "Limited Liability Partnership",
  "Others",
];

const countries = [
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Australia", code: "+61", flag: "🇦��" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Singapore", code: "+65", flag: "🇸��" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
];

const emptyAddress = {
  state: "",
  district: "",
  pincode: "",
  city: "",
  landmark: "",
};

const initialForm = {
  title: "Mr",
  name: "",
  businessName: "",
  businessCountry: "India",
  displayName: "",
  entity: "Individual",
  gstin: "",
  pan: "",
  msmeNumber: "",
  email: "",
  mobileCountry: "India",
  mobile: "",

  businessAddress: { ...emptyAddress },
  billingAddress: { ...emptyAddress },
  shippingAddress: { ...emptyAddress },

  billingSameAsBusiness: true,
  shippingSameAsBusiness: true,
};

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    />
  </div>
);

const SelectButton = ({ label, value, onClick }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm outline-none transition hover:border-emerald-400"
    >
      <span className="truncate text-slate-700">{value}</span>
      <ChevronDown size={17} className="shrink-0 text-slate-400" />
    </button>
  </div>
);

const AddressFields = ({ address, setAddress }) => {
  const update = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="State"
        value={address.state}
        onChange={(value) => update("state", value)}
        placeholder="State"
      />

      <Input
        label="District"
        value={address.district}
        onChange={(value) => update("district", value)}
        placeholder="District"
      />

      <Input
        label="Pincode"
        value={address.pincode}
        onChange={(value) => update("pincode", value)}
        placeholder="Pincode"
      />

      <Input
        label="City"
        value={address.city}
        onChange={(value) => update("city", value)}
        placeholder="City"
      />

      <div className="sm:col-span-2">
        <Input
          label="Landmark"
          value={address.landmark}
          onChange={(value) => update("landmark", value)}
          placeholder="Landmark"
        />
      </div>
    </div>
  );
};

const Customers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [drawer, setDrawer] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.get("/api/customers");
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.phone || "").includes(search)
  );

  const totalReceivable = customers.reduce(
    (sum, c) => sum + Number(c.total_due || 0),
    0
  );

  const settledCount = customers.filter(
    (c) => Number(c.total_due || 0) <= 0
  ).length;

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateBusinessAddress = (updater) => {
    setForm((prev) => ({
      ...prev,
      businessAddress:
        typeof updater === "function"
          ? updater(prev.businessAddress)
          : updater,
    }));
  };

  const updateBillingAddress = (updater) => {
    setForm((prev) => ({
      ...prev,
      billingAddress:
        typeof updater === "function"
          ? updater(prev.billingAddress)
          : updater,
    }));
  };

  const updateShippingAddress = (updater) => {
    setForm((prev) => ({
      ...prev,
      shippingAddress:
        typeof updater === "function"
          ? updater(prev.shippingAddress)
          : updater,
    }));
  };

  const toggleBillingSame = (checked) => {
    setForm((prev) => ({
      ...prev,
      billingSameAsBusiness: checked,
      billingAddress: checked
        ? { ...prev.businessAddress }
        : { ...prev.billingAddress },
    }));
  };

  const toggleShippingSame = (checked) => {
    setForm((prev) => ({
      ...prev,
      shippingSameAsBusiness: checked,
      shippingAddress: checked
        ? { ...prev.businessAddress }
        : { ...prev.shippingAddress },
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setSaveError("");
    setDrawer(null);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);

    try {
      /*
       * UI is ready for all customer fields.
       * Backend integration will be adjusted after we inspect
       * the existing customer controller/database schema.
       */
      await api.post("/api/customers", {
  title: form.title,
  name: form.name,
  businessName: form.businessName,
  businessCountry: form.businessCountry,
  displayName: form.displayName,
  entity: form.entity,
  gstin: form.gstin,
  pan: form.pan,
  msmeNumber: form.msmeNumber,
  email: form.email,

  phone: `${countries.find(
    (c) => c.name === form.mobileCountry
  )?.code || "+91"}${form.mobile}`,

  mobileCountry: form.mobileCountry,

  businessAddress: form.businessAddress,

  billingAddress: form.billingSameAsBusiness
    ? form.businessAddress
    : form.billingAddress,

  shippingAddress: form.shippingSameAsBusiness
    ? form.businessAddress
    : form.shippingAddress,
});

      setShowAddModal(false);
      resetForm();
      loadCustomers();
    } catch (err) {
      setSaveError(err.message || "Could not add customer.");
    } finally {
      setSaving(false);
    }
  };

  const selectDrawerValue = (value) => {
    if (drawer === "country") {
      updateForm("businessCountry", value);
    }

    if (drawer === "entity") {
      updateForm("entity", value);
    }

    if (drawer === "mobileCountry") {
      updateForm("mobileCountry", value);
    }

    setDrawer(null);
  };

  const drawerTitle =
    drawer === "country"
      ? "Select Business Country"
      : drawer === "entity"
        ? "Select Entity"
        : "Select Mobile Country";

  const drawerOptions =
    drawer === "country"
      ? countries.map((country) => country.name)
      : drawer === "entity"
        ? entities
        : countries.map((country) => `${country.flag} ${country.name} (${country.code})`);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold">Customers</h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your customer accounts
              </p>
            </div>
          </div>

          <Button
            icon={Plus}
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            Add Customer
          </Button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : customers.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Receivable
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading
                  ? "..."
                  : `₹${totalReceivable.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Settled Accounts
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : settledCount}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer by name or phone..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {loading ? (
            <p className="mt-8 text-center text-sm text-slate-400">
              Loading customers...
            </p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  id={customer.id}
                  name={customer.name}
                  phone={customer.phone}
                  balance={Number(customer.total_due || 0)}
                />
              ))}
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users size={35} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-semibold">
                No customers found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {customers.length === 0
                  ? "Add your first customer to get started."
                  : "Try searching with another name or phone number."}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ADD CUSTOMER */}
      <Modal
        open={showAddModal}
        onClose={() => {
          if (!saving) {
            setShowAddModal(false);
            resetForm();
          }
        }}
        title="Add Customer"
      >
        <form onSubmit={handleAddCustomer} className="space-y-7">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          {/* PERSONAL INFORMATION */}
          <section>
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900">
                Personal Information
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Enter the basic details of your customer.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectButton
                label="Title"
                value={form.title}
                onClick={() => setDrawer("title")}
              />

              <Input
                label="Name"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
                placeholder="Customer name"
              />

              <Input
                label="Business Name"
                value={form.businessName}
                onChange={(value) => updateForm("businessName", value)}
                placeholder="Business name"
              />

              <SelectButton
                label="Business Country"
                value={form.businessCountry}
                onClick={() => setDrawer("country")}
              />

              <Input
                label="Display Name"
                value={form.displayName}
                onChange={(value) => updateForm("displayName", value)}
                placeholder="Name shown across the app"
              />

              <SelectButton
                label="Entity"
                value={form.entity}
                onClick={() => setDrawer("entity")}
              />

              <Input
                label="GSTIN"
                value={form.gstin}
                onChange={(value) => updateForm("gstin", value)}
                placeholder="GST identification number"
              />

              <Input
                label="PAN"
                value={form.pan}
                onChange={(value) => updateForm("pan", value)}
                placeholder="PAN number"
              />

              <Input
                label="MSME Number"
                value={form.msmeNumber}
                onChange={(value) => updateForm("msmeNumber", value)}
                placeholder="MSME registration number"
              />

              <Input
                label="Email"
                value={form.email}
                onChange={(value) => updateForm("email", value)}
                placeholder="customer@example.com"
                type="email"
              />

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mobile
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawer("mobileCountry")}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm hover:border-emerald-400"
                  >
                    {countries.find(
                      (c) => c.name === form.mobileCountry
                    )?.flag || "🇮🇳"}

                    <span>
                      {countries.find(
                        (c) => c.name === form.mobileCountry
                      )?.code || "+91"}
                    </span>

                    <ChevronDown size={15} />
                  </button>

                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) =>
                      updateForm("mobile", e.target.value)
                    }
                    placeholder="Mobile number"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BUSINESS ADDRESS */}
          <section className="border-t border-slate-100 pt-6">
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900">
                Business Address
              </h4>
            </div>

            <AddressFields
              address={form.businessAddress}
              setAddress={updateBusinessAddress}
            />
          </section>

          {/* BILLING ADDRESS */}
          <section className="border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-slate-900">
                  Billing Address
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  Use the business address or enter a separate address.
                </p>
              </div>

              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={form.billingSameAsBusiness}
                  onChange={(e) => toggleBillingSame(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Same as business
              </label>
            </div>

            {form.billingSameAsBusiness ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Billing address will use the business address.
              </div>
            ) : (
              <AddressFields
                address={form.billingAddress}
                setAddress={updateBillingAddress}
              />
            )}
          </section>

          {/* SHIPPING ADDRESS */}
          <section className="border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold text-slate-900">
                  Shipping Address
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  Use the business address or enter a separate address.
                </p>
              </div>

              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={form.shippingSameAsBusiness}
                  onChange={(e) => toggleShippingSame(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Same as business
              </label>
            </div>

            {form.shippingSameAsBusiness ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Shipping address will use the business address.
              </div>
            ) : (
              <AddressFields
                address={form.shippingAddress}
                setAddress={updateShippingAddress}
              />
            )}
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Customer"}
          </button>
        </form>
      </Modal>

      {/* SELECT DRAWER */}
      {drawer && drawer !== "title" && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setDrawer(null)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h3 className="font-semibold text-slate-900">
                {drawerTitle}
              </h3>

              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-3">
              {drawerOptions.map((option) => {
                const value =
                  drawer === "mobileCountry"
                    ? countries.find(
                        (country) =>
                          `${country.flag} ${country.name} (${country.code})` ===
                          option
                      )?.name
                    : option;

                const selected =
                  drawer === "country"
                    ? form.businessCountry === value
                    : drawer === "entity"
                      ? form.entity === value
                      : form.mobileCountry === value;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectDrawerValue(value)}
                    className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "bg-emerald-50 font-semibold text-emerald-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TITLE DRAWER */}
      {drawer === "title" && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setDrawer(null)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="font-semibold text-slate-900">
                Select Title
              </h3>

              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-3">
              {titles.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => {
                    updateForm("title", title);
                    setDrawer(null);
                  }}
                  className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm ${
                    form.title === title
                      ? "bg-emerald-50 font-semibold text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
