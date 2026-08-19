import React, { useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  IndianRupee,
  Eye,
  Edit,
  Trash2,
  X,
  UserRound,
  Building2,
} from "lucide-react";

const CustomerManagement = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      phone: "+91 9876543210",
      email: "rajesh@gmail.com",
      type: "Customer",
      balance: 2500,
      status: "To Receive",
      lastTransaction: "Today",
    },
    {
      id: 2,
      name: "Amit Traders",
      phone: "+91 9123456780",
      email: "amittraders@gmail.com",
      type: "Customer",
      balance: 1200,
      status: "To Pay",
      lastTransaction: "Yesterday",
    },
    {
      id: 3,
      name: "Sita Store",
      phone: "+91 9988776655",
      email: "sitastore@gmail.com",
      type: "Customer",
      balance: 4800,
      status: "To Receive",
      lastTransaction: "2 days ago",
    },
    {
      id: 4,
      name: "Ramesh Das",
      phone: "+91 9090909090",
      email: "ramesh@gmail.com",
      type: "Supplier",
      balance: 3200,
      status: "To Pay",
      lastTransaction: "3 days ago",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    type: "Customer",
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      `${customer.name} ${customer.phone} ${customer.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customers, search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      return;
    }

    const newCustomer = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || "Not provided",
      type: formData.type,
      balance: 0,
      status: "No Balance",
      lastTransaction: "No transaction",
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    setFormData({
      name: "",
      phone: "",
      email: "",
      type: "Customer",
    });

    setShowModal(false);
  };

  const handleDelete = (id) => {
    setCustomers((prev) =>
      prev.filter((customer) => customer.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ================================
          PAGE HEADER
      ================================= */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Users size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Customer Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your customers and their transactions
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl bg-emerald-600
            px-5 py-3
            text-sm font-semibold text-white
            shadow-sm
            transition
            hover:bg-emerald-700
          "
        >
          <UserPlus size={18} />
          Add Customer
        </button>

      </div>

      {/* ================================
          STAT CARDS
      ================================= */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Customers
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {customers.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* To Receive */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            To Receive
          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-600">
            ₹8,500
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Customer balances
          </p>
        </div>

        {/* To Pay */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            To Pay
          </p>

          <h2 className="mt-2 text-2xl font-bold text-red-500">
            ₹4,400
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Supplier balances
          </p>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Accounts
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {customers.length}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Currently active
          </p>
        </div>

      </div>

      {/* ================================
          CUSTOMER LIST
      ================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Search Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold text-slate-900">
              All Customers
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredCustomers.length} customers found
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">

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

        {/* ================================
            DESKTOP TABLE
        ================================= */}
        <div className="hidden overflow-x-auto md:block">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">

                <th className="px-5 py-4">
                  Customer
                </th>

                <th className="px-5 py-4">
                  Contact
                </th>

                <th className="px-5 py-4">
                  Type
                </th>

                <th className="px-5 py-4">
                  Balance
                </th>

                <th className="px-5 py-4">
                  Last Transaction
                </th>

                <th className="px-5 py-4 text-right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredCustomers.map((customer) => (

                <tr
                  key={customer.id}
                  className="transition hover:bg-slate-50"
                >

                  {/* Customer */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {customer.name.charAt(0)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {customer.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          ID #{customer.id}
                        </p>
                      </div>

                    </div>

                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">

                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} />
                      {customer.phone}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <Mail size={13} />
                      {customer.email}
                    </p>

                  </td>

                  {/* Type */}
                  <td className="px-5 py-4">

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {customer.type}
                    </span>

                  </td>

                  {/* Balance */}
                  <td className="px-5 py-4">

                    <p
                      className={`font-bold ${
                        customer.status === "To Receive"
                          ? "text-emerald-600"
                          : customer.status === "To Pay"
                          ? "text-red-500"
                          : "text-slate-500"
                      }`}
                    >
                      ₹{customer.balance.toLocaleString()}
                    </p>

                    <p className="text-xs text-slate-400">
                      {customer.status}
                    </p>

                  </td>

                  {/* Last Transaction */}
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {customer.lastTransaction}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">

                    <div className="flex justify-end gap-1">

                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        title="View"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit size={17} />
                      </button>

                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* ================================
            MOBILE CUSTOMER CARDS
        ================================= */}
        <div className="space-y-3 p-4 md:hidden">

          {filteredCustomers.map((customer) => (

            <div
              key={customer.id}
              className="rounded-xl border border-slate-200 p-4"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {customer.name.charAt(0)}
                  </div>

                  <div className="min-w-0">

                    <h3 className="truncate font-semibold text-slate-800">
                      {customer.name}
                    </h3>

                    <p className="text-xs text-slate-400">
                      {customer.type}
                    </p>

                  </div>

                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    customer.status === "To Receive"
                      ? "bg-emerald-100 text-emerald-700"
                      : customer.status === "To Pay"
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {customer.status}
                </span>

              </div>

              <div className="mt-4 space-y-2">

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={15} />
                  {customer.phone}
                </div>

                <div className="flex items-center gap-2 break-all text-xs text-slate-400">
                  <Mail size={14} />
                  {customer.email}
                </div>

              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                <div>
                  <p className="text-xs text-slate-400">
                    Balance
                  </p>

                  <p
                    className={`font-bold ${
                      customer.status === "To Receive"
                        ? "text-emerald-600"
                        : customer.status === "To Pay"
                        ? "text-red-500"
                        : "text-slate-500"
                    }`}
                  >
                    ₹{customer.balance.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-1">

                  <button className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600">
                    <Eye size={17} />
                  </button>

                  <button className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                    <Edit size={17} />
                  </button>

                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ================================
          EMPTY STATE
      ================================= */}
      {filteredCustomers.length === 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Users
            size={40}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-3 font-semibold text-slate-700">
            No customers found
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Try searching with another name or phone number.
          </p>
        </div>
      )}

      {/* ================================
          ADD CUSTOMER MODAL
      ================================= */}
      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Customer
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Add a new customer to your business
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
              onSubmit={handleAddCustomer}
              className="space-y-4 p-5"
            >

              {/* Name */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Customer Name
                </label>

                <div className="relative">

                  <UserRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />

                </div>

              </div>

              {/* Phone */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />

                </div>

              </div>

              {/* Email */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@email.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                </div>

              </div>

              {/* Type */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "Customer",
                      })
                    }
                    className={`rounded-xl border p-3 text-sm font-semibold transition ${
                      formData.type === "Customer"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <UserRound
                      size={18}
                      className="mx-auto mb-1"
                    />
                    Customer
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: "Supplier",
                      })
                    }
                    className={`rounded-xl border p-3 text-sm font-semibold transition ${
                      formData.type === "Supplier"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <Building2
                      size={18}
                      className="mx-auto mb-1"
                    />
                    Supplier
                  </button>

                </div>

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Add Customer
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default CustomerManagement;