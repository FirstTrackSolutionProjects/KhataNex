import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Menu,
  Search,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

const Payments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const payments = [
    {
      name: "Rajesh Kumar",
      amount: 2500,
      date: "18 Aug 2026",
      status: "Received",
      method: "UPI",
    },
    {
      name: "Sita Store",
      amount: 4800,
      date: "17 Aug 2026",
      status: "Received",
      method: "Cash",
    },
    {
      name: "Amit Traders",
      amount: 1200,
      date: "16 Aug 2026",
      status: "Pending",
      method: "UPI",
    },
    {
      name: "Priya Enterprises",
      amount: 6700,
      date: "15 Aug 2026",
      status: "Pending",
      method: "Bank Transfer",
    },
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
              Payments
            </h1>
            <p className="text-xs text-slate-400">
              Track your business payments
            </p>
          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Received
                  </p>

                  <p className="text-xl font-bold text-emerald-600">
                    ₹48,600
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <Clock3 size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Pending
                  </p>

                  <p className="text-xl font-bold text-amber-600">
                    ₹19,200
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <CreditCard size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Transactions
                  </p>

                  <p className="text-xl font-bold">
                    126
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
                placeholder="Search payment..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">

            <table className="w-full min-w-[700px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Method
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {payments.map((payment, index) => (
                  <tr key={index} className="hover:bg-slate-50">

                    <td className="px-5 py-4 text-sm font-semibold">
                      {payment.name}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-emerald-600">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {payment.date}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {payment.method}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === "Received"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {payment.status}
                      </span>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Payments;