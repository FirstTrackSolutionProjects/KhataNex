import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpFromLine,
  TrendingUp,
  Menu,
  Search,
  Plus,
  X,
  Package,
  Users,
  Check,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";

const CATEGORY_LABEL = {
  due_received: "Due Received",
  normal_received: "Normal Received",
  amount_received: "Normal Received",
  paid_by_business: "Paid Out",
  purchase_bill: "Purchase Bill",
  advance_from_investor: "Investor Advance",
};

const CATEGORY_STYLE = {
  due_received: "bg-emerald-100 text-emerald-700",
  normal_received: "bg-teal-100 text-teal-700",
  amount_received: "bg-teal-100 text-teal-700",
  paid_by_business: "bg-red-100 text-red-700",
  purchase_bill: "bg-amber-100 text-amber-700",
  advance_from_investor: "bg-blue-100 text-blue-700",
};

export const getEffectiveCategory = (p) => {
  const cat = (p.payment_category || "").toLowerCase();
  const purpose = (p.purpose || "").toLowerCase();
  if (cat === "normal_received" || cat === "amount_received") return "normal_received";
  if (cat === "due_received") {
    if (
      purpose.startsWith("product sale") ||
      purpose.startsWith("new payment") ||
      purpose.includes("amount received") ||
      purpose.includes("normal received")
    ) {
      return "normal_received";
    }
    return "due_received";
  }
  if (cat === "paid_by_business") return "paid_by_business";
  if (cat === "purchase_bill") return "purchase_bill";
  if (cat === "advance_from_investor") return "advance_from_investor";
  return cat || "normal_received";
};

const Payments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stock, setStock] = useState([]);
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [khataDebits, setKhataDebits] = useState([]);
  const [moneyReceipts, setMoneyReceipts] = useState([]);
  const [skippedKhataDebits, setSkippedKhataDebits] = useState(() => {
    return JSON.parse(localStorage.getItem("khatanex_skipped_khata_debits") || "[]");
  });
  const [linkedKhataDebits, setLinkedKhataDebits] = useState(() => {
    return JSON.parse(localStorage.getItem("khatanex_linked_khata_debits") || "[]");
  });
  const [skippedReceipts, setSkippedReceipts] = useState(() => {
    return JSON.parse(localStorage.getItem("khatanex_skipped_receipts") || "[]");
  });
  const [linkedReceipts, setLinkedReceipts] = useState(() => {
    return JSON.parse(localStorage.getItem("khatanex_linked_receipts") || "[]");
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Form State
  const [form, setForm] = useState({
    payment_category: "due_received",
    party_name: "",
    purpose: "",
    amount: "",
    payment_mode: "cash",
  });

  // Selected customer & search
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");

  // Purpose choice when customer is selected: "due_received" | "product_sale" | "advance" | "new_payment"
  const [purposeType, setPurposeType] = useState("due_received");

  // Outstanding dues for the selected customer
  const [customerDues, setCustomerDues] = useState([]);
  const [loadingDues, setLoadingDues] = useState(false);

  // Product Master search for "Product Sale"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);

  // Selected Purchase Bill for "Purchase Bill" category
  const [selectedPurchaseBill, setSelectedPurchaseBill] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [payRes, custRes, stockRes, pbRes, khataRes, mrRes] = await Promise.all([
        api.get("/api/payments"),
        api.get("/api/customers").catch(() => ({ customers: [] })),
        api.get("/api/stock").catch(() => ({ stock: [] })),
        api.get("/api/purchase-bills").catch(() => ({ purchase_bills: [] })),
        api.get("/api/khata").catch(() => ({ entries: [] })),
        api.get("/api/documents/money-receipts/list").catch(() => ({ receipts: [] })),
      ]);
      setPayments(payRes.payments || []);
      setCustomers(custRes.customers || []);
      setStock(stockRes.stock || []);
      setPurchaseBills(pbRes.purchase_bills || pbRes.bills || []);

      const serverDebits = (khataRes.entries || []).filter((e) => e.type === "debit");
      const localDebits = JSON.parse(
        localStorage.getItem("khatanex_local_khata_debits") || "[]"
      ).filter((e) => e.type === "debit");
      const allDebits = [...serverDebits];
      localDebits.forEach((ld) => {
        if (!allDebits.some((d) => String(d.id) === String(ld.id))) {
          allDebits.unshift(ld);
        }
      });
      setKhataDebits(allDebits);

      const receipts = mrRes.receipts || mrRes.data?.receipts || [];
      setMoneyReceipts(receipts);
    } catch (err) {
      setError(err.message || "Could not load payments data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadCustomerDues = async (customerId) => {
    if (!customerId) {
      setCustomerDues([]);
      return;
    }
    setLoadingDues(true);
    try {
      const custData = await api.get(`/api/customers/${customerId}`);
      const rawDues = (custData.sales_history || []).filter(
        (s) => s.payment_type === "due"
      );
      const mapped = rawDues.map((d) => ({
        id: d.id,
        item_name: d.item_name || "Credit Sale",
        sale_date: d.sale_date,
        originalAmount: Number(d.amount || 0),
        allocatedAmount: Number(d.amount || 0),
        selected: true,
      }));
      setCustomerDues(mapped);

      // Auto compute total from selected dues
      const total = mapped.reduce(
        (sum, item) => sum + (item.selected ? item.allocatedAmount : 0),
        0
      );
      if (total > 0) {
        setForm((prev) => ({
          ...prev,
          amount: String(total),
          purpose: `Due Received: ${mapped.map((m) => m.item_name).join(", ")}`,
        }));
      }
    } catch (err) {
      console.error("Failed to load customer dues:", err);
      setCustomerDues([]);
    } finally {
      setLoadingDues(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setForm((prev) => ({
      ...prev,
      party_name: customer ? customer.name || customer.business_name || "" : "",
    }));
    if (customer && purposeType === "due_received") {
      loadCustomerDues(customer.id);
    } else {
      setCustomerDues([]);
    }
  };

  const handleDueCheckboxToggle = (dueId) => {
    setCustomerDues((prev) => {
      const updated = prev.map((d) =>
        d.id === dueId ? { ...d, selected: !d.selected } : d
      );
      const total = updated.reduce(
        (sum, item) => sum + (item.selected ? item.allocatedAmount : 0),
        0
      );
      const selectedNames = updated
        .filter((d) => d.selected)
        .map((d) => d.item_name)
        .join(", ");
      setForm((f) => ({
        ...f,
        amount: total > 0 ? String(total) : "",
        purpose: selectedNames ? `Due Received: ${selectedNames}` : "Due Received",
      }));
      return updated;
    });
  };

  const handleDueAmountChange = (dueId, newAmount) => {
    const val = Number(newAmount) || 0;
    setCustomerDues((prev) => {
      const updated = prev.map((d) =>
        d.id === dueId ? { ...d, allocatedAmount: val } : d
      );
      const total = updated.reduce(
        (sum, item) => sum + (item.selected ? item.allocatedAmount : 0),
        0
      );
      setForm((f) => ({
        ...f,
        amount: total > 0 ? String(total) : "",
      }));
      return updated;
    });
  };

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    const sellingPrice = Number(prod.price || 0); // Always selling price from Product Master
    const total = sellingPrice * (productQuantity || 1);
    setForm((prev) => ({
      ...prev,
      amount: String(total),
      purpose: `Product Sale: ${prod.product_name} (x${productQuantity || 1})`,
    }));
  };

  const handleProductQuantityChange = (qty) => {
    const q = Math.max(1, Number(qty) || 1);
    setProductQuantity(q);
    if (selectedProduct) {
      const sellingPrice = Number(selectedProduct.price || 0);
      const total = sellingPrice * q;
      setForm((prev) => ({
        ...prev,
        amount: String(total),
        purpose: `Product Sale: ${selectedProduct.product_name} (x${q})`,
      }));
    }
  };

  const handlePurposeTypeChange = (type) => {
    setPurposeType(type);
    if (type === "due_received") {
      setForm((prev) => ({ ...prev, payment_category: "due_received" }));
      if (selectedCustomer) {
        loadCustomerDues(selectedCustomer.id);
      }
    } else if (type === "product_sale") {
      setCustomerDues([]);
      setForm((prev) => ({ ...prev, payment_category: "normal_received" }));
      if (selectedProduct) {
        handleSelectProduct(selectedProduct);
      } else {
        setForm((prev) => ({
          ...prev,
          payment_category: "normal_received",
          purpose: "Product Sale",
          amount: "",
        }));
      }
    } else if (type === "advance") {
      setCustomerDues([]);
      setSelectedProduct(null);
      setForm((prev) => ({
        ...prev,
        payment_category: "advance_from_investor",
        purpose: "Advance Payment",
        amount: "",
      }));
    } else if (type === "new_payment") {
      setCustomerDues([]);
      setSelectedProduct(null);
      setForm((prev) => ({
        ...prev,
        payment_category: "normal_received",
        purpose: "Normal Received",
        amount: "",
      }));
    }
  };

  const resetModalState = () => {
    setForm({
      payment_category: "due_received",
      party_name: "",
      purpose: "",
      amount: "",
      payment_mode: "cash",
    });
    setSelectedCustomer(null);
    setCustomerSearch("");
    setPurposeType("due_received");
    setCustomerDues([]);
    setSelectedProduct(null);
    setProductSearch("");
    setProductQuantity(1);
    setSelectedPurchaseBill(null);
    setSaveError("");
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const party = selectedCustomer
        ? selectedCustomer.name || selectedCustomer.business_name
        : form.party_name;

      const payload = {
        payment_category: form.payment_category,
        customer_id: selectedCustomer?.id || undefined,
        party_name: party,
        purpose: form.purpose || CATEGORY_LABEL[form.payment_category] || "Payment",
        amount: Number(form.amount || 0),
        payment_mode: form.payment_mode,
        purchase_bill_id:
          form.payment_category === "purchase_bill" && selectedPurchaseBill?.id
            ? Number(selectedPurchaseBill.id)
            : undefined,
      };

      await api.post("/api/payments", payload);

      setShowModal(false);
      resetModalState();
      await loadData();
    } catch (err) {
      setSaveError(err.message || "Could not save payment.");
    } finally {
      setSaving(false);
    }
  };

  const unlinkedDebits = khataDebits.filter((d) => {
    const idStr = String(d.id);
    if (skippedKhataDebits.includes(idStr) || linkedKhataDebits.includes(idStr)) {
      return false;
    }
    const isRecorded = payments.some(
      (p) =>
        p.payment_category === "paid_by_business" &&
        p.party_name === (d.name || d.party_name) &&
        Number(p.amount) === Number(d.amount)
    );
    return !isRecorded;
  });

  const unlinkedReceipts = moneyReceipts.filter((r) => {
    const idStr = String(r.id);
    if (skippedReceipts.includes(idStr) || linkedReceipts.includes(idStr)) {
      return false;
    }
    const receiptNum = r.receipt_number || `#${r.id}`;
    const isRecorded = payments.some(
      (p) => p.purpose && p.purpose.includes(receiptNum)
    );
    return !isRecorded;
  });

  const handleAddKhataDebitToPayment = async (debit) => {
    try {
      await api.post("/api/payments", {
        payment_category: "paid_by_business",
        party_name: debit.name || debit.party_name || "Vendor",
        purpose: debit.description ? `Khata debit: ${debit.description}` : "Khata debit payment",
        amount: Number(debit.amount || 0),
        payment_mode: "cash",
      });
      const idStr = String(debit.id);
      const nextLinked = [...linkedKhataDebits, idStr];
      setLinkedKhataDebits(nextLinked);
      localStorage.setItem("khatanex_linked_khata_debits", JSON.stringify(nextLinked));
      await loadData();
    } catch (err) {
      window.alert(err.message || "Failed to create payment from Khata debit.");
    }
  };

  const handleSkipKhataDebit = (debitId) => {
    const idStr = String(debitId);
    const nextSkipped = [...skippedKhataDebits, idStr];
    setSkippedKhataDebits(nextSkipped);
    localStorage.setItem("khatanex_skipped_khata_debits", JSON.stringify(nextSkipped));
  };

  const handleAddMoneyReceiptToPayment = async (receipt) => {
    try {
      const isAdvance =
        receipt.against_type === "advance" ||
        String(receipt.description || "").toLowerCase().includes("advance");
      const amt = Number(receipt.amount_received ?? receipt.amount ?? 0);
      await api.post("/api/payments", {
        payment_category: isAdvance ? "advance_from_investor" : "due_received",
        party_name:
          receipt.customer_name ||
          receipt.received_from_name ||
          receipt.customer_business_name ||
          "Customer",
        purpose: `Money Receipt: ${receipt.receipt_number || `#${receipt.id}`}`,
        amount: amt,
        payment_mode: receipt.payment_mode || "cash",
      });
      const idStr = String(receipt.id);
      const nextLinked = [...linkedReceipts, idStr];
      setLinkedReceipts(nextLinked);
      localStorage.setItem("khatanex_linked_receipts", JSON.stringify(nextLinked));
      await loadData();
    } catch (err) {
      window.alert(err.message || "Failed to create payment from Money Receipt.");
    }
  };

  const handleSkipMoneyReceipt = (receiptId) => {
    const idStr = String(receiptId);
    const nextSkipped = [...skippedReceipts, idStr];
    setSkippedReceipts(nextSkipped);
    localStorage.setItem("khatanex_skipped_receipts", JSON.stringify(nextSkipped));
  };

  const filtered = payments.filter((p) =>
    (p.customer_name || p.party_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sumByCategory = (cat) =>
    payments
      .filter((p) => getEffectiveCategory(p) === cat)
      .reduce((s, p) => s + Number(p.amount || 0), 0);

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.business_name || "").toLowerCase().includes(q)
    );
  });

  const filteredStock = stock.filter((p) => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (p.product_name || "").toLowerCase().includes(q);
  });

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
              <h1 className="text-lg font-bold">Payments</h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Track and record your business payments
              </p>
            </div>
          </div>

          <Button
            icon={Plus}
            size="sm"
            onClick={() => {
              resetModalState();
              setShowModal(true);
            }}
          >
            Add Payment
          </Button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* NOTIFICATION: KHATA DEBITS AVAILABLE */}
          {unlinkedDebits.map((debit) => (
            <div
              key={`khata-debit-${debit.id}`}
              className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Khata debit available
                  </p>
                  <p className="text-xs text-amber-700">
                    {debit.name || debit.party_name || "Vendor"} · ₹{Number(debit.amount || 0).toLocaleString("en-IN")}
                    {debit.description ? ` (${debit.description})` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleAddKhataDebitToPayment(debit)}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Add to Payment
                </button>
                <button
                  type="button"
                  onClick={() => handleSkipKhataDebit(debit.id)}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}

          {/* NOTIFICATION: MONEY RECEIPTS AVAILABLE */}
          {unlinkedReceipts.map((receipt) => {
            const isAdvance =
              receipt.against_type === "advance" ||
              String(receipt.description || "").toLowerCase().includes("advance");
            const amt = Number(receipt.amount_received ?? receipt.amount ?? 0);
            return (
              <div
                key={`receipt-${receipt.id}`}
                className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Money Receipt available
                    </p>
                    <p className="text-xs text-blue-700">
                      {receipt.receipt_number || `Receipt #${receipt.id}`} · ₹{amt.toLocaleString("en-IN")}
                      {receipt.customer_name || receipt.received_from_name ? ` from ${receipt.customer_name || receipt.received_from_name}` : ""}
                      {isAdvance ? " (Investor Advance)" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleAddMoneyReceiptToPayment(receipt)}
                    className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Add to Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSkipMoneyReceipt(receipt.id)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Skip
                  </button>
                </div>
              </div>
            );
          })}

          {/* SUMMARY CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <CheckCircle2 size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Due Received</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {loading
                      ? "..."
                      : `₹${sumByCategory("due_received").toLocaleString(
                          "en-IN"
                        )}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-100 p-3 text-teal-600">
                  <CreditCard size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Normal Received</p>
                  <p className="text-xl font-bold text-teal-600">
                    {loading
                      ? "..."
                      : `₹${sumByCategory("normal_received").toLocaleString(
                          "en-IN"
                        )}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-3 text-red-600">
                  <ArrowUpFromLine size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Paid Out</p>
                  <p className="text-xl font-bold text-red-600">
                    {loading
                      ? "..."
                      : `₹${(
                          sumByCategory("paid_by_business") +
                          sumByCategory("purchase_bill")
                        ).toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <TrendingUp size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Investor Advance</p>
                  <p className="text-xl font-bold text-blue-600">
                    {loading
                      ? "..."
                      : `₹${sumByCategory("advance_from_investor").toLocaleString(
                          "en-IN"
                        )}`}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payment by customer or party..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Party / Customer
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Purpose
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Mode
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Category
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-6 text-center text-sm text-slate-400"
                    >
                      Loading payments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-6 text-center text-sm text-slate-400"
                    >
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {payment.customer_name ||
                          payment.party_name ||
                          "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {payment.purpose || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-emerald-600">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {payment.payment_date
                          ? new Date(
                              payment.payment_date
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm capitalize text-slate-500">
                        {payment.payment_mode}
                      </td>

                      <td className="px-5 py-4">
                        {(() => {
                          const cat = getEffectiveCategory(payment);
                          return (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                CATEGORY_STYLE[cat] || "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {CATEGORY_LABEL[cat] || cat}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ADD PAYMENT MODAL */}
      <Modal
        open={showModal}
        onClose={() => {
          if (!saving) setShowModal(false);
        }}
        title="Record Payment"
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          {/* CATEGORY */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={form.payment_category}
              onChange={(e) => {
                setForm({ ...form, payment_category: e.target.value });
                if (e.target.value !== "due_received") {
                  setSelectedCustomer(null);
                  setCustomerDues([]);
                }
                if (e.target.value !== "purchase_bill") {
                  setSelectedPurchaseBill(null);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="due_received">Due Received (customer paid)</option>
              <option value="normal_received">Normal Received (amount received)</option>
              <option value="paid_by_business">Paid Out (business pays someone)</option>
              <option value="purchase_bill">Purchase Bill (recorded bill)</option>
              <option value="advance_from_investor">Investor Advance</option>
            </select>
          </div>

          {/* PURCHASE BILL PICKER (When Purchase Bill category) */}
          {form.payment_category === "purchase_bill" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800">
                  Select Recorded Purchase Bill
                </label>
                {selectedPurchaseBill && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPurchaseBill(null);
                      setForm((f) => ({ ...f, party_name: "", amount: "", purpose: "" }));
                    }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <select
                value={selectedPurchaseBill ? selectedPurchaseBill.id : ""}
                onChange={(e) => {
                  const bill = purchaseBills.find((b) => String(b.id) === e.target.value) || null;
                  setSelectedPurchaseBill(bill);
                  if (bill) {
                    const billTotal = Number(
                      bill.total_amount ??
                      bill.total ??
                      bill.amount ??
                      (Array.isArray(bill.items)
                        ? bill.items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1) - Number(it.discount || 0), 0)
                        : 0)
                    );
                    setForm((prev) => ({
                      ...prev,
                      party_name: bill.vendor_name || "",
                      amount: billTotal > 0 ? String(billTotal) : "",
                      purpose: `Purchase Bill #${bill.bill_number || bill.id}`,
                    }));
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose a recorded purchase bill --</option>
                {purchaseBills.map((b) => {
                  const billTotal = Number(
                    b.total_amount ??
                    b.total ??
                    b.amount ??
                    (Array.isArray(b.items)
                      ? b.items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1) - Number(it.discount || 0), 0)
                      : 0)
                  );
                  return (
                    <option key={b.id} value={b.id}>
                      {b.bill_number || `#${b.id}`} - {b.vendor_name || "Vendor"} (₹{billTotal.toLocaleString("en-IN")})
                    </option>
                  );
                })}
              </select>
              {purchaseBills.length === 0 && (
                <p className="text-xs text-slate-400">No recorded purchase bills found.</p>
              )}
            </div>
          )}

          {/* CUSTOMER SEARCH & SELECT (When Due Received) */}
          {form.payment_category === "due_received" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800">
                  Customer
                </label>
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => handleSelectCustomer(null)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {!selectedCustomer ? (
                <div>
                  <div className="relative mb-2">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search customer by name or phone..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No customers found. Enter name manually below.
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => handleSelectCustomer(cust)}
                          className="flex w-full items-center justify-between p-2.5 text-left text-xs transition hover:bg-emerald-50"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {cust.name || cust.business_name || `Customer #${cust.id}`}
                            </p>
                            {cust.phone && (
                              <p className="text-slate-400">{cust.phone}</p>
                            )}
                          </div>
                          {Number(cust.total_due || 0) > 0 && (
                            <span className="font-bold text-red-600">
                              Due: ₹{Number(cust.total_due).toLocaleString("en-IN")}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                  <div>
                    <p className="font-semibold text-emerald-900">
                      {selectedCustomer.name || selectedCustomer.business_name}
                    </p>
                    {selectedCustomer.phone && (
                      <p className="text-emerald-700">{selectedCustomer.phone}</p>
                    )}
                  </div>
                  {Number(selectedCustomer.total_due || 0) > 0 && (
                    <span className="font-bold text-red-600">
                      Total Due: ₹{Number(selectedCustomer.total_due).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              )}

              {/* PURPOSE SELECTOR (Due Received / Product Sale / Advance / New Payment) */}
              {selectedCustomer && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Payment Purpose
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { id: "due_received", label: "Due Received" },
                      { id: "product_sale", label: "Product Sale" },
                      { id: "advance", label: "Advance" },
                      { id: "new_payment", label: "New Payment" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handlePurposeTypeChange(opt.id)}
                        className={`rounded-lg border py-2 text-xs font-semibold transition ${
                          purposeType === opt.id
                            ? "border-emerald-500 bg-emerald-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* IF PURPOSE === 'due_received': DISPLAY CUSTOMER'S INDIVIDUAL DUES */}
              {selectedCustomer && purposeType === "due_received" && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Customer Outstanding Dues
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Select items & adjust payment
                    </span>
                  </div>

                  {loadingDues ? (
                    <p className="text-xs text-slate-400 py-2">Loading customer dues...</p>
                  ) : customerDues.length === 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                      No individual pending dues found for this customer. Enter the amount directly below.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white max-h-48 overflow-y-auto">
                      {customerDues.map((due) => (
                        <div
                          key={due.id}
                          className="flex items-center justify-between p-2.5 text-xs gap-3"
                        >
                          <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={due.selected}
                              onChange={() => handleDueCheckboxToggle(due.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-slate-800 truncate">
                                {due.item_name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {due.sale_date
                                  ? new Date(due.sale_date).toLocaleDateString("en-IN")
                                  : ""} · Due: ₹{due.originalAmount}
                              </p>
                            </div>
                          </label>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-slate-400 text-[11px]">Pay ₹</span>
                            <input
                              type="number"
                              min="0"
                              max={due.originalAmount}
                              step="0.01"
                              value={due.allocatedAmount}
                              disabled={!due.selected}
                              onChange={(e) =>
                                handleDueAmountChange(due.id, e.target.value)
                              }
                              className="w-20 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500 disabled:opacity-50 text-right font-medium"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* IF PURPOSE === 'product_sale': PRODUCT MASTER LOOKUP */}
              {selectedCustomer && purposeType === "product_sale" && (
                <div className="mt-3 space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Product Master (Search Product)
                  </label>

                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product from inventory..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                    {filteredStock.length === 0 ? (
                      <p className="p-3 text-center text-xs text-slate-400">
                        No matching products in inventory.
                      </p>
                    ) : (
                      filteredStock.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleSelectProduct(prod)}
                          className={`flex w-full items-center justify-between p-2 text-left text-xs transition ${
                            selectedProduct?.id === prod.id
                              ? "bg-emerald-50 font-semibold text-emerald-800"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span>{prod.product_name}</span>
                          <span className="font-bold text-emerald-600">
                            Selling Price: ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  {selectedProduct && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-600">
                        Quantity:
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => handleProductQuantityChange(e.target.value)}
                        className="w-20 rounded border border-slate-200 px-2 py-1 text-xs text-center font-bold"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PARTY NAME (When NOT Due Received or fallback) */}
          {form.payment_category !== "due_received" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {form.payment_category === "purchase_bill"
                  ? "Vendor / Supplier Name"
                  : form.payment_category === "paid_by_business"
                  ? "Paid To (Vendor / Person)"
                  : form.payment_category === "normal_received"
                  ? "Received From (Customer / Party)"
                  : "Investor Name"}
              </label>
              <input
                type="text"
                required
                value={form.party_name}
                onChange={(e) => setForm({ ...form, party_name: e.target.value })}
                placeholder={
                  form.payment_category === "purchase_bill"
                    ? "Vendor name from purchase bill"
                    : form.payment_category === "normal_received"
                    ? "Customer or payer name"
                    : "Name of vendor or investor"
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          {/* PURPOSE / DESCRIPTION */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Purpose / Description
            </label>
            <input
              type="text"
              required
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="What is this payment for?"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* AMOUNT & PAYMENT MODE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount (₹)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Payment Mode
              </label>
              <select
                value={form.payment_mode}
                onChange={(e) =>
                  setForm({ ...form, payment_mode: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="cash">Cash</option>
                <option value="online">Online / UPI</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Record Payment"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
