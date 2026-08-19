import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  MoreVertical,
  Menu,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

const CustomerDetails = () => {
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const customer = {
    id,
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    balance: 8500,
  };

  const transactions = [
    {
      date: "18 Aug 2026",
      description: "Payment Received",
      type: "credit",
      amount: 2500,
    },
    {
      date: "16 Aug 2026",
      description: "Goods Purchased",
      type: "debit",
      amount: 1800,
    },
    {
      date: "14 Aug 2026",
      description: "Credit Sale",
      type: "credit",
      amount: 4200,
    },
    {
      date: "10 Aug 2026",
      description: "Payment Received",
      type: "credit",
      amount: 3000,
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

            <Link
              to="/customers"
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600"
            >
              <ArrowLeft size={18} />
              Customers
            </Link>

          </div>

          <Button
            icon={Plus}
            size="sm"
          >
            Add Transaction
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {/* Customer Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                  {customer.name.charAt(0)}
                </div>

                <div>
                  <h1 className="text-2xl font-bold">
                    {customer.name}
                  </h1>

                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={14} />
                    {customer.phone}
                  </p>
                </div>

              </div>

              <button className="self-start rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <MoreVertical size={20} />
              </button>

            </div>

          </div>

          {/* Stats */}
          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Outstanding
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                ₹8,500
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Credit
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                ₹9,700
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Transactions
              </p>

              <p className="mt-2 text-2xl font-bold">
                18
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

            <div className="divide-y divide-slate-100">

              {transactions.map((transaction, index) => {

                const isCredit =
                  transaction.type === "credit";

                return (
                  <div
                    key={index}
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
                        {transaction.date}
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

          </div>

        </main>
      </div>
    </div>
  );
};

export default CustomerDetails;