import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpFromLine,
  TrendingUp,
  Menu,
  Search,
  Plus,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";

const CATEGORY_LABEL = {
  due_received: "Due Received",
  paid_by_business: "Paid Out",
  advance_from_investor: "Investor Advance",
};

const CATEGORY_STYLE = {
  due_received: "bg-emerald-100 text-emerald-700",
  paid_by_business: "bg-red-100 text-red-700",
  advance_from_investor: "bg-blue-100 text-blue-700",
};

const Payments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    payment_category: "due_received",
    party_name: "",
    purpose: "",
    amount: "",
    payment_mode: "cash",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/payments");
      setPayments(data.payments || []);
    } catch (err) {
      setError(err.message || "Could not load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = payments.filter((p) =>
    (p.customer_name || p.party_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const sumByCategory = (cat) =>
    payments.filter((p) => p.payment_category === cat).reduce((s, p) => s + Number(p.amount || 0), 0);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      await api.post("/api/payments", form);
      setShowModal(false);
      setForm({ payment_category: "due_received", party_name: "", purpose: "", amount: "", payment_mode: "cash" });
      loadPayments();
    } catch (err) {
      setSaveError(err.message || "Could not save payment.");
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
                Payments
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Track your business payments
              </p>
            </div>
          </div>

          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)}>
            Add Payment
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
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Due Received</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {loading ? "..." : `₹${sumByCategory("due_received").toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-3 text-red-600">
                  <ArrowUpFromLine size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Paid Out</p>
                  <p className="text-xl font-bold text-red-600">
                    {loading ? "..." : `₹${sumByCategory("paid_by_business").toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <TrendingUp size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Investor Advance</p>
                  <p className="text-xl font-bold text-blue-600">
                    {loading ? "..." : `₹${sumByCategory("advance_from_investor").toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payment..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">

            <table className="w-full min-w-[700px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">Party</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">Amount</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">Date</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">Mode</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">Category</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">

                      <td className="px-5 py-4 text-sm font-semibold">
                        {payment.customer_name || payment.party_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-emerald-600">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(payment.payment_date).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-sm capitalize text-slate-500">
                        {payment.payment_mode}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            CATEGORY_STYLE[payment.payment_category] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {CATEGORY_LABEL[payment.payment_category] || payment.payment_category}
                        </span>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </main>
      </div>

      {/* ADD PAYMENT MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Payment">
        <form onSubmit={handleAddPayment} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={form.payment_category}
              onChange={(e) => setForm({ ...form, payment_category: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="due_received">Due Received (customer paid)</option>
              <option value="paid_by_business">Paid Out (business pays someone)</option>
              <option value="advance_from_investor">Investor Advance</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Party Name</label>
            <input
              type="text"
              value={form.party_name}
              onChange={(e) => setForm({ ...form, party_name: e.target.value })}
              placeholder="Customer / vendor / investor name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Purpose</label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="What is this payment for?"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mode</label>
              <select
                value={form.payment_mode}
                onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="cash">Cash</option>
                <option value="online">Online / UPI</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Payment"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
