import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Menu,
  ClipboardList,
  IndianRupee,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";

const LOW_STOCK_THRESHOLD = 10;

const emptyProduct = { product_name: "", category: "", type: "", hsn_code: "", price: "", quantity: "" };
const emptyPurchase = {
  seller_name: "",
  invoice_number: "",
  product_name: "",
  hsn_code: "",
  quantity: "",
  price: "",
};

const Inventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productError, setProductError] = useState("");
  const [hsnHint, setHsnHint] = useState("");

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchase);
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const loadStock = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/stock");
      setStock(data.stock || []);
    } catch (err) {
      setError(err.message || "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const filtered = stock.filter(
    (p) =>
      (p.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const stockValue = stock.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0), 0);
  const lowStockCount = stock.filter((p) => Number(p.quantity || 0) < LOW_STOCK_THRESHOLD).length;

  const handleHsnBlur = async () => {
    if (!productForm.hsn_code) {
      setHsnHint("");
      return;
    }
    try {
      const data = await api.get(`/api/purchase-invoices/lookup?hsn_code=${encodeURIComponent(productForm.hsn_code)}`);
      if (data.found) {
        setProductForm((prev) => ({
          ...prev,
          price: prev.price || data.match.price,
          quantity: prev.quantity || data.match.quantity,
          product_name: prev.product_name || data.match.product_name,
        }));
        setHsnHint(`Auto-filled from a purchase invoice recorded on ${new Date(data.match.invoice_date).toLocaleDateString("en-IN")}.`);
      } else {
        setHsnHint("No prior purchase invoice found for this HSN code yet.");
      }
    } catch (_) {
      setHsnHint("");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductError("");
    setSavingProduct(true);
    try {
      await api.post("/api/stock", productForm);
      setShowProductModal(false);
      setProductForm(emptyProduct);
      setHsnHint("");
      loadStock();
    } catch (err) {
      setProductError(err.message || "Could not add product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    setPurchaseError("");
    setSavingPurchase(true);
    try {
      const formData = new FormData();
      Object.entries(purchaseForm).forEach(([key, value]) => formData.append(key, value));
      await api.postForm("/api/purchase-invoices", formData);
      setShowPurchaseModal(false);
      setPurchaseForm(emptyPurchase);
    } catch (err) {
      setPurchaseError(err.message || "Could not record purchase invoice.");
    } finally {
      setSavingPurchase(false);
    }
  };

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
              <h1 className="text-lg font-bold">Inventory</h1>
              <p className="hidden text-xs text-slate-400 sm:block">Manage products and stock</p>
            </div>

          </div>

          <div className="flex gap-2">
            <Button icon={ClipboardList} size="sm" variant="outline" onClick={() => setShowPurchaseModal(true)}>
              Record Purchase
            </Button>
            <Button icon={Plus} size="sm" onClick={() => setShowProductModal(true)}>
              Add Product
            </Button>
          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Package size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Products</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stock.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <IndianRupee size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stock Value</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {loading ? "..." : `₹${stockValue.toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <AlertTriangle size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-600">{loading ? "..." : lowStockCount}</p>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">

            <table className="w-full min-w-[700px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Product</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Category</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">HSN</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Stock</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Price</th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-400">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-400">No products yet.</td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const low = Number(product.quantity || 0) < LOW_STOCK_THRESHOLD;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-semibold">{product.product_name}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{product.category || "-"}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{product.hsn_code || "-"}</td>
                        <td className="px-5 py-4 text-sm font-semibold">{product.quantity}</td>
                        <td className="px-5 py-4 text-sm font-bold">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              low ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {low ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>

        </main>
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal open={showProductModal} onClose={() => setShowProductModal(false)} title="Add Product">
        <form onSubmit={handleAddProduct} className="space-y-4">
          {productError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {productError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Product Name</label>
            <input
              type="text"
              value={productForm.product_name}
              onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
              placeholder="Product name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                placeholder="e.g. Grocery"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">HSN Code</label>
              <input
                type="text"
                value={productForm.hsn_code}
                onChange={(e) => setProductForm({ ...productForm, hsn_code: e.target.value })}
                onBlur={handleHsnBlur}
                placeholder="Auto-fills price/qty if known"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {hsnHint && <p className="text-xs text-emerald-600">{hsnHint}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="number"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProduct}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingProduct ? "Saving..." : "Add Product"}
          </button>
        </form>
      </Modal>

      {/* RECORD PURCHASE INVOICE MODAL */}
      <Modal open={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Record Purchase Invoice">
        <form onSubmit={handleAddPurchase} className="space-y-4">
          {purchaseError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {purchaseError}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Record what a seller billed you for, keyed by HSN code — this powers auto-fill when adding stock later.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Seller Name</label>
              <input
                type="text"
                value={purchaseForm.seller_name}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, seller_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Invoice Number</label>
              <input
                type="text"
                value={purchaseForm.invoice_number}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, invoice_number: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Product Name</label>
              <input
                type="text"
                value={purchaseForm.product_name}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, product_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">HSN Code</label>
              <input
                type="text"
                value={purchaseForm.hsn_code}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, hsn_code: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="number"
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                value={purchaseForm.price}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, price: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPurchase}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingPurchase ? "Saving..." : "Record Purchase Invoice"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;