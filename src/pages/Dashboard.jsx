import React, { useState } from "react";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Plus,
  Menu,
  Bell,
  Search,
  Eye,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import TransactionCard from "../components/TransactionCard";
import Button from "../components/Button";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const transactions = [
    {
      name: "Rajesh Kumar",
      type: "credit",
      amount: "2,500",
      date: "Today, 10:30 AM",
      description: "Payment received",
    },
    {
      name: "Amit Traders",
      type: "debit",
      amount: "1,200",
      date: "Today, 09:15 AM",
      description: "Purchase",
    },
    {
      name: "Sita Store",
      type: "credit",
      amount: "4,800",
      date: "Yesterday",
      description: "Payment received",
    },
    {
      name: "Ramesh Das",
      type: "credit",
      amount: "3,200",
      date: "Yesterday",
      description: "Credit entry",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold">
                Dashboard
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your business
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Search size={19} />
            </button>

            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Bell size={19} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
              A
            </div>

          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {/* Welcome */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                Good Morning, Admin 👋
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening with your business today.
              </p>
            </div>

            <Button
              icon={Plus}
              onClick={() => {}}
            >
              Add Transaction
            </Button>

          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Balance"
              value="₹52,300"
              icon={Wallet}
              type="blue"
              change="+8.4%"
              description="this month"
            />

            <StatCard
              title="To Receive"
              value="₹84,500"
              icon={ArrowDownToLine}
              type="success"
              change="+12.5%"
              description="this month"
            />

            <StatCard
              title="To Pay"
              value="₹32,200"
              icon={ArrowUpFromLine}
              type="danger"
              change="-4.2%"
              description="this month"
            />

            <StatCard
              title="Customers"
              value="248"
              icon={Users}
              type="warning"
              change="+18"
              description="new this month"
            />

          </div>

          {/* Content */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">

            {/* Transactions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-bold">
                    Recent Transactions
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Latest business transactions
                  </p>
                </div>

                <button className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  View All
                  <Eye size={15} />
                </button>

              </div>

              <div className="mt-5 space-y-3">

                {transactions.map((transaction, index) => (
                  <TransactionCard
                    key={index}
                    {...transaction}
                  />
                ))}

              </div>

            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <h3 className="font-bold">
                Quick Actions
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Frequently used actions
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50">
                  <Plus
                    size={20}
                    className="text-emerald-600"
                  />
                  <p className="mt-3 text-sm font-semibold">
                    Add Customer
                  </p>
                </button>

                <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50">
                  <Wallet
                    size={20}
                    className="text-emerald-600"
                  />
                  <p className="mt-3 text-sm font-semibold">
                    Add Payment
                  </p>
                </button>

                <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50">
                  <ArrowDownToLine
                    size={20}
                    className="text-emerald-600"
                  />
                  <p className="mt-3 text-sm font-semibold">
                    Credit Entry
                  </p>
                </button>

                <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50">
                  <ArrowUpFromLine
                    size={20}
                    className="text-red-500"
                  />
                  <p className="mt-3 text-sm font-semibold">
                    Debit Entry
                  </p>
                </button>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;