import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
  Menu,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import api from "../lib/api";

// Ledger convention for a single customer's statement: a sale increases
// what they owe (shown as a debit against their account), and a due
// payment they make reduces it (shown as a credit).
const CustomerDetails = () => {
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get(`/api/customers/${id}`);
        setCustomer(data.customer);

        const sales = (data.sales_history || []).map((s) => ({
          id: `sale-${s.id}`,
          date: s.sale_date,
          description: `Sale${s.item_name ? ` - ${s.item_name}` : ""} (${s.payment_type})`,
          type: "debit",
          amount: Number(s.amount || 0),
        }));
        const payments = (data.due_payments_history || []).map((p) => ({
          id: `payment-${p.id}`,
          date: p.payment_date,
          description: p.purpose || "Payment received",
          type: "credit",
          amount: Number(p.amount || 0),
        }));

        setTransactions(
          [...sales, ...payments].sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      } catch (err) {
        setError(err.message || "Could not load customer.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

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
            <p className="text-center text-sm text-slate-400">Loading customer...</p>
          ) : !customer ? (
            <p className="text-center text-sm text-slate-400">Customer not found.</p>
          ) : (
            <>
              {/* Customer Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                      {(customer.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold">
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

                </div>

              </div>

              {/* Stats */}
              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs text-slate-500">
                    Outstanding
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    ₹{Number(customer.total_due || 0).toLocaleString("en-IN")}
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

              {/* Ledger */}
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
                  <p className="p-5 text-sm text-slate-400">No transactions yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">

                    {transactions.map((transaction) => {

                      const isCredit = transaction.type === "credit";

                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-4 p-5"
                        >

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              isCredit
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
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
                              {new Date(transaction.date).toLocaleDateString("en-IN")}
                            </p>
                          </div>

                          <p
                            className={`text-sm font-bold ${
                              isCredit
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {isCredit ? "+" : "-"}₹
                            {transaction.amount.toLocaleString("en-IN")}
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
    </div>
  );
};

export default CustomerDetails;
