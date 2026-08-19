import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Menu,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const months = [
    { month: "Mar", value: 35 },
    { month: "Apr", value: 52 },
    { month: "May", value: 42 },
    { month: "Jun", value: 68 },
    { month: "Jul", value: 74 },
    { month: "Aug", value: 88 },
  ];

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
            <h1 className="text-lg font-bold">
              Reports
            </h1>

            <p className="text-xs text-slate-400">
              Understand your business performance
            </p>
          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <IndianRupee size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Total Sales
                  </p>
                  <p className="text-xl font-bold">
                    ₹2,84,500
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
                  <p className="text-xs text-slate-500">
                    Growth
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    +18.5%
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
                  <p className="text-xs text-slate-500">
                    Expenses
                  </p>
                  <p className="text-xl font-bold">
                    ₹1,26,200
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
                  <p className="text-xs text-slate-500">
                    Net Profit
                  </p>
                  <p className="text-xl font-bold">
                    ₹1,58,300
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Chart */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-bold">
                  Sales Overview
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Monthly business performance
                </p>
              </div>

              <select className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>

            </div>

            <div className="mt-8 flex h-64 items-end justify-between gap-3 border-b border-l border-slate-200 px-3 pb-0">

              {months.map((item) => (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >

                  <div
                    className="w-full max-w-12 rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600"
                    style={{
                      height: `${item.value * 2}px`,
                    }}
                  />

                  <span className="mb-2 text-xs text-slate-400">
                    {item.month}
                  </span>

                </div>
              ))}

            </div>

          </div>

          {/* Summary */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

            <h2 className="font-bold">
              Business Summary
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-700">
                  Credit Transactions
                </p>
                <p className="mt-2 text-xl font-bold text-emerald-700">
                  182
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-red-600">
                  Debit Transactions
                </p>
                <p className="mt-2 text-xl font-bold text-red-600">
                  96
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs text-blue-600">
                  New Customers
                </p>
                <p className="mt-2 text-xl font-bold text-blue-600">
                  28
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