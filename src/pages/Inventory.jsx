import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Menu,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

const Inventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const products = [
    {
      name: "Rice 25kg",
      category: "Grocery",
      stock: 42,
      price: 1250,
      status: "In Stock",
    },
    {
      name: "Wheat Flour 10kg",
      category: "Grocery",
      stock: 8,
      price: 520,
      status: "Low Stock",
    },
    {
      name: "Cooking Oil 5L",
      category: "Grocery",
      stock: 25,
      price: 780,
      status: "In Stock",
    },
    {
      name: "Sugar 5kg",
      category: "Grocery",
      stock: 4,
      price: 280,
      status: "Low Stock",
    },
    {
      name: "Tea 1kg",
      category: "Beverages",
      stock: 31,
      price: 420,
      status: "In Stock",
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
                Inventory
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Manage products and stock
              </p>
            </div>

          </div>

          <Button
            icon={Plus}
            size="sm"
          >
            Add Product
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Package size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Products
                  </p>

                  <p className="text-2xl font-bold">
                    156
                  </p>
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Stock Value
              </p>

              <p className="mt-2 text-2xl font-bold">
                ₹4,82,500
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Low Stock
                  </p>

                  <p className="text-2xl font-bold text-amber-600">
                    12
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
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />

            </div>

          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">

            <table className="w-full min-w-[700px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Status
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {products.map((product) => (
                  <tr
                    key={product.name}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 text-sm font-semibold">
                      {product.name}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {product.category}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {product.stock}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.status === "In Stock"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {product.status}
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

export default Inventory;