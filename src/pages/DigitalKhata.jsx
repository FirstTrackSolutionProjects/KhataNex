import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  IndianRupee,
  Users,
  CalendarDays,
  X,
  CheckCircle,
} from "lucide-react";

const DigitalKhata = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState("credit");

  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    date: "",
    description: "",
  });

  const customers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      phone: "9876543210",
      balance: 12500,
      type: "receive",
    },
    {
      id: 2,
      name: "Amit Traders",
      phone: "9123456780",
      balance: 8200,
      type: "receive",
    },
    {
      id: 3,
      name: "Sita Store",
      phone: "9988776655",
      balance: 5400,
      type: "receive",
    },
    {
      id: 4,
      name: "Ramesh Das",
      phone: "9090909090",
      balance: 3200,
      type: "pay",
    },
    {
      id: 5,
      name: "Priya Enterprises",
      phone: "9012345678",
      balance: 7800,
      type: "receive",
    },
  ];

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalReceive = customers
    .filter((item) => item.type === "receive")
    .reduce((sum, item) => sum + item.balance, 0);

  const totalPay = customers
    .filter((item) => item.type === "pay")
    .reduce((sum, item) => sum + item.balance, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Khata Entry:", {
      ...formData,
      type: entryType,
    });

    setFormData({
      customer: "",
      amount: "",
      date: "",
      description: "",
    });

    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          HEADER
      ========================================== */}
      <header className="border-b border-slate-200 bg-white">

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">

          {/* Title */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <BookOpen size={23} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Digital Khata
                </h1>

                <p className="text-sm text-slate-500">
                  Manage customer credit and debit records
                </p>
              </div>

            </div>

            {/* Add Entry */}
            <button
              onClick={() => setShowModal(true)}
              className="
                flex items-center justify-center gap-2
                rounded-xl bg-emerald-600
                px-4 py-2.5
                text-sm font-semibold text-white
                shadow-sm
                transition
                hover:bg-emerald-700
              "
            >
              <Plus size={18} />
              Add Khata Entry
            </button>

          </div>

        </div>

      </header>

      {/* =========================================
          MAIN CONTENT
      ========================================== */}
      <main className="p-4 sm:p-6 lg:p-8">

        {/* =====================================
            SUMMARY CARDS
        ====================================== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total Receive */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total To Receive
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  ₹{totalReceive.toLocaleString("en-IN")}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <ArrowDownToLine size={22} />
              </div>

            </div>

            <p className="mt-3 text-xs text-emerald-600">
              Money customers need to pay you
            </p>

          </div>

          {/* Total Pay */}
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total To Pay
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  ₹{totalPay.toLocaleString("en-IN")}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <ArrowUpFromLine size={22} />
              </div>

            </div>

            <p className="mt-3 text-xs text-red-500">
              Money you need to pay
            </p>

          </div>

          {/* Customers */}
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Customers
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {customers.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users size={22} />
              </div>

            </div>

            <p className="mt-3 text-xs text-blue-600">
              Customers in your digital khata
            </p>

          </div>

        </div>

        {/* =====================================
            CUSTOMER KHATA
        ====================================== */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white">

          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-bold text-slate-900">
                Customer Khata
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                View and manage customer balances
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full rounded-xl
                  border border-slate-200
                  bg-slate-50
                  py-2.5 pl-10 pr-4
                  text-sm
                  outline-none
                  transition
                  focus:border-emerald-500
                  focus:bg-white
                  focus:ring-2
                  focus:ring-emerald-100
                "
              />

            </div>

          </div>

          {/* Customer List */}
          <div className="divide-y divide-slate-100">

            {filteredCustomers.length > 0 ? (

              filteredCustomers.map((customer) => (

                <div
                  key={customer.id}
                  className="
                    flex flex-col gap-4
                    p-5
                    transition
                    hover:bg-slate-50
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  {/* Customer */}
                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      {customer.name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {customer.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        {customer.phone}
                      </p>
                    </div>

                  </div>

                  {/* Balance */}
                  <div className="flex items-center justify-between gap-5 sm:justify-end">

                    <div className="text-left sm:text-right">

                      <p className="text-xs text-slate-400">
                        {customer.type === "receive"
                          ? "To Receive"
                          : "To Pay"}
                      </p>

                      <p
                        className={`mt-1 text-lg font-bold ${
                          customer.type === "receive"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        ₹{customer.balance.toLocaleString("en-IN")}
                      </p>

                    </div>

                    <button
                      className="
                        rounded-xl
                        border border-slate-200
                        px-3 py-2
                        text-xs font-semibold
                        text-slate-600
                        transition
                        hover:border-emerald-200
                        hover:bg-emerald-50
                        hover:text-emerald-700
                      "
                    >
                      View Khata
                    </button>

                  </div>

                </div>

              ))

            ) : (

              <div className="p-10 text-center">

                <Users
                  size={35}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-500">
                  No customer found
                </p>

              </div>

            )}

          </div>

        </div>

      </main>

      {/* =========================================
          ADD KHATA MODAL
      ========================================== */}
      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Khata Entry
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Record a credit or debit transaction
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* Entry Type */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Entry Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setEntryType("credit")}
                    className={`
                      flex items-center justify-center gap-2
                      rounded-xl border px-4 py-3
                      text-sm font-semibold
                      transition
                      ${
                        entryType === "credit"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500"
                      }
                    `}
                  >
                    <ArrowDownToLine size={18} />
                    Credit
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryType("debit")}
                    className={`
                      flex items-center justify-center gap-2
                      rounded-xl border px-4 py-3
                      text-sm font-semibold
                      transition
                      ${
                        entryType === "debit"
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-slate-200 text-slate-500"
                      }
                    `}
                  >
                    <ArrowUpFromLine size={18} />
                    Debit
                  </button>

                </div>

              </div>

              {/* Customer */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer
                </label>

                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl
                    border border-slate-200
                    bg-white
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                >

                  <option value="">
                    Select Customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.name}
                    >
                      {customer.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* Amount */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount
                </label>

                <div className="relative">

                  <IndianRupee
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="1"
                    className="
                      w-full rounded-xl
                      border border-slate-200
                      py-3 pl-10 pr-4
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />

                </div>

              </div>

              {/* Date */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Date
                </label>

                <div className="relative">

                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="
                      w-full rounded-xl
                      border border-slate-200
                      py-3 pl-10 pr-4
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />

                </div>

              </div>

              {/* Description */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter transaction description..."
                  className="
                    w-full resize-none rounded-xl
                    border border-slate-200
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="
                    flex-1 rounded-xl
                    border border-slate-200
                    px-4 py-3
                    text-sm font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    flex flex-1 items-center justify-center gap-2
                    rounded-xl bg-emerald-600
                    px-4 py-3
                    text-sm font-semibold text-white
                    transition
                    hover:bg-emerald-700
                  "
                >
                  <CheckCircle size={17} />
                  Save Entry
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default DigitalKhata;