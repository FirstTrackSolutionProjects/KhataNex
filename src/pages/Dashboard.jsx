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
    <div className="min-h-screen overflow-x-hidden bg-slate-50">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">

        {/* =========================================
            TOPBAR
        ========================================== */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6">

          {/* Left */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                Dashboard
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your business
              </p>
            </div>

          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">

            {/* Search */}
            <button
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Notification */}
            <button
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile */}
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 sm:ml-2 sm:h-9 sm:w-9">
              A
            </div>

          </div>
        </header>

        {/* =========================================
            MAIN
        ========================================== */}
        <main className="w-full p-3 sm:p-6 lg:p-8">

          {/* =====================================
              WELCOME SECTION
          ====================================== */}
          <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Good Morning, Admin 👋
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Here's what's happening with your business today.
              </p>
            </div>

            {/* Add Transaction */}
            <div className="w-full sm:w-auto">
              <Button
                icon={Plus}
                onClick={() => {}}
              >
                Add Transaction
              </Button>
            </div>

          </div>

          {/* =====================================
              STATS
          ====================================== */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

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

          {/* =====================================
              CONTENT
          ====================================== */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">

            {/* =================================
                RECENT TRANSACTIONS
            ================================== */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-2">

              {/* Header */}
              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">
                    Recent Transactions
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Latest business transactions
                  </p>
                </div>

                <button
                  className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 sm:text-sm"
                >
                  View All
                  <Eye size={15} />
                </button>

              </div>

              {/* Transactions */}
              <div className="mt-4 space-y-3 sm:mt-5">

                {transactions.map((transaction, index) => (
                  <TransactionCard
                    key={index}
                    {...transaction}
                  />
                ))}

              </div>

            </div>

            {/* =================================
                QUICK ACTIONS
            ================================== */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

              <h3 className="font-bold text-slate-900">
                Quick Actions
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Frequently used actions
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">

                {/* Add Customer */}
                <button
                  className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50 sm:p-4"
                >
                  <Plus
                    size={19}
                    className="text-emerald-600"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-800 sm:mt-3 sm:text-sm">
                    Add Customer
                  </p>
                </button>

                {/* Add Payment */}
                <button
                  className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50 sm:p-4"
                >
                  <Wallet
                    size={19}
                    className="text-emerald-600"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-800 sm:mt-3 sm:text-sm">
                    Add Payment
                  </p>
                </button>

                {/* Credit Entry */}
                <button
                  className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50 sm:p-4"
                >
                  <ArrowDownToLine
                    size={19}
                    className="text-emerald-600"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-800 sm:mt-3 sm:text-sm">
                    Credit Entry
                  </p>
                </button>

                {/* Debit Entry */}
                <button
                  className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-red-200 hover:bg-red-50 sm:p-4"
                >
                  <ArrowUpFromLine
                    size={19}
                    className="text-red-500"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-800 sm:mt-3 sm:text-sm">
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