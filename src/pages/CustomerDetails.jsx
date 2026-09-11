import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
  Menu,
  Pencil,
  X,
  Save,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import api from "../lib/api";

const emptyAddress = {
  state: "",
  district: "",
  pincode: "",
  city: "",
  landmark: "",
};

const CustomerDetails = () => {
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    title: "",
    name: "",
    businessName: "",
    businessCountry: "",
    displayName: "",
    entity: "",
    gstin: "",
    pan: "",
    msmeNumber: "",
    email: "",
    phone: "",
    mobileCountry: "",
    businessAddress: { ...emptyAddress },
    billingAddress: { ...emptyAddress },
    shippingAddress: { ...emptyAddress },
  });

  const loadCustomer = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.get("/api/customers/" + id);

      setCustomer(data.customer);

      const sales = (data.sales_history || []).map((sale) => ({
        id: "sale-" + sale.id,
        date: sale.sale_date,
        description:
          "Sale" +
          (sale.item_name ? " - " + sale.item_name : "") +
          " (" +
          sale.payment_type +
          ")",
        type: "debit",
        amount: Number(sale.amount || 0),
      }));

      const payments = (data.due_payments_history || []).map((payment) => ({
        id: "payment-" + payment.id,
        date: payment.payment_date,
        description: payment.purpose || "Payment received",
        type: "credit",
        amount: Number(payment.amount || 0),
      }));

      const allTransactions = [...sales, ...payments];

      allTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setTransactions(allTransactions);
    } catch (err) {
      setError(err.message || "Could not load customer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const startEditing = () => {
    if (!customer) {
      return;
    }

    setSaveError("");

    setForm({
      title: customer.title || "",
      name: customer.name || "",
      businessName: customer.business_name || "",
      businessCountry: customer.business_country || "",
      displayName: customer.display_name || "",
      entity: customer.entity || "",
      gstin: customer.gstin || "",
      pan: customer.pan || "",
      msmeNumber: customer.msme_number || "",
      email: customer.email || "",
      phone: customer.phone || "",
      mobileCountry: customer.mobile_country || "",

      businessAddress: {
        state: customer.business_state || "",
        district: customer.business_district || "",
        pincode: customer.business_pincode || "",
        city: customer.business_city || "",
        landmark: customer.business_landmark || "",
      },

      billingAddress: {
        state: customer.billing_state || "",
        district: customer.billing_district || "",
        pincode: customer.billing_pincode || "",
        city: customer.billing_city || "",
        landmark: customer.billing_landmark || "",
      },

      shippingAddress: {
        state: customer.shipping_state || "",
        district: customer.shipping_district || "",
        pincode: customer.shipping_pincode || "",
        city: customer.shipping_city || "",
        landmark: customer.shipping_landmark || "",
      },
    });

    setEditing(true);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateAddress = (addressType, field, value) => {
    setForm((previous) => ({
      ...previous,
      [addressType]: {
        ...previous[addressType],
        [field]: value,
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSaveError("");

    try {
      await api.patch("/api/customers/" + id, {
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
        phone: form.phone,
        mobileCountry: form.mobileCountry,
        businessAddress: form.businessAddress,
        billingAddress: form.billingAddress,
        shippingAddress: form.shippingAddress,
      });

      setEditing(false);

      await loadCustomer();
    } catch (err) {
      setSaveError(err.message || "Could not update customer.");
    } finally {
      setSaving(false);
    }
  };

  const totalCredit = transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const Info = ({ label, value }) => {
    return (
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="mt-1 text-sm font-medium text-slate-800">
          {value || "—"}
        </p>
      </div>
    );
  };

  const Address = ({ title, prefix }) => {
    return (
      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900">{title}</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Info
            label="State"
            value={customer[prefix + "_state"]}
          />

          <Info
            label="District"
            value={customer[prefix + "_district"]}
          />

          <Info
            label="Pincode"
            value={customer[prefix + "_pincode"]}
          />

          <Info
            label="City"
            value={customer[prefix + "_city"]}
          />

          <div className="sm:col-span-2">
            <Info
              label="Landmark"
              value={customer[prefix + "_landmark"]}
            />
          </div>
        </div>
      </div>
    );
  };

  const inputFields = [
    ["title", "Title"],
    ["name", "Name"],
    ["businessName", "Business Name"],
    ["businessCountry", "Business Country"],
    ["displayName", "Display Name"],
    ["entity", "Entity"],
    ["gstin", "GSTIN"],
    ["pan", "PAN"],
    ["msmeNumber", "MSME Number"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["mobileCountry", "Mobile Country"],
  ];

  const addressSections = [
    ["businessAddress", "Business Address"],
    ["billingAddress", "Billing Address"],
    ["shippingAddress", "Shipping Address"],
  ];

  const addressFields = [
    ["state", "State"],
    ["district", "District"],
    ["pincode", "Pincode"],
    ["city", "City"],
    ["landmark", "Landmark"],
  ];

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

            <Link
              to="/customers"
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600"
            >
              <ArrowLeft size={18} />
              Customers
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-center text-sm text-slate-400">
              Loading customer...
            </p>
          ) : !customer ? (
            <p className="text-center text-sm text-slate-400">
              Customer not found.
            </p>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                      {(customer.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">
                        {customer.name}
                      </h1>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        {customer.phone && (
                          <span className="flex items-center gap-2">
                            <Phone size={14} />
                            {customer.phone}
                          </span>
                        )}

                        {customer.email && (
                          <span className="flex items-center gap-2">
                            <Mail size={14} />
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startEditing}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Pencil size={16} />
                    Edit Customer
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Information
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Info label="Title" value={customer.title} />
                  <Info label="Name" value={customer.name} />
                  <Info
                    label="Business Name"
                    value={customer.business_name}
                  />
                  <Info
                    label="Display Name"
                    value={customer.display_name}
                  />
                  <Info label="Entity" value={customer.entity} />
                  <Info
                    label="Business Country"
                    value={customer.business_country}
                  />
                  <Info label="GSTIN" value={customer.gstin} />
                  <Info label="PAN" value={customer.pan} />
                  <Info
                    label="MSME Number"
                    value={customer.msme_number}
                  />
                  <Info
                    label="Mobile Country"
                    value={customer.mobile_country}
                  />
                  <Info label="Phone" value={customer.phone} />
                  <Info label="Email" value={customer.email} />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Addresses
                </h2>

                <div className="mt-5 grid gap-5 lg:grid-cols-3">
                  <Address
                    title="Business Address"
                    prefix="business"
                  />

                  <Address
                    title="Billing Address"
                    prefix="billing"
                  />

                  <Address
                    title="Shipping Address"
                    prefix="shipping"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs text-slate-500">
                    Outstanding
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    ₹
                    {Number(
                      customer.total_due || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs text-slate-500">
                    Total Paid
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    ₹{totalCredit.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs text-slate-500">
                    Transactions
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {transactions.length}
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="font-bold">
                    Transaction History
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Complete ledger for this customer
                  </p>
                </div>

                {transactions.length === 0 ? (
                  <p className="p-5 text-sm text-slate-400">
                    No transactions yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {transactions.map((transaction) => {
                      const isCredit =
                        transaction.type === "credit";

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-4 p-5"
                        >
                          <div
                            className={
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                              (isCredit
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600")
                            }
                          >
                            {isCredit ? (
                              <ArrowDownLeft size={19} />
                            ) : (
                              <ArrowUpRight size={19} />
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-semibold">
                              {transaction.description}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(
                                transaction.date
                              ).toLocaleDateString("en-IN")}
                            </p>
                          </div>

                          <p
                            className={
                              "text-sm font-bold " +
                              (isCredit
                                ? "text-emerald-600"
                                : "text-red-600")
                            }
                          >
                            {isCredit ? "+" : "-"}₹
                            {transaction.amount.toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Customer
                </h2>

                <p className="text-xs text-slate-400">
                  Update customer information and addresses
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              {saveError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {saveError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inputFields.map(([field, label]) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      {label}
                    </label>

                    <input
                      value={form[field]}
                      onChange={(event) =>
                        updateForm(field, event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                ))}
              </div>

              {addressSections.map(([type, title]) => (
                <div
                  key={type}
                  className="mt-6 rounded-xl border border-slate-200 p-5"
                >
                  <h3 className="font-semibold text-slate-900">
                    {title}
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {addressFields.map(([field, label]) => (
                      <div
                        key={field}
                        className={
                          field === "landmark"
                            ? "sm:col-span-2"
                            : ""
                        }
                      >
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                          {label}
                        </label>

                        <input
                          value={form[type][field]}
                          onChange={(event) =>
                            updateAddress(
                              type,
                              field,
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;