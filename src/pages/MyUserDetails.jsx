import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  Landmark,
  Mail,
  MessageCircle,
  MapPin,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  X,
  BookOpen,
  Eye,
  Search,
  Trash2,
  TrendingDown,
  IndianRupee,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Pencil,
  Gift,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api, { secureFileObjectUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DeleteUserModal from "../components/DeleteUserModal";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
};

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const displayValue = (value, fallback = "—") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const USER_REPORT_PERIODS = [
  { id: "today", label: "Today", months: 1 },
  { id: "this_week", label: "This Week", months: 1 },
  { id: "this_month", label: "This Month", months: 1 },
  { id: "this_year", label: "This Year", months: 12 },
  { id: "last_6_months", label: "6M", months: 6 },
  { id: "last_12_months", label: "12M", months: 12 },
];

const isDateInPeriod = (dateVal, p, cStart, cEnd) => {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();

  if (p === "custom") {
    if (cStart) {
      const s = new Date(cStart);
      s.setHours(0, 0, 0, 0);
      if (d < s) return false;
    }
    if (cEnd) {
      const e = new Date(cEnd);
      e.setHours(23, 59, 59, 999);
      if (d > e) return false;
    }
    return true;
  }
  if (p === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (p === "this_week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek && d <= now;
  }
  if (p === "this_month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (p === "this_year") {
    return d.getFullYear() === now.getFullYear();
  }
  if (p === "last_6_months") {
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    return d >= sixMonthsAgo;
  }
  if (p === "last_12_months") {
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
    return d >= twelveMonthsAgo;
  }
  return true;
};

const getResponseData = (response) => response?.data || response || {};

const getKhataRecordType = (record) => {
  if (!record) return "credit";
  const rawType = String(record.type || record.entry_type || "").trim().toLowerCase();
  const rawMode = String(record.payment_mode || record.payment_type || "").trim().toLowerCase();
  const rawSrc = String(record.source || "").trim().toLowerCase();
  const rawCat = String(record.payment_category || record.category || "").trim().toLowerCase();
  const rawStatus = String(record.status || "").trim().toLowerCase();

  // Debit entries
  if (
    rawType === "debit" ||
    rawMode === "debit" ||
    rawCat === "debit" ||
    rawSrc === "khata_debit" ||
    Number(record.debit_amount || 0) > 0
  ) {
    return "debit";
  }

  // Due entries
  if (
    rawType === "due" ||
    rawMode === "due" ||
    rawCat === "due" ||
    rawSrc === "customer_due" ||
    rawStatus === "due" ||
    rawStatus === "pending" ||
    rawStatus === "partially_paid" ||
    Number(record.remaining_amount || 0) > 0
  ) {
    return "due";
  }

  // Credit entries (sales, receipts, manual credit)
  return "credit";
};

const extractRecordsFromResponse = (data, type) => {
  if (Array.isArray(data)) {
    if (type === "khata") {
      return data.map((item) => {
        const resolvedType = getKhataRecordType(item);
        return {
          ...item,
          type: resolvedType,
          entry_type: resolvedType,
          source: item.source || (resolvedType === "due" && item.remaining_amount !== undefined ? "customer_due" : (item.payment_type ? "collection" : "khata_entry")),
        };
      });
    }
    return data;
  }
  if (!data || typeof data !== "object") return [];

  // 1. Direct key match
  if (Array.isArray(data[type])) {
    const list = data[type];
    if (type === "khata") {
      return list.map((item) => {
        const resolvedType = getKhataRecordType(item);
        return {
          ...item,
          type: resolvedType,
          entry_type: resolvedType,
          source: item.source || (resolvedType === "due" && item.remaining_amount !== undefined ? "customer_due" : (item.payment_type ? "collection" : "khata_entry")),
        };
      });
    }
    return list;
  }

  // 2. Type-specific alias keys
  if (type === "inventory" || type === "stock") {
    if (Array.isArray(data.stock)) return data.stock;
    if (Array.isArray(data.inventory)) return data.inventory;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.items)) return data.items;
  }

  if (type === "customers") {
    if (Array.isArray(data.customers)) return data.customers;
  }

  if (type === "khata") {
    let list = null;
    if (Array.isArray(data.khata)) list = data.khata;
    else if (Array.isArray(data.entries)) list = data.entries;
    else if (Array.isArray(data.ledger)) list = data.ledger;
    else if (data.credit || data.debit || data.due) {
      list = [
        ...(Array.isArray(data.credit) ? data.credit.map((x) => ({ ...x, type: x.type || "credit", source: x.source || "khata_entry" })) : []),
        ...(Array.isArray(data.debit) ? data.debit.map((x) => ({ ...x, type: x.type || "debit", source: x.source || "khata_entry" })) : []),
        ...(Array.isArray(data.due) ? data.due.map((x) => ({ ...x, type: x.type || "due", source: x.source || "customer_due" })) : []),
      ];
    }
    if (list) {
      return list.map((item) => {
        const resolvedType = getKhataRecordType(item);
        return {
          ...item,
          type: resolvedType,
          entry_type: resolvedType,
          source: item.source || (resolvedType === "due" && item.remaining_amount !== undefined ? "customer_due" : (item.payment_type ? "collection" : "khata_entry")),
        };
      });
    }
  }

  if (type === "purchase-bills" || type === "purchase_bills" || type === "purchase-bill" || type === "purchases") {
    if (Array.isArray(data["purchase-bills"])) return data["purchase-bills"];
    if (Array.isArray(data.purchase_bills)) return data.purchase_bills;
    if (Array.isArray(data.purchaseBills)) return data.purchaseBills;
    if (Array.isArray(data.bills)) return data.bills;
    if (Array.isArray(data.purchases)) return data.purchases;
  }

  if (type === "vehicles" || type === "vehicle") {
    if (Array.isArray(data.vehicles)) return data.vehicles;
    if (Array.isArray(data.trips)) return data.trips;
    if (Array.isArray(data.vehicle_trips)) return data.vehicle_trips;
  }

  if (type === "payments" || type === "payment") {
    if (Array.isArray(data.payments)) return data.payments;
    if (Array.isArray(data.payment)) return data.payment;
  }

  if (type === "expenses") {
    if (Array.isArray(data.expenses)) return data.expenses;
  }

  if (type === "money-receipts" || type === "receipts" || type === "money_receipts") {
    if (Array.isArray(data.receipts)) return data.receipts;
    if (Array.isArray(data["money-receipts"])) return data["money-receipts"];
    if (Array.isArray(data.money_receipts)) return data.money_receipts;
  }

  if (type === "invoices") {
    if (Array.isArray(data.invoices)) return data.invoices;
    if (Array.isArray(data.documents)) return data.documents;
  }

  if (type === "quotations") {
    if (Array.isArray(data.quotations)) return data.quotations;
    if (Array.isArray(data.documents)) return data.documents;
  }

  // 3. Generic collection keys
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.list)) return data.list;

  // 4. Any single array present in the object
  const arrayValues = Object.values(data).filter(Array.isArray);
  if (arrayValues.length === 1) {
    return arrayValues[0];
  }

  return [];
};

const formatTxDate = (tx) => {
  const dVal = tx.date || tx.created_at;
  if (!dVal) return "—";
  try {
    const d = new Date(dVal);
    if (Number.isNaN(d.getTime())) return String(dVal).split("T")[0];
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dVal);
  }
};

const formatTxTime = (tx) => {
  if (tx.time && typeof tx.time === "string" && tx.time.trim() && tx.time !== "00:00:00") {
    return tx.time.slice(0, 5);
  }
  const dVal = tx.date || tx.created_at;
  if (dVal && typeof dVal === "string" && (dVal.includes("T") || dVal.includes(" "))) {
    try {
      const d = new Date(dVal);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch {
      return "";
    }
  }
  return "";
};

const USER_METRIC_LABELS = {
  "total-sales": "Total Sales",
  "expenses": "Total Expense",
  "purchases": "Purchases",
  "debit-entries": "Debit Entries",
  "pay-out": "Business Pay Out",
  "advance-receivable": "Advance Receivable",
  "advance-payable": "Advance Payable",
  "cash-in-hand": "Cash in Hand",
  "cash-in-bank": "Cash in Bank",
  "net-profit": "Net Profit",
};

const USER_EXPENSE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "Purchases", label: "Purchases" },
  { id: "Debit Entries", label: "Debit Entries" },
  { id: "Business Pay Out", label: "Business Pay Out" },
  { id: "Advance Payable", label: "Advance Payable" },
  { id: "Other Expenses", label: "Other Expenses" },
];

const getUserFallbackTransactions = (metricSlug, label, currentPeriod, cStart, cEnd, rawData) => {
  const txs = [];
  const norm = (metricSlug || "").toLowerCase();
  const inPeriod = (dt) => isDateInPeriod(dt, currentPeriod, cStart, cEnd);
  const khata = rawData.khata || [];
  const payments = rawData.payments || [];
  const invoices = rawData.invoices || [];
  const purchaseBills = rawData.purchaseBills || [];

  if (norm === "total-sales" || norm === "sales") {
    invoices
      .filter((inv) => inPeriod(inv.invoice_date || inv.created_at))
      .forEach((inv) => {
        txs.push({
          id: `inv-${inv.id}`,
          date: inv.invoice_date || inv.created_at,
          time: inv.created_at,
          party: inv.customer_name || inv.client_name || "Invoice Customer",
          description: `Invoice #${inv.document_number || inv.invoice_number || inv.id}`,
          payment_mode: inv.payment_mode || "online",
          amount: Number(inv.total_amount || 0),
          source: "invoice",
          structure_category: "Sales",
        });
      });

    khata
      .filter((k) => {
        const t = String(k.type || k.entry_type || "").toLowerCase();
        return (t === "credit" || Number(k.credit_amount || 0) > 0) && inPeriod(k.entry_date || k.date || k.created_at);
      })
      .forEach((ke) => {
        txs.push({
          id: `ke-${ke.id}`,
          date: ke.entry_date || ke.date || ke.created_at,
          time: ke.entry_time || ke.created_at,
          party: ke.customer_name || "Walk-in",
          description: ke.description || "Khata Credit Sale",
          payment_mode: ke.payment_mode || "cash",
          amount: Number(ke.amount || ke.credit_amount || 0),
          source: "khata_credit",
          structure_category: "Sales",
        });
      });
  } else if (norm === "purchases" || norm === "total-purchases") {
    payments
      .filter((p) => {
        const cat = String(p.payment_category || "").toLowerCase();
        return (cat === "purchase_bill" || cat === "purchase") && inPeriod(p.payment_date || p.created_at);
      })
      .forEach((p) => {
        txs.push({
          id: `pay-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || p.vendor_name || "Vendor",
          description: p.purpose || "Purchase Bill",
          payment_mode: p.payment_mode || "cash",
          amount: Number(p.amount || 0),
          source: "purchase_bill",
          structure_category: "Purchases",
        });
      });

    purchaseBills
      .filter((pb) => inPeriod(pb.bill_date || pb.date || pb.created_at))
      .forEach((pb) => {
        if (!txs.some((t) => t.id === `pay-${pb.id}`)) {
          txs.push({
            id: `pb-${pb.id}`,
            date: pb.bill_date || pb.date || pb.created_at,
            time: pb.created_at,
            party: pb.vendor_name || pb.party_name || "Vendor",
            description: pb.bill_number ? `Bill #${pb.bill_number}` : "Purchase Bill",
            payment_mode: pb.payment_mode || "cash",
            amount: Number(pb.total_amount || pb.amount || 0),
            source: "purchase_bill",
            structure_category: "Purchases",
          });
        }
      });
  } else if (norm === "expenses" || norm === "total-expenses") {
    // 1. Purchases
    payments
      .filter((p) => {
        const cat = String(p.payment_category || "").toLowerCase();
        return (cat === "purchase_bill" || cat === "purchase") && inPeriod(p.payment_date || p.created_at);
      })
      .forEach((p) => {
        txs.push({
          id: `pay-pb-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || p.vendor_name || "Vendor",
          description: p.purpose || "Purchase Bill",
          payment_mode: p.payment_mode || "cash",
          amount: Number(p.amount || 0),
          source: "purchase_bill",
          structure_category: "Purchases",
        });
      });

    // 1b. Purchase Bills (if any not already in payments)
    purchaseBills
      .filter((pb) => inPeriod(pb.bill_date || pb.date || pb.created_at))
      .forEach((pb) => {
        if (!txs.some((t) => t.id === `pay-pb-${pb.id}` || t.id === `pb-${pb.id}`)) {
          txs.push({
            id: `pb-${pb.id}`,
            date: pb.bill_date || pb.date || pb.created_at,
            time: pb.created_at,
            party: pb.vendor_name || pb.party_name || "Vendor",
            description: pb.bill_number ? `Bill #${pb.bill_number}` : "Purchase Bill",
            payment_mode: pb.payment_mode || "cash",
            amount: Number(pb.total_amount || pb.amount || 0),
            source: "purchase_bill",
            structure_category: "Purchases",
          });
        }
      });

    // 2. Debit Entries
    khata
      .filter((ke) => {
        const t = String(ke.type || ke.entry_type || "").toLowerCase();
        return (t === "debit" || Number(ke.debit_amount || 0) > 0) && inPeriod(ke.entry_date || ke.date || ke.created_at);
      })
      .forEach((ke) => {
        txs.push({
          id: `ke-${ke.id}`,
          date: ke.entry_date || ke.date || ke.created_at,
          time: ke.entry_time || ke.created_at,
          party: ke.customer_name || "Debit Payee",
          description: ke.description || "Khata Debit",
          payment_mode: ke.payment_mode || "cash",
          amount: Number(ke.amount || ke.debit_amount || 0),
          source: "khata_debit",
          structure_category: "Debit",
        });
      });

    // 3. Business Pay Out
    payments
      .filter((p) => {
        const cat = String(p.payment_category || "").toLowerCase();
        const isPurchaseLinked = Boolean(
          p.purchase_bill_id ||
          String(p.purpose || "").startsWith("Purchase Bill") ||
          (rawData.purchaseBills || []).some((pb) => Number(pb.payment_id) === Number(p.id) || Number(pb.id) === Number(p.purchase_bill_id))
        );
        const isKhataLinked = Boolean(p.khata_entry_id);
        return ["paid_by_business", "paid_out", "expense"].includes(cat) && !isPurchaseLinked && !isKhataLinked && inPeriod(p.payment_date || p.created_at);
      })
      .forEach((p) => {
        txs.push({
          id: `pay-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || "Payee / Vendor",
          description: p.purpose || "Business Payout",
          payment_mode: p.payment_mode || "cash",
          amount: Number(p.amount || 0),
          source: "payment_payout",
          structure_category: "Business Pay Out",
        });
      });

    // 4. Advance Payable
    payments
      .filter((p) => {
        const cat = String(p.payment_category || "").toLowerCase();
        return cat === "advance_payable" && inPeriod(p.payment_date || p.created_at);
      })
      .forEach((p) => {
        txs.push({
          id: `pay-advp-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || "Payee / Vendor",
          description: p.purpose || "Advance Payable",
          payment_mode: p.payment_mode || "cash",
          amount: Number(p.amount || 0),
          source: "advance_payable",
          structure_category: "Advance Payable",
        });
      });

    // 5. Other Expenses
    (rawData.expenses || [])
      .filter((ex) => inPeriod(ex.expense_date || ex.date || ex.created_at))
      .forEach((ex) => {
        txs.push({
          id: `ex-${ex.id}`,
          date: ex.expense_date || ex.date || ex.created_at,
          time: ex.created_at,
          party: ex.vendor_name || ex.party_name || ex.added_by || "Vendor / Payee",
          description: ex.description || ex.category || "Direct Expense",
          payment_mode: ex.payment_mode || "cash",
          amount: Number(ex.amount || 0),
          source: "direct_expense",
          structure_category: "Other Expenses",
        });
      });
  } else if (norm === "debit-entries" || norm === "debit") {
    khata
      .filter((ke) => {
        const t = String(ke.type || ke.entry_type || "").toLowerCase();
        return (t === "debit" || Number(ke.debit_amount || 0) > 0) && inPeriod(ke.entry_date || ke.date || ke.created_at);
      })
      .forEach((ke) => {
        txs.push({
          id: `ke-${ke.id}`,
          date: ke.entry_date || ke.date || ke.created_at,
          time: ke.entry_time || ke.created_at,
          party: ke.customer_name || "Debit Payee",
          description: ke.description || "Khata Debit",
          payment_mode: ke.payment_mode || "cash",
          amount: Number(ke.amount || ke.debit_amount || 0),
          source: "khata_debit",
          structure_category: "Debit",
        });
      });
  } else if (norm === "pay-out" || norm === "payout" || norm === "business-payout" || norm === "business-pay-out") {
    payments
      .filter((p) => {
        const cat = String(p.payment_category || "").toLowerCase();
        const isPurchaseLinked = Boolean(
          p.purchase_bill_id ||
          String(p.purpose || "").startsWith("Purchase Bill") ||
          (rawData.purchaseBills || []).some((pb) => Number(pb.payment_id) === Number(p.id) || Number(pb.id) === Number(p.purchase_bill_id))
        );
        const isKhataLinked = Boolean(p.khata_entry_id);
        return ["paid_by_business", "paid_out", "expense"].includes(cat) && !isPurchaseLinked && !isKhataLinked && inPeriod(p.payment_date || p.created_at);
      })
      .forEach((p) => {
        txs.push({
          id: `pay-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || "Payee / Vendor",
          description: p.purpose || "Business Payout",
          payment_mode: p.payment_mode || "cash",
          amount: Number(p.amount || 0),
          source: "payment_payout",
          structure_category: "Business Pay Out",
        });
      });
  } else if (norm === "advance-receivable") {
    payments
      .filter((p) => {
        const cat = String(p.payment_category || "").toLowerCase();
        return ["advance_receivable", "advance_from_investor"].includes(cat) && inPeriod(p.payment_date || p.created_at);
      })
      .forEach((p) => {
        txs.push({
          id: `pay-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || "Customer / Investor",
          description: p.purpose || "Advance Receivable",
          payment_mode: p.payment_mode || "cash",
          amount: Number(p.amount || 0),
          source: "Payments Advance Receivable",
          structure_category: "Payments Advance Receivable",
        });
      });
  } else if (norm === "advance-payable") {
    payments
      .filter((p) => {
        const cat = String(p.payment_category || "").toLowerCase();
        return cat === "advance_payable" && inPeriod(p.payment_date || p.created_at);
      })
      .forEach((p) => {
        txs.push({
          id: `pay-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || "Payee / Vendor",
          description: p.purpose || "Advance Payable",
          payment_mode: p.payment_mode || "cash",
          amount: Number(p.amount || 0),
          source: "Payments Advance Payable",
          structure_category: "Payments Advance Payable",
        });
      });
  } else if (norm === "cash-in-hand") {
    khata
      .filter((ke) => (ke.payment_mode || "cash").toLowerCase() === "cash" && inPeriod(ke.entry_date || ke.date || ke.created_at))
      .forEach((ke) => {
        txs.push({
          id: `ke-${ke.id}`,
          date: ke.entry_date || ke.date || ke.created_at,
          time: ke.entry_time || ke.created_at,
          party: ke.customer_name || "Walk-in",
          description: ke.description || (ke.type === "credit" ? "Cash Credit" : "Cash Debit"),
          payment_mode: "Cash",
          amount: Number(ke.amount || 0),
          source: `khata_${ke.type}`,
          structure_category: "Khata",
        });
      });
    payments
      .filter((p) => (p.payment_mode || "").toLowerCase() === "cash" && inPeriod(p.payment_date || p.created_at))
      .forEach((p) => {
        txs.push({
          id: `pay-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || "Party",
          description: p.purpose || p.payment_category,
          payment_mode: "Cash",
          amount: Number(p.amount || 0),
          source: "payment",
          structure_category: "Payments",
        });
      });
  } else if (norm === "cash-in-bank") {
    khata
      .filter((ke) => ["upi", "online", "bank"].includes((ke.payment_mode || "").toLowerCase()) && inPeriod(ke.entry_date || ke.date || ke.created_at))
      .forEach((ke) => {
        txs.push({
          id: `ke-${ke.id}`,
          date: ke.entry_date || ke.date || ke.created_at,
          time: ke.entry_time || ke.created_at,
          party: ke.customer_name || "Walk-in",
          description: ke.description || (ke.type === "credit" ? "Bank/UPI Credit" : "Bank/UPI Debit"),
          payment_mode: ke.payment_mode?.toUpperCase() || "UPI",
          amount: Number(ke.amount || 0),
          source: `khata_${ke.type}`,
          structure_category: "Khata",
        });
      });
    payments
      .filter((p) => ["upi", "online", "bank", "cheque", "neft", "rtgs"].includes((p.payment_mode || "").toLowerCase()) && inPeriod(p.payment_date || p.created_at))
      .forEach((p) => {
        txs.push({
          id: `pay-${p.id}`,
          date: p.payment_date || p.created_at,
          time: p.created_at,
          party: p.party_name || "Party",
          description: p.purpose || p.payment_category,
          payment_mode: p.payment_mode?.toUpperCase() || "UPI",
          amount: Number(p.amount || 0),
          source: "payment",
          structure_category: "Payments",
        });
      });
  }

  txs.sort((a, b) => {
    const dateA = a.date || a.created_at || "";
    const dateB = b.date || b.created_at || "";
    const timeA =
      a.time ||
      (a.created_at && String(a.created_at).includes("T")
        ? String(a.created_at).split("T")[1]
        : "") ||
      "00:00:00";
    const timeB =
      b.time ||
      (b.created_at && String(b.created_at).includes("T")
        ? String(b.created_at).split("T")[1]
        : "") ||
      "00:00:00";
    const dtA =
      new Date(`${String(dateA).slice(0, 10)}T${String(timeA).slice(0, 8)}`).getTime() || 0;
    const dtB =
      new Date(`${String(dateB).slice(0, 10)}T${String(timeB).slice(0, 8)}`).getTime() || 0;
    if (dtB !== dtA) return dtB - dtA;
    const rawIdA = Number(String(a.id || "").replace(/\D+/g, "")) || 0;
    const rawIdB = Number(String(b.id || "").replace(/\D+/g, "")) || 0;
    return rawIdB - rawIdA;
  });
  const totalAmount = txs.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  return {
    metric: metricSlug,
    label,
    period: currentPeriod,
    total_amount: totalAmount,
    count: txs.length,
    transactions: txs,
  };
};


const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-800">
      {displayValue(value)}
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-700">
      {title}
    </h2>
    {children}
  </section>
);

const ActivityCard = ({
  title,
  count,
  icon: Icon,
  description,
  onClick,
  showCount = true,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex min-h-[120px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
  >
    <div className="min-w-0">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon size={21} />
      </div>

      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>

    <div className="ml-4 flex shrink-0 items-center gap-3">
      {showCount && (
        <span className="text-2xl font-bold text-slate-800">
          {Number(count || 0).toLocaleString("en-IN")}
        </span>
      )}
      <ChevronRight
        size={19}
        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
      />
    </div>
  </button>
);

const RecordModal = ({
  record,
  type,
  userId,
  onClose,
  onDeleteCustomer,
}) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadPdf = async () => {
      if (
        !record?.pdf_path ||
        !["invoice", "quotation", "money-receipt"].includes(type)
      ) {
        return;
      }

      try {
        setPdfLoading(true);
        setPdfError("");

        objectUrl = await secureFileObjectUrl(record.pdf_path, userId);

        if (!cancelled) {
          setPdfUrl(objectUrl);
        }
      } catch (err) {
        console.error("Failed to load document PDF:", err);

        if (!cancelled) {
          setPdfError(err.message || "Could not load PDF.");
        }
      } finally {
        if (!cancelled) {
          setPdfLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [record, type, userId]);

  if (!record) return null;

  const title =
    type === "invoice"
      ? "Invoice Details"
      : type === "quotation"
        ? "Quotation Details"
        : type === "money-receipt"
          ? "Money Receipt Details"
          : type === "customer"
            ? "Customer Details"
            : type === "payment"
              ? "Payment Details"
              : type === "inventory" || type === "stock"
                ? "Inventory Details"
                : type === "vehicle"
                  ? "Vehicle Trip Details"
                  : type === "expense"
                    ? "Expense Details"
                    : type === "purchase-bill" || type === "purchase_bill"
                      ? "Purchase Bill Details"
                      : type === "khata"
                        ? "Khata Entry Details"
                        : "Record Details";

  const documentNumber =
    record.invoice_number ||
    record.quotation_number ||
    record.receipt_number ||
    record.document_number;

  const renderDocumentDetails = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow label="Document Number" value={documentNumber} />
        <InfoRow
          label="Date"
          value={formatDate(
            record.invoice_date ||
              record.quotation_date ||
              record.receipt_date
          )}
        />
        <InfoRow label="Customer" value={record.customer_name} />
        <InfoRow label="Customer Phone" value={record.customer_phone} />
        <InfoRow label="Customer Email" value={record.customer_email} />
        <InfoRow label="Status" value={record.document_status || record.status} />
        <InfoRow label="Total Amount" value={formatMoney(record.total_amount)} />
        <InfoRow label="Created By" value={record.created_by_name} />
      </div>

      {pdfLoading && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <RefreshCw size={16} className="animate-spin" />
          Loading generated PDF...
        </div>
      )}

      {pdfError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pdfError}
        </div>
      )}

      {pdfUrl && (
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <iframe
            src={pdfUrl}
            title={`${title} PDF`}
            className="h-[65vh] min-h-[420px] w-full"
          />
        </div>
      )}
    </>
  );

  const renderCustomerDetails = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow label="Name" value={record.name} />
        <InfoRow label="Business Name" value={record.business_name} />
        <InfoRow label="Email" value={record.email} />
        <InfoRow label="Phone" value={record.phone} />
        <InfoRow label="GSTIN" value={record.gstin} />
        <InfoRow label="PAN" value={record.pan} />
        <InfoRow label="Customer Type" value={record.entity_type} />
        <InfoRow label="Total Due" value={formatMoney(record.total_due)} />
      </div>

      {(record.billing_address ||
        record.shipping_address ||
        record.address_line1 ||
        record.city ||
        record.state ||
        record.pincode) && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Address
          </p>

          <p className="whitespace-pre-line text-sm text-slate-700">
            {[
              record.billing_address || record.address_line1,
              record.address_line2,
              record.city,
              record.state,
              record.pincode,
              record.country,
            ]
              .filter(Boolean)
              .join("\n")}
          </p>
        </div>
      )}

      {record.sales_history?.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Sales History
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-800">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    Payment
                  </th>
                </tr>
              </thead>

              <tbody>
                {record.sales_history.map((sale) => (
                  <tr key={sale.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(sale.sale_date)}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {displayValue(sale.item_name)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {formatMoney(sale.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {displayValue(sale.payment_type)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {record.due_payments_history?.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Due Payment History
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Purpose
                  </th>
                </tr>
              </thead>

              <tbody>
                {record.due_payments_history.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {displayValue(payment.payment_mode)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {displayValue(payment.purpose)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  const renderExpenseDetails = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <InfoRow label="Expense Date" value={formatDate(record.expense_date)} />
      <InfoRow label="Description" value={record.description} />
      <InfoRow label="Category" value={record.category} />
      <InfoRow label="Amount" value={formatMoney(record.amount)} />
      <InfoRow label="Added By" value={record.added_by} />
      <InfoRow label="Created At" value={formatDateTime(record.created_at)} />
    </div>
  );

  const renderPurchaseBillDetails = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow label="Bill Number" value={record.bill_number ? `#${record.bill_number}` : "—"} />
        <InfoRow label="Vendor Name" value={record.vendor_name} />
        <InfoRow label="Bill Date" value={formatDate(record.bill_date || record.created_at)} />
        <InfoRow label="Payment Status" value={Number(record.is_paid) ? "Paid" : "Unpaid"} />
        <InfoRow label="Payment Mode" value={record.payment_mode || "—"} />
        <InfoRow label="Total Amount" value={formatMoney(record.total_amount ?? record.amount)} />
        {record.payment_reference && (
          <InfoRow label="Payment Reference" value={record.payment_reference} />
        )}
        {record.added_by && (
          <InfoRow label="Recorded By" value={record.added_by} />
        )}
      </div>

      {record.items?.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-800">Bill Items</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-amber-800">Item</th>
                  <th className="px-4 py-3 text-right font-semibold text-amber-800">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold text-amber-800">Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-amber-800">Discount</th>
                  <th className="px-4 py-3 text-right font-semibold text-amber-800">GST %</th>
                  <th className="px-4 py-3 text-right font-semibold text-amber-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {record.items.map((item, idx) => (
                  <tr key={item.id || idx} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-800 font-medium">{item.item_name || item.linked_stock_name || "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{displayValue(item.quantity)} {item.unit || ""}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatMoney(item.price)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatMoney(item.discount)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{displayValue(item.gst_rate, "0")}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMoney(item.total_amount || (Number(item.quantity || 0) * Number(item.price || 0)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  const renderKhataDetails = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <InfoRow label="Party / Customer" value={record.customer_name || record.party_name || record.name || "Walk-in"} />
      <InfoRow label="Entry Type" value={String(record.type || record.entry_type || "").toUpperCase()} />
      <InfoRow label="Amount" value={formatMoney(record.amount)} />
      <InfoRow label="Date" value={formatDate(record.entry_date || record.date || record.created_at)} />
      <InfoRow label="Payment Mode" value={record.payment_mode || "cash"} />
      <InfoRow label="Description" value={record.description || "—"} />
      {record.product_name && (
        <InfoRow label="Linked Product" value={record.product_name} />
      )}
      {record.customer_phone && (
        <InfoRow label="Phone" value={record.customer_phone} />
      )}
      {record.customer_email && (
        <InfoRow label="Email" value={record.customer_email} />
      )}
    </div>
  );

  const renderGenericDetails = () => {
    const hiddenKeys = new Set([
      "pdf_path",
      "items",
      "sales_history",
      "due_payments_history",
      "customer_email",
      "customer_phone",
      "customer_name",
      "created_by_name",
    ]);

    const entries = Object.entries(record).filter(
      ([key, value]) =>
        !hiddenKeys.has(key) &&
        value !== null &&
        value !== undefined &&
        value !== ""
    );

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <InfoRow
            key={key}
            label={key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}
            value={
              typeof value === "object"
                ? JSON.stringify(value)
                : value
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Selected user account #{userId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {["invoice", "quotation", "money-receipt"].includes(type)
            ? renderDocumentDetails()
            : type === "customer"
              ? renderCustomerDetails()
              : type === "expense"
                ? renderExpenseDetails()
                : type === "purchase-bill" || type === "purchase_bill"
                  ? renderPurchaseBillDetails()
                  : type === "khata"
                    ? renderKhataDetails()
                    : renderGenericDetails()}

          {type === "customer" && onDeleteCustomer && (
            <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onDeleteCustomer(record)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={15} />
                Delete Customer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recordsError, setRecordsError] = useState("");
  const [activeType, setActiveType] = useState("");
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [recordSearch, setRecordSearch] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantPlanCode, setGrantPlanCode] = useState("monthly");
  const [grantDuration, setGrantDuration] = useState(1);
  const [grantNotes, setGrantNotes] = useState("");
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantError, setGrantError] = useState("");
  const [grantSuccess, setGrantSuccess] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    business_type: "",
    gstin: "",
    pan: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const openEditModal = () => {
    if (!user) return;
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      business_name: user.business_name || "",
      business_type: user.business_type || "",
      gstin: user.gstin || "",
      pan: user.pan || "",
      address: user.address || user.address_line1 || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
    });
    setEditError("");
    setEditSuccess("");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const res = await api.patch(`/api/superadmin/users/${id}`, editForm);
      if (res?.success) {
        setEditSuccess("Profile updated successfully.");
        await loadUser();
        setTimeout(() => {
          setEditModalOpen(false);
          setEditSuccess("");
        }, 800);
      } else {
        setEditError(res?.message || "Failed to update profile.");
      }
    } catch (err) {
      setEditError(err.message || "Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleGrantSubmit = async (e) => {
    e.preventDefault();
    setGrantLoading(true);
    setGrantError("");
    setGrantSuccess("");
    try {
      const res = await api.post("/api/superadmin/billing/grant", {
        user_id: user.id,
        plan_code: grantPlanCode,
        duration_months: Number(grantDuration),
        notes: grantNotes.trim() || undefined,
      });
      if (res?.success) {
        setGrantSuccess(`Complimentary subscription successfully granted for ${user.name}!`);
        await loadUser();
        setTimeout(() => {
          setGrantModalOpen(false);
          setGrantSuccess("");
          setGrantNotes("");
        }, 1200);
      } else {
        setGrantError(res?.message || "Failed to grant complimentary subscription.");
      }
    } catch (err) {
      setGrantError(err.response?.data?.message || err.message || "Failed to grant complimentary subscription.");
    } finally {
      setGrantLoading(false);
    }
  };

  const [showReports, setShowReports] = useState(false);
  const [selectedBusinessSection, setSelectedBusinessSection] = useState("");

  const isSuperadmin = currentUser?.role === "superadmin";
  const isEmployee = currentUser?.role === "employee";
  const assigned = Array.isArray(currentUser?.assigned_modules) ? currentUser.assigned_modules : [];

  const canAccessSection = (modId) => {
    if (isSuperadmin) return true;
    if (!isEmployee) return true;
    return assigned.includes("all") || assigned.includes("manage_all") || assigned.includes(modId);
  };

  // Scoped Superadmin Reports State
  const [userReportPeriod, setUserReportPeriod] = useState("this_month");
  const [showUserCustomCalendar, setShowUserCustomCalendar] = useState(false);
  const [userCustomStartDate, setUserCustomStartDate] = useState("");
  const [userCustomEndDate, setUserCustomEndDate] = useState("");
  const [userReportsLoading, setUserReportsLoading] = useState(false);
  const [userReportsData, setUserReportsData] = useState(null);
  const [userRawData, setUserRawData] = useState({ khata: [], payments: [], purchaseBills: [], invoices: [] });
  const [khataFilter, setKhataFilter] = useState("all");

  // Superadmin Drilldown Modal State
  const [userDrilldownOpen, setUserDrilldownOpen] = useState(false);
  const [userDrilldownLoading, setUserDrilldownLoading] = useState(false);
  const [userDrilldownData, setUserDrilldownData] = useState(null);
  const [userActiveMetricLabel, setUserActiveMetricLabel] = useState("");
  const [userActiveMetricSlug, setUserActiveMetricSlug] = useState("");
  const [userExpenseFilterCategory, setUserExpenseFilterCategory] = useState("all");

  const loadUserReports = async (periodId) => {
    try {
      setUserReportsLoading(true);
      const [repRes, overRes, khataRes, payRes, billsRes, invRes, expRes] = await Promise.all([
        api.get(`/api/superadmin/users/${id}/data?type=reports&period=${periodId}`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/overview?period=${periodId}`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=khata`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=payments`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=purchase-bills`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=invoices`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=expenses`).catch(() => null),
      ]);

      const repData = getResponseData(repRes);
      const overData = getResponseData(overRes);
      const khataList = extractRecordsFromResponse(getResponseData(khataRes), "khata");
      const payList = extractRecordsFromResponse(getResponseData(payRes), "payments");
      const billsList = extractRecordsFromResponse(getResponseData(billsRes), "purchase-bills");
      const invList = extractRecordsFromResponse(getResponseData(invRes), "invoices");
      const expList = extractRecordsFromResponse(getResponseData(expRes), "expenses");

      setUserRawData({ khata: khataList, payments: payList, purchaseBills: billsList, invoices: invList, expenses: expList });
      setUserReportsData({
        reports: repData?.reports || overData?.overview?.reports || overData?.reports || null,
        overview: overData?.overview || null,
      });
    } catch (err) {
      console.error("Failed to load user reports:", err);
    } finally {
      setUserReportsLoading(false);
    }
  };

  const userMetrics = useMemo(() => {
    const inPeriod = (dt) => isDateInPeriod(dt, userReportPeriod, userCustomStartDate, userCustomEndDate);

    const periodInvoices = (userRawData.invoices || []).filter((i) =>
      inPeriod(i.invoice_date || i.created_at)
    );
    const invoiceSalesSum = periodInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

    const periodKhataCredits = (userRawData.khata || []).filter((k) => {
      const t = String(k.type || k.entry_type || "").toLowerCase();
      return (t === "credit" || Number(k.credit_amount || 0) > 0) && inPeriod(k.entry_date || k.date || k.created_at);
    });
    const khataCreditSalesSum = periodKhataCredits.reduce((sum, k) => sum + Number(k.amount || k.credit_amount || 0), 0);

    const periodPayments = (userRawData.payments || []).filter((p) =>
      inPeriod(p.payment_date || p.created_at)
    );

    const periodKhataDebits = (userRawData.khata || []).filter((k) => {
      const t = String(k.type || k.entry_type || "").toLowerCase();
      return (t === "debit" || Number(k.debit_amount || 0) > 0) && inPeriod(k.entry_date || k.date || k.created_at);
    });
    const khataDebitsSum = periodKhataDebits.reduce((sum, k) => sum + Number(k.amount || k.debit_amount || 0), 0);

    const paymentExpensesSum = periodPayments
      .filter((p) => {
        if (p.khata_entry_id) return false;
        if (p.purchase_bill_id) return false;
        const cat = (p.payment_category || "").toLowerCase();
        return cat === "paid_by_business" || cat === "paid_out" || cat === "expense";
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const purchasesSum = periodPayments
      .filter((p) => {
        const cat = (p.payment_category || "").toLowerCase();
        return cat === "purchase_bill" || cat === "purchase";
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const purchaseBillsSum = (userRawData.purchaseBills || [])
      .filter((pb) => inPeriod(pb.bill_date || pb.date || pb.created_at))
      .reduce((sum, pb) => sum + Number(pb.total_amount || pb.amount || 0), 0);

    const advRecSum = periodPayments
      .filter((p) => {
        const cat = (p.payment_category || "").toLowerCase();
        return cat === "advance_receivable" || cat === "advance_from_investor";
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const advPaySum = periodPayments
      .filter((p) => (p.payment_category || "").toLowerCase() === "advance_payable")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const cashCreditSales = periodKhataCredits
      .filter((k) => (k.payment_mode || "cash").toLowerCase() === "cash")
      .reduce((sum, k) => sum + Number(k.amount || 0), 0);
    const cashPayments = periodPayments
      .filter((p) => (p.payment_mode || "").toLowerCase() === "cash")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const cashInHandFallback = cashCreditSales + cashPayments;

    const bankCreditSales = periodKhataCredits
      .filter((k) => ["upi", "online", "bank"].includes((k.payment_mode || "").toLowerCase()))
      .reduce((sum, k) => sum + Number(k.amount || 0), 0);
    const bankPayments = periodPayments
      .filter((p) =>
        ["upi", "online", "bank", "cheque", "neft", "rtgs"].includes((p.payment_mode || "").toLowerCase())
      )
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const cashInBankFallback = bankCreditSales + bankPayments;

    const rep = userReportsData?.reports || overview?.reports || {};
    const ov = userReportsData?.overview || overview || {};

    const sales = Number(rep?.total_sales ?? rep?.sales ?? ov?.total_sales ?? (invoiceSalesSum > 0 ? invoiceSalesSum : khataCreditSalesSum));
    const totalExpense = Number(rep?.total_expense ?? rep?.total_expenses ?? rep?.expenses ?? ov?.expenses ?? (paymentExpensesSum + khataDebitsSum + purchasesSum + advPaySum));
    const purchases = Number(rep?.purchases ?? rep?.total_purchases ?? ov?.purchases ?? (purchaseBillsSum > 0 ? purchaseBillsSum : purchasesSum));
    const debitEntries = khataDebitsSum;
    const payOut = paymentExpensesSum;
    const advanceReceivable = Number(rep?.advance_receivable ?? advRecSum);
    const advancePayable = Number(rep?.advance_payable ?? advPaySum);
    const cashInHand = Number(rep?.cash_in_hand ?? cashInHandFallback);
    const cashInBank = Number(rep?.cash_in_bank ?? cashInBankFallback);
    const netProfit = Number(rep?.net_profit ?? ov?.net_profit ?? (sales - totalExpense));

    return {
      sales,
      totalExpense,
      purchases,
      debitEntries,
      payOut,
      advanceReceivable,
      advancePayable,
      cashInHand,
      cashInBank,
      netProfit,
    };
  }, [userRawData, userReportsData, overview, userReportPeriod, userCustomStartDate, userCustomEndDate]);

  const userReportCards = useMemo(() => [
    {
      key: "total-sales",
      title: "Total Sales",
      value: userMetrics.sales,
      icon: IndianRupee,
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      valColor: "text-slate-900",
      subtext: "Total revenue",
    },
    {
      key: "expenses",
      title: "Total Expense",
      value: userMetrics.totalExpense,
      icon: TrendingDown,
      bg: "bg-rose-100",
      text: "text-rose-600",
      valColor: "text-rose-600",
      subtext: "Purchases, debits & pay out",
    },
    {
      key: "purchases",
      title: "Purchases",
      value: userMetrics.purchases,
      icon: Package,
      bg: "bg-amber-100",
      text: "text-amber-600",
      valColor: "text-amber-700",
      subtext: "Stock purchases",
    },
    {
      key: "pay-out",
      title: "Business Pay Out",
      value: userMetrics.payOut,
      icon: ArrowUpRight,
      bg: "bg-orange-100",
      text: "text-orange-600",
      valColor: "text-orange-700",
      subtext: "Direct business payouts",
    },
    {
      key: "advance-receivable",
      title: "Advance Receivable",
      value: userMetrics.advanceReceivable,
      icon: ArrowDownLeft,
      bg: "bg-blue-100",
      text: "text-blue-600",
      valColor: "text-blue-700",
      subtext: "Receipts & advance in",
    },
    {
      key: "advance-payable",
      title: "Advance Payable",
      value: userMetrics.advancePayable,
      icon: ArrowUpRight,
      bg: "bg-purple-100",
      text: "text-purple-600",
      valColor: "text-purple-700",
      subtext: "Payments advance out",
    },
    {
      key: "cash-in-hand",
      title: "Cash in Hand",
      value: userMetrics.cashInHand,
      icon: Wallet,
      bg: "bg-teal-100",
      text: "text-teal-600",
      valColor: "text-teal-700",
      subtext: "Cash transactions",
    },
    {
      key: "cash-in-bank",
      title: "Cash in Bank",
      value: userMetrics.cashInBank,
      icon: Landmark,
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      valColor: "text-indigo-700",
      subtext: "UPI & bank transfers",
    },
    {
      key: "net-profit",
      title: "Net Profit",
      value: userMetrics.netProfit,
      icon: BarChart3,
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      valColor: userMetrics.netProfit < 0 ? "text-red-600" : "text-emerald-600",
      subtext: "Sales − Total Expense",
    },
  ], [userMetrics]);

  const handleOpenUserDrilldown = async (metricSlug, label) => {
    setUserActiveMetricSlug(metricSlug);
    setUserActiveMetricLabel(label);
    setUserExpenseFilterCategory("all");
    setUserDrilldownOpen(true);
    setUserDrilldownLoading(true);
    setUserDrilldownData(null);

    try {
      let url = `/api/superadmin/users/${id}/reports/drilldown/${metricSlug}?period=${userReportPeriod}`;
      if (userReportPeriod === "custom") {
        if (userCustomStartDate) url += `&from=${userCustomStartDate}`;
        if (userCustomEndDate) url += `&to=${userCustomEndDate}`;
      }
      let res = await api.get(url).catch(() => null);
      if (!res) {
        let altUrl = `/api/superadmin/users/${id}/data?type=drilldown&metric=${metricSlug}&period=${userReportPeriod}`;
        if (userReportPeriod === "custom") {
          if (userCustomStartDate) altUrl += `&from=${userCustomStartDate}`;
          if (userCustomEndDate) altUrl += `&to=${userCustomEndDate}`;
        }
        res = await api.get(altUrl).catch(() => null);
      }

      if (res && ((res.transactions && res.transactions.length > 0) || res.count > 0 || res.breakdown)) {
        const taggedTxs = (res.transactions || []).map((t) => {
          let cat = t.structure_category || t.category;
          const src = String(t.source || "").toLowerCase();
          const rawCat = String(cat || "").toLowerCase().replace(/[\s_-]+/g, "");
          if (rawCat.includes("purchase") || src.includes("purchase")) {
            cat = "Purchases";
          } else if (rawCat.includes("debit") || src.includes("debit")) {
            cat = "Debit Entries";
          } else if (rawCat.includes("payout") || rawCat.includes("paidbybusiness") || src.includes("paid_by_business") || src.includes("payout")) {
            cat = "Business Pay Out";
          } else if (rawCat.includes("advancepayable") || src.includes("advance_payable")) {
            cat = "Advance Payable";
          } else if (rawCat.includes("advancereceivable") || src.includes("advance_receivable")) {
            cat = "Advance Receivable";
          } else if (rawCat.includes("moneyreceipt") || src.includes("money_receipt")) {
            cat = "Money Receipt";
          } else if (rawCat.includes("sale") || src.includes("collection") || src.includes("invoice") || src.includes("credit")) {
            cat = "Sales";
          } else if (rawCat.includes("otherexpense") || rawCat.includes("directexpense") || src.includes("expense") || src.includes("direct_expense")) {
            cat = "Other Expenses";
          } else if (!cat) {
            cat = metricSlug === "total-sales" ? "Sales" : "Other Expenses";
          }
          return { ...t, structure_category: cat };
        });
        setUserDrilldownData({ ...res, transactions: taggedTxs });
      } else {
        const fallback = getUserFallbackTransactions(
          metricSlug,
          label,
          userReportPeriod,
          userCustomStartDate,
          userCustomEndDate,
          userRawData
        );
        setUserDrilldownData(fallback);
      }
    } catch {
      const fallback = getUserFallbackTransactions(
        metricSlug,
        label,
        userReportPeriod,
        userCustomStartDate,
        userCustomEndDate,
        userRawData
      );
      setUserDrilldownData(fallback);
    } finally {
      setUserDrilldownLoading(false);
    }
  };

  const filteredUserDrilldownTransactions = useMemo(() => {
    let list = userDrilldownData?.transactions || [];
    if (userActiveMetricSlug === "expenses" || userActiveMetricSlug === "total-expenses") {
      if (userExpenseFilterCategory !== "all") {
        const targetKey = String(userExpenseFilterCategory || "").toLowerCase().replace(/[\s_-]+/g, "");

        list = list.filter((tx) => {
          const catKey = String(tx.structure_category || tx.category || "").toLowerCase().replace(/[\s_-]+/g, "");
          const srcKey = String(tx.source || "").toLowerCase().replace(/[\s_-]+/g, "");

          if (targetKey === "purchases" || targetKey === "purchase") {
            return catKey.includes("purchase") || srcKey.includes("purchase");
          }
          if (targetKey === "debitentries" || targetKey === "debitentry" || targetKey === "debits" || targetKey === "debit") {
            return catKey.includes("debit") || srcKey.includes("debit");
          }
          if (targetKey === "businesspayout" || targetKey === "paidbybusiness" || targetKey === "payout") {
            return catKey.includes("businesspayout") || catKey.includes("paidbybusiness") || srcKey.includes("paidbybusiness") || srcKey.includes("payout");
          }
          if (targetKey === "advancepayable") {
            return catKey.includes("advancepayable") || srcKey.includes("advancepayable");
          }
          if (targetKey === "otherexpenses" || targetKey === "otherexpense" || targetKey === "directexpenses" || targetKey === "directexpense") {
            return catKey.includes("other") || catKey.includes("direct") || catKey.includes("expense") || srcKey.includes("directexpense") || srcKey.includes("expense");
          }
          return catKey.includes(targetKey) || catKey === targetKey;
        });
      }
    }

    return [...list].sort((a, b) => {
      const dateA = a.date || a.created_at || "";
      const dateB = b.date || b.created_at || "";
      const timeA =
        a.time ||
        (a.created_at && String(a.created_at).includes("T")
          ? String(a.created_at).split("T")[1]
          : "") ||
        "00:00:00";
      const timeB =
        b.time ||
        (b.created_at && String(b.created_at).includes("T")
          ? String(b.created_at).split("T")[1]
          : "") ||
        "00:00:00";
      const dtA =
        new Date(`${String(dateA).slice(0, 10)}T${String(timeA).slice(0, 8)}`).getTime() || 0;
      const dtB =
        new Date(`${String(dateB).slice(0, 10)}T${String(timeB).slice(0, 8)}`).getTime() || 0;
      if (dtB !== dtA) return dtB - dtA;
      const rawIdA = Number(String(a.id || "").replace(/\D+/g, "")) || 0;
      const rawIdB = Number(String(b.id || "").replace(/\D+/g, "")) || 0;
      return rawIdB - rawIdA;
    });
  }, [userDrilldownData, userActiveMetricSlug, userExpenseFilterCategory]);

  const actualDebitCount = useMemo(() => {
    const list = userRawData.khata || [];
    const fromKhata = list.filter((k) => {
      const t = String(k.type || k.entry_type || "").toLowerCase();
      return t === "debit" || Number(k.debit_amount || 0) > 0;
    }).length;
    const paymentsList = userRawData.payments || [];
    const fromPayments = paymentsList.filter((p) => {
      const cat = String(p.payment_category || "").toLowerCase();
      return cat === "paid_out" || cat === "paid_by_business" || cat === "expense";
    }).length;
    const countFromData = fromKhata + fromPayments;
    if (countFromData > 0) return countFromData;
    const rep = userReportsData?.reports || overview?.reports || {};
    const serverCount = rep.debit_entries_count ?? rep.debitEntriesCount ?? rep.debit_entries ?? overview?.debit_entries ?? overview?.debit_count;
    if (serverCount !== undefined && serverCount !== null && Number(serverCount) > 0) {
      return Number(serverCount);
    }
    return countFromData || Number(serverCount || 0);
  }, [userRawData.khata, userRawData.payments, overview, userReportsData]);

  const actualCreditCount = useMemo(() => {
    const list = userRawData.khata || [];
    const fromKhata = list.filter((k) => {
      const t = String(k.type || k.entry_type || "").toLowerCase();
      return t === "credit" || Number(k.credit_amount || 0) > 0;
    }).length;
    const invCount = (userRawData.invoices || []).length;
    const countFromData = fromKhata + invCount;
    if (countFromData > 0) return countFromData;
    const rep = userReportsData?.reports || overview?.reports || {};
    const serverCount = rep.credit_entries_count ?? rep.creditEntriesCount ?? rep.credit_entries ?? overview?.credit_entries ?? overview?.credit_count;
    if (serverCount !== undefined && serverCount !== null && Number(serverCount) > 0) {
      return Number(serverCount);
    }
    return countFromData || Number(serverCount || 0);
  }, [userRawData.khata, userRawData.invoices, overview, userReportsData]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");

      const [overRes, khataRes, payRes, billsRes, invRes, billRes] = await Promise.all([
        api.get(`/api/superadmin/users/${id}/overview`),
        api.get(`/api/superadmin/users/${id}/data?type=khata`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=payments`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=purchase-bills`).catch(() => null),
        api.get(`/api/superadmin/users/${id}/data?type=invoices`).catch(() => null),
        api.get(`/api/superadmin/billing/users/${id}`).catch(() => null),
      ]);

      const data = getResponseData(overRes);

      setUser(data.user || null);
      setOverview(data.overview || null);
      if (billRes?.success) {
        setBillingData(billRes);
      }

      const khataList = extractRecordsFromResponse(getResponseData(khataRes), "khata");
      const payList = extractRecordsFromResponse(getResponseData(payRes), "payments");
      const billsList = extractRecordsFromResponse(getResponseData(billsRes), "purchase-bills");
      const invList = extractRecordsFromResponse(getResponseData(invRes), "invoices");

      setUserRawData({
        khata: khataList,
        payments: payList,
        purchaseBills: billsList,
        invoices: invList,
      });
    } catch (err) {
      console.error("Failed to load selected user:", err);
      setError(err.message || "Could not load user.");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSectionChange = (section) => {
    setSelectedBusinessSection(section);
    setRecordSearch("");
    if (section === "khata") {
      setKhataFilter("all");
    }
    if (section === "reports") {
      setActiveType("");
      setRecords([]);
      setRecordsError("");
      setShowReports(true);
      loadUserReports(userReportPeriod);
    } else if (section) {
      setShowReports(false);
      loadRecords(section);
    } else {
      setShowReports(false);
      setActiveType("");
      setRecords([]);
    }
  };

  const handleDeleteCustomer = async (cust) => {
    const custName = cust.name || cust.business_name || `Customer #${cust.id}`;
    if (
      !window.confirm(
        `Are you sure you want to delete ${custName}? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await api.del(`/api/customers/${cust.id}`);
      setSelectedRecord(null);
      setRecords((prev) => prev.filter((r) => r.id !== cust.id));
      loadUser();
    } catch (err) {
      console.error("Failed to delete customer:", err);
      window.alert(err.message || "Failed to delete customer.");
    }
  };

  useEffect(() => {
    // Reset all state when switching to a different user ID to avoid showing stale data
    setUser(null);
    setOverview(null);
    setRecords([]);
    setSelectedRecord(null);
    setSelectedRecordType("");
    setActiveType("");
    setSelectedBusinessSection("");
    setShowReports(false);
    setRecordsError("");
    setError("");
    setRecordSearch("");
    setLogoUrl("");
    setSignatureUrl("");
    setUserReportsData(null);
    setUserRawData({ khata: [], payments: [], invoices: [] });
    setUserReportPeriod("this_month");

    loadUser();
  }, [id]);

  const toggleAccountStatus = async () => {
    if (!user) return;

    const nextStatus = user.status === "active" ? "inactive" : "active";

    try {
      setStatusLoading(true);
      setError("");

      await api.patch(`/api/superadmin/users/${id}/status`, {
        status: nextStatus,
      });

      setUser((current) =>
        current ? { ...current, status: nextStatus } : current
      );
    } catch (err) {
      console.error("Failed to update account status:", err);
      setError(err.message || "Could not update account status.");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let currentLogoUrl = null;
    let currentSignatureUrl = null;

    const loadImages = async () => {
      if (!user) return;

      try {
        if (user.logo_path) {
          currentLogoUrl = await secureFileObjectUrl(user.logo_path, id);

          if (!cancelled) {
            setLogoUrl(currentLogoUrl);
          }
        } else {
          setLogoUrl("");
        }

        if (user.signature_path) {
          currentSignatureUrl = await secureFileObjectUrl(
            user.signature_path,
            id
          );

          if (!cancelled) {
            setSignatureUrl(currentSignatureUrl);
          }
        } else {
          setSignatureUrl("");
        }
      } catch (err) {
        console.error("Failed to load selected user images:", err);

        if (!cancelled) {
          setLogoUrl("");
          setSignatureUrl("");
        }
      }
    };

    loadImages();

    return () => {
      cancelled = true;

      if (currentLogoUrl) {
        URL.revokeObjectURL(currentLogoUrl);
      }

      if (currentSignatureUrl) {
        URL.revokeObjectURL(currentSignatureUrl);
      }
    };
  }, [user, id]);

  const loadRecords = async (type) => {
    try {
      setActiveType(type);
      setRecordsLoading(true);
      setRecordsError("");
      setSelectedRecord(null);

      let response;
      try {
        response = await api.get(
          `/api/superadmin/users/${id}/data?type=${encodeURIComponent(type)}`
        );
      } catch (err) {
        if (type === "inventory") {
          response = await api.get(
            `/api/superadmin/users/${id}/data?type=stock`
          );
        } else if (type === "stock") {
          response = await api.get(
            `/api/superadmin/users/${id}/data?type=inventory`
          );
        } else if (type === "purchase-bills") {
          response = await api.get(
            `/api/superadmin/users/${id}/data?type=purchase_bills`
          );
        } else {
          throw err;
        }
      }

      const data = getResponseData(response);
      let recordsList = extractRecordsFromResponse(data, type);

      if (type === "inventory" && recordsList.length === 0) {
        try {
          const fallbackRes = await api.get(
            `/api/superadmin/users/${id}/data?type=stock`
          );
          const fallbackData = getResponseData(fallbackRes);
          const fallbackList = extractRecordsFromResponse(fallbackData, "stock");
          if (fallbackList.length > 0) {
            recordsList = fallbackList;
          }
        } catch {
          // ignore fallback error
        }
      }

      if ((type === "purchase-bills" || type === "purchase_bills") && recordsList.length === 0) {
        try {
          const fallbackRes = await api.get(
            `/api/superadmin/users/${id}/purchase-bills`
          );
          const fallbackData = getResponseData(fallbackRes);
          const fallbackList = extractRecordsFromResponse(fallbackData, "purchase-bills");
          if (fallbackList.length > 0) {
            recordsList = fallbackList;
          }
        } catch {
          // ignore fallback error
        }
      }

      if (type === "khata" && recordsList.length === 0) {
        try {
          const fallbackRes = await api.get(
            `/api/superadmin/users/${id}/khata`
          );
          const fallbackData = getResponseData(fallbackRes);
          const fallbackList = extractRecordsFromResponse(fallbackData, "khata");
          if (fallbackList.length > 0) {
            recordsList = fallbackList;
          }
        } catch {
          // ignore fallback error
        }
      }

      setRecords(recordsList);
    } catch (err) {
      console.error(`Failed to load ${type}:`, err);
      if (type === "khata" && userRawData.khata?.length) {
        setRecords(userRawData.khata);
      } else if (type === "payments" && userRawData.payments?.length) {
        setRecords(userRawData.payments);
      } else if (type === "purchase-bills" && userRawData.purchaseBills?.length) {
        setRecords(userRawData.purchaseBills);
      } else {
        setRecords([]);
        setRecordsError(err.message || `Could not load ${type}.`);
      }
    } finally {
      setRecordsLoading(false);
    }
  };

  const openRecord = async (type, recordId, rawRecord) => {
    try {
      const sourceParam = rawRecord?.source ? `&source=${encodeURIComponent(rawRecord.source)}` : "";
      const response = await api.get(
        `/api/superadmin/users/${id}/records/${recordId}?type=${encodeURIComponent(
          type
        )}${sourceParam}`
      );

      const data = getResponseData(response);

      setSelectedRecordType(type);
      setSelectedRecord(
        data.record ||
          data.customer ||
          data.stock ||
          data.inventory ||
          data.item ||
          null
      );

      if (type === "customer" && data.customer) {
        setSelectedRecord({
          ...data.customer,
          sales_history: data.sales_history || [],
          due_payments_history: data.due_payments_history || [],
        });
      }
    } catch (err) {
      console.error("Failed to load record:", err);

      setRecordsError(err.message || "Could not load record.");
    }
  };

  const getRecordId = (record, type) => {
    if (type === "quotation") {
      return record.id;
    }

    if (type === "money-receipts") {
      return record.id;
    }

    return record.id;
  };

  const getRecordTypeForDetails = (type) => {
    if (type === "invoices") return "invoice";
    if (type === "quotations") return "quotation";
    if (type === "money-receipts") return "money-receipt";
    if (type === "customers") return "customer";
    if (type === "payments") return "payment";
    if (type === "purchase-bills" || type === "purchase_bills") return "purchase-bill";
    if (type === "expenses") return "expense";
    if (type === "vehicles") return "vehicle";
    if (type === "inventory" || type === "stock") return "stock";
    if (type === "khata") return "khata";
    return type;
  };

  const recordTitle = (record, type) => {
    if (!record) return "Record";

    if (type === "customers") {
      return record.name || record.business_name || "Customer";
    }

    if (type === "khata") {
      return record.name || record.customer_name || record.description || "Khata Entry";
    }

    if (type === "payments") {
      return record.customer_name || record.party_name || "Payment";
    }

    if (type === "invoices") {
      return record.invoice_number || "Invoice";
    }

    if (type === "quotations") {
      return record.quotation_number || "Quotation";
    }

    if (type === "money-receipts") {
      return record.receipt_number || "Money Receipt";
    }

    if (type === "inventory" || type === "stock") {
      return record.product_name || record.name || record.item_name || "Inventory Item";
    }

    if (type === "vehicles") {
      return (
        record.vehicle_number ||
        record.vehicle_no ||
        record.driver_name ||
        "Vehicle Trip"
      );
    }

    if (type === "purchase-bills" || type === "purchase_bills" || type === "purchase-bill" || type === "purchases") {
      return record.bill_number ? `Bill #${record.bill_number}` : record.vendor_name || "Purchase Bill";
    }

    if (type === "billing" || type === "subscriptions") {
      return record.plan_name || (record.order_number ? `Order #${record.order_number}` : "Subscription Plan");
    }

    return record.name || record.title || "Record";
  };

  const recordSubtitle = (record, type) => {
    if (!record) return "";

    if (type === "customers") {
      return record.phone || record.email || record.city || "Customer";
    }

    if (type === "khata") {
      const rawType = getKhataRecordType(record);
      const badge =
        rawType === "debit"
          ? "Debit"
          : rawType === "credit"
            ? "Credit"
            : "Due";
      const desc = record.description || record.customer_name || "";
      const dateStr = formatDate(
        record.date || record.entry_date || record.created_at
      );
      return [badge, desc, dateStr].filter(Boolean).join(" · ");
    }

    if (type === "payments") {
      const cat = String(record.payment_category || record.category || "").toLowerCase();
      const label =
        cat === "normal_received"
          ? "Normal Received"
          : cat === "due_received"
            ? "Due Received"
            : cat === "investor_advance"
              ? "Investor Advance"
              : cat === "paid_out"
                ? "Paid Out"
                : cat === "purchase_bill"
                  ? "Purchase Bill"
                  : displayValue(record.payment_category || record.category || "");
      return `${label} · ${formatDate(
        record.payment_date || record.date || record.created_at
      )}`;
    }

    if (type === "invoices") {
      return `${formatMoney(record.total_amount || record.amount)} · ${formatDate(
        record.invoice_date || record.date || record.created_at
      )}`;
    }

    if (type === "quotations") {
      return `${formatMoney(record.total_amount || record.amount)} · ${formatDate(
        record.quotation_date || record.date || record.created_at
      )}`;
    }

    if (type === "money-receipts") {
      return `${formatMoney(record.amount_received ?? record.amount)} · ${formatDate(
        record.receipt_date || record.date || record.created_at
      )}`;
    }

    if (type === "inventory" || type === "stock") {
      const qty =
        record.quantity !== undefined
          ? record.quantity
          : (record.stock_quantity ?? record.stock ?? 0);
      const unit = record.unit || "";
      const price =
        record.selling_price !== undefined || record.price !== undefined
          ? ` · ${formatMoney(record.selling_price || record.price)}`
          : "";
      return `${displayValue(qty)} ${displayValue(unit, "")}${price}`.trim();
    }

    if (type === "vehicles") {
      return `${record.driver_name ? `${record.driver_name} · ` : ""}${formatDate(
        record.trip_date || record.created_at
      )}`;
    }

    if (type === "purchase-bills" || type === "purchase_bills" || type === "purchase-bill" || type === "purchases") {
      const vendor = record.vendor_name || "Vendor";
      const total = formatMoney(record.total_amount ?? record.amount ?? 0);
      const dateStr = formatDate(record.bill_date || record.created_at);
      const status = Number(record.is_paid) ? "Paid" : "Unpaid";
      return [vendor, total, dateStr, status].filter(Boolean).join(" · ");
    }

    if (type === "billing" || type === "subscriptions") {
      const orderNum = record.order_number ? `Order #${record.order_number}` : "";
      const invNum = record.invoice_number ? `Invoice #${record.invoice_number}` : "";
      const dateStr = formatDate(record.paid_at || record.created_at);
      const status = (record.status || "paid").toUpperCase();
      return [orderNum, invNum, dateStr, status].filter(Boolean).join(" · ");
    }

    return "";
  };

  const renderRecordRows = () => {
    if (recordsLoading) {
      return (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <RefreshCw size={18} className="animate-spin text-emerald-600" />
          Loading records...
        </div>
      );
    }

    if (recordsError) {
      return (
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          <p className="font-semibold">{recordsError}</p>
          <button
            type="button"
            onClick={() => loadRecords(activeType)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </div>
      );
    }

    const query = recordSearch.trim().toLowerCase();

    const filteredRecords = records.filter((record) => {
      if (activeType === "khata" && khataFilter !== "all") {
        const kType = getKhataRecordType(record);
        if (kType !== khataFilter) return false;
      }
      if (!query) return true;

      return [
        recordTitle(record, activeType),
        recordSubtitle(record, activeType),
        record.invoice_number,
        record.quotation_number,
        record.receipt_number,
        record.bill_number,
        record.customer_name,
        record.customer_phone,
        record.customer_email,
        record.party_name,
        record.vendor_name,
        record.name,
        record.product_name,
        record.vehicle_number,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });

    if (!records.length) {
      return (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            No records found.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            This selected user has no {activeType === "inventory" || activeType === "stock" ? "inventory / stock" : activeType.replace("-", " ")} records.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={recordSearch}
              onChange={(event) => setRecordSearch(event.target.value)}
              placeholder={`Search ${activeType === "inventory" || activeType === "stock" ? "inventory / stock" : activeType.replace("-", " ")}...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {activeType === "khata" && (
            <div className="mt-3 flex items-center gap-1.5">
              {[
                { id: "all", label: "All Entries" },
                { id: "credit", label: "Credit" },
                { id: "debit", label: "Debit" },
                { id: "due", label: "Due" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setKhataFilter(f.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    khataFilter === f.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {!filteredRecords.length ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-600">
                No matching {activeType === "khata" && khataFilter !== "all" ? `${khataFilter} ` : ""}records.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {query ? "Try a different search term." : activeType === "khata" && khataFilter !== "all" ? `No ${khataFilter} entries found for this user.` : "No matching records found."}
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={`${record.source || activeType || "record"}-${record.type || record.entry_type || "item"}-${record.id}`}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 transition hover:bg-emerald-50/40"
              >
                <button
                  type="button"
                  onClick={() =>
                    openRecord(
                      getRecordTypeForDetails(activeType),
                      getRecordId(record, activeType),
                      record
                    )
                  }
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {recordTitle(record, activeType)}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {recordSubtitle(record, activeType)}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  {record.amount !== undefined &&
                    ["money-receipts", "khata", "payments", "expenses"].includes(activeType) && (
                      activeType === "khata" ? (
                        (() => {
                          const kType = getKhataRecordType(record);
                          if (kType === "debit") {
                            return (
                              <span className="text-sm font-semibold text-red-600 mr-1">
                                -{formatMoney(record.amount)}
                              </span>
                            );
                          }
                          if (kType === "credit") {
                            return (
                              <span className="text-sm font-semibold text-emerald-600 mr-1">
                                +{formatMoney(record.amount)}
                              </span>
                            );
                          }
                          if (kType === "due") {
                            return (
                              <span className="text-sm font-semibold text-amber-600 mr-1">
                                {formatMoney(record.amount)}
                              </span>
                            );
                          }
                          return (
                            <span className="text-sm font-semibold text-slate-800 mr-1">
                              {formatMoney(record.amount)}
                            </span>
                          );
                        })()
                      ) : activeType === "payments" ? (
                        (() => {
                          const cat = String(record.payment_category || record.category || "").toLowerCase();
                          const isReceived = ["normal_received", "due_received", "investor_advance", "received"].includes(cat);
                          return (
                            <span
                              className={`text-sm font-semibold mr-1 ${
                                isReceived ? "text-emerald-600" : "text-slate-800"
                              }`}
                            >
                              {formatMoney(record.amount)}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-sm font-semibold text-slate-800 mr-1">
                          {formatMoney(record.amount)}
                        </span>
                      )
                    )}

                  {record.total_amount !== undefined &&
                    ["invoices", "quotations", "purchase-bills", "purchase_bills"].includes(activeType) && (
                      <span className="text-sm font-semibold text-slate-800 mr-1">
                        {formatMoney(record.total_amount)}
                      </span>
                    )}

                  {record.total_paise !== undefined &&
                    ["billing", "subscriptions"].includes(activeType) && (
                      <span className="text-sm font-semibold text-emerald-600 mr-1">
                        {formatMoney(record.total_paise / 100)}
                      </span>
                    )}

                  {(record.selling_price !== undefined || record.price !== undefined) &&
                    (activeType === "inventory" || activeType === "stock") && (
                      <span className="text-sm font-semibold text-slate-800 mr-1">
                        {formatMoney(record.selling_price || record.price)}
                      </span>
                    )}

                  {activeType === "customers" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomer(record);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Delete Customer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      openRecord(
                        getRecordTypeForDetails(activeType),
                        getRecordId(record, activeType),
                        record
                      )
                    }
                    className="rounded-lg p-1 text-slate-400 hover:text-emerald-600"
                    title="View details"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          Showing {filteredRecords.length.toLocaleString("en-IN")} of{" "}
          {records.length.toLocaleString("en-IN")} records
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw size={18} className="animate-spin" />
          Loading user profile...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/my-users")}
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Back to My Users
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "User not found."}
        </div>
      </div>
    );
  }

  const financialCards = [
    {
      title: "Net Credit",
      value: formatMoney(overview?.net_credit),
      icon: CreditCard,
    },
    {
      title: "Debit",
      value: formatMoney(overview?.debit),
      icon: Receipt,
    },
    {
      title: "Used Credits",
      value: formatMoney(overview?.used_credits),
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-5 pb-8 lg:pl-64">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/my-users")}
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Back to My Users
        </button>

        <button
          type="button"
          onClick={loadUser}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(330px,390px)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => logoUrl && setShowLogo(true)}
                disabled={!logoUrl}
                aria-label={logoUrl ? "View business logo" : "No business logo available"}
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-default"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Business logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 size={32} className="text-slate-400" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="break-words text-xl font-bold text-slate-800">
                  {user.name || "Unnamed User"}
                </h1>

                <p className="mt-1 text-sm font-medium text-emerald-600">
                  Business Owner
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Account #{user.id}
                </p>

                {signatureUrl && (
                  <button
                    type="button"
                    onClick={() => setShowSignature(true)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <Eye size={15} />
                    View Signature
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Account Created
                </span>
                <span className="text-right text-xs font-medium text-slate-700">
                  {formatDateTime(user.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Current Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {user.status || "active"}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              {isSuperadmin && (
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-left transition hover:bg-emerald-100/80"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Pencil size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-emerald-800">
                        Edit Profile
                      </span>
                      <span className="block text-xs text-emerald-700/80">
                        Update name, phone, business, GSTIN and contact details.
                      </span>
                    </span>
                  </span>
                </button>
              )}

              {user.status === "active" ? (
                <button
                  type="button"
                  onClick={toggleAccountStatus}
                  disabled={statusLoading}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <UserRound size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-red-700">
                        {statusLoading ? "Deactivating..." : "Deactivate Account"}
                      </span>
                      <span className="block text-xs text-red-600/80">
                        Disable this user's access without deleting their data.
                      </span>
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleAccountStatus}
                  disabled={statusLoading}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <UserRound size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-emerald-700">
                        {statusLoading ? "Reactivating..." : "Reactivate Account"}
                      </span>
                      <span className="block text-xs text-emerald-600/80">
                        Restore this user's access.
                      </span>
                    </span>
                  </span>
                </button>
              )}

              {currentUser?.role === "superadmin" && (
                <button
                  type="button"
                  onClick={() => {
                    setGrantError("");
                    setGrantSuccess("");
                    setGrantModalOpen(true);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-left transition hover:bg-purple-100"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                      <Sparkles size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-purple-900">
                        Grant Complimentary Subscription
                      </span>
                      <span className="block text-xs text-purple-700/80">
                        Provide a free subscription term to this user without payment.
                      </span>
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-purple-400" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-left transition hover:bg-red-50 hover:border-red-300"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <Trash2 size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-red-700">
                      Delete User Account
                    </span>
                    <span className="block text-xs text-slate-500">
                      Permanently delete empty user or safely deactivate if records exist.
                    </span>
                  </span>
                </span>
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    if (user.email) {
                      window.location.href = `mailto:${user.email}`;
                    }
                  }}
                  disabled={!user.email}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mail size={17} />
                  Send Email
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (user.phone) {
                      const phone = String(user.phone).replace(/[^0-9+]/g, "");
                      window.open(`https://wa.me/${phone.replace(/^\+/, "")}`, "_blank");
                    }
                  }}
                  disabled={!user.phone}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCircle size={17} />
                  Send WhatsApp
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Subscription
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Plan and validity details
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {(user?.subscription || billingData?.user?.subscription)?.is_complimentary ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                        <Sparkles size={11} />
                        Complimentary
                      </span>
                    ) : null}
                    {(user?.subscription || billingData?.user?.subscription)?.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (user?.subscription || billingData?.user?.subscription)?.status === "expired" ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        No Subscription
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Plan</span>
                    <span className="font-semibold text-slate-900">
                      {(user?.subscription || billingData?.user?.subscription)?.plan_name || "—"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">
                      {(user?.subscription || billingData?.user?.subscription)?.status === "active" ? "Remaining" : "Ends"}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {(user?.subscription || billingData?.user?.subscription)?.status === "active"
                        ? `${(user?.subscription || billingData?.user?.subscription)?.remaining_days ?? 0}d left`
                        : (user?.subscription || billingData?.user?.subscription)?.ends_at
                        ? formatDate((user?.subscription || billingData?.user?.subscription)?.ends_at)
                        : "—"}
                    </span>
                  </div>
                </div>

                {(user?.subscription || billingData?.user?.subscription)?.starts_at && (
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-100">
                    <span>Started: {formatDate((user?.subscription || billingData?.user?.subscription)?.starts_at)}</span>
                    <span>Valid until: {formatDate((user?.subscription || billingData?.user?.subscription)?.ends_at)}</span>
                  </div>
                )}

                {currentUser?.role === "superadmin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setGrantError("");
                      setGrantSuccess("");
                      setGrantModalOpen(true);
                    }}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5 text-xs font-bold shadow-xs transition"
                  >
                    <Sparkles size={14} />
                    <span>Grant Complimentary Subscription</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <Section title="Personal Information">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone} />
            </div>
          </Section>

          <Section title="Business Information">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <InfoRow label="Business Name" value={user.business_name} />
              <InfoRow label="Business Type" value={user.business_type} />
              <InfoRow label="GSTIN" value={user.gstin} />
              <InfoRow label="PAN" value={user.pan} />
              <InfoRow label="Website" value={user.website} />
            </div>
          </Section>

          <Section title="Business Address">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <InfoRow label="Address Line 1" value={user.address_line1} />
              <InfoRow label="Address Line 2" value={user.address_line2} />
              <InfoRow label="City" value={user.city} />
              <InfoRow label="State" value={user.state} />
              <InfoRow label="PIN Code" value={user.pincode} />
              <InfoRow label="Country" value={user.country || "India"} />
            </div>
          </Section>

          <Section title="Other Settings">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <InfoRow label="Currency" value={user.currency || "INR"} />
              <InfoRow label="Tax Type" value={user.tax_type || "standard"} />
              <InfoRow
                label="TCS"
                value={user.tcs_enabled ? "Enabled" : "Disabled"}
              />
              <InfoRow
                label="TDS"
                value={user.tds_enabled ? "Enabled" : "Disabled"}
              />
              <InfoRow label="Payment Terms" value={user.payment_terms} />
            </div>
          </Section>

          {/* Complimentary Grant History */}
          <Section title="Complimentary Grant History">
            {(!user?.grant_history?.length && !billingData?.grantHistory?.length) ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No complimentary subscriptions granted yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">Date</th>
                      <th className="py-2 px-2.5">Plan / Duration</th>
                      <th className="py-2 px-2.5">Granted By</th>
                      <th className="py-2 px-2.5">Reason / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(user?.grant_history || billingData?.grantHistory || []).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-2.5 text-slate-700 whitespace-nowrap">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                          {item.plan_name}
                          <span className="ml-1 text-[11px] font-normal text-slate-500">
                            ({item.duration_months} mo)
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="font-medium text-slate-800 block">
                            {item.granted_by_name || "Superadmin"}
                          </span>
                          {item.granted_by_email && (
                            <span className="text-[10px] text-slate-400 block">
                              {item.granted_by_email}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-600 max-w-xs truncate">
                          {item.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {billingData?.orders?.length > 0 && (
            <Section title="Subscription Orders History">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">Order</th>
                      <th className="py-2 px-2.5">Plan</th>
                      <th className="py-2 px-2.5">Amount</th>
                      <th className="py-2 px-2.5">Status</th>
                      <th className="py-2 px-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billingData.orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="py-2 px-2.5 font-mono text-slate-700">{ord.order_number || `#${ord.id}`}</td>
                        <td className="py-2 px-2.5 font-medium text-slate-800">{ord.plan_name || ord.plan_code || "Plan"}</td>
                        <td className="py-2 px-2.5 font-semibold text-slate-900">₹{((ord.amount_paise || 0) / 100).toFixed(2)}</td>
                        <td className="py-2 px-2.5">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            ord.status === "completed" || ord.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-500">{formatDate(ord.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Financial Overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Financial activity belonging to this user account.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {financialCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon size={20} />
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-1 break-words text-xl font-bold text-slate-800">
                      {card.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-slate-800">Documents</h2>
              <p className="mt-1 text-xs text-slate-500">
                Open this user's actual documents and generated PDFs.
              </p>
            </div>

            <div className="space-y-4">
              {canAccessSection("invoices") && (
                <div>
                  <ActivityCard
                    title="Invoices"
                    count={overview?.invoice_count}
                    icon={FileText}
                    description="View invoices"
                    onClick={() => {
                      setRecordSearch("");
                      loadRecords("invoices");
                    }}
                  />

                  {activeType === "invoices" && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-200 bg-white">
                      {renderRecordRows()}
                    </div>
                  )}
                </div>
              )}

              {canAccessSection("quotations") && (
                <div>
                  <ActivityCard
                    title="Quotations"
                    count={overview?.quotation_count}
                    icon={FileText}
                    description="View quotations"
                    onClick={() => {
                      setRecordSearch("");
                      loadRecords("quotations");
                    }}
                  />

                  {activeType === "quotations" && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-200 bg-white">
                      {renderRecordRows()}
                    </div>
                  )}
                </div>
              )}

              {(canAccessSection("receipts") || canAccessSection("invoices")) && (
                <div>
                  <ActivityCard
                    title="Money Receipts"
                    count={overview?.money_receipt_count}
                    icon={Receipt}
                    description="View receipts"
                    onClick={() => {
                      setRecordSearch("");
                      loadRecords("money-receipts");
                    }}
                  />

                  {activeType === "money-receipts" && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-200 bg-white">
                      {renderRecordRows()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Business Data
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Browse records belonging only to this selected user.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 shrink-0">
                  Select Section:
                </label>
                <select
                  value={selectedBusinessSection}
                  onChange={(e) => handleBusinessSectionChange(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">-- Choose Business Section --</option>
                  {canAccessSection("customers") && (
                    <option value="customers">Customers ({overview?.customer_count || 0})</option>
                  )}
                  {canAccessSection("khata") && (
                    <option value="khata">Khata (Credit / Debit / Due) ({userRawData.khata?.length || Number(overview?.khata_count || 0)})</option>
                  )}
                  {canAccessSection("payments") && (
                    <option value="payments">Payments ({userRawData.payments?.length || overview?.payment_count || 0})</option>
                  )}
                  {canAccessSection("inventory") && (
                    <option value="purchase-bills">Purchase Bills ({userRawData.purchaseBills?.length || overview?.purchase_bill_count || 0})</option>
                  )}
                  {canAccessSection("reports") && (
                    <option value="reports">Reports (Sales, Expenses & Profit)</option>
                  )}
                  {canAccessSection("inventory") && (
                    <option value="inventory">Inventory / Stock ({overview?.stock_count || 0})</option>
                  )}
                  {canAccessSection("vehicles") && (
                    <option value="vehicles">Vehicles ({overview?.vehicle_trip_count || 0})</option>
                  )}
                  {canAccessSection("billing") && (
                    <option value="billing">Billing & Subscriptions</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {canAccessSection("customers") && (
                <ActivityCard
                  title="Customers"
                  count={overview?.customer_count}
                  icon={Users}
                  description="Customer accounts"
                  onClick={() => handleBusinessSectionChange("customers")}
                />
              )}

              {canAccessSection("khata") && (
                <ActivityCard
                  title="Khata (Credit / Debit / Due)"
                  count={userRawData.khata?.length || Number(overview?.khata_count || 0)}
                  icon={BookOpen}
                  description="Credit, debit & due entries"
                  onClick={() => handleBusinessSectionChange("khata")}
                />
              )}

              {canAccessSection("payments") && (
                <ActivityCard
                  title="Payments"
                  count={userRawData.payments?.length || overview?.payment_count}
                  icon={Receipt}
                  description="Customer & vendor payments"
                  onClick={() => handleBusinessSectionChange("payments")}
                />
              )}

              {canAccessSection("inventory") && (
                <ActivityCard
                  title="Purchase Bills"
                  count={userRawData.purchaseBills?.length || overview?.purchase_bill_count}
                  icon={Package}
                  description="Purchase bills & stock vouchers"
                  onClick={() => handleBusinessSectionChange("purchase-bills")}
                />
              )}

              {canAccessSection("reports") && (
                <ActivityCard
                  title="Reports"
                  count={null}
                  icon={BarChart3}
                  description="Business performance & drilldowns"
                  showCount={false}
                  onClick={() => handleBusinessSectionChange("reports")}
                />
              )}

              {canAccessSection("inventory") && (
                <ActivityCard
                  title="Inventory / Stock"
                  count={overview?.stock_count}
                  icon={Package}
                  description="Stock items & catalog"
                  onClick={() => handleBusinessSectionChange("inventory")}
                />
              )}

              {canAccessSection("vehicles") && (
                <ActivityCard
                  title="Vehicles"
                  count={overview?.vehicle_trip_count}
                  icon={Truck}
                  description="Vehicle trips & log"
                  onClick={() => handleBusinessSectionChange("vehicles")}
                />
              )}

              {canAccessSection("billing") && (
                <ActivityCard
                  title="Billing & Subscriptions"
                  count={null}
                  icon={CreditCard}
                  description="Plans, orders & tax invoices"
                  showCount={false}
                  onClick={() => handleBusinessSectionChange("billing")}
                />
              )}
            </div>

            {["customers", "khata", "payments", "purchase-bills", "purchase_bills", "inventory", "stock", "vehicles", "billing", "subscriptions"].includes(activeType) && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 capitalize">
                      {activeType === "inventory" || activeType === "stock" ? "Inventory / Stock" : activeType} Records
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {records.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveType("");
                      setSelectedBusinessSection("");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>
                {renderRecordRows()}
              </div>
            )}

            {showReports && (
              <section className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Reports
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Understand your business performance
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReports(false);
                      setSelectedBusinessSection("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                  >
                    <X size={15} />
                    Close
                  </button>
                </div>

                {/* Period Controls Header */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">Filter Period:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {USER_REPORT_PERIODS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setUserReportPeriod(opt.id);
                          loadUserReports(opt.id);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          userReportPeriod === opt.id
                            ? "bg-slate-900 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setShowUserCustomCalendar(!showUserCustomCalendar)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                        userReportPeriod === "custom" || showUserCustomCalendar
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                      title="Custom date range"
                    >
                      <Calendar size={13} />
                    </button>

                    {showUserCustomCalendar && (
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 shadow-sm">
                        <input
                          type="date"
                          value={userCustomStartDate}
                          onChange={(e) => {
                            setUserCustomStartDate(e.target.value);
                            setUserReportPeriod("custom");
                            loadUserReports("custom");
                          }}
                          className="text-xs text-slate-700 outline-none"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                          type="date"
                          value={userCustomEndDate}
                          onChange={(e) => {
                            setUserCustomEndDate(e.target.value);
                            setUserReportPeriod("custom");
                            loadUserReports("custom");
                          }}
                          className="text-xs text-slate-700 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {userReportsLoading ? (
                  <div className="py-12 text-center text-sm font-medium text-slate-500">
                    Loading reports for {user?.name || "selected user"}...
                  </div>
                ) : (
                  <>
                    {/* ALL 9 METRIC CARDS WITH DRILLDOWN */}
                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                      {userReportCards.map((card) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={card.key}
                            onClick={() => handleOpenUserDrilldown(card.key, card.title)}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleOpenUserDrilldown(card.key, card.title);
                              }
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`shrink-0 rounded-xl p-2 sm:p-2.5 ${card.bg} ${card.text}`}>
                                <Icon size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-600 truncate">
                                  {card.title}
                                </p>
                                <p
                                  className={`mt-0.5 text-base sm:text-lg font-bold truncate ${card.valColor}`}
                                  title={formatMoney(card.value)}
                                >
                                  {formatMoney(card.value)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2.5 sm:mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-400 group-hover:text-emerald-600 transition">
                              <span className="truncate pr-1">{card.subtext || "Click to drilldown"}</span>
                              <span className="font-bold shrink-0">→</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* SALES VS TOTAL EXPENSE COMPARATIVE GRAPH (AGGREGATE FOR SELECTED PERIOD) */}
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-800">
                            Sales vs Total Expense
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            Aggregate comparison for the selected period
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-emerald-700">
                            <span className="h-3 w-3 rounded-md bg-emerald-500" /> Sales: {formatMoney(userMetrics.sales)}
                          </span>
                          <span className="flex items-center gap-1.5 text-rose-700">
                            <span className="h-3 w-3 rounded-md bg-rose-500" /> Total Expense: {formatMoney(userMetrics.totalExpense)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-5">
                        {(() => {
                          const maxVal = Math.max(userMetrics.sales, userMetrics.totalExpense, 1);
                          const salesPct = Math.round((userMetrics.sales / maxVal) * 100);
                          const expPct = Math.round((userMetrics.totalExpense / maxVal) * 100);
                          const netDiff = userMetrics.sales - userMetrics.totalExpense;

                          return (
                            <div className="space-y-4">
                              {/* Comparative Bars */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span className="text-slate-700">Total Sales</span>
                                  <span className="text-emerald-600 font-bold">{formatMoney(userMetrics.sales)}</span>
                                </div>
                                <div className="h-5 w-full overflow-hidden rounded-xl bg-slate-100">
                                  <div
                                    className="h-full rounded-xl bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${Math.max(userMetrics.sales > 0 ? 3 : 0, salesPct)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span className="text-slate-700">Total Expense</span>
                                  <span className="text-rose-600 font-bold">{formatMoney(userMetrics.totalExpense)}</span>
                                </div>
                                <div className="h-5 w-full overflow-hidden rounded-xl bg-slate-100">
                                  <div
                                    className="h-full rounded-xl bg-rose-500 transition-all duration-500"
                                    style={{ width: `${Math.max(userMetrics.totalExpense > 0 ? 3 : 0, expPct)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
                                <div>
                                  <span className="text-slate-500">Period Result: </span>
                                  <span className={`font-bold ${netDiff >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                                    {netDiff >= 0 ? "Net Profit" : "Net Loss"} of {formatMoney(Math.abs(netDiff))}
                                  </span>
                                </div>
                                <div className="text-slate-400">
                                  Expense Ratio: {userMetrics.sales > 0 ? `${Math.round((userMetrics.totalExpense / userMetrics.sales) * 100)}%` : "N/A"}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-5">
                  <h3 className="mb-3 text-base font-bold text-slate-800">
                    Business Summary
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReports(false);
                        setRecordSearch("");
                        setKhataFilter("credit");
                        loadRecords("khata");
                      }}
                      className="overflow-hidden min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <p className="text-xs text-slate-500 truncate">Credit Entries</p>
                      <p className="mt-1 text-xl font-bold text-emerald-600 truncate" title={actualCreditCount.toLocaleString("en-IN")}>
                        {actualCreditCount.toLocaleString("en-IN")}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowReports(false);
                        setRecordSearch("");
                        setKhataFilter("debit");
                        loadRecords("khata");
                      }}
                      className="overflow-hidden min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-red-300 hover:bg-red-50"
                    >
                      <p className="text-xs text-slate-500 truncate">Debit Entries</p>
                      <p className="mt-1 text-xl font-bold text-red-600 truncate" title={actualDebitCount.toLocaleString("en-IN")}>
                        {actualDebitCount.toLocaleString("en-IN")}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowReports(false);
                        setRecordSearch("");
                        loadRecords("customers");
                      }}
                      className="overflow-hidden min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <p className="text-xs text-slate-500 truncate">Total Customers</p>
                      <p className="mt-1 text-xl font-bold text-slate-800 truncate" title={Number(overview?.customer_count || 0).toLocaleString("en-IN")}>
                        {Number(overview?.customer_count || 0).toLocaleString("en-IN")}
                      </p>
                    </button>
                  </div>
                </div>
              </section>
            )}
          </section>

        </div>
      </div>

      {showLogo && logoUrl && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setShowLogo(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Business Logo
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {user.business_name || user.name || "Selected User"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLogo(false)}
                aria-label="Close logo preview"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex min-h-[320px] items-center justify-center overflow-auto bg-slate-50 p-6">
              <img
                src={logoUrl}
                alt="Business logo enlarged"
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {showSignature && signatureUrl && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Authorized Signature
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Read-only signature preview
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSignature(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close signature preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex min-h-[260px] items-center justify-center bg-slate-50 p-8">
              <img
                src={signatureUrl}
                alt="Authorized signature"
                className="max-h-[300px] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {selectedRecord && selectedRecordType && (
        <RecordModal
          record={selectedRecord}
          type={selectedRecordType}
          userId={id}
          onClose={() => {
            setSelectedRecord(null);
            setSelectedRecordType("");
          }}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {userDrilldownOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setUserDrilldownOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {userActiveMetricLabel} Drill-Down
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {user?.business_name || user?.name || "Selected User"} · Detailed transaction breakdown
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserDrilldownOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {userDrilldownLoading ? (
                <div className="py-12 text-center text-sm font-medium text-slate-400">
                  Loading {userActiveMetricLabel} transactions...
                </div>
              ) : (
                <>
                  {/* Header summary */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div>
                      <p className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                        Total Amount
                      </p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">
                        {formatMoney(
                          userDrilldownData?.total_amount ??
                            userDrilldownData?.net_profit ??
                            0
                        )}
                      </p>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {filteredUserDrilldownTransactions.length} Transactions
                    </div>
                  </div>

                  {/* Total Expense Breakdown & Categories */}
                  {(userActiveMetricSlug === "expenses" || userActiveMetricSlug === "total-expenses") && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Expense Breakdown
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {(() => {
                          const allTxs = userDrilldownData?.transactions || [];
                          const getSubtotal = (catName) => {
                            const targetKey = String(catName || "").toLowerCase().replace(/[\s_-]+/g, "");
                            return allTxs
                              .filter((tx) => {
                                const catKey = String(tx.structure_category || tx.category || "").toLowerCase().replace(/[\s_-]+/g, "");
                                const srcKey = String(tx.source || "").toLowerCase().replace(/[\s_-]+/g, "");
                                if (targetKey === "purchases" || targetKey === "purchase") {
                                  return catKey.includes("purchase") || srcKey.includes("purchase");
                                }
                                if (targetKey === "debitentries" || targetKey === "debitentry" || targetKey === "debits" || targetKey === "debit") {
                                  return catKey.includes("debit") || srcKey.includes("debit");
                                }
                                if (targetKey === "businesspayout" || targetKey === "paidbybusiness" || targetKey === "payout") {
                                  return catKey.includes("businesspayout") || catKey.includes("paidbybusiness") || srcKey.includes("paidbybusiness") || srcKey.includes("payout");
                                }
                                if (targetKey === "advancepayable") {
                                  return catKey.includes("advancepayable") || srcKey.includes("advancepayable");
                                }
                                if (targetKey === "otherexpenses" || targetKey === "otherexpense" || targetKey === "directexpenses" || targetKey === "directexpense") {
                                  return catKey.includes("other") || catKey.includes("direct") || catKey.includes("expense") || srcKey.includes("directexpense") || srcKey.includes("expense");
                                }
                                return catKey.includes(targetKey) || catKey === targetKey;
                              })
                              .reduce((s, tx) => s + Number(tx.amount || tx.total_amount || 0), 0);
                          };

                          return [
                            { label: "Purchases", amount: getSubtotal("Purchases") },
                            { label: "Debit Entries", amount: getSubtotal("Debit Entries") },
                            { label: "Business Pay Out", amount: getSubtotal("Business Pay Out") },
                            { label: "Advance Payable", amount: getSubtotal("Advance Payable") },
                            { label: "Other Expenses", amount: getSubtotal("Other Expenses") },
                          ].map((item) => (
                            <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                              <p className="text-[11px] text-slate-500">{item.label}</p>
                              <p className="font-bold text-slate-800">{formatMoney(item.amount)}</p>
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Filter by Category:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {USER_EXPENSE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setUserExpenseFilterCategory(cat.id)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                userExpenseFilterCategory === cat.id
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Profit Summary */}
                  {userActiveMetricSlug === "net-profit" && userDrilldownData?.breakdown && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Profit &amp; Loss Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-600">Total Sales:</span>
                          <span className="font-semibold text-emerald-600">
                            {formatMoney(userDrilldownData.total_sales)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-600">Total Expense:</span>
                          <span className="font-semibold text-rose-600">
                            {formatMoney(userDrilldownData.total_expenses)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-600">Direct Expenses:</span>
                          <span className="font-medium text-slate-700">
                            {formatMoney(userDrilldownData.breakdown.directExpenses)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-600">Khata Debits:</span>
                          <span className="font-medium text-slate-700">
                            {formatMoney(userDrilldownData.breakdown.khataDebits)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-600">Business Payouts:</span>
                          <span className="font-medium text-slate-700">
                            {formatMoney(userDrilldownData.breakdown.unlinkedBusinessPayouts)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-600">Advance Payable:</span>
                          <span className="font-medium text-slate-700">
                            {formatMoney(userDrilldownData.breakdown.advancePayable)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                        <span className="text-slate-800">Net Profit / (Loss):</span>
                        <span
                          className={
                            userDrilldownData.net_profit < 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }
                        >
                          {formatMoney(userDrilldownData.net_profit)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Transactions list */}
                  <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
                    {filteredUserDrilldownTransactions.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-400">
                        No transactions recorded for this metric in the selected period.
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Date &amp; Time</th>
                            <th className="px-4 py-3">Party</th>
                            <th className="px-4 py-3">Description / Purpose</th>
                            <th className="px-4 py-3">Mode</th>
                            <th className="px-4 py-3">Category / Source</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredUserDrilldownTransactions.map((tx, idx) => (
                            <tr key={`${tx.source || tx.structure_category || tx.category || "tx"}-${tx.id ?? idx}`} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                <div className="font-medium text-slate-700">
                                  {formatTxDate(tx)}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {formatTxTime(tx)}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                <div>
                                  {tx.party ||
                                    tx.party_name ||
                                    tx.customer_name ||
                                    tx.vendor_name ||
                                    tx.customer ||
                                    tx.name ||
                                    "Walk-in / General"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600">
                                {tx.description ||
                                  tx.purpose ||
                                  tx.category ||
                                  tx.notes ||
                                  tx.item_name ||
                                  "—"}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium capitalize text-slate-700">
                                  {tx.payment_mode ||
                                    tx.mode ||
                                    "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                  {tx.structure_category ||
                                    tx.category ||
                                    String(tx.source || "—").replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                                {formatMoney(tx.amount || tx.total_amount || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={deleteModalOpen}
        user={user}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={(res) => {
          alert(res.message || "User account updated successfully.");
          navigate("/my-users");
        }}
      />

      {/* Edit User Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit User Details</h3>
                <p className="text-xs text-slate-500">Update account #{user.id} profile and business data</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
                {editError}
              </div>
            )}
            {editSuccess && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Retail, Service"
                    value={editForm.business_type}
                    onChange={(e) => setEditForm({ ...editForm, business_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editForm.gstin}
                    onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PAN</label>
                  <input
                    type="text"
                    value={editForm.pan}
                    onChange={(e) => setEditForm({ ...editForm, pan: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editForm.pincode}
                    onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Complimentary Subscription Modal */}
      {grantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Grant Complimentary Subscription
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Provide a free subscription term to this user
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGrantModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {grantError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{grantError}</span>
              </div>
            )}
            {grantSuccess && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{grantSuccess}</span>
              </div>
            )}

            <form onSubmit={handleGrantSubmit} className="mt-4 space-y-4 text-xs">
              {/* Target User Summary Card */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200 dark:border-slate-700/50 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Account</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</span>
                  <span className="text-slate-500 font-mono">#{user.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 pt-1 text-[11px]">
                  <div>Email: <span className="font-medium text-slate-800 dark:text-slate-200">{user.email || "—"}</span></div>
                  <div>Business: <span className="font-medium text-slate-800 dark:text-slate-200">{user.business_name || "—"}</span></div>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                  <span>Current Subscription:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {user?.subscription?.status || "None"} {user?.subscription?.plan_name ? `(${user.subscription.plan_name})` : ""}
                  </span>
                </div>
              </div>

              {/* Select Subscription Plan */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Select Subscription Plan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "monthly", name: "Monthly Plan", defaultDuration: 1 },
                    { code: "six_months", name: "6 Months", defaultDuration: 6 },
                    { code: "yearly", name: "1 Year", defaultDuration: 13 },
                  ].map((p) => {
                    const isSelected = grantPlanCode === p.code;
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          setGrantPlanCode(p.code);
                          setGrantDuration(p.defaultDuration);
                        }}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-purple-300 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <p className={`font-bold ${isSelected ? "text-purple-900 dark:text-purple-200" : "text-slate-800 dark:text-slate-200"}`}>
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Default: {p.defaultDuration} mo
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Choose Subscription Duration */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Subscription Duration <span className="text-rose-500">*</span>
                </label>
                <select
                  value={grantDuration}
                  onChange={(e) => setGrantDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={13}>13 Months (Yearly + 1 Mo Free)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Duration supported by the platform subscription model.
                </p>
              </div>

              {/* Optional Admin Reason / Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Reason / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="e.g., Customer courtesy, promotional partner, annual beta trial"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Review & Calculations Summary */}
              {(() => {
                const currentEndsAt = user?.subscription?.ends_at ? new Date(user.subscription.ends_at) : null;
                const isCurrentlyActive = user?.subscription?.status === "active" && currentEndsAt && currentEndsAt > new Date();
                const startDate = isCurrentlyActive ? currentEndsAt : new Date();
                const expiryDate = new Date(startDate);
                expiryDate.setMonth(expiryDate.getMonth() + Number(grantDuration));

                return (
                  <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-3.5 space-y-2">
                    <p className="text-[11px] font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-purple-600" />
                      Grant Review & Confirmation
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Effective Start:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(startDate)} {isCurrentlyActive ? "(Extends active)" : "(Immediate)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">New Expiry Date:</span>
                        <span className="font-semibold text-purple-700 dark:text-purple-300">
                          {formatDate(expiryDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Duration:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {grantDuration} Month{grantDuration > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Charged Amount:</span>
                        <span className="font-bold text-emerald-600">
                          ₹0.00 (Complimentary)
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-purple-100 dark:border-purple-900/40">
                      No payment gateway transaction will be initiated. Subscription will activate immediately and record an administrative audit entry.
                    </p>
                  </div>
                );
              })()}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGrantModalOpen(false)}
                  disabled={grantLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                >
                  {grantLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>{grantLoading ? "Granting..." : "Confirm & Grant Subscription"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyUserDetails;
