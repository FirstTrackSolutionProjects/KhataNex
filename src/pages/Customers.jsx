import React, { useState } from "react";
import {
  Plus,
  Search,
  Users,
  Menu,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import CustomerCard from "../components/CustomerCard";
import Button from "../components/Button";

const Customers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const customers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      balance: 8500,
      transactions: 18,
    },
    {
      id: 2,
      name: "Amit Traders",
      phone: "+91 91234 56789",
      balance: 4200,
      transactions: 12,
    },
    {
      id: 3,
      name: "Sita Store",
      phone: "+91 99887 66554",
      balance: 12800,
      transactions: 24,
    },
    {
      id: 4,
      name: "Ramesh Das",
      phone: "+91 90909 80808",
      balance: 0,
      transactions: 9,
    },
    {
      id: 5,
      name: "Priya Enterprises",
      phone: "+91 93456 78901",
      balance: 6700,
      transactions: 15,
    },
    {
      id: 6,
      name: "Maa Laxmi Store",
      phone: "+91 95678 12345",
      balance: 3500,
      transactions: 8,
    },
  ];

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone.includes(search)
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
                Customers
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your customer accounts
              </p>
            </div>

          </div>

          <Button
            icon={Plus}
            size="sm"
          >
            Add Customer
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">
                    248
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Receivable
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                ₹84,500
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Settled Accounts
              </p>
              <p className="mt-2 text-2xl font-bold">
                74
              </p>
            </div>

          </div>

          {/* Search */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">

            <div className="relative">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer by name or phone..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

          </div>

          {/* Customers */}
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                {...customer}
              />
            ))}

          </div>

          {filteredCustomers.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users
                size={35}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold">
                No customers found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try searching with another name or phone number.
              </p>
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default Customers;