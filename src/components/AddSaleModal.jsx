import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Package,
  User,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
  Percent,
} from "lucide-react";
import Modal from "./Modal";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const todayString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const currentTimeString = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const createEmptyItem = () => ({
  id: Math.random().toString(36).substring(2, 9),
  product_id: "",
  product_name: "",
  category: "",
  item_type: "goods",
  quantity: "1",
  unit: "pcs",
  unit_price: "",
  discount: "0",
  tax_rate: "18",
  hsn_code: "",
  available_stock: null,
});

export default function AddSaleModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [customerMode, setCustomerMode] = useState("existing"); // 'existing' | 'manual'
  const [customers, setCustomers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Customer state
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerState, setCustomerState] = useState("");

  // Items state (Multi-item list)
  const [items, setItems] = useState([createEmptyItem()]);

  // GST Mode state: 'cgst_sgst' (equal split) | 'igst' (single application)
  const [gstMode, setGstMode] = useState("cgst_sgst");

  // Payment state
  const [paymentMode, setPaymentMode] = useState("cash");
  const [bankId, setBankId] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [isPaidAmountCustom, setIsPaidAmountCustom] = useState(false);

  // Metadata
  const [saleDate, setSaleDate] = useState(todayString());
  const [saleTime, setSaleTime] = useState(currentTimeString());
  const [notes, setNotes] = useState("");

  // Tax Invoice generation option
  const [createInvoice, setCreateInvoice] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial dropdown data on open
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }
    const fetchData = async () => {
      setLoadingInitial(true);
      setError(null);
      try {
        const [custRes, stockRes, bankRes] = await Promise.allSettled([
          api.get("/api/customers"),
          api.get("/api/stock"),
          api.get("/api/banking"),
        ]);
        if (custRes.status === "fulfilled" && custRes.value?.customers) {
          const rawCusts = Array.isArray(custRes.value.customers) ? custRes.value.customers : [];
          const seen = new Set();
          const uniqueCusts = rawCusts.filter((c) => {
            if (!c?.id || seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          });
          setCustomers(uniqueCusts);
        }
        if (stockRes.status === "fulfilled" && stockRes.value?.stock) {
          const rawStock = Array.isArray(stockRes.value.stock) ? stockRes.value.stock : [];
          const seenStock = new Set();
          const uniqueStock = rawStock.filter((s) => {
            if (!s?.id || seenStock.has(s.id)) return false;
            seenStock.add(s.id);
            return true;
          });
          setStockItems(uniqueStock);
        }
        if (bankRes.status === "fulfilled") {
          const banks =
            bankRes.value?.banking ||
            bankRes.value?.banks ||
            bankRes.value?.accounts ||
            bankRes.value?.data ||
            [];
          setBankAccounts(Array.isArray(banks) ? banks : []);
        }
      } catch (err) {
        console.error("Failed to load initial data for AddSaleModal:", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchData();
  }, [isOpen]);

  const resetForm = () => {
    setCustomerMode("existing");
    setCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerGstin("");
    setCustomerState("");
    setItems([createEmptyItem()]);
    setGstMode("cgst_sgst");
    setPaymentMode("cash");
    setBankId("");
    setPaidAmount("");
    setIsPaidAmountCustom(false);
    setSaleDate(todayString());
    setSaleTime(currentTimeString());
    setNotes("");
    setCreateInvoice(false);
    setError(null);
  };

  // Handle existing customer selection
  const handleSelectCustomer = (id) => {
    setCustomerId(id);
    const match = customers.find((c) => String(c.id) === String(id));
    if (match) {
      const cState = match.billing_state || match.state || "";
      setCustomerName(match.name || match.business_name || "");
      setCustomerPhone(match.phone || "");
      setCustomerEmail(match.email || "");
      setCustomerAddress(match.address_line1 || match.billing_city || match.address || "");
      setCustomerGstin(match.gstin || "");
      setCustomerState(cState);

      const sellerState = String(user?.state || "").trim().toLowerCase();
      const buyerState = String(cState).trim().toLowerCase();
      if (sellerState && buyerState && sellerState !== buyerState) {
        setGstMode("igst");
      } else {
        setGstMode("cgst_sgst");
      }
    }
  };

  // Multi-item handlers
  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemFieldChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Stock item selection in an item row
  const handleSelectStockItem = (index, stockId) => {
    if (!stockId) {
      setItems((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          product_id: "",
          available_stock: null,
        };
        return next;
      });
      return;
    }

    const match = stockItems.find((s) => String(s.id) === String(stockId));
    if (match) {
      setItems((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          product_id: match.id,
          product_name: match.product_name || next[index].product_name,
          category: match.category || next[index].category,
          item_type: match.item_type || match.type || "goods",
          unit: match.unit || "pcs",
          unit_price: String(match.selling_price || match.price || 0),
          tax_rate: String(match.gst_rate ?? 18),
          hsn_code: match.hsn_code || "",
          available_stock: match.quantity !== undefined ? Number(match.quantity) : null,
        };
        return next;
      });
    }
  };

  // Calculations
  const { subtotal, totalTax, grandTotal, lineCalculations, isInterState } = useMemo(() => {
    let sub = 0;
    let tax = 0;
    const lines = items.map((it) => {
      const qty = Math.max(0, Number(it.quantity) || 0);
      const rate = Math.max(0, Number(it.unit_price) || 0);
      const disc = Math.max(0, Number(it.discount) || 0);
      const taxable = Math.max(0, qty * rate - disc);
      const rateTax = Math.max(0, Number(it.tax_rate) || 0);
      const lineTax = (taxable * rateTax) / 100;
      const lineTot = taxable + lineTax;

      sub += taxable;
      tax += lineTax;
      return { taxable, lineTax, lineTot };
    });

    const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
    const cleanSub = round2(sub);
    const cleanTax = round2(tax);
    const cleanGrand = round2(cleanSub + cleanTax);

    // Place of Supply: Compare seller state with buyer state
    const sellerState = String(user?.state || "").trim().toLowerCase();
    const buyerState = String(customerState || "").trim().toLowerCase();
    const interState = Boolean(sellerState && buyerState && sellerState !== buyerState);

    return {
      subtotal: cleanSub,
      totalTax: cleanTax,
      grandTotal: cleanGrand,
      lineCalculations: lines,
      isInterState: interState,
    };
  }, [items, user?.state, customerState]);

  // Keep paid amount synced to grand total unless user modified it
  useEffect(() => {
    if (!isPaidAmountCustom) {
      setPaidAmount(String(grandTotal));
    }
  }, [grandTotal, isPaidAmountCustom]);

  const numPaid = Math.max(0, Number(paidAmount) || 0);
  const dueAmount = Math.max(0, Math.round((grandTotal - numPaid) * 100) / 100);

  let paymentStatusBadge = { text: "Paid", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  if (numPaid >= grandTotal && grandTotal > 0) {
    paymentStatusBadge = { text: "Fully Paid", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  } else if (numPaid > 0 && numPaid < grandTotal) {
    paymentStatusBadge = { text: "Partially Paid", color: "bg-amber-100 text-amber-800 border-amber-200" };
  } else if (numPaid === 0 && grandTotal > 0) {
    paymentStatusBadge = { text: "Unpaid / Credit", color: "bg-red-100 text-red-800 border-red-200" };
  }

  const showError = (msg) => {
    setError(msg);
    if (typeof document !== "undefined") {
      const modalBody = document.querySelector(".overflow-y-auto");
      if (modalBody) {
        modalBody.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    if (customerMode === "existing" && !customerId) {
      showError("Please select an existing customer or switch to manual/walk-in entry.");
      return;
    }

    const finalCustomerName = customerName.trim() || (customerMode === "manual" ? "Walk-in Customer" : "");
    if (!finalCustomerName) {
      showError("Please enter a customer or buyer name.");
      return;
    }

    // Validate items
    if (!items || items.length === 0) {
      showError("Please add at least one line item.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.product_name || !it.product_name.trim()) {
        showError(`Item #${i + 1} must have a valid product or service name.`);
        return;
      }
      const qty = Number(it.quantity);
      if (it.quantity === "" || Number.isNaN(qty) || qty <= 0) {
        showError(`Item #${i + 1} ("${it.product_name.trim()}") has an invalid quantity.`);
        return;
      }
      const rate = Number(it.unit_price);
      if (it.unit_price === "" || it.unit_price === null || Number.isNaN(rate) || rate < 0) {
        showError(`Item #${i + 1} ("${it.product_name.trim()}") must have a valid price / rate.`);
        return;
      }
      if (
        it.item_type !== "service" &&
        it.available_stock !== null &&
        qty > it.available_stock
      ) {
        showError(
          `Insufficient stock for "${it.product_name.trim()}". Requested: ${qty}, Available: ${it.available_stock}`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id: customerMode === "existing" && customerId ? Number(customerId) : null,
        customer_name: finalCustomerName,
        customer_phone: customerPhone.trim() || null,
        customer_email: customerEmail.trim() || null,
        customer_address: customerAddress.trim() || null,
        customer_gstin: customerGstin.trim() || null,
        billing_state: customerState.trim() || null,
        state: customerState.trim() || null,
        items: items.map((it) => ({
          product_id: it.product_id ? Number(it.product_id) : null,
          product_name: it.product_name.trim(),
          category: it.category.trim() || null,
          quantity: Number(it.quantity || 1),
          unit: it.unit.trim() || "pcs",
          unit_price: Number(it.unit_price || 0),
          discount: Number(it.discount || 0),
          tax_rate: Number(it.tax_rate || 0),
          item_type: it.item_type || "goods",
          hsn_code: it.hsn_code ? it.hsn_code.trim() : null,
        })),
        payment_mode: paymentMode,
        paid_amount: numPaid,
        bank_id: bankId ? Number(bankId) : null,
        sale_date: saleDate,
        sale_time: saleTime,
        notes: notes.trim() || null,
        create_invoice: createInvoice,
        gst_rate: items[0]?.tax_rate ? Number(items[0].tax_rate) : 18,
        gst_mode: gstMode,
      };

      const res = await api.post("/api/sales", payload);
      if (res?.success) {
        if (onSuccess) onSuccess(res.sale, res.invoice);
        onClose();
      }
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "Failed to record sale.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Sale" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} noValidate className="space-y-6 text-slate-800">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* CUSTOMER SECTION */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <User size={18} />
              </div>
              <h3 className="font-semibold text-slate-900">Customer Information</h3>
            </div>
            {/* Mode switch pills */}
            <div className="flex rounded-xl bg-slate-200/80 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCustomerMode("existing")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  customerMode === "existing"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Existing Customer
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerMode("manual");
                  setCustomerId("");
                  if (!customerName || customerName === "Walk-in Customer") {
                    setCustomerName("Walk-in Customer");
                  }
                }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  customerMode === "manual"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Walk-in / Manual
              </button>
            </div>
          </div>

          {customerMode === "existing" ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Select Existing Customer *
                </label>
                <select
                  id="sale-customer-select"
                  value={customerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">-- Choose from Customer Directory --</option>
                  {customers.map((c) => {
                    const name = c.name || c.business_name || "Customer";
                    const meta = [
                      c.phone ? `Ph: ${c.phone}` : null,
                      c.gstin ? `GST: ${c.gstin}` : null,
                      `#${c.id}`,
                    ]
                      .filter(Boolean)
                      .join(" • ");
                    return (
                      <option key={c.id} value={c.id}>
                        {name} ({meta})
                      </option>
                    );
                  })}
                </select>
              </div>

              {customerId && (
                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
                    <span className="text-slate-400 block">Name:</span>
                    <p className="font-semibold text-slate-800 truncate">{customerName || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
                    <span className="text-slate-400 block">Phone:</span>
                    <p className="font-semibold text-slate-800">{customerPhone || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
                    <span className="text-slate-400 block">GSTIN:</span>
                    <p className="font-semibold text-slate-800">{customerGstin || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
                    <span className="text-slate-400 block">State (POS):</span>
                    <p className="font-semibold text-slate-800">{customerState || "—"}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Customer / Buyer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Walk-in Customer or Rajesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="10-digit mobile"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Customer GSTIN
                </label>
                <input
                  type="text"
                  placeholder="15-character GSTIN"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm uppercase text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Place of Supply (State)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Odisha"
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* MULTI-ITEM PRODUCTS & SERVICES SECTION */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Package size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Line Items (Goods & Services)</h3>
                <p className="text-xs text-slate-500">
                  Select items from inventory stock or enter custom products/services.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition shadow-xs"
            >
              <Plus size={14} />
              Add Another Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => {
              const calc = lineCalculations[idx] || { taxable: 0, lineTax: 0, lineTot: 0 };
              const isGoods = item.item_type !== "service";

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-slate-300"
                >
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Inventory Autofetch Selector */}
                    <div className="col-span-12 sm:col-span-4">
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Select from Stock
                      </label>
                      <select
                        id={`sale-stock-select-${idx}`}
                        value={item.product_id || ""}
                        onChange={(e) => handleSelectStockItem(idx, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
                      >
                        <option value="">-- Choose Stock Item or Type Below --</option>
                        {stockItems.map((s) => {
                          const code = s.item_code || s.code || s.sku || `#${s.id}`;
                          const cat = s.category ? ` • ${s.category}` : "";
                          const stockQty = s.quantity !== undefined ? s.quantity : 0;
                          return (
                            <option key={s.id} value={s.id}>
                              {s.product_name} [{code}] — ₹{s.selling_price || s.price || 0} (Stock: {stockQty} {s.unit || "pcs"}{cat})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Product Name */}
                    <div className="col-span-12 sm:col-span-5">
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Item / Service Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Copper Wire, Consulting"
                        value={item.product_name}
                        onChange={(e) => handleItemFieldChange(idx, "product_name", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Item Type (Goods vs Service) */}
                    <div className="col-span-12 sm:col-span-3">
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Type
                      </label>
                      <select
                        value={item.item_type}
                        onChange={(e) => handleItemFieldChange(idx, "item_type", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500"
                      >
                        <option value="goods">Goods</option>
                        <option value="service">Service</option>
                      </select>
                    </div>

                    {/* Quantity & Stock Check */}
                    <div className="col-span-4 sm:col-span-2">
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Qty *
                        </label>
                        {isGoods && item.available_stock !== null && (
                          <span
                            className={`text-[10px] font-semibold ${
                              item.available_stock < Number(item.quantity)
                                ? "text-red-600 font-bold"
                                : "text-emerald-700"
                            }`}
                          >
                            Stk: {item.available_stock}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemFieldChange(idx, "quantity", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Unit
                      </label>
                      <input
                        type="text"
                        placeholder="pcs, kg"
                        value={item.unit}
                        onChange={(e) => handleItemFieldChange(idx, "unit", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Rate (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={item.unit_price}
                        onChange={(e) => handleItemFieldChange(idx, "unit_price", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Discount */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Disc (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={item.discount}
                        onChange={(e) => handleItemFieldChange(idx, "discount", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* GST Rate */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        GST %
                      </label>
                      <select
                        value={item.tax_rate}
                        onChange={(e) => handleItemFieldChange(idx, "tax_rate", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    {/* Line Total & Remove Action */}
                    <div className="col-span-4 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400">Total</span>
                        <span className="text-xs font-bold text-slate-900">
                          ₹{calc.lineTot.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          title="Remove item"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
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

          {/* GST Mode & Tax Breakdown */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100/80 p-4 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-700 block sm:inline">GST Mode:</span>
                <span className="text-slate-500 text-[11px] sm:ml-2">
                  {gstMode === "cgst_sgst" ? "CGST + SGST (Equal Split)" : "IGST (Single Application)"}
                </span>
              </div>

              {/* 2-Choice Segmented Toggle */}
              <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setGstMode("cgst_sgst")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    gstMode === "cgst_sgst"
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  CGST + SGST
                </button>
                <button
                  type="button"
                  onClick={() => setGstMode("igst")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    gstMode === "igst"
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  IGST
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200/80 pt-3 flex flex-col items-end gap-1.5 text-slate-600">
              <div className="flex gap-4">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {gstMode === "igst" ? (
                <div className="flex gap-4">
                  <span>IGST:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <div className="flex gap-4">
                  <span>CGST (₹{(totalTax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) + SGST (₹{(totalTax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}):</span>
                  <span className="font-semibold text-slate-900">
                    ₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex gap-4 text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
                <span>Total Sale Value:</span>
                <span className="text-brand-700 text-base">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT DETAILS SECTION */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CreditCard size={18} />
              </div>
              <h3 className="font-semibold text-slate-900">Payment & Settlement</h3>
            </div>
            <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-bold ${paymentStatusBadge.color}`}>
              {paymentStatusBadge.text}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Payment Mode */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="cash">Cash in Hand</option>
                <option value="online">Online / UPI</option>
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="cheque">Cheque</option>
                <option value="credit">Credit (Khata Dues)</option>
              </select>
            </div>

            {/* Bank Account (if non-cash) */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Deposit Bank Account
              </label>
              <select
                value={bankId}
                disabled={paymentMode === "cash" || paymentMode === "credit"}
                onChange={(e) => setBankId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Choose Account (Optional) --</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bank_name || b.account_holder_name} ({b.account_number ? `...${String(b.account_number).slice(-4)}` : "A/C"})
                  </option>
                ))}
              </select>
            </div>

            {/* Paid Amount */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Amount Received (₹)
                </label>
                {dueAmount > 0 && (
                  <span className="text-xs font-bold text-amber-700">Due: ₹{dueAmount}</span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={paidAmount}
                onChange={(e) => {
                  setIsPaidAmountCustom(true);
                  setPaidAmount(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </div>

        {/* TRANSACTION METADATA */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Sale Date
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Sale Time
            </label>
            <input
              type="time"
              value={saleTime}
              onChange={(e) => setSaleTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Notes / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Counter slip, order reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        {/* INVOICE GENERATION CHECKBOX */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={createInvoice}
              onChange={(e) => setCreateInvoice(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="font-semibold text-slate-900">Generate Official GST Tax Invoice</span>
              <p className="text-xs text-slate-500">
                Generate and link an official tax invoice with this sale.
              </p>
            </div>
          </label>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Recording..." : createInvoice ? "Record & Issue Invoice" : "Record Sale"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
