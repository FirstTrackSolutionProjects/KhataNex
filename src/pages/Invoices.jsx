import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Menu,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

const Invoices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const invoices = [
    {
      id: "INV-1001",
      customer: "Rajesh Kumar",
      date: "18 Aug 2026",
      amount: 2500,
      status: "Paid",
    },
    {
      id: "INV-1002",
      customer: "Sita Store",
      date: "17 Aug 2026",
      amount: 4800,
      status: "Pending",
    },
    {
      id: "INV-1003",
      customer: "Amit Traders",
      date: "16 Aug 2026",
      amount: 1200,
      status: "Paid",
    },
    {
      id: "INV-1004",
      customer: "Priya Enterprises",
      date: "15 Aug 2026",
      amount: 6700,
      status: "Pending",
    },
  ];

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
                Create and manage business invoices
              </p>
            </div>

          </div>

          <Button
            icon={Plus}
            size="sm"
          >
            Create Invoice
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Invoices
              </p>
              <p className="mt-2 text-2xl font-bold">
                84
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Paid
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                62
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600">
                22
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                placeholder="Search invoice..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">

            <table className="w-full min-w-[750px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Invoice
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Action
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                          <FileText size={17} />
                        </div>

                        <span className="text-sm font-semibold">
                          {invoice.id}
                        </span>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-sm">
                      {invoice.customer}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {invoice.date}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold">
                      ₹{invoice.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          invoice.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {invoice.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                          <Eye size={17} />
                        </button>

                        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                          <Download size={17} />
                        </button>

                      </div>

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

export default Invoices;