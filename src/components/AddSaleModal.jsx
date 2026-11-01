import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Plus,
  Search,
  Package,
  User,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import api from "../lib/api";

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

export default function AddSaleModal({ isOpen, onClose, onSuccess }) {
  const [customerMode, setCustomerMode] = useState("existing"); // 'existing' | 'manual'
  const [customers, setCustomers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerState, setCustomerState] = useState("");

  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [unitPrice, setUnitPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [saleDate, setSaleDate] = useState(todayString());
  const [saleTime, setSaleTime] = useState(currentTimeString());
  const [notes, setNotes] = useState("");

  const [createInvoice, setCreateInvoice] = useState(false);
  const [gstRate, setGstRate] = useState("18");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customers and stock items on open
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }
    const fetchData = async () => {
      setLoadingInitial(true);
      setError(null);
      try {
        const [custRes, stockRes] = await Promise.allSettled([
          api.get("/api/customers"),
          api.get("/api/stock"),
        ]);
        if (custRes.status === "fulfilled" && custRes.value?.customers) {
          setCustomers(custRes.value.customers);
        }
        if (stockRes.status === "fulfilled" && stockRes.value?.stock) {
          setStockItems(stockRes.value.stock);
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
    setProductId("");
    setProductName("");
    setCategory("");
    setQuantity("1");
    setUnit("pcs");
    setUnitPrice("");
    setDiscount("0");
    setPaymentMode("cash");
    setSaleDate(todayString());
    setSaleTime(currentTimeString());
    setNotes("");
    setCreateInvoice(false);
    setGstRate("18");
    setError(null);
  };

  // Handle existing customer selection
  const handleSelectCustomer = (id) => {
    setCustomerId(id);
    const match = customers.find((c) => String(c.id) === String(id));
    if (match) {
      setCustomerName(match.name || match.business_name || "");
      setCustomerPhone(match.phone || "");
      setCustomerEmail(match.email || "");
      setCustomerAddress(match.address_line1 || match.billing_city || match.address || "");
      setCustomerGstin(match.gstin || "");
      setCustomerState(match.billing_state || match.state || "");
    }
  };

  // Handle inventory product selection
  const handleSelectProduct = (id) => {
    setProductId(id);
    const match = stockItems.find((s) => String(s.id) === String(id));
    if (match) {
      setProductName(match.product_name || "");
      setCategory(match.category || "");
      if (match.price) setUnitPrice(String(match.price));
      if (match.unit) setUnit(match.unit);
    }
  };

  // Selected stock item info
  const selectedStockItem = useMemo(() => {
    return stockItems.find((s) => String(s.id) === String(productId));
  }, [stockItems, productId]);

  const availableStock = selectedStockItem ? Number(selectedStockItem.quantity || 0) : null;

  // Calculated Total Amount
  const numQty = Math.max(0, Number(quantity) || 0);
  const numPrice = Math.max(0, Number(unitPrice) || 0);
  const numDisc = Math.max(0, Number(discount) || 0);
  const calculatedTotal = Math.max(0, Math.round((numQty * numPrice - numDisc) * 100) / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (customerMode === "existing" && !customerId) {
      setError("Please select a customer from the list or switch to manual customer entry.");
      return;
    }
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!productName.trim()) {
      setError("Product or service name is required.");
      return;
    }
    if (numQty <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    if (availableStock !== null && numQty > availableStock) {
      setError(`Cannot sell ${numQty} items. Only ${availableStock} in stock.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id: customerMode === "existing" && customerId ? Number(customerId) : null,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        customer_email: customerEmail.trim() || null,
        customer_address: customerAddress.trim() || null,
        customer_gstin: customerGstin.trim() || null,
        billing_state: customerState.trim() || null,
        product_id: productId ? Number(productId) : null,
        product_name: productName.trim(),
        category: category.trim() || null,
        quantity: numQty,
        unit: unit.trim() || "pcs",
        unit_price: numPrice,
        discount: numDisc,
        payment_mode: paymentMode,
        sale_date: saleDate,
        sale_time: saleTime,
        notes: notes.trim() || null,
        create_invoice: createInvoice,
        gst_rate: createInvoice ? Number(gstRate) || 0 : 0,
      };

      const res = await api.post("/api/sales", payload);
      if (res?.success) {
        if (onSuccess) onSuccess(res.sale, res.invoice);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to record sale. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record New Sale" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <User size={18} />
              </div>
              <h3 className="font-semibold text-slate-900">Customer Details</h3>
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
                }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  customerMode === "manual"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manual Entry
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
                  value={customerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">-- Choose a customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.business_name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {customerId && (
                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
                    <span className="text-slate-400">Phone:</span>
                    <p className="font-semibold text-slate-800">{customerPhone || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
                    <span className="text-slate-400">GSTIN:</span>
                    <p className="font-semibold text-slate-800">{customerGstin || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
                    <span className="text-slate-400">State:</span>
                    <p className="font-semibold text-slate-800">{customerState || "—"}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Traders"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm uppercase text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  State (Place of Supply)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Odisha"
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* PRODUCT & PRICING SECTION */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Package size={18} />
              </div>
              <h3 className="font-semibold text-slate-900">Product & Pricing</h3>
            </div>
            {stockItems.length > 0 && (
              <span className="text-xs text-slate-500">
                {stockItems.length} products available in Inventory
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Stock selector */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Select from Inventory (Optional)
              </label>
              <select
                value={productId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">-- Manual product or choose from stock --</option>
                {stockItems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.product_name} — ₹{s.price} (Stock: {s.quantity} {s.unit || "pcs"})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Product / Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="Product or service name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Electronics, Hardware"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Quantity */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Quantity *
                </label>
                {availableStock !== null && (
                  <span
                    className={`text-xs font-medium ${
                      availableStock < numQty ? "text-red-600 font-bold" : "text-emerald-700"
                    }`}
                  >
                    Avail: {availableStock}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Unit
              </label>
              <input
                type="text"
                placeholder="pcs, kg, mtr, box"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Total Amount Callout Banner */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <span className="text-sm font-semibold text-emerald-900">Total Sale Amount:</span>
            <span className="text-xl font-bold text-emerald-700">₹{calculatedTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* TRANSACTION METADATA */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Payment Mode */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="cash">Cash</option>
              <option value="online">Online / UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="credit">Credit (Khata)</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Sale Date
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Notes / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Invoice reference or order details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* INVOICE GENERATION OPTION */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={createInvoice}
              onChange={(e) => setCreateInvoice(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-slate-900">Generate Official Tax Invoice</span>
              <p className="text-xs text-slate-500">
                Immediately create an official KhataNex PDF invoice (#INV-YYYY-XXXXX) that links with your Invoices page.
              </p>
            </div>
          </label>

          {createInvoice && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  GST Rate
                </label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="0">0% (Nil Rated / Exempt)</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST (Standard)</option>
                  <option value="28">28% GST</option>
                </select>
              </div>
              <div className="flex items-center text-xs text-slate-500 pt-5">
                <CheckCircle2 size={16} className="text-emerald-600 mr-2 shrink-0" />
                <span>Single-decrement protected: inventory will only be deducted once.</span>
              </div>
            </div>
          )}
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
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Recording..." : createInvoice ? "Record & Issue Invoice" : "Record Sale"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
