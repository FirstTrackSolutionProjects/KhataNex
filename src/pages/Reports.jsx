import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Menu,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import api from "../lib/api";

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profitLoss, setProfitLoss] = useState(null);
  const [trend, setTrend] = useState([]);
  const [khataEntries, setKhataEntries] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState(6);

  const loadReports = async (m) => {
    setLoading(true);
    setError("");
    try {
      const [plRes, trendRes, khataRes, custRes] = await Promise.all([
        api.get("/api/reports/profit-loss"),
        api.get(`/api/reports/monthly-trend?months=${m}`),
        api.get("/api/khata"),
        api.get("/api/customers"),
      ]);
      setProfitLoss(plRes);
      setTrend(trendRes.trend || []);
      setKhataEntries(khataRes.entries || []);
      setCustomerCount((custRes.customers || []).length);
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

  const maxTrendValue = Math.max(1, ...trend.map((t) => Math.max(t.sales, t.expenses)));
  const creditCount = khataEntries.filter((e) => e.type === "credit").length;
  const debitCount = khataEntries.filter((e) => e.type === "debit").length;

  const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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
            <p className="text-xs text-slate-400">Understand your business performance</p>
          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <IndianRupee size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Sales</p>
                  <p className="text-xl font-bold">
                    {loading ? "..." : formatMoney(profitLoss?.income_from_sales?.total)}
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
                    {loading ? "..." : formatMoney(profitLoss?.due_received_from_customers)}
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
                  <p className="text-xl font-bold">
                    {loading ? "..." : formatMoney(profitLoss?.expenses_total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <BarChart3 size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net Profit</p>
                  <p className={`text-xl font-bold ${Number(profitLoss?.profit_or_loss) < 0 ? "text-red-600" : ""}`}>
                    {loading ? "..." : formatMoney(profitLoss?.profit_or_loss)}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Chart */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-bold">Sales vs Expenses</h2>
                <p className="mt-1 text-xs text-slate-400">Monthly business performance</p>
              </div>

              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none"
              >
                <option value={6}>Last 6 Months</option>
                <option value={12}>Last 12 Months</option>
              </select>

            </div>

            {loading ? (
              <p className="mt-8 text-center text-sm text-slate-400">Loading chart...</p>
            ) : trend.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-400">No data yet for this period.</p>
            ) : (
              <div className="mt-8 flex h-64 items-end justify-between gap-3 border-b border-l border-slate-200 px-3 pb-0">

                {trend.map((item) => (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div className="flex w-full max-w-14 items-end justify-center gap-1" style={{ height: "100%" }}>
                      <div
                        className="w-1/2 rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600"
                        style={{ height: `${(item.sales / maxTrendValue) * 200}px` }}
                        title={`Sales: ${formatMoney(item.sales)}`}
                      />
                      <div
                        className="w-1/2 rounded-t-lg bg-red-400 transition hover:bg-red-500"
                        style={{ height: `${(item.expenses / maxTrendValue) * 200}px` }}
                        title={`Expenses: ${formatMoney(item.expenses)}`}
                      />
                    </div>

                    <span className="mb-2 text-xs text-slate-400">{item.month}</span>
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

          {/* Summary */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

            <h2 className="font-bold">Business Summary</h2>

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
