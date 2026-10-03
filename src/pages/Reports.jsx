import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Menu,
  CreditCard,
  Calendar,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import api from "../lib/api";

const PERIOD_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
  { id: "this_year", label: "This Year" },
  { id: "last_6_months", label: "Last 6 Months" },
];

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("last_6_months");
  const [profitLoss, setProfitLoss] = useState(null);
  const [trend, setTrend] = useState([]);
  const [khataEntries, setKhataEntries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState(6);

  const loadReports = async (m) => {
    setLoading(true);
    setError("");
    try {
      const [plRes, trendRes, khataRes, custRes, payRes, invRes] = await Promise.all([
        api.get("/api/reports/profit-loss").catch(() => null),
        api.get(`/api/reports/monthly-trend?months=${m}`).catch(() => ({ trend: [] })),
        api.get("/api/khata").catch(() => ({ entries: [] })),
        api.get("/api/customers").catch(() => ({ customers: [] })),
        api.get("/api/payments").catch(() => ({ payments: [] })),
        api.get("/api/documents?doc_type=invoice").catch(() => ({ documents: [] })),
      ]);
      setProfitLoss(plRes);
      setTrend(trendRes.trend || []);
      setKhataEntries(khataRes.entries || []);
      setCustomerCount((custRes.customers || []).length);
      setPayments(payRes.payments || []);
      setInvoices(invRes.documents || []);
    } catch (err) {
      setError(err.message || "Could not load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(months);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months]);

  const isDateInPeriod = (dateVal, p) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();

    if (p === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (p === "this_week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek && d <= now;
    }
    if (p === "this_month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (p === "this_year") {
      return d.getFullYear() === now.getFullYear();
    }
    if (p === "last_6_months") {
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return d >= sixMonthsAgo;
    }
    return true;
  };

  // Dynamically derive period figures from backend data
  const metrics = useMemo(() => {
    const periodInvoices = invoices.filter((i) =>
      isDateInPeriod(i.invoice_date || i.created_at, period)
    );
    const invoiceSalesSum = periodInvoices.reduce(
      (sum, i) => sum + Number(i.total_amount || 0),
      0
    );

    const periodPayments = payments.filter((p) =>
      isDateInPeriod(p.payment_date || p.created_at, period)
    );

    const dueRecSum = periodPayments
      .filter((p) => p.payment_category === "due_received")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const expensesSum = periodPayments
      .filter(
        (p) =>
          p.payment_category === "paid_by_business" ||
          p.payment_category === "purchase_bill"
      )
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const advanceSum = periodPayments
      .filter((p) => p.payment_category === "advance_from_investor")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Fallbacks from profitLoss API if detailed lists are empty for this_month / last_6_months
    let totalSales = invoiceSalesSum;
    let dueReceived = dueRecSum;
    let expenses = expensesSum;
    let investorAdvance = advanceSum;

    if (totalSales === 0 && profitLoss?.income_from_sales?.total && (period === "this_month" || period === "last_6_months")) {
      totalSales = Number(profitLoss.income_from_sales.total || 0);
    }
    if (dueReceived === 0 && profitLoss?.due_received_from_customers && (period === "this_month" || period === "last_6_months")) {
      dueReceived = Number(profitLoss.due_received_from_customers || 0);
    }
    if (expenses === 0 && profitLoss?.expenses_total && (period === "this_month" || period === "last_6_months")) {
      expenses = Number(profitLoss.expenses_total || 0);
    }
    if (investorAdvance === 0 && profitLoss?.investor_advance && (period === "this_month" || period === "last_6_months")) {
      investorAdvance = Number(profitLoss.investor_advance || 0);
    }

    const netProfit = totalSales + dueReceived - expenses;

    return {
      totalSales,
      dueReceived,
      expenses,
      investorAdvance,
      netProfit,
    };
  }, [invoices, payments, period, profitLoss]);

  const maxTrendValue = Math.max(
    1,
    ...trend.map((t) => Math.max(Number(t.sales || 0), Number(t.expenses || 0)))
  );
  const creditCount = khataEntries.filter((e) => e.type === "credit").length;
  const debitCount = khataEntries.filter((e) => e.type === "debit").length;

  const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-3 rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-lg font-bold">Reports</h1>
            <p className="text-xs text-slate-400">
              Understand your business performance
            </p>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* PERIOD SELECTOR */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Filter Period:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    period === opt.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5 TOTALS METRIC CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <IndianRupee size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Sales</p>
                  <p className="text-xl font-bold text-slate-900">
                    {loading ? "..." : formatMoney(metrics.totalSales)}
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
                  <p className="text-xs text-slate-500">Due Received</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {loading ? "..." : formatMoney(metrics.dueReceived)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-3 text-red-600">
                  <TrendingDown size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    {loading ? "..." : formatMoney(metrics.expenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <CreditCard size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Investor Advance</p>
                  <p className="text-xl font-bold text-purple-600">
                    {loading ? "..." : formatMoney(metrics.investorAdvance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <BarChart3 size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net Profit</p>
                  <p
                    className={`text-xl font-bold ${
                      metrics.netProfit < 0
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {loading ? "..." : formatMoney(metrics.netProfit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MONTHLY TREND CHART (Prominently displayed for Last 6 Months) */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  Sales vs Expenses Trend
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Monthly performance comparison from recorded records
                </p>
              </div>

              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              >
                <option value={6}>Last 6 Months</option>
                <option value={12}>Last 12 Months</option>
              </select>
            </div>

            {loading ? (
              <p className="mt-8 text-center text-sm text-slate-400">
                Loading chart...
              </p>
            ) : trend.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-400">
                No data yet for this period.
              </p>
            ) : (
              <div className="mt-8 flex h-64 items-end justify-between gap-3 border-b border-l border-slate-200 px-3 pb-0">
                {trend.map((item) => (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div
                      className="flex w-full max-w-14 items-end justify-center gap-1"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="w-1/2 rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600"
                        style={{
                          height: `${(Number(item.sales || 0) / maxTrendValue) * 200}px`,
                        }}
                        title={`Sales: ${formatMoney(item.sales)}`}
                      />
                      <div
                        className="w-1/2 rounded-t-lg bg-red-400 transition hover:bg-red-500"
                        style={{
                          height: `${(Number(item.expenses || 0) / maxTrendValue) * 200}px`,
                        }}
                        title={`Expenses: ${formatMoney(item.expenses)}`}
                      />
                    </div>

                    <span className="mb-2 text-xs text-slate-400">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Expenses
              </span>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-slate-800">Business Summary</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-700">Credit Entries</p>
                <p className="mt-2 text-xl font-bold text-emerald-700">
                  {loading ? "..." : creditCount}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-red-600">Debit Entries</p>
                <p className="mt-2 text-xl font-bold text-red-600">
                  {loading ? "..." : debitCount}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-600">Total Customers</p>
                <p className="mt-2 text-xl font-bold text-blue-600">
                  {loading ? "..." : customerCount}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
