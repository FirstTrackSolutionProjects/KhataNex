import React, { useMemo, useState } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  X,
  User,
  Calendar,
  Hash,
} from "lucide-react";

const PaymentTracking = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [payments, setPayments] = useState([
    {
      id: 1,
      transactionId: "TXN-1001",
      customer: "Rajesh Kumar",
      amount: 2500,
      method: "UPI",
      status: "Received",
      date: "19 Aug 2026",
    },
    {
      id: 2,
      transactionId: "TXN-1002",
      customer: "Amit Traders",
      amount: 1200,
      method: "Cash",
      status: "Pending",
      date: "18 Aug 2026",
    },
    {
      id: 3,
      transactionId: "TXN-1003",
      customer: "Sita Store",
      amount: 4800,
      method: "Bank Transfer",
      status: "Received",
      date: "17 Aug 2026",
    },
    {
      id: 4,
      transactionId: "TXN-1004",
      customer: "Ramesh Das",
      amount: 3200,
      method: "UPI",
      status: "Failed",
      date: "16 Aug 2026",
    },
    {
      id: 5,
      transactionId: "TXN-1005",
      customer: "Priya Enterprises",
      amount: 5600,
      method: "Cash",
      status: "Received",
      date: "15 Aug 2026",
    },
  ]);

  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    method: "UPI",
    status: "Received",
  });

  /* =====================================
      FILTER PAYMENTS
  ===================================== */

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        `${payment.customer} ${payment.transactionId} ${payment.method}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  /* =====================================
      CALCULATIONS
  ===================================== */

  const totalPayments = payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const receivedAmount = payments
    .filter((payment) => payment.status === "Received")
    .reduce((total, payment) => total + payment.amount, 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((total, payment) => total + payment.amount, 0);

  const failedAmount = payments
    .filter((payment) => payment.status === "Failed")
    .reduce((total, payment) => total + payment.amount, 0);

  /* =====================================
      FORM HANDLER
  ===================================== */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddPayment = (e) => {
    e.preventDefault();

    if (!formData.customer || !formData.amount) {
      return;
    }

    const newPayment = {
      id: Date.now(),
      transactionId: `TXN-${1000 + payments.length + 1}`,
      customer: formData.customer,
      amount: Number(formData.amount),
      method: formData.method,
      status: formData.status,
      date: "19 Aug 2026",
    };

    setPayments((prev) => [newPayment, ...prev]);

    setFormData({
      customer: "",
      amount: "",
      method: "UPI",
      status: "Received",
    });

    setShowModal(false);
  };

  /* =====================================
      STATUS STYLE
  ===================================== */

  const getStatusStyle = (status) => {
    if (status === "Received") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CreditCard size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment Tracking
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track and manage all your business payments
            </p>
          </div>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl bg-emerald-600
            px-5 py-3
            text-sm font-semibold text-white
            shadow-sm transition
            hover:bg-emerald-700
          "
        >
          <Plus size={18} />
          Add Payment
        </button>

      </div>

      {/* =====================================
          STAT CARDS
      ===================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Payments
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalPayments.toLocaleString()}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <IndianRupee size={21} />
            </div>

          </div>

        </div>

        {/* Received */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Received
              </p>

              <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                ₹{receivedAmount.toLocaleString()}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle size={21} />
            </div>

          </div>

        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                ₹{pendingAmount.toLocaleString()}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Clock size={21} />
            </div>

          </div>

        </div>

        {/* Failed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Failed
              </p>

              <h2 className="mt-2 text-2xl font-bold text-red-500">
                ₹{failedAmount.toLocaleString()}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <XCircle size={21} />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          PAYMENT LIST
      ===================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Search + Filter */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="font-bold text-slate-900">
              Payment History
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredPayments.length} payments found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search payment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full rounded-xl
                  border border-slate-200
                  bg-slate-50
                  py-2.5 pl-10 pr-4
                  text-sm
                  outline-none
                  focus:border-emerald-500
                  focus:bg-white
                  focus:ring-2
                  focus:ring-emerald-100
                  sm:w-64
                "
              />

            </div>

            {/* Filter */}
            <div className="relative">

              <Filter
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  w-full appearance-none
                  rounded-xl border border-slate-200
                  bg-slate-50
                  py-2.5 pl-9 pr-8
                  text-sm text-slate-600
                  outline-none
                  focus:border-emerald-500
                "
              >
                <option value="All">All Status</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>

            </div>

          </div>

        </div>

        {/* =====================================
            DESKTOP TABLE
        ===================================== */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">

                <th className="px-5 py-4">
                  Transaction
                </th>

                <th className="px-5 py-4">
                  Customer
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>

                <th className="px-5 py-4">
                  Method
                </th>

                <th className="px-5 py-4">
                  Date
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4 text-right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredPayments.map((payment) => (

                <tr
                  key={payment.id}
                  className="transition hover:bg-slate-50"
                >

                  {/* Transaction */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Hash size={16} />
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {payment.transactionId}
                      </span>

                    </div>

                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                        {payment.customer.charAt(0)}
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {payment.customer}
                      </span>

                    </div>

                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4">

                    <span className="font-bold text-slate-800">
                      ₹{payment.amount.toLocaleString()}
                    </span>

                  </td>

                  {/* Method */}
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {payment.method}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} />
                      {payment.date}
                    </div>

                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>

                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">

                    <button
                      className="
                        rounded-lg p-2
                        text-slate-500
                        transition
                        hover:bg-emerald-50
                        hover:text-emerald-600
                      "
                      title="View Payment"
                    >
                      <Eye size={17} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* =====================================
            MOBILE CARDS
        ===================================== */}

        <div className="space-y-3 p-4 md:hidden">

          {filteredPayments.map((payment) => (

            <div
              key={payment.id}
              className="rounded-xl border border-slate-200 p-4"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {payment.customer.charAt(0)}
                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      {payment.customer}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {payment.transactionId}
                    </p>

                  </div>

                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(
                    payment.status
                  )}`}
                >
                  {payment.status}
                </span>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <div>
                  <p className="text-xs text-slate-400">
                    Amount
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    ₹{payment.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Payment Method
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {payment.method}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {payment.date}
                  </p>
                </div>

                <div className="flex justify-end">

                  <button
                    className="
                      flex items-center gap-1
                      rounded-lg
                      bg-emerald-50
                      px-3 py-2
                      text-xs font-semibold
                      text-emerald-600
                    "
                  >
                    <Eye size={14} />
                    View
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* =====================================
          EMPTY STATE
      ===================================== */}

      {filteredPayments.length === 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center">

          <CreditCard
            size={40}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-3 font-semibold text-slate-700">
            No payments found
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Try changing your search or filter.
          </p>

        </div>
      )}

      {/* =====================================
          ADD PAYMENT MODAL
      ===================================== */}

      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Payment
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Record a new business payment
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleAddPayment}
              className="space-y-4 p-5"
            >

              {/* Customer */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Customer Name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    placeholder="Enter customer name"
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

              {/* Amount */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amount
                </label>

                <div className="relative">

                  <IndianRupee
                    size={18}
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

              {/* Method */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl
                    border border-slate-200
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                  "
                >
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                </select>

              </div>

              {/* Status */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl
                    border border-slate-200
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-emerald-500
                  "
                >
                  <option>Received</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>

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
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    flex-1 rounded-xl
                    bg-emerald-600
                    px-4 py-3
                    text-sm font-semibold
                    text-white
                    hover:bg-emerald-700
                  "
                >
                  Save Payment
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default PaymentTracking;