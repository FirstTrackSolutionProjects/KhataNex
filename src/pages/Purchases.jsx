import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Plus,
  Search,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Edit2,
  Eye,
  X,
  AlertCircle,
  Building2,
  Layers,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import api from "../lib/api";
import useSubscriptionAccess from "../hooks/useSubscriptionAccess";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${mins}`;
};

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return Number.isNaN(d.getTime())
    ? String(val)
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatCurrency = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Purchases = () => {
  const { canWrite, subscriptionRequiredMessage } = useSubscriptionAccess();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [viewBill, setViewBill] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const initialForm = {
    bill_number: "",
    vendor_name: "",
    bill_date: getCurrentDateTime(),
    notes: "",
    payment_mode: "bank_transfer",
    update_inventory: true,
    items: [
      {
        item_name: "",
        item_type: "goods",
        quantity: 1,
        unit: "Unit",
        price: 0,
        discount: 0,
        gst_rate: "18",
        hsn_code: "",
      },
    ],
  };

  const [form, setForm] = useState(initialForm);

  // Fetch purchases & stock
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [billsRes, stockRes] = await Promise.allSettled([
        api.get("/api/purchase-bills"),
        api.get("/api/stock"),
      ]);

      if (billsRes.status === "fulfilled") {
        const raw = billsRes.value?.purchase_bills || billsRes.value?.bills || billsRes.value?.data || billsRes.value || [];
        setPurchases(Array.isArray(raw) ? raw : []);
      } else {
        setError("Failed to load purchase bills.");
      }

      if (stockRes.status === "fulfilled") {
        const rawStock = stockRes.value?.stock || stockRes.value?.products || stockRes.value?.data || stockRes.value || [];
        setStock(Array.isArray(rawStock) ? rawStock : []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter((b) => {
      const bNum = String(b.bill_number || "").toLowerCase();
      const vendor = String(b.vendor_name || "").toLowerCase();
      const itNames = Array.isArray(b.items)
        ? b.items.map((it) => String(it.item_name || it.product_name || "").toLowerCase()).join(" ")
        : "";
      return bNum.includes(q) || vendor.includes(q) || itNames.includes(q);
    });
  }, [purchases, search]);

  // Aggregate KPIs
  const stats = useMemo(() => {
    let totalAmt = 0;
    let totalTax = 0;
    const vendorSet = new Set();

    for (const b of purchases) {
      totalAmt += Number(b.total_amount || 0);
      totalTax += Number(b.gst_amount || 0);
      if (b.vendor_name) vendorSet.add(b.vendor_name.trim().toLowerCase());
    }

    return {
      totalBills: purchases.length,
      totalAmount: totalAmt,
      totalTax: totalTax,
      totalVendors: vendorSet.size,
    };
  }, [purchases]);

  // Form helpers
  const handleOpenNew = () => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    setEditingId(null);
    setForm(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = async (bill) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    setFormError("");
    try {
      const data = await api.get(`/api/purchase-bills/${bill.id}`);
      const detail = data?.purchase_bill || data?.bill || bill;
      setEditingId(detail.id);
      setForm({
        bill_number: detail.bill_number || "",
        vendor_name: detail.vendor_name || "",
        bill_date: detail.bill_date ? String(detail.bill_date).slice(0, 16) : getCurrentDateTime(),
        notes: detail.notes || "",
        payment_mode: detail.payment_mode || "bank_transfer",
        update_inventory: false,
        items: Array.isArray(detail.items) && detail.items.length > 0
          ? detail.items.map((it) => ({
              item_name: it.item_name || it.product_name || "",
              item_type: it.item_type || "goods",
              quantity: Number(it.quantity || 1),
              unit: it.unit || "Unit",
              price: Number(it.price || it.rate || 0),
              discount: Number(it.discount || 0),
              gst_rate: String(it.gst_rate ?? "18"),
              hsn_code: it.hsn_code || "",
            }))
          : initialForm.items,
      });
      setShowModal(true);
    } catch (err) {
      alert("Failed to load purchase bill details for editing.");
    }
  };

  const updateItemField = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_name: "",
          item_type: "goods",
          quantity: 1,
          unit: "Unit",
          price: 0,
          discount: 0,
          gst_rate: "18",
          hsn_code: "",
        },
      ],
    }));
  };

  const removeItemRow = (idx) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  // Form Calculations
  const calculatedTotals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    for (const it of form.items) {
      const q = Number(it.quantity || 0);
      const p = Number(it.price || 0);
      const d = Number(it.discount || 0);
      const taxable = Math.max(0, q * p - d);
      const rate = Number(it.gst_rate || 0);
      subtotal += taxable;
      totalTax += taxable * (rate / 100);
    }

    return {
      subtotal,
      totalTax,
      grandTotal: subtotal + totalTax,
    };
  }, [form.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bill_number.trim()) {
      setFormError("Please enter a bill number.");
      return;
    }
    if (!form.vendor_name.trim()) {
      setFormError("Please enter the vendor name.");
      return;
    }
    const validItems = form.items.filter((it) => it.item_name && it.item_name.trim());
    if (validItems.length === 0) {
      setFormError("Please add at least one item with a valid name.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        bill_number: form.bill_number.trim(),
        vendor_name: form.vendor_name.trim(),
        bill_date: form.bill_date,
        total_amount: calculatedTotals.grandTotal,
        gst_amount: calculatedTotals.totalTax,
        notes: form.notes || "",
        items: validItems.map((it) => ({
          item_name: it.item_name.trim(),
          item_type: it.item_type || "goods",
          quantity: Number(it.quantity || 1),
          unit: it.unit || "Unit",
          price: Number(it.price || 0),
          discount: Number(it.discount || 0),
          gst_rate: Number(it.gst_rate || 0),
          hsn_code: it.hsn_code || "",
        })),
      };

      if (editingId) {
        await api.put(`/api/purchase-bills/${editingId}`, payload);
      } else {
        await api.post("/api/purchase-bills", payload);

        // Auto-update or create inventory stock if checked
        if (form.update_inventory) {
          for (const it of validItems) {
            const name = it.item_name.trim();
            const existing = stock.find(
              (p) => (p.product_name || p.name || "").trim().toLowerCase() === name.toLowerCase()
            );
            if (existing) {
              try {
                await api.patch(`/api/stock/${existing.id}`, {
                  quantity: Number(existing.quantity || 0) + Number(it.quantity || 0),
                });
              } catch (_) {}
            } else if (it.item_type !== "service") {
              try {
                await api.post("/api/stock", {
                  product_name: name,
                  item_type: it.item_type || "goods",
                  type: it.item_type || "goods",
                  unit: it.unit || "Unit",
                  hsn_code: it.hsn_code || "",
                  gst_rate: String(it.gst_rate || 0),
                  quantity: Number(it.quantity || 0),
                  price: Number(it.price || 0),
                  category: "Purchases",
                });
              } catch (_) {}
            }
          }
        }
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || "Failed to save purchase bill.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase bill?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/purchase-bills/${id}`);
      setPurchases((prev) => prev.filter((b) => b.id !== id));
      if (viewBill?.id === id) setViewBill(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete purchase bill.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64">
        <PageHeader
          title="Purchases"
          subtitle="Manage vendor purchase bills, incoming inventory, and tax input credits"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showProfile={true}
          onNew={handleOpenNew}
          newLabel="Record Bill"
          newDisabled={!canWrite}
          newTooltip={!canWrite ? subscriptionRequiredMessage : undefined}
        />

        <div className="p-4 sm:p-6 lg:p-8">

      {/* KPI STATS CARDS */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Purchases</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(stats.totalAmount)}</p>
          <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">Billed to date</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Recorded Bills</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats.totalBills}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Total transactions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">GST Input Tax</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{formatCurrency(stats.totalTax)}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Eligible ITC</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Active Vendors</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats.totalVendors}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Unique suppliers</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor, bill #, or item name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={loadData} className="ml-auto font-semibold underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* PURCHASES TABLE / LIST */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="mt-3 text-sm">Loading purchase bills...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingBag size={28} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-800">No purchase bills found</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {search
                ? `No purchase bills matched "${search}". Try another search term.`
                : "Record your supplier bills here to track expenses and incoming inventory stock."}
            </p>
            {!search && (
              <button
                type="button"
                onClick={handleOpenNew}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus size={15} />
                Record First Bill
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Bill #</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Vendor</th>
                    <th className="px-4 py-3.5">Items</th>
                    <th className="px-4 py-3.5 text-right">Tax (GST)</th>
                    <th className="px-5 py-3.5 text-right">Total Amount</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map((bill) => {
                    const billItems = Array.isArray(bill.items) ? bill.items : [];
                    const itemSummary = billItems.map((it) => it.item_name || it.product_name).filter(Boolean).join(", ");

                    return (
                      <tr key={bill.id} className="transition hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-slate-400" />
                            <span>{bill.bill_number || `#PUR-${bill.id}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(bill.bill_date || bill.created_at)}
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-slate-400" />
                            <span>{bill.vendor_name || "Unknown Vendor"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                            {billItems.length} {billItems.length === 1 ? "item" : "items"}
                          </span>
                          {itemSummary && (
                            <p className="mt-0.5 max-w-xs truncate text-[11px] text-slate-400">
                              {itemSummary}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-xs text-slate-600 whitespace-nowrap">
                          {formatCurrency(bill.gst_amount || 0)}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(bill.total_amount || 0)}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewBill(bill)}
                              title="View Details"
                              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(bill)}
                              title="Edit Bill"
                              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(bill.id)}
                              disabled={deletingId === bill.id}
                              title="Delete Bill"
                              className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 768px) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredPurchases.map((bill) => {
                const billItems = Array.isArray(bill.items) ? bill.items : [];
                const itemSummary = billItems.map((it) => it.item_name || it.product_name).filter(Boolean).join(", ");
                return (
                  <div key={bill.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <FileText size={14} className="text-slate-400" />
                          <span className="font-semibold text-slate-900 text-sm">
                            {bill.bill_number || `#PUR-${bill.id}`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {formatDate(bill.bill_date || bill.created_at)}
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-medium">
                        {billItems.length} {billItems.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-800">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{bill.vendor_name || "Unknown Vendor"}</span>
                      </div>
                      {itemSummary && (
                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{itemSummary}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-xs">
                      <div className="text-slate-500">
                        Tax: <span className="font-medium text-slate-700">{formatCurrency(bill.gst_amount || 0)}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {formatCurrency(bill.total_amount || 0)}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => setViewBill(bill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(bill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(bill.id)}
                        disabled={deletingId === bill.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
        </div>
      </main>

      {/* RECORD / EDIT PURCHASE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Purchase Bill" : "Record Purchase Bill"}
                </h2>
                <p className="text-xs text-slate-500">Record supplier invoice details and update inventory stocks</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {formError}
                  </div>
                )}

                {/* Primary Meta Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Bill Number *</label>
                    <input
                      type="text"
                      required
                      value={form.bill_number}
                      onChange={(e) => setForm({ ...form, bill_number: e.target.value })}
                      placeholder="e.g. INV-9841"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Vendor / Supplier *</label>
                    <input
                      type="text"
                      required
                      value={form.vendor_name}
                      onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                      placeholder="e.g. Acme Supplies Pvt Ltd"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Bill Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.bill_date}
                      onChange={(e) => setForm({ ...form, bill_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Item Line Rows */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Items / Products</span>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.items.map((it, idx) => {
                      const itemSubtotal = Math.max(0, Number(it.quantity || 0) * Number(it.price || 0) - Number(it.discount || 0));
                      const itemTax = itemSubtotal * (Number(it.gst_rate || 0) / 100);
                      const itemTotal = itemSubtotal + itemTax;

                      return (
                        <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                          <div className="grid grid-cols-12 gap-2.5 items-end">
                            {/* Item Name */}
                            <div className="col-span-12 sm:col-span-4">
                              <label className="mb-1 block text-[11px] font-medium text-slate-600">Item Name *</label>
                              <input
                                type="text"
                                required
                                value={it.item_name}
                                onChange={(e) => updateItemField(idx, "item_name", e.target.value)}
                                placeholder="Product or service name"
                                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500"
                              />
                            </div>

                            {/* Quantity */}
                            <div className="col-span-4 sm:col-span-2">
                              <label className="mb-1 block text-[11px] font-medium text-slate-600">Qty</label>
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={it.quantity}
                                onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                              />
                            </div>

                            {/* Purchase Price */}
                            <div className="col-span-4 sm:col-span-2">
                              <label className="mb-1 block text-[11px] font-medium text-slate-600">Rate (₹)</label>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={it.price}
                                onChange={(e) => updateItemField(idx, "price", e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                              />
                            </div>

                            {/* GST Rate */}
                            <div className="col-span-4 sm:col-span-2">
                              <label className="mb-1 block text-[11px] font-medium text-slate-600">GST %</label>
                              <select
                                value={it.gst_rate}
                                onChange={(e) => updateItemField(idx, "gst_rate", e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                              >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </select>
                            </div>

                            {/* Line Total & Remove */}
                            <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                              <div className="text-right">
                                <span className="block text-[10px] text-slate-400">Total</span>
                                <span className="text-xs font-bold text-slate-800">{formatCurrency(itemTotal)}</span>
                              </div>
                              {form.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItemRow(idx)}
                                  className="rounded-md p-1 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals Summary */}
                  <div className="mt-4 flex flex-col items-end gap-1 border-t border-slate-200 pt-3 text-xs">
                    <div className="flex w-64 justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculatedTotals.subtotal)}</span>
                    </div>
                    <div className="flex w-64 justify-between text-slate-500">
                      <span>GST Amount:</span>
                      <span>{formatCurrency(calculatedTotals.totalTax)}</span>
                    </div>
                    <div className="flex w-64 justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-1">
                      <span>Grand Total:</span>
                      <span className="text-emerald-700">{formatCurrency(calculatedTotals.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Inventory update option */}
                {!editingId && (
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.update_inventory}
                      onChange={(e) => setForm({ ...form, update_inventory: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Automatically add / update items into Inventory Stock</span>
                  </label>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update Bill" : "Save Purchase Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BILL DETAILS MODAL */}
      {viewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Purchase Bill Details</h3>
                <p className="text-xs text-slate-500">Bill #{viewBill.bill_number || viewBill.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewBill(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Vendor / Supplier</span>
                  <span className="font-semibold text-slate-800 text-sm">{viewBill.vendor_name || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bill Date</span>
                  <span className="font-semibold text-slate-800">{formatDate(viewBill.bill_date || viewBill.created_at)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Itemized Breakdown</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Tax</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(viewBill.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-medium text-slate-800">{it.item_name || it.product_name}</td>
                          <td className="px-3 py-2 text-slate-600">{it.quantity} {it.unit || ""}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(it.price || it.rate)}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{it.gst_rate ? `${it.gst_rate}%` : "-"}</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-900">
                            {formatCurrency(Number(it.quantity || 1) * Number(it.price || it.rate || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 text-xs pt-2">
                <div className="flex w-56 justify-between text-slate-500">
                  <span>GST Amount:</span>
                  <span>{formatCurrency(viewBill.gst_amount || 0)}</span>
                </div>
                <div className="flex w-56 justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Total Amount:</span>
                  <span className="text-emerald-700">{formatCurrency(viewBill.total_amount || 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-3">
              <button
                type="button"
                onClick={() => setViewBill(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
