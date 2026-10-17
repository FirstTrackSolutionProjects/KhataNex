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
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import api from "../lib/api";
import useSubscriptionAccess from "../hooks/useSubscriptionAccess";

const CATEGORY_LABEL = {
  money_received: "Money Received",
  advance_receivable: "Advance Receivable",
  advance_payable: "Advance Payable",
  paid_out: "Paid Out",
  due_received: "Due Received",
  normal_received: "Money Received",
  amount_received: "Money Received",
  paid_by_business: "Paid Out",
  purchase_bill: "Purchase Bill",
  advance_from_investor: "Advance Receivable",
};

const CATEGORY_STYLE = {
  money_received: "bg-emerald-100 text-emerald-700",
  advance_receivable: "bg-blue-100 text-blue-700",
  advance_payable: "bg-purple-100 text-purple-700",
  paid_out: "bg-red-100 text-red-700",
  due_received: "bg-teal-100 text-teal-700",
  normal_received: "bg-emerald-100 text-emerald-700",
  amount_received: "bg-emerald-100 text-emerald-700",
  paid_by_business: "bg-red-100 text-red-700",
  purchase_bill: "bg-amber-100 text-amber-700",
  advance_from_investor: "bg-blue-100 text-blue-700",
};

export const getEffectiveCategory = (p) => {
  const cat = (p.payment_category || "").toLowerCase();
  if (cat === "money_received" || cat === "normal_received" || cat === "amount_received") return "money_received";
  if (cat === "advance_receivable" || cat === "advance_from_investor") return "advance_receivable";
  if (cat === "advance_payable") return "advance_payable";
  if (cat === "paid_out" || cat === "paid_by_business" || cat === "purchase_bill") return "paid_out";
  if (cat === "due_received") return "due_received";
  return cat || "money_received";
};

const Payments = () => {
  const { canWrite, isRestricted, subscriptionRequiredMessage } = useSubscriptionAccess();
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
  const [viewingPayment, setViewingPayment] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // Form State
  const [form, setForm] = useState({
    payment_category: "money_received",
    party_name: "",
    purpose: "",
    amount: "",
    payment_mode: "cash",
  });

  // Selected customer & search
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");

  // Purpose choice when customer is selected: "new_payment" | "due_received" | "product_sale" | "advance"
  const [purposeType, setPurposeType] = useState("new_payment");

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
    if (customer && form.payment_category === "due_received") {
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
      setForm((prev) => ({ ...prev, payment_category: "money_received" }));
      if (selectedProduct) {
        handleSelectProduct(selectedProduct);
      } else {
        setForm((prev) => ({
          ...prev,
          payment_category: "money_received",
          purpose: "Product Sale",
          amount: "",
        }));
      }
    } else if (type === "advance") {
      setCustomerDues([]);
      setSelectedProduct(null);
      setForm((prev) => ({
        ...prev,
        payment_category: "advance_receivable",
        purpose: "Advance Payment",
        amount: "",
      }));
    } else if (type === "new_payment") {
      setCustomerDues([]);
      setSelectedProduct(null);
      setForm((prev) => ({
        ...prev,
        payment_category: "money_received",
        purpose: "Money Received",
        amount: "",
      }));
    }
  };

  const resetModalState = () => {
    setForm({
      payment_category: "money_received",
      party_name: "",
      purpose: "",
      amount: "",
      payment_mode: "cash",
    });
    setEditingPayment(null);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setPurposeType("new_payment");
    setCustomerDues([]);
    setSelectedProduct(null);
    setProductSearch("");
    setProductQuantity(1);
    setSelectedPurchaseBill(null);
    setSaveError("");
  };

  const openEditModal = (payment) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    setEditingPayment(payment);
    const cat = getEffectiveCategory(payment);
    setForm({
      payment_category: cat,
      party_name: payment.customer_name || payment.party_name || "",
      purpose: payment.purpose || "",
      amount: String(payment.amount || ""),
      payment_mode: payment.payment_mode || "cash",
    });
    if (payment.customer_id) {
      const cust = customers.find((c) => String(c.id) === String(payment.customer_id));
      setSelectedCustomer(cust || { id: payment.customer_id, name: payment.customer_name });
      setCustomerSearch(payment.customer_name || "");
    } else {
      setSelectedCustomer(null);
      setCustomerSearch(payment.party_name || "");
    }
    setSaveError("");
    setShowModal(true);
  };

  const handleDeletePayment = async (paymentId) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await api.del(`/api/payments/${paymentId}`);
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      if (viewingPayment?.id === paymentId) setViewingPayment(null);
    } catch (err) {
      window.alert(err.message || "Could not delete payment.");
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!canWrite) {
      setSaveError(subscriptionRequiredMessage);
      return;
    }
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

      if (editingPayment) {
        try {
          await api.patch(`/api/payments/${editingPayment.id}`, payload);
        } catch (_) {
          await api.put(`/api/payments/${editingPayment.id}`, payload);
        }
      } else {
        await api.post("/api/payments", payload);
      }

      setShowModal(false);
      resetModalState();
      await loadData();
    } catch (err) {
      setSaveError(err.message || "Could not save payment.");
    } finally {
      setSaving(false);
    }
  };

  const unlinkedReceipts = moneyReceipts.filter((r) => {
    const idStr = String(r.id);
    if (skippedReceipts.includes(idStr) || linkedReceipts.includes(idStr)) {
      return false;
    }
    if (r.is_linked_to_payment === 1 || r.payment_id) {
      return false;
    }
    const receiptNum = r.receipt_number || `#${r.id}`;
    const isRecorded = payments.some(
      (p) =>
        (p.money_receipt_id && String(p.money_receipt_id) === idStr) ||
        (p.purpose && p.purpose.includes(receiptNum))
    );
    return !isRecorded;
  });

  const handleAddMoneyReceiptToPayment = async (receipt) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    try {
      await api.post(`/api/payments/link-money-receipt/${receipt.id}`, {
        payment_mode: receipt.payment_mode || "cash",
      });
      const idStr = String(receipt.id);
      const nextLinked = [...linkedReceipts, idStr];
      setLinkedReceipts(nextLinked);
      localStorage.setItem("khatanex_linked_receipts", JSON.stringify(nextLinked));
      await loadData();
    } catch (err) {
      window.alert(err.message || "Failed to link Money Receipt.");
    }
  };

  const handleSkipMoneyReceipt = (receiptId) => {
    const idStr = String(receiptId);
    const nextSkipped = [...skippedReceipts, idStr];
    setSkippedReceipts(nextSkipped);
    localStorage.setItem("khatanex_skipped_receipts", JSON.stringify(nextSkipped));
  };

  const formatTransactionTime = (timeStr, createdAt) => {
    if (timeStr && typeof timeStr === "string") {
      const parts = timeStr.trim().split(":");
      if (parts.length >= 2) {
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        if (!isNaN(hours)) {
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12 || 12;
          return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
        }
      }
    }
    if (createdAt) {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    }
    return "";
  };

  const filtered = payments
    .filter((p) =>
      (p.customer_name || p.party_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = a.payment_date || a.effective_date || a.created_at || "";
      const dateB = b.payment_date || b.effective_date || b.created_at || "";
      const timeA =
        a.time ||
        a.payment_time ||
        (a.created_at && String(a.created_at).includes("T")
          ? String(a.created_at).split("T")[1]
          : "") ||
        "00:00:00";
      const timeB =
        b.time ||
        b.payment_time ||
        (b.created_at && String(b.created_at).includes("T")
          ? String(b.created_at).split("T")[1]
          : "") ||
        "00:00:00";
      const dtA =
        new Date(`${String(dateA).slice(0, 10)}T${String(timeA).slice(0, 8)}`).getTime() || 0;
      const dtB =
        new Date(`${String(dateB).slice(0, 10)}T${String(timeB).slice(0, 8)}`).getTime() || 0;
      if (dtB !== dtA) return dtB - dtA;
      return Number(b.id || 0) - Number(a.id || 0);
    });

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
        <PageHeader
          title="Payments"
          subtitle="Track and record your business payments"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showSearch={true}
          showProfile={true}
          onNew={() => {
            if (!canWrite) {
              alert(subscriptionRequiredMessage);
              return;
            }
            resetModalState();
            setShowModal(true);
          }}
          newLabel="Add Payment"
          newDisabled={!canWrite}
          newTooltip={!canWrite ? subscriptionRequiredMessage : undefined}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <CheckCircle2 size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Money Received</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {loading
                      ? "..."
                      : `₹${(
                          sumByCategory("money_received") +
                          sumByCategory("due_received")
                        ).toLocaleString("en-IN")}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <CreditCard size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Advance Receivable</p>
                  <p className="text-xl font-bold text-blue-600">
                    {loading
                      ? "..."
                      : `₹${sumByCategory("advance_receivable").toLocaleString(
                          "en-IN"
                        )}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <TrendingUp size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Advance Payable</p>
                  <p className="text-xl font-bold text-purple-600">
                    {loading
                      ? "..."
                      : `₹${sumByCategory("advance_payable").toLocaleString(
                          "en-IN"
                        )}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-3 text-red-600">
                  <ArrowUpFromLine size={21} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Paid Out</p>
                  <p className="text-xl font-bold text-red-600">
                    {loading
                      ? "..."
                      : `₹${sumByCategory("paid_out").toLocaleString("en-IN")}`}
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
                    Date &amp; Time
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Mode
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                    Category
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-6 text-center text-sm text-slate-400"
                    >
                      Loading payments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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

                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                        <div className="font-medium text-slate-700">
                          {payment.payment_date || payment.effective_date
                            ? new Date(
                                payment.payment_date || payment.effective_date
                              ).toLocaleDateString("en-IN")
                            : payment.created_at
                            ? new Date(payment.created_at).toLocaleDateString("en-IN")
                            : "—"}
                        </div>
                        {formatTransactionTime(
                          payment.time || payment.payment_time,
                          payment.created_at
                        ) ? (
                          <div className="text-xs text-slate-400">
                            {formatTransactionTime(
                              payment.time || payment.payment_time,
                              payment.created_at
                            )}
                          </div>
                        ) : null}
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

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingPayment(payment)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                            title="View Details"
                            aria-label="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            disabled={!canWrite}
                            onClick={() => openEditModal(payment)}
                            className={`rounded-lg p-2 transition ${
                              !canWrite
                                ? "opacity-40 cursor-not-allowed text-slate-400"
                                : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                            }`}
                            title={!canWrite ? subscriptionRequiredMessage : "Edit Payment"}
                            aria-label="Edit Payment"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            disabled={!canWrite}
                            onClick={() => handleDeletePayment(payment.id)}
                            className={`rounded-lg p-2 transition ${
                              !canWrite
                                ? "opacity-40 cursor-not-allowed text-rose-300"
                                : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            }`}
                            title={!canWrite ? subscriptionRequiredMessage : "Delete Payment"}
                            aria-label="Delete Payment"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
        title={editingPayment ? "Edit Payment" : "Record Payment"}
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
                const val = e.target.value;
                let defaultPurpose = "Payment";
                if (val === "money_received") defaultPurpose = "Money Received";
                else if (val === "due_received") defaultPurpose = "Due Received";
                else if (val === "advance_receivable") defaultPurpose = "Advance Payment";
                else if (val === "advance_payable") defaultPurpose = "Advance Payable";
                else if (val === "paid_out") defaultPurpose = "Paid Out";
                else if (val === "purchase_bill") defaultPurpose = "Purchase Bill";

                setForm((prev) => ({
                  ...prev,
                  payment_category: val,
                  purpose: defaultPurpose,
                }));

                if (val !== "due_received" && val !== "money_received" && val !== "advance_receivable") {
                  setSelectedCustomer(null);
                  setCustomerDues([]);
                } else if (val === "due_received" && selectedCustomer) {
                  loadCustomerDues(selectedCustomer.id);
                } else {
                  setCustomerDues([]);
                }

                if (val !== "purchase_bill") {
                  setSelectedPurchaseBill(null);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="money_received">Money Received</option>
              <option value="due_received">Due Received</option>
              <option value="advance_receivable">Advance Receivable</option>
              <option value="advance_payable">Advance Payable</option>
              <option value="paid_out">Paid Out</option>
              <option value="purchase_bill">Purchase Bill</option>
            </select>
          </div>

          {/* PURCHASE BILL PICKER */}
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
                      setForm((f) => ({ ...f, party_name: "", amount: "", purpose: "Purchase Bill" }));
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

          {/* ADVANCE RECEIVABLE: CUSTOMER SEARCH / SELECT ONLY */}
          {form.payment_category === "advance_receivable" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800">
                  Customer
                </label>
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectCustomer(null);
                      setCustomerSearch("");
                    }}
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
                      value={customerSearch || form.party_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerSearch(val);
                        setForm((prev) => ({ ...prev, party_name: val }));
                      }}
                      placeholder="Search existing customer or type customer name..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  {customerSearch.trim() && (
                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Unknown customer: "{customerSearch}". Will record as new party.
                        </div>
                      ) : (
                        filteredCustomers.map((cust) => (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              handleSelectCustomer(cust);
                              setCustomerSearch("");
                            }}
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
                            <span className="text-[10px] text-emerald-600 font-semibold">Select</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
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
                  <span className="font-semibold text-emerald-700">Linked Customer</span>
                </div>
              )}
            </div>
          )}

          {/* MONEY RECEIVED: NORMAL CUSTOMER PAYMENT (DO NOT LOAD/FORCE DUES) */}
          {form.payment_category === "money_received" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800">
                  Customer
                </label>
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectCustomer(null);
                      setCustomerSearch("");
                    }}
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
                      value={customerSearch || form.party_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerSearch(val);
                        setForm((prev) => ({ ...prev, party_name: val }));
                      }}
                      placeholder="Search existing customer or type customer name..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  {customerSearch.trim() && (
                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Unknown customer: "{customerSearch}". Will record as new customer name.
                        </div>
                      ) : (
                        filteredCustomers.map((cust) => (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              handleSelectCustomer(cust);
                              setCustomerSearch("");
                            }}
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
                            <span className="text-[10px] text-emerald-600 font-semibold">Select</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
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
                  <span className="font-semibold text-emerald-700">Linked Customer</span>
                </div>
              )}
            </div>
          )}

          {/* DUE RECEIVED: ONLY CATEGORY WHERE CUSTOMER DUES ARE LOADED/AUTOFILLED */}
          {form.payment_category === "due_received" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800">
                  Customer <span className="text-red-500">* </span>
                </label>
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectCustomer(null);
                      setCustomerSearch("");
                    }}
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
                      placeholder="Search customer with dues..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No customers found. Please select an existing customer with dues.
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => {
                            handleSelectCustomer(cust);
                            setCustomerSearch("");
                          }}
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

              {/* DUES TABLE (ONLY FOR DUE_RECEIVED) */}
              {selectedCustomer && (
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
                      No individual pending dues recorded for this customer. Enter the amount directly below.
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
            </div>
          )}

          {/* PAYEE NAME FOR ADVANCE PAYABLE & PAID OUT */}
          {(form.payment_category === "advance_payable" || form.payment_category === "paid_out") && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {form.payment_category === "advance_payable"
                  ? "Payee / Recipient / Vendor Name"
                  : "Paid To (Vendor / Payee / Person)"}
              </label>
              <input
                type="text"
                required
                value={form.party_name}
                onChange={(e) => setForm({ ...form, party_name: e.target.value })}
                placeholder={
                  form.payment_category === "advance_payable"
                    ? "Name of vendor, supplier, or payee"
                    : "Name of vendor or payee"
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
            disabled={!canWrite || saving}
            title={!canWrite ? subscriptionRequiredMessage : undefined}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : (editingPayment ? "Update Payment" : "Record Payment")}
          </button>
        </form>
      </Modal>

      {/* LARGE READABLE VIEW PAYMENT DETAIL MODAL */}
      <Modal
        open={Boolean(viewingPayment)}
        onClose={() => setViewingPayment(null)}
        title="Payment Details"
      >
        {viewingPayment && (
          <div className="space-y-5">
            {/* Amount Banner */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Payment Amount
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                ₹{Number(viewingPayment.amount || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    CATEGORY_STYLE[getEffectiveCategory(viewingPayment)] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {CATEGORY_LABEL[getEffectiveCategory(viewingPayment)] || viewingPayment.payment_category}
                </span>
                <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  Mode: {viewingPayment.payment_mode || "Cash"}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs font-medium text-slate-400">Party / Customer</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {viewingPayment.customer_name || viewingPayment.party_name || "—"}
                </p>
                {viewingPayment.customer_phone && (
                  <p className="text-xs text-slate-500 mt-0.5">Phone: {viewingPayment.customer_phone}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs font-medium text-slate-400">Date & Time</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {viewingPayment.payment_date
                    ? new Date(viewingPayment.payment_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatTransactionTime(
                    viewingPayment.time || viewingPayment.payment_time,
                    viewingPayment.created_at
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 sm:col-span-2">
                <p className="text-xs font-medium text-slate-400">Purpose / Description</p>
                <p className="mt-1 font-medium text-slate-800 break-words">
                  {viewingPayment.purpose || "—"}
                </p>
              </div>

              {viewingPayment.reference_number && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs font-medium text-slate-400">Reference / Txn ID</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {viewingPayment.reference_number}
                  </p>
                </div>
              )}

              {viewingPayment.notes && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-400">Notes</p>
                  <p className="mt-1 text-slate-700">{viewingPayment.notes}</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                disabled={!canWrite}
                onClick={() => handleDeletePayment(viewingPayment.id)}
                title={!canWrite ? subscriptionRequiredMessage : "Delete"}
                className={`inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold transition ${
                  !canWrite ? "opacity-40 cursor-not-allowed text-rose-400" : "text-rose-700 hover:bg-rose-100"
                }`}
              >
                <Trash2 size={15} /> Delete
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canWrite}
                  onClick={() => {
                    const p = viewingPayment;
                    setViewingPayment(null);
                    openEditModal(p);
                  }}
                  title={!canWrite ? subscriptionRequiredMessage : "Edit"}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold transition ${
                    !canWrite ? "opacity-40 cursor-not-allowed text-slate-400" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Pencil size={15} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPayment(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
