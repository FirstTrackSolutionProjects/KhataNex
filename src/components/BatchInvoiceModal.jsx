import React, { useState } from "react";
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import Modal from "./Modal";
import api from "../lib/api";

const todayString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

export default function BatchInvoiceModal({ isOpen, onClose, selectedSales = [], onSuccess }) {
  const [gstRate, setGstRate] = useState("18");
  const [invoiceDate, setInvoiceDate] = useState(todayString());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = selectedSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const customerName = selectedSales[0]?.customer_name || "Customer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSales.length) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post("/api/sales/generate-invoice", {
        sale_ids: selectedSales.map((s) => s.id),
        gst_rate: Number(gstRate) || 0,
        invoice_date: invoiceDate,
        notes: notes.trim() || undefined,
      });

      if (res?.success) {
        if (onSuccess) onSuccess(res.invoice);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to generate invoice. Please verify customer consistency.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Tax Invoice from Sales" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Selected Sales
            </span>
            <span className="rounded-full bg-emerald-200/70 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
              {selectedSales.length} item{selectedSales.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900">Customer: {customerName}</p>
          <div className="mt-3 flex items-center justify-between border-t border-emerald-200/60 pt-2 text-sm">
            <span className="text-slate-600">Total Taxable Subtotal:</span>
            <span className="font-bold text-emerald-800">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              GST Rate *
            </label>
            <select
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="0">0% (Nil / Exempt)</option>
              <option value="5">5% GST</option>
              <option value="12">12% GST</option>
              <option value="18">18% GST (Standard)</option>
              <option value="28">28% GST</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Invoice Date *
            </label>
            <input
              type="date"
              required
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Invoice Remarks / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Consolidated monthly billing"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Generating this invoice will not deduct inventory a second time.</span>
        </div>

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
            {submitting ? "Generating..." : "Generate Official Invoice"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
