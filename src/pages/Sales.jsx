import React, { useEffect, useState, useMemo } from "react";
import {
  BadgePercent,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Modal from "../components/Modal";
import AddSaleModal from "../components/AddSaleModal";
import BatchInvoiceModal from "../components/BatchInvoiceModal";
import api, { fetchSecureFile } from "../lib/api";

const money = (val) =>
  `₹${Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PAYMENT_MODE_LABELS = {
  cash: { label: "Cash", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  online: { label: "Online / UPI", color: "bg-blue-50 text-blue-700 border-blue-200" },
  bank_transfer: { label: "Bank Transfer", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  cheque: { label: "Cheque", color: "bg-purple-50 text-purple-700 border-purple-200" },
  credit: { label: "Credit (Khata)", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [metrics, setMetrics] = useState({
    total_sales_amount: 0,
    total_sales_count: 0,
    invoiced_sales_count: 0,
    uninvoiced_sales_count: 0,
    uninvoiced_sales_amount: 0,
    invoiced_sales_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [invoiceStatus, setInvoiceStatus] = useState("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedSaleForView, setSelectedSaleForView] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Multi-select for batch invoicing
  const [selectedSaleIds, setSelectedSaleIds] = useState(new Set());

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set("search", search.trim());
      if (period !== "all") queryParams.set("period", period);
      if (paymentMode !== "all") queryParams.set("payment_mode", paymentMode);
      if (invoiceStatus !== "all") queryParams.set("invoice_status", invoiceStatus);

      const res = await api.get(`/api/sales?${queryParams.toString()}`);
      if (res?.success) {
        setSales(res.sales || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      setError(err.message || "Failed to load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    setSelectedSaleIds(new Set());
  }, [period, paymentMode, invoiceStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Multi-select handlers
  const handleToggleSelect = (id) => {
    setSelectedSaleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllUninvoiced = () => {
    const uninvoiced = sales.filter((s) => !s.invoice_id);
    if (selectedSaleIds.size === uninvoiced.length) {
      setSelectedSaleIds(new Set());
    } else {
      setSelectedSaleIds(new Set(uninvoiced.map((s) => s.id)));
    }
  };

  const selectedSalesList = useMemo(() => {
    return sales.filter((s) => selectedSaleIds.has(s.id));
  }, [sales, selectedSaleIds]);

  // Download Invoice PDF
  const handleDownloadInvoice = async (pdfPath, invNum) => {
    if (!pdfPath) return;
    try {
      await fetchSecureFile(pdfPath, `${invNum || "Tax-Invoice"}.pdf`);
    } catch (err) {
      alert("Could not download invoice: " + err.message);
    }
  };

  // Delete Sale handler
  const handleDeleteSale = async () => {
    if (!saleToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await api.delete(`/api/sales/${saleToDelete.id}`);
      if (res?.success) {
        setSaleToDelete(null);
        fetchSales();
      }
    } catch (err) {
      setDeleteError(err.message || "Failed to delete sale.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* PAGE HEADER */}
      <PageHeader
        title="Sales Management"
        subtitle="Record business sales, manage transactions, and seamlessly issue official GST tax invoices"
        icon={BadgePercent}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Record Sale
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Sales
          </span>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {money(metrics.total_sales_amount)}
          </p>
          <span className="mt-1 block text-xs text-slate-400">
            {metrics.total_sales_count} total transaction{metrics.total_sales_count === 1 ? "" : "s"}
          </span>
        </div>

        {/* Invoiced Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Invoiced Sales
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {money(metrics.invoiced_sales_amount)}
          </p>
          <span className="mt-1 block text-xs text-emerald-600 font-medium">
            {metrics.invoiced_sales_count} invoice{metrics.invoiced_sales_count === 1 ? "" : "s"} generated
          </span>
        </div>

        {/* Un-invoiced Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Un-invoiced Sales
          </span>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {money(metrics.uninvoiced_sales_amount)}
          </p>
          <span className="mt-1 block text-xs text-amber-600 font-medium">
            {metrics.uninvoiced_sales_count} pending invoice issuance
          </span>
        </div>

        {/* Quick Batch Invoicing Info */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            GST Compliance
          </span>
          <p className="mt-2 text-sm font-semibold text-emerald-950">
            Ready for Tax Invoicing
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Select multiple un-invoiced sales below to generate a single consolidated invoice.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search customer, phone, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Period Filter */}
          <div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">Last 7 Days</option>
              <option value="this_month">Last 30 Days</option>
              <option value="this_year">Past Year</option>
            </select>
          </div>

          {/* Payment Mode */}
          <div>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All Payment Modes</option>
              <option value="cash">Cash</option>
              <option value="online">Online / UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="credit">Credit (Khata)</option>
            </select>
          </div>

          {/* Invoice Status */}
          <div>
            <select
              value={invoiceStatus}
              onChange={(e) => setInvoiceStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All Invoicing Status</option>
              <option value="uninvoiced">Un-invoiced Only</option>
              <option value="invoiced">Invoiced Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* SALES LIST / TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <span className="text-sm font-medium">Loading sales records...</span>
          </div>
        ) : sales.length === 0 ? (
          <div className="py-20 text-center">
            <BadgePercent size={44} className="mx-auto text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-800">No Sales Found</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Record your first sale to start tracking customer revenue, inventory movements, and generating GST invoices.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus size={16} />
              Record Sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 pl-4 pr-2 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAllUninvoiced}
                      title="Select all un-invoiced"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {selectedSaleIds.size > 0 ? (
                        <CheckSquare size={16} className="text-emerald-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Product & Category</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5 text-right">Qty & Rate</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5 text-center">Tax Invoice</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => {
                  const isSelected = selectedSaleIds.has(sale.id);
                  const isUninvoiced = !sale.invoice_id;
                  const modeBadge =
                    PAYMENT_MODE_LABELS[sale.payment_mode] || PAYMENT_MODE_LABELS.cash;

                  return (
                    <tr
                      key={sale.id}
                      className={`transition hover:bg-slate-50/80 ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3.5 pl-4 pr-2">
                        {isUninvoiced ? (
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(sale.id)}
                            className="text-slate-400 hover:text-emerald-600"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-emerald-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        ) : (
                          <span title="Already invoiced" className="text-slate-300">
                            •
                          </span>
                        )}
                      </td>

                      {/* Product & Category */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {sale.product_name}
                        </span>
                        {sale.category && (
                          <span className="text-xs text-slate-400">{sale.category}</span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800 block">
                          {sale.customer_name}
                        </span>
                        {sale.customer_phone && (
                          <span className="text-xs text-slate-400">{sale.customer_phone}</span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{formatDate(sale.sale_date)}</div>
                        <div className="text-slate-400">{sale.sale_time || "—"}</div>
                      </td>

                      {/* Qty & Unit Rate */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {sale.quantity} {sale.unit || "pcs"}
                        </span>
                        <div className="text-xs text-slate-400">@ {money(sale.unit_price)}</div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-900">{money(sale.amount)}</span>
                        {Number(sale.discount) > 0 && (
                          <div className="text-xs text-emerald-600">
                            -{money(sale.discount)} disc
                          </div>
                        )}
                      </td>

                      {/* Payment Mode */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${modeBadge.color}`}
                        >
                          {modeBadge.label}
                        </span>
                      </td>

                      {/* Tax Invoice Badge & Button */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {sale.invoice_id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="rounded-lg bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                              {sale.invoice_number || `#INV-${sale.invoice_id}`}
                            </span>
                            {sale.invoice_pdf_path && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadInvoice(sale.invoice_pdf_path, sale.invoice_number)
                                }
                                title="Download PDF"
                                className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition"
                              >
                                <Download size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">
                            Un-invoiced
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedSaleForView(sale)}
                            title="View Details"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSaleToDelete(sale)}
                            title="Delete Sale"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
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
        )}
      </div>

      {/* FLOATING BATCH INVOICE BAR (Phase 4) */}
      {selectedSaleIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-2xl border border-emerald-300 bg-emerald-950 px-6 py-3.5 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold">
              {selectedSaleIds.size}
            </span>
            <span className="text-sm font-medium">
              sale{selectedSaleIds.size > 1 ? "s" : ""} selected (
              {money(selectedSalesList.reduce((sum, s) => sum + Number(s.amount || 0), 0))})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSaleIds(new Set())}
              className="rounded-xl px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 shadow-sm"
            >
              <FileText size={15} />
              Generate Tax Invoice
            </button>
          </div>
        </div>
      )}
      </div>

      {/* ADD SALE MODAL */}
      <AddSaleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchSales();
        }}
      />

      {/* BATCH INVOICE MODAL */}
      <BatchInvoiceModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedSales={selectedSalesList}
        onSuccess={(inv) => {
          fetchSales();
          setSelectedSaleIds(new Set());
          if (inv?.pdfPath) {
            handleDownloadInvoice(inv.pdfPath, inv.invoiceNumber);
          }
        }}
      />

      {/* VIEW SALE DETAILS MODAL */}
      {selectedSaleForView && (
        <Modal
          isOpen={Boolean(selectedSaleForView)}
          onClose={() => setSelectedSaleForView(null)}
          title={`Sale Details #${selectedSaleForView.id}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <span className="text-xs uppercase font-semibold text-slate-400">Customer</span>
              <p className="text-base font-bold text-slate-900 mt-1">
                {selectedSaleForView.customer_name}
              </p>
              {selectedSaleForView.customer_phone && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Phone: {selectedSaleForView.customer_phone}
                </p>
              )}
              {selectedSaleForView.customer_gstin && (
                <p className="text-xs text-slate-500">
                  GSTIN: {selectedSaleForView.customer_gstin}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-400">Product Name:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {selectedSaleForView.product_name}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-400">Category:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {selectedSaleForView.category || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-400">Quantity & Rate:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {selectedSaleForView.quantity} {selectedSaleForView.unit || "pcs"} @ {money(selectedSaleForView.unit_price)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-400">Discount:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {money(selectedSaleForView.discount)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-400">Date & Time:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {formatDate(selectedSaleForView.sale_date)} {selectedSaleForView.sale_time}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <span className="text-slate-400">Payment Mode:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5 capitalize">
                  {selectedSaleForView.payment_mode}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <span className="font-semibold text-emerald-900">Total Net Amount:</span>
              <span className="text-xl font-bold text-emerald-700">
                {money(selectedSaleForView.amount)}
              </span>
            </div>

            {selectedSaleForView.notes && (
              <div className="rounded-xl border border-slate-200 p-3 text-xs">
                <span className="text-slate-400">Notes / Remarks:</span>
                <p className="text-slate-700 mt-1">{selectedSaleForView.notes}</p>
              </div>
            )}

            {selectedSaleForView.invoice_id && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                <div>
                  <span className="text-slate-400">Linked Invoice:</span>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    {selectedSaleForView.invoice_number || `#INV-${selectedSaleForView.invoice_id}`}
                  </p>
                </div>
                {selectedSaleForView.invoice_pdf_path && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadInvoice(
                        selectedSaleForView.invoice_pdf_path,
                        selectedSaleForView.invoice_number
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSaleForView(null)}
                className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {saleToDelete && (
        <Modal
          isOpen={Boolean(saleToDelete)}
          onClose={() => {
            setSaleToDelete(null);
            setDeleteError(null);
          }}
          title="Delete Sale Record"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-sm text-slate-700">
            {deleteError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}
            <p>
              Are you sure you want to delete this sale of{" "}
              <strong className="text-slate-900">{saleToDelete.product_name}</strong> to{" "}
              <strong className="text-slate-900">{saleToDelete.customer_name}</strong>?
            </p>
            {saleToDelete.product_id && (
              <p className="text-xs text-emerald-700 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                Inventory will automatically be restored by {saleToDelete.quantity}{" "}
                {saleToDelete.unit || "pcs"}.
              </p>
            )}
            {saleToDelete.invoice_id && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3 border border-amber-200">
                Warning: This sale is linked to Invoice {saleToDelete.invoice_number || ""}. If the invoice is issued, deletion will be rejected.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSaleToDelete(null);
                  setDeleteError(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteSale}
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
