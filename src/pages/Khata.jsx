import React, { useState } from "react";
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

const Khata = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const entries = [
    {
      name: "Rajesh Kumar",
      description: "Credit Sale",
      amount: 2500,
      type: "credit",
      date: "18 Aug 2026",
    },
    {
      name: "Amit Traders",
      description: "Payment",
      amount: 1200,
      type: "debit",
      date: "18 Aug 2026",
    },
    {
      name: "Sita Store",
      description: "Credit Sale",
      amount: 4800,
      type: "credit",
      date: "17 Aug 2026",
    },
    {
      name: "Ramesh Das",
      description: "Payment Received",
      amount: 3200,
      type: "credit",
      date: "17 Aug 2026",
    },
  ];

  const filtered = entries.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

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

          <Button icon={Plus} size="sm">
            New Entry
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Credit
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                ₹84,500
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Debit
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                ₹32,200
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Net Balance
              </p>

              <p className="mt-2 text-2xl font-bold">
                ₹52,300
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

            <div className="divide-y divide-slate-100">

              {filtered.map((item, index) => {

                const credit = item.type === "credit";

                return (
                  <div
                    key={index}
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
                        {item.description} · {item.date}
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
                      {item.amount.toLocaleString("en-IN")}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Khata;