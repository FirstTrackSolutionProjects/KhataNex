import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Menu,
  Trash2,
  Mail,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api, { fileUrl } from "../lib/api";

const DOC_TYPE_LABEL = {
  invoice: "Invoice",
  quotation: "Quotation",
  merchant_bill: "Merchant Bill",
};

const EMAIL_STYLE = {
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-amber-100 text-amber-700",
  not_sent: "bg-slate-100 text-slate-600",
};

const emptyItem = () => ({ product_name: "", hsn_code: "", quantity: "", price: "" });

const Invoices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [documents, setDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState("invoice");
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [docsRes, custRes] = await Promise.all([
        api.get("/api/documents"),
        api.get("/api/customers"),
      ]);
      setDocuments(docsRes.documents || []);
      setCustomers(custRes.customers || []);
    } catch (err) {
      setError(err.message || "Could not load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = documents.filter((d) => {
    const matchesType = typeFilter === "all" || d.doc_type === typeFilter;
    const matchesSearch =
      (d.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.invoice_number || "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalAmount = documents.reduce((sum, d) => sum + Number(d.total_amount || 0), 0);
  const sentCount = documents.filter((d) => d.email_status === "sent").length;

  const updateItem = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const addItemRow = () => setItems([...items, emptyItem()]);
  const removeItemRow = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const cleanItems = items
        .filter((it) => it.product_name || it.price || it.quantity)
        .map((it) => ({
          product_name: it.product_name,
          hsn_code: it.hsn_code,
          quantity: it.quantity,
          price: it.price,
        }));

      await api.post("/api/documents", {
        doc_type: docType,
        customer_id: customerId || undefined,
        items: cleanItems,
      });

      setShowModal(false);
      setDocType("invoice");
      setCustomerId("");
      setItems([emptyItem()]);
      loadData();
    } catch (err) {
      setSaveError(err.message || "Could not create document.");
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

        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold">
                Invoices
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Invoices, quotations & merchant bills
              </p>
            </div>

          </div>

          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)}>
            Create Document
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
              <p className="text-xs text-slate-500">Total Documents</p>
              <p className="mt-2 text-2xl font-bold">{loading ? "..." : documents.length}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Emailed Successfully</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{loading ? "..." : sentCount}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Total Value</p>
              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : `₹${totalAmount.toLocaleString("en-IN")}`}
              </p>
            </div>

          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer or number..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All types</option>
              <option value="invoice">Invoice</option>
              <option value="quotation">Quotation</option>
              <option value="merchant_bill">Merchant Bill</option>
            </select>

          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">

            <table className="w-full min-w-[750px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Document</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Type</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Customer</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Date</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Amount</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Email</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-sm text-slate-400">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-sm text-slate-400">No documents yet.</td>
                  </tr>
                ) : (
                  filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                            <FileText size={17} />
                          </div>
                          <span className="text-sm font-semibold">{doc.invoice_number}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {DOC_TYPE_LABEL[doc.doc_type] || doc.doc_type}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {doc.customer_name || "Walk-in Customer"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(doc.invoice_date).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold">
                        ₹{Number(doc.total_amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            EMAIL_STYLE[doc.email_status] || EMAIL_STYLE.not_sent
                          }`}
                        >
                          <Mail size={11} />
                          {doc.email_status === "sent" ? "Sent" : doc.email_status === "failed" ? "Failed" : "Not sent"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {doc.pdf_path ? (
                          <a
                            href={fileUrl(doc.pdf_path)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            title="Download PDF"
                          >
                            <Download size={17} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </main>
      </div>

      {/* CREATE DOCUMENT MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Document">
        <form onSubmit={handleCreateDocument} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="invoice">Invoice</option>
                <option value="quotation">Quotation</option>
                <option value="merchant_bill">Merchant Bill</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Items</label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                + Add item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={item.product_name}
                    onChange={(e) => updateItem(idx, "product_name", e.target.value)}
                    placeholder="Item"
                    className="col-span-4 rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={item.hsn_code}
                    onChange={(e) => updateItem(idx, "hsn_code", e.target.value)}
                    placeholder="HSN"
                    className="col-span-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    placeholder="Qty"
                    className="col-span-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(idx, "price", e.target.value)}
                    placeholder="Price"
                    className="col-span-3 rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="col-span-1 flex items-center justify-center text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Items are optional — you can create a document with none and add details later.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create & Download"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;
