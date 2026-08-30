import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Menu,
  Search,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";

const Khata = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState("credit");
  const [form, setForm] = useState({ name: "", description: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/khata");
      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message || "Could not load khata entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filtered = entries.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCredit = entries.filter((e) => e.type === "credit").reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalDebit = entries.filter((e) => e.type === "debit").reduce((s, e) => s + Number(e.amount || 0), 0);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      if (entryType === "credit") {
        // A credit entry is recorded as a due sale for the named customer.
        await api.post("/api/collections", {
          amount: form.amount,
          payment_type: "due",
          customer_name: form.name,
          item_name: form.description,
        });
      } else {
        // A debit entry is money the business paid out.
        await api.post("/api/payments", {
          payment_category: "paid_by_business",
          party_name: form.name,
          purpose: form.description,
          amount: form.amount,
        });
      }
      setShowModal(false);
      setForm({ name: "", description: "", amount: "" });
      loadEntries();
    } catch (err) {
      setSaveError(err.message || "Could not save entry.");
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
                Digital Khata
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage credit and debit entries
              </p>
            </div>

          </div>

          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)}>
            New Entry
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Credit
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "..." : `₹${totalCredit.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Debit
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {loading ? "..." : `₹${totalDebit.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Net Balance
              </p>

              <p className="mt-2 text-2xl font-bold">
                {loading ? "..." : `₹${(totalCredit - totalDebit).toLocaleString("en-IN")}`}
              </p>
            </div>

          </div>

          {/* Search */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* Entries */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <BookOpen size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Ledger Entries
                  </h2>

                  <p className="text-xs text-slate-400">
                    Recent khata transactions
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="p-5 text-sm text-slate-400">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">No entries yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">

                {filtered.map((item) => {

                  const credit = item.type === "credit";

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center gap-4 p-5"
                    >

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          credit
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {credit ? (
                          <ArrowDownLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.description} · {new Date(item.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <p
                        className={`text-sm font-bold ${
                          credit
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {credit ? "+" : "-"}₹
                        {Number(item.amount).toLocaleString("en-IN")}
                      </p>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </main>
      </div>

      {/* NEW ENTRY MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Khata Entry">
        <form onSubmit={handleAddEntry} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntryType("credit")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                entryType === "credit"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              Credit Entry
            </button>
            <button
              type="button"
              onClick={() => setEntryType("debit")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                entryType === "debit"
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              Debit Entry
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {entryType === "credit" ? "Customer Name" : "Paid To"}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={entryType === "credit" ? "Customer name" : "Vendor / staff name"}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this for?"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Entry"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Khata;
