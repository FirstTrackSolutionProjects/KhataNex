import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  TrendingDown,
  IndianRupee,
  Calendar,
  Wallet,
  Landmark,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Download,
  Printer,
  RefreshCw,
  ShieldCheck,
  Tag,
  DollarSign,
  Search,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import api, { getToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const PERIOD_OPTIONS = [
  { id: "today", label: "Today", months: 1 },
  { id: "this_week", label: "This Week", months: 1 },
  { id: "this_month", label: "This Month", months: 1 },
  { id: "this_year", label: "This Year", months: 12 },
  { id: "last_6_months", label: "6M", months: 6 },
  { id: "last_12_months", label: "12M", months: 12 },
];

const METRIC_LABELS = {
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

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("this_month");
  const [months, setMonths] = useState(1);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [profitLoss, setProfitLoss] = useState(null);
  const [trend, setTrend] = useState([]);
  const [khataEntries, setKhataEntries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Drilldown Modal State
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownData, setDrilldownData] = useState(null);
  const [drilldownError, setDrilldownError] = useState("");
  const [activeMetricLabel, setActiveMetricLabel] = useState("");
  const [activeMetricSlug, setActiveMetricSlug] = useState("");
  const [expenseFilterCategory, setExpenseFilterCategory] = useState("all");

  const urlMetricHandledRef = useRef(false);

  const { user } = useAuth();
  const [activeReportTab, setActiveReportTab] = useState("accounting"); // "accounting" | "subscriptions"

  // Subscriptions Report State (Superadmin)
  const [subReportPeriod, setSubReportPeriod] = useState("this_month");
  const [subReportStatus, setSubReportStatus] = useState("paid");
  const [subReportSearch, setSubReportSearch] = useState("");
  const [subReportPlan, setSubReportPlan] = useState("");
  const [subReportPage, setSubReportPage] = useState(1);
  const [subReportData, setSubReportData] = useState({ metrics: {}, pagination: {}, rows: [] });
  const [subReportLoading, setSubReportLoading] = useState(false);
  const [subReportError, setSubReportError] = useState("");
  const [selectedSubOrder, setSelectedSubOrder] = useState(null);

  const loadSubscriptionReports = async (page = 1) => {
    setSubReportLoading(true);
    setSubReportError("");
    try {
      const q = new URLSearchParams({
        period: subReportPeriod,
        status: subReportStatus,
        search: subReportSearch.trim(),
        page: String(page),
        limit: "20",
      });
      if (subReportPlan) q.append("plan_code", subReportPlan);
      const res = await api.get(`/api/superadmin/billing/reports?${q.toString()}`);
      if (res?.success) {
        setSubReportData(res);
        setSubReportPage(page);
      } else {
        setSubReportError(res?.message || "Failed to load subscription reports.");
      }
    } catch (err) {
      setSubReportError(err.message || "Failed to load subscription reports.");
    } finally {
      setSubReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeReportTab === "subscriptions") {
      loadSubscriptionReports(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReportTab, subReportPeriod, subReportStatus, subReportPlan]);

  const handleDownloadSubInvoice = async (orderId, invoiceNumber) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/subscriptions/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download invoice.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber || "Invoice"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || "Could not download invoice.");
    }
  };

  const loadReports = async (selectedPeriod, m) => {
    setLoading(true);
    setError("");
    setProfitLoss(null);
    try {
      const [plRes, trendRes, khataRes, custRes, payRes, invRes, pbRes] = await Promise.all([
        api.get(`/api/reports/profit-loss?period=${selectedPeriod}`).catch(() => null),
        api.get(`/api/reports/monthly-trend?period=${selectedPeriod}&months=${m}`).catch(() => ({ trend: [] })),
        api.get("/api/khata").catch(() => ({ entries: [] })),
        api.get("/api/customers").catch(() => ({ customers: [] })),
        api.get("/api/payments").catch(() => ({ payments: [] })),
        api.get("/api/documents?doc_type=invoice").catch(() => ({ documents: [] })),
        api.get("/api/purchase-bills").catch(() => ({ purchase_bills: [] })),
      ]);
      setProfitLoss(plRes);
      setTrend(trendRes?.trend || []);
      setKhataEntries(khataRes?.entries || []);
      setCustomerCount((custRes?.customers || []).length);
      setPayments(payRes?.payments || []);
      setInvoices(invRes?.documents || []);
      setPurchaseBills(pbRes?.purchase_bills || []);
    } catch (err) {
      setError(err.message || "Could not load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(period, months);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, months]);

  const handlePeriodChange = (pId, pMonths) => {
    setPeriod(pId);
    if (pMonths) setMonths(pMonths);
  };

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

  // Derive metrics for the 8 cards
  const metrics = useMemo(() => {
    const periodInvoices = invoices.filter((i) =>
      isDateInPeriod(i.invoice_date || i.created_at, period, customStartDate, customEndDate)
    );
    const invoiceSalesSum = periodInvoices.reduce(
      (sum, i) => sum + Number(i.total_amount || 0),
      0
    );

    const periodKhataCredits = khataEntries.filter(
      (k) =>
        k.type === "credit" &&
        isDateInPeriod(k.entry_date || k.date || k.created_at, period, customStartDate, customEndDate)
    );
    const khataCreditSalesSum = periodKhataCredits.reduce(
      (sum, k) => sum + Number(k.amount || 0),
      0
    );

    const periodPayments = payments.filter((p) =>
      isDateInPeriod(p.payment_date || p.created_at, period, customStartDate, customEndDate)
    );

    const periodKhataDebits = khataEntries.filter(
      (k) =>
        k.type === "debit" &&
        isDateInPeriod(k.entry_date || k.date || k.created_at, period, customStartDate, customEndDate)
    );
    const khataDebitsSum = periodKhataDebits.reduce(
      (sum, k) => sum + Number(k.amount || 0),
      0
    );

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

    const purchaseBillsSum = purchaseBills
      .filter((pb) =>
        isDateInPeriod(pb.bill_date || pb.date || pb.created_at, period, customStartDate, customEndDate)
      )
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
        ["upi", "online", "bank", "cheque", "neft", "rtgs"].includes(
          (p.payment_mode || "").toLowerCase()
        )
      )
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const cashInBankFallback = bankCreditSales + bankPayments;

    // Use backend-calculated profitLoss values if available for this period, or fallback to client period sums
    let totalSales = Number(
      profitLoss?.total_sales ?? profitLoss?.sales ?? invoiceSalesSum + khataCreditSalesSum
    );
    let expenses = Number(
      profitLoss?.total_expense ?? profitLoss?.total_expenses ?? profitLoss?.expenses ?? paymentExpensesSum + khataDebitsSum + purchasesSum + advPaySum
    );
    // Purchases matches drilldown total
    let purchases = Number(
      profitLoss?.purchases ??
      profitLoss?.total_purchases ??
      (purchaseBillsSum > 0 ? purchaseBillsSum : purchasesSum)
    );
    let advanceReceivable = Number(
      profitLoss?.advance_receivable ?? advRecSum
    );
    let advancePayable = Number(
      profitLoss?.advance_payable ?? advPaySum
    );
    let cashInHand = Number(
      profitLoss?.cash_in_hand ?? cashInHandFallback
    );
    let cashInBank = Number(
      profitLoss?.cash_in_bank ?? cashInBankFallback
    );
    let netProfit = totalSales - expenses;
    let debitEntries = Number(
      profitLoss?.debit_entries ??
      profitLoss?.debit_entry ??
      profitLoss?.debit_entries_amount ??
      profitLoss?.debitEntriesAmount ??
      khataDebitsSum
    );
    let payOut = Number(
      profitLoss?.business_pay_out ??
      profitLoss?.business_payout ??
      profitLoss?.breakdown?.business_pay_out ??
      paymentExpensesSum
    );

    return {
      totalSales,
      expenses,
      purchases,
      debitEntries,
      payOut,
      advanceReceivable,
      advancePayable,
      cashInHand,
      cashInBank,
      netProfit,
    };
  }, [invoices, khataEntries, payments, purchaseBills, period, profitLoss, customStartDate, customEndDate]);

  // Enrich monthly trend data so Purchases series is derived if backend missing and always rendered
  const enrichedTrend = useMemo(() => {
    const paymentsPurchaseByMonth = {};
    const paymentsExpensesByMonth = {};
    payments.forEach((p) => {
      const cat = (p.payment_category || "").toLowerCase();
      const d = p.payment_date || p.created_at;
      if (!d) return;
      const mStr = String(d).slice(0, 7);
      if (cat === "purchase_bill" || cat === "purchase") {
        paymentsPurchaseByMonth[mStr] = (paymentsPurchaseByMonth[mStr] || 0) + Number(p.amount || 0);
      } else if (["paid_by_business", "paid_out", "expense", "advance_payable"].includes(cat)) {
        paymentsExpensesByMonth[mStr] = (paymentsExpensesByMonth[mStr] || 0) + Number(p.amount || 0);
      }
    });

    return (trend || []).map((t) => {
      const pAmt =
        Number(t.purchases || 0) > 0
          ? Number(t.purchases)
          : paymentsPurchaseByMonth[t.month] || 0;
      const eAmt =
        Number(t.total_expense || t.expenses || 0) > 0
          ? Number(t.total_expense || t.expenses)
          : paymentsExpensesByMonth[t.month] || 0;
      return {
        ...t,
        purchases: pAmt,
        expenses: eAmt,
      };
    });
  }, [trend, payments]);

  const maxTrendValue = Math.max(
    1,
    ...enrichedTrend.map((t) =>
      Math.max(
        Number(t.sales || 0),
        Number(t.expenses || 0),
        Number(t.purchases || 0)
      )
    )
  );

  const getBarHeight = (val) => {
    const num = Number(val || 0);
    if (num <= 0) return "0px";
    const calculated = (num / maxTrendValue) * 200;
    return `${Math.max(6, Math.round(calculated))}px`;
  };

  const creditCount = useMemo(() => {
    if (profitLoss?.credit_entries_count !== undefined && profitLoss?.credit_entries_count !== null) {
      return Number(profitLoss.credit_entries_count);
    }
    if (profitLoss?.breakdown?.credit_entries_count !== undefined && profitLoss?.breakdown?.credit_entries_count !== null) {
      return Number(profitLoss.breakdown.credit_entries_count);
    }
    if (profitLoss?.creditEntriesCount !== undefined && profitLoss?.creditEntriesCount !== null) {
      return Number(profitLoss.creditEntriesCount);
    }
    return khataEntries.filter(
      (e) => (e.type === "credit" || e.is_credit) && isDateInPeriod(e.entry_date || e.date || e.created_at, period, customStartDate, customEndDate)
    ).length;
  }, [profitLoss, khataEntries, period, customStartDate, customEndDate]);

  const debitCount = useMemo(() => {
    if (profitLoss?.debit_entries_count !== undefined && profitLoss?.debit_entries_count !== null) {
      return Number(profitLoss.debit_entries_count);
    }
    if (profitLoss?.breakdown?.debit_entries_count !== undefined && profitLoss?.breakdown?.debit_entries_count !== null) {
      return Number(profitLoss.breakdown.debit_entries_count);
    }
    if (profitLoss?.debitEntriesCount !== undefined && profitLoss?.debitEntriesCount !== null) {
      return Number(profitLoss.debitEntriesCount);
    }
    const khataDebits = khataEntries.filter(
      (e) => (e.type === "debit" || e.is_debit) && isDateInPeriod(e.entry_date || e.date || e.created_at, period, customStartDate, customEndDate)
    ).length;
    return khataDebits;
  }, [profitLoss, khataEntries, period, customStartDate, customEndDate]);

  const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

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
      const parts = tx.time.split(":");
      if (parts.length >= 2) {
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        if (!isNaN(hours)) {
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12 || 12;
          return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
        }
      }
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
      } catch {}
    }
    return "—";
  };

  // Local fallback generator if backend drilldown is unavailable or empty
  const getFallbackTransactions = (metricSlug, label, currentPeriod) => {
    const txs = [];
    const norm = (metricSlug || "").toLowerCase();
    const inPeriod = (dt) => isDateInPeriod(dt, currentPeriod, customStartDate, customEndDate);

    if (norm === "total-sales" || norm === "sales") {
      invoices
        .filter((inv) => inPeriod(inv.invoice_date || inv.created_at))
        .forEach((inv) => {
          txs.push({
            id: `inv-${inv.id}`,
            date: inv.invoice_date || inv.created_at,
            time: inv.created_at,
            party: inv.customer_name || inv.client_name || "Invoice Customer",
            description: `Invoice #${inv.document_number || inv.id}`,
            payment_mode: inv.payment_mode || "online",
            amount: Number(inv.total_amount || 0),
            source: "invoice",
            structure_category: "Sales",
          });
        });
      khataEntries
        .filter(
          (ke) =>
            ke.type === "credit" &&
            inPeriod(ke.entry_date || ke.date || ke.created_at)
        )
        .forEach((ke) => {
          txs.push({
            id: `ke-${ke.id}`,
            date: ke.entry_date || ke.date || ke.created_at,
            time: ke.entry_time || ke.created_at,
            party: ke.customer_name || "Walk-in",
            description: ke.description || "Khata Credit Sale",
            payment_mode: ke.payment_mode || "cash",
            amount: Number(ke.amount || 0),
            source: "khata_credit",
            structure_category: "Sales",
          });
        });
    } else if (norm === "purchases" || norm === "total-purchases") {
      payments
        .filter((p) => {
          const cat = (p.payment_category || "").toLowerCase();
          return (
            (cat === "purchase_bill" || cat === "purchase") &&
            inPeriod(p.payment_date || p.created_at)
          );
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
    } else if (norm === "expenses" || norm === "total-expenses") {
      // 1. Purchases
      payments
        .filter((p) => {
          const cat = (p.payment_category || "").toLowerCase();
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

      // 2. Debit Entries
      khataEntries
        .filter(
          (ke) =>
            ke.type === "debit" &&
            inPeriod(ke.entry_date || ke.date || ke.created_at)
        )
        .forEach((ke) => {
          txs.push({
            id: `ke-${ke.id}`,
            date: ke.entry_date || ke.date || ke.created_at,
            time: ke.entry_time || ke.created_at,
            party: ke.customer_name || "Debit Payee",
            description: ke.description || "Khata Debit",
            payment_mode: ke.payment_mode || "cash",
            amount: Number(ke.amount || 0),
            source: "khata_debit",
            structure_category: "Debit",
          });
        });

      // 3. Business Pay Out
      payments
        .filter((p) => {
          const cat = (p.payment_category || "").toLowerCase();
          const isPurchaseLinked = Boolean(
            p.purchase_bill_id ||
            (p.purpose && String(p.purpose).startsWith("Purchase Bill")) ||
            purchaseBills.some((pb) => Number(pb.payment_id) === Number(p.id) || Number(pb.id) === Number(p.purchase_bill_id))
          );
          const isKhataLinked = Boolean(p.khata_entry_id);
          return (
            ["paid_by_business", "paid_out", "expense"].includes(cat) &&
            !isPurchaseLinked &&
            !isKhataLinked &&
            inPeriod(p.payment_date || p.created_at)
          );
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
          const cat = (p.payment_category || "").toLowerCase();
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
    } else if (norm === "debit-entries" || norm === "debit") {
      khataEntries
        .filter(
          (ke) =>
            ke.type === "debit" &&
            inPeriod(ke.entry_date || ke.date || ke.created_at)
        )
        .forEach((ke) => {
          txs.push({
            id: `ke-${ke.id}`,
            date: ke.entry_date || ke.date || ke.created_at,
            time: ke.entry_time || ke.created_at,
            party: ke.customer_name || "Debit Payee",
            description: ke.description || "Khata Debit",
            payment_mode: ke.payment_mode || "cash",
            amount: Number(ke.amount || 0),
            source: "khata_debit",
            structure_category: "Debit",
          });
        });
    } else if (norm === "pay-out" || norm === "payout" || norm === "business-payout" || norm === "business-pay-out") {
      payments
        .filter((p) => {
          const cat = (p.payment_category || "").toLowerCase();
          const isPurchaseLinked = Boolean(
            p.purchase_bill_id ||
            (p.purpose && String(p.purpose).startsWith("Purchase Bill")) ||
            purchaseBills.some((pb) => Number(pb.payment_id) === Number(p.id) || Number(pb.id) === Number(p.purchase_bill_id))
          );
          const isKhataLinked = Boolean(p.khata_entry_id);
          return (
            ["paid_by_business", "paid_out", "expense"].includes(cat) &&
            !isPurchaseLinked &&
            !isKhataLinked &&
            inPeriod(p.payment_date || p.created_at)
          );
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
          const cat = (p.payment_category || "").toLowerCase();
          return (
            ["advance_receivable", "advance_from_investor"].includes(cat) &&
            inPeriod(p.payment_date || p.created_at)
          );
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
          const cat = (p.payment_category || "").toLowerCase();
          return (
            cat === "advance_payable" &&
            inPeriod(p.payment_date || p.created_at)
          );
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
      khataEntries
        .filter(
          (ke) =>
            (ke.payment_mode || "cash").toLowerCase() === "cash" &&
            inPeriod(ke.entry_date || ke.date || ke.created_at)
        )
        .forEach((ke) => {
          txs.push({
            id: `ke-${ke.id}`,
            date: ke.entry_date || ke.date || ke.created_at,
            time: ke.entry_time || ke.created_at,
            party: ke.customer_name || "Walk-in",
            description:
              ke.description || (ke.type === "credit" ? "Cash Credit" : "Cash Debit"),
            payment_mode: "Cash",
            amount: Number(ke.amount || 0),
            source: `khata_${ke.type}`,
            structure_category: "Khata",
          });
        });
      payments
        .filter(
          (p) =>
            (p.payment_mode || "").toLowerCase() === "cash" &&
            inPeriod(p.payment_date || p.created_at)
        )
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
      khataEntries
        .filter(
          (ke) =>
            ["upi", "online", "bank"].includes((ke.payment_mode || "").toLowerCase()) &&
            inPeriod(ke.entry_date || ke.date || ke.created_at)
        )
        .forEach((ke) => {
          txs.push({
            id: `ke-${ke.id}`,
            date: ke.entry_date || ke.date || ke.created_at,
            time: ke.entry_time || ke.created_at,
            party: ke.customer_name || "Walk-in",
            description:
              ke.description ||
              (ke.type === "credit" ? "Bank/UPI Credit" : "Bank/UPI Debit"),
            payment_mode: ke.payment_mode?.toUpperCase() || "UPI",
            amount: Number(ke.amount || 0),
            source: `khata_${ke.type}`,
            structure_category: "Khata",
          });
        });
      payments
        .filter(
          (p) =>
            ["upi", "online", "bank", "cheque", "neft", "rtgs"].includes(
              (p.payment_mode || "").toLowerCase()
            ) && inPeriod(p.payment_date || p.created_at)
        )
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

  const handleOpenDrilldown = async (metricSlug, label) => {
    setActiveMetricSlug(metricSlug);
    setActiveMetricLabel(label);
    setExpenseFilterCategory("all");
    setDrilldownOpen(true);
    setDrilldownLoading(true);
    setDrilldownError("");
    setDrilldownData(null);

    try {
      const query = new URLSearchParams({ period });
      if (period === "custom") {
        if (customStartDate) query.set("from", customStartDate);
        if (customEndDate) query.set("to", customEndDate);
      }
      const res = await api.get(`/api/reports/drilldown/${metricSlug}?${query.toString()}`);
      if (
        res &&
        ((res.transactions && res.transactions.length > 0) ||
          res.count > 0 ||
          res.breakdown)
      ) {
        // Tag structured category on server transactions if missing
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
            cat = activeMetricSlug === "total-sales" ? "Sales" : "Other Expenses";
          }
          return { ...t, structure_category: cat };
        });
        setDrilldownData({ ...res, transactions: taggedTxs });
      } else {
        const fallback = getFallbackTransactions(metricSlug, label, period);
        setDrilldownData(fallback.transactions?.length > 0 ? fallback : res || fallback);
      }
    } catch {
      const fallback = getFallbackTransactions(metricSlug, label, period);
      setDrilldownData(fallback);
    } finally {
      setDrilldownLoading(false);
    }
  };

  // Auto-open drilldown if ?metric= query param is present on mount
  useEffect(() => {
    if (urlMetricHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const metricParam = params.get("metric");
    if (metricParam) {
      urlMetricHandledRef.current = true;
      const label =
        METRIC_LABELS[metricParam] ||
        metricParam.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      handleOpenDrilldown(metricParam, label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, payments, khataEntries]);

  const metricCards = [
    {
      key: "total-sales",
      title: "Total Sales",
      value: metrics.totalSales,
      icon: IndianRupee,
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      valColor: "text-slate-900",
    },
    {
      key: "expenses",
      title: "Total Expense",
      value: metrics.expenses,
      icon: TrendingDown,
      bg: "bg-rose-100",
      text: "text-rose-600",
      valColor: "text-rose-600",
    },
    {
      key: "purchases",
      title: "Purchases",
      value: metrics.purchases,
      icon: Package,
      bg: "bg-amber-100",
      text: "text-amber-600",
      valColor: "text-amber-700",
    },
    {
      key: "pay-out",
      title: "Business Pay Out",
      value: metrics.payOut,
      icon: ArrowUpRight,
      bg: "bg-orange-100",
      text: "text-orange-600",
      valColor: "text-orange-700",
    },
    {
      key: "advance-receivable",
      title: "Advance Receivable",
      value: metrics.advanceReceivable,
      icon: ArrowDownLeft,
      bg: "bg-blue-100",
      text: "text-blue-600",
      valColor: "text-blue-700",
    },
    {
      key: "advance-payable",
      title: "Advance Payable",
      value: metrics.advancePayable,
      icon: ArrowUpRight,
      bg: "bg-purple-100",
      text: "text-purple-600",
      valColor: "text-purple-700",
    },
    {
      key: "cash-in-hand",
      title: "Cash in Hand",
      value: metrics.cashInHand,
      icon: Wallet,
      bg: "bg-teal-100",
      text: "text-teal-600",
      valColor: "text-teal-700",
    },
    {
      key: "cash-in-bank",
      title: "Cash in Bank",
      value: metrics.cashInBank,
      icon: Landmark,
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      valColor: "text-indigo-700",
    },
    {
      key: "net-profit",
      title: "Net Profit",
      value: metrics.netProfit,
      icon: BarChart3,
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      valColor: metrics.netProfit < 0 ? "text-red-600" : "text-emerald-600",
    },
  ];

  // Structured breakdown categories for Total Expense drilldown
  const expenseCategories = [
    { id: "all", label: "All" },
    { id: "Purchases", label: "Purchases" },
    { id: "Debit Entries", label: "Debit Entries" },
    { id: "Business Pay Out", label: "Business Pay Out" },
    { id: "Advance Payable", label: "Advance Payable" },
    { id: "Other Expenses", label: "Other Expenses" },
  ];

  const filteredDrilldownTransactions = useMemo(() => {
    if (!drilldownData?.transactions) return [];
    let list = drilldownData.transactions;
    if (activeMetricSlug === "expenses" || activeMetricSlug === "total-expenses") {
      if (expenseFilterCategory !== "all") {
        const targetKey = String(expenseFilterCategory || "").toLowerCase().replace(/[\s_-]+/g, "");

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
  }, [drilldownData, activeMetricSlug, expenseFilterCategory]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <PageHeader
          title={
            user?.role !== "superadmin"
              ? `Welcome to KhataNex, ${user?.name || "Business Owner"} 👋`
              : "Reports"
          }
          subtitle={
            user?.role !== "superadmin"
              ? "Your business overview and financial activity"
              : "Understand your business performance"
          }
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showProfile={true}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {user?.role === "superadmin" && (
            <div className="mb-6 flex border-b border-slate-200 bg-white px-2 rounded-2xl border shadow-sm">
              <button
                type="button"
                onClick={() => setActiveReportTab("accounting")}
                className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-xs font-bold transition ${
                  activeReportTab === "accounting"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <BarChart3 size={16} />
                <span>Accounting Reports</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReportTab("subscriptions")}
                className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-xs font-bold transition ${
                  activeReportTab === "subscriptions"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Receipt size={16} />
                <span>Subscriptions Report</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Platform
                </span>
              </button>
            </div>
          )}

          {activeReportTab === "subscriptions" ? (
            /* DEDICATED SAAS SUBSCRIPTIONS REPORT VIEW */
            <div className="space-y-6">
              {/* Report Header Bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    SaaS Subscription Revenue &amp; Financial Reports
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Server-side aggregated billing intelligence, tax collections, and active subscriber metrics
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    <Printer size={15} />
                    <span>Print / Export</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSubscriptionReports(subReportPage)}
                    disabled={subReportLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={subReportLoading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {subReportError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                  {subReportError}
                </div>
              )}

              {/* 5 KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Total Collections</p>
                      <p className="text-xl font-bold text-slate-900">
                        {subReportLoading
                          ? "..."
                          : `₹${Number(subReportData.metrics?.totalCollections || 0).toLocaleString("en-IN")}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-teal-100 p-3 text-teal-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Paid Orders</p>
                      <p className="text-xl font-bold text-slate-900">
                        {subReportLoading ? "..." : subReportData.metrics?.paidOrdersCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                      <Tag size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Discounts Granted</p>
                      <p className="text-xl font-bold text-purple-700">
                        {subReportLoading
                          ? "..."
                          : `₹${Number(subReportData.metrics?.totalDiscountsGranted || 0).toLocaleString("en-IN")}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Tax Collected (GST)</p>
                      <p className="text-xl font-bold text-slate-900">
                        {subReportLoading
                          ? "..."
                          : `₹${Number(subReportData.metrics?.taxCollected || 0).toLocaleString("en-IN")}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Expiring in 7 Days</p>
                      <p className="text-xl font-bold text-amber-700">
                        {subReportLoading ? "..." : subReportData.metrics?.expiringSubscriptions ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FILTERS & SEARCH BAR */}
              <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {[
                    { id: "today", label: "Today" },
                    { id: "this_week", label: "This Week" },
                    { id: "this_month", label: "This Month" },
                    { id: "this_year", label: "This Year" },
                    { id: "all", label: "All Time" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSubReportPeriod(p.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        subReportPeriod === p.id
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={subReportStatus}
                    onChange={(e) => setSubReportStatus(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="paid">Status: Paid</option>
                    <option value="all">Status: All</option>
                    <option value="created">Status: Pending</option>
                    <option value="failed">Status: Failed</option>
                  </select>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadSubscriptionReports(1);
                  }}
                  className="relative flex-1 w-full"
                >
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={subReportSearch}
                    onChange={(e) => setSubReportSearch(e.target.value)}
                    placeholder="Search by subscriber, email, or order ID..."
                    className="w-full rounded-xl border border-slate-300 py-1.5 pl-9 pr-3 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </form>
              </div>

              {/* ORDERS DRILLDOWN TABLE */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[850px] text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Order # &amp; Date</th>
                      <th className="py-3 px-4">Subscriber</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Tax (GST)</th>
                      <th className="py-3 px-4">Paid Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subReportLoading ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          Loading subscription financial records...
                        </td>
                      </tr>
                    ) : !subReportData.rows || subReportData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No subscription orders found for this filter period.
                        </td>
                      </tr>
                    ) : (
                      subReportData.rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-slate-900 block">{row.order_number}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(row.paid_at || row.created_at).toLocaleDateString("en-IN")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{row.customer_name}</span>
                            <span className="text-[11px] text-slate-400">{row.customer_email}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {row.plan_name}
                          </td>
                          <td className="py-3 px-4">
                            ₹{Number(row.base_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-medium">
                            {Number(row.discount_amount || 0) > 0
                              ? `-₹${Number(row.discount_amount).toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            ₹{Number(row.tax_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ₹{Number(row.final_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                row.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : row.status === "created"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedSubOrder(row)}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 transition"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            {row.invoice_number && (
                              <button
                                type="button"
                                onClick={() => handleDownloadSubInvoice(row.id, row.invoice_number)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                title="Download GST Invoice"
                              >
                                <Download size={12} />
                                <span>PDF</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {subReportData.pagination?.totalPages > 1 && (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
                  <span className="text-slate-500">
                    Page {subReportData.pagination.currentPage} of {subReportData.pagination.totalPages} · {subReportData.pagination.totalCount} records
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={subReportPage <= 1}
                      onClick={() => loadSubscriptionReports(subReportPage - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={subReportPage >= subReportData.pagination.totalPages}
                      onClick={() => loadSubscriptionReports(subReportPage + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* PERIOD SELECTOR */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Filter Period:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    handlePeriodChange(opt.id, opt.months);
                    setShowCustomCalendar(false);
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    period === opt.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setShowCustomCalendar((prev) => !prev);
                  if (!showCustomCalendar) setPeriod("custom");
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                  period === "custom" || showCustomCalendar
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                title="Custom date range"
              >
                <Calendar size={14} />
              </button>

              {showCustomCalendar && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setPeriod("custom");
                    }}
                    className="text-xs text-slate-700 outline-none"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setPeriod("custom");
                    }}
                    className="text-xs text-slate-700 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 8 METRIC CARDS (ALL CLICKABLE WITH DRILL-DOWN) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  onClick={() => handleOpenDrilldown(card.key, card.title)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleOpenDrilldown(card.key, card.title);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 rounded-xl p-3 ${card.bg} ${card.text}`}>
                      <Icon size={21} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-500" title={card.title}>
                        {card.title}
                      </p>
                      <p
                        className={`text-lg sm:text-xl font-bold truncate tracking-tight ${card.valColor}`}
                        title={loading ? "..." : formatMoney(card.value)}
                      >
                        {loading ? "..." : formatMoney(card.value)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-400 group-hover:text-emerald-600 transition">
                    <span>View drill-down</span>
                    <span className="font-bold">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SALES VS TOTAL EXPENSE COMPARATIVE GRAPH (AGGREGATE FOR SELECTED PERIOD) */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-800">
                  Sales vs Total Expense
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Aggregate comparison for the selected period
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-3 w-3 rounded-md bg-emerald-500" /> Sales: {formatMoney(metrics.totalSales)}
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="h-3 w-3 rounded-md bg-rose-500" /> Total Expense: {formatMoney(metrics.expenses)}
                </span>
              </div>
            </div>

            {loading ? (
              <p className="mt-8 text-center text-sm text-slate-400">
                Loading chart...
              </p>
            ) : (
              <div className="mt-8 space-y-6">
                {(() => {
                  const maxVal = Math.max(metrics.totalSales, metrics.expenses, 1);
                  const salesPct = Math.round((metrics.totalSales / maxVal) * 100);
                  const expPct = Math.round((metrics.expenses / maxVal) * 100);
                  const netDiff = metrics.totalSales - metrics.expenses;

                  return (
                    <div className="space-y-4">
                      {/* Comparative Bars */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700">Total Sales</span>
                          <span className="text-emerald-600 font-bold">{formatMoney(metrics.totalSales)}</span>
                        </div>
                        <div className="h-6 w-full overflow-hidden rounded-xl bg-slate-100">
                          <div
                            className="h-full rounded-xl bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.max(metrics.totalSales > 0 ? 3 : 0, salesPct)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700">Total Expense</span>
                          <span className="text-rose-600 font-bold">{formatMoney(metrics.expenses)}</span>
                        </div>
                        <div className="h-6 w-full overflow-hidden rounded-xl bg-slate-100">
                          <div
                            className="h-full rounded-xl bg-rose-500 transition-all duration-500"
                            style={{ width: `${Math.max(metrics.expenses > 0 ? 3 : 0, expPct)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
                        <div>
                          <span className="text-slate-500">Period Result: </span>
                          <span className={`font-bold ${netDiff >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                            {netDiff >= 0 ? "Net Profit" : "Net Loss"} of {formatMoney(Math.abs(netDiff))}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          Expense Ratio: {metrics.totalSales > 0 ? `${Math.round((metrics.expenses / metrics.totalSales) * 100)}%` : "N/A"}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-800">Business Summary</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4 min-w-0 overflow-hidden">
                <p className="text-xs text-emerald-700 truncate">Credit Entries</p>
                <p className="mt-2 text-xl font-bold text-emerald-700 truncate" title={creditCount}>
                  {loading ? "..." : creditCount}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4 min-w-0 overflow-hidden">
                <p className="text-xs text-red-600 truncate">Debit Entries</p>
                <p className="mt-2 text-xl font-bold text-red-600 truncate" title={debitCount}>
                  {loading ? "..." : debitCount}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4 min-w-0 overflow-hidden">
                <p className="text-xs text-blue-600 truncate">Total Customers</p>
                <p className="mt-2 text-xl font-bold text-blue-600 truncate" title={customerCount}>
                  {loading ? "..." : customerCount}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      </main>
      </div>

      {/* DRILL-DOWN MODAL */}
      <Modal
        open={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        title={`${activeMetricLabel} Drill-Down`}
      >
        <div className="space-y-4">
          {drilldownLoading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading {activeMetricLabel} transactions...
            </div>
          ) : drilldownError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {drilldownError}
            </div>
          ) : (
            <>
              {/* Header metrics */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total Amount
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatMoney(
                      drilldownData?.total_amount ??
                        drilldownData?.net_profit ??
                        0
                    )}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {filteredDrilldownTransactions.length}{" "}
                  Transactions
                </div>
              </div>

              {/* Total Expense Structured Filter Tabs and Breakdown */}
              {(activeMetricSlug === "expenses" || activeMetricSlug === "total-expenses") && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Expense Breakdown
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {(() => {
                      const allTxs = drilldownData?.transactions || [];
                      const getSubtotal = (catName) => {
                        const targetKey = String(catName || "").toLowerCase().replace(/[\s_-]+/g, "");
                        return allTxs
                          .filter((tx) => {
                            const catKey = String(tx.structure_category || tx.category || "").toLowerCase().replace(/[\s_-]+/g, "");
                            const srcKey = String(tx.source || "").toLowerCase().replace(/[\s_-]+/g, "");
                            if (targetKey === "purchases") return catKey.includes("purchase") || srcKey.includes("purchase");
                            if (targetKey === "debitentries") return catKey.includes("debit") || srcKey.includes("debit");
                            if (targetKey === "businesspayout") return catKey.includes("businesspayout") || catKey.includes("paidbybusiness") || srcKey.includes("paidbybusiness") || srcKey.includes("payout");
                            if (targetKey === "advancepayable") return catKey.includes("advancepayable") || srcKey.includes("advancepayable");
                            if (targetKey === "otherexpenses") return catKey.includes("other") || catKey.includes("direct") || catKey.includes("expense") || srcKey.includes("directexpense") || srcKey.includes("expense");
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
                        <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                          <p className="text-[11px] text-slate-500">{item.label}</p>
                          <p className="font-bold text-slate-800">{formatMoney(item.amount)}</p>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Filter by Category:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {expenseCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setExpenseFilterCategory(cat.id)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            expenseFilterCategory === cat.id
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

              {/* Net Profit Breakdown if applicable */}
              {activeMetricSlug === "net-profit" && drilldownData?.breakdown && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Profit &amp; Loss Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Total Sales:</span>
                      <span className="font-semibold text-emerald-600">
                        {formatMoney(drilldownData.total_sales)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Total Expense:</span>
                      <span className="font-semibold text-rose-600">
                        {formatMoney(drilldownData.total_expenses)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Direct Expenses:</span>
                      <span className="font-medium text-slate-700">
                        {formatMoney(drilldownData.breakdown.directExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Khata Debits:</span>
                      <span className="font-medium text-slate-700">
                        {formatMoney(drilldownData.breakdown.khataDebits)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Business Payouts:</span>
                      <span className="font-medium text-slate-700">
                        {formatMoney(drilldownData.breakdown.unlinkedBusinessPayouts)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Advance Payable:</span>
                      <span className="font-medium text-slate-700">
                        {formatMoney(drilldownData.breakdown.advancePayable)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                    <span className="text-slate-800">Net Profit / (Loss):</span>
                    <span
                      className={
                        drilldownData.net_profit < 0
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }
                    >
                      {formatMoney(drilldownData.net_profit)}
                    </span>
                  </div>
                </div>
              )}

              {/* Transactions list */}
              <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
                {filteredDrilldownTransactions.length === 0 ? (
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
                      {filteredDrilldownTransactions.map((tx, idx) => (
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

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDrilldownOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* SUBSCRIPTION ORDER DETAIL MODAL */}
      <Modal
        open={Boolean(selectedSubOrder)}
        onClose={() => setSelectedSubOrder(null)}
        title="Subscription Order Details"
      >
        {selectedSubOrder && (
          <div className="space-y-4 text-xs">
            {/* Amount Banner */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Total Amount Paid
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                ₹{Number(selectedSubOrder.final_amount || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                  {selectedSubOrder.status}
                </span>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 capitalize">
                  {selectedSubOrder.provider || "Razorpay"}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-slate-400 font-medium">Subscriber</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedSubOrder.customer_name}</p>
                <p className="text-slate-500">{selectedSubOrder.customer_email}</p>
                {selectedSubOrder.customer_phone && (
                  <p className="text-slate-500">Phone: {selectedSubOrder.customer_phone}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-slate-400 font-medium">Plan Information</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedSubOrder.plan_name}</p>
                <p className="text-slate-500">Duration: {selectedSubOrder.duration_months} Months</p>
                {selectedSubOrder.business_name && (
                  <p className="text-slate-500">Business: {selectedSubOrder.business_name}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-slate-400 font-medium">Order Number</p>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedSubOrder.order_number}</p>
                <p className="text-slate-500">
                  {new Date(selectedSubOrder.paid_at || selectedSubOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-slate-400 font-medium">Payment ID</p>
                <p className="font-mono text-[11px] font-semibold text-slate-800 mt-0.5 break-all">
                  {selectedSubOrder.provider_payment_id || selectedSubOrder.provider_order_id || "Direct Fulfillment"}
                </p>
                {selectedSubOrder.invoice_number && (
                  <p className="text-emerald-700 font-medium mt-1">Invoice: {selectedSubOrder.invoice_number}</p>
                )}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Accounting Reconciliation
              </h5>
              <div className="flex justify-between text-slate-600">
                <span>Base Price:</span>
                <span>₹{Number(selectedSubOrder.base_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              {Number(selectedSubOrder.discount_amount || 0) > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Discount:</span>
                  <span>-₹{Number(selectedSubOrder.discount_amount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST (18% Included):</span>
                <span>₹{Number(selectedSubOrder.tax_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-slate-100 pt-1.5 flex justify-between font-bold text-slate-900">
                <span>Net Collected:</span>
                <span className="text-emerald-700">₹{Number(selectedSubOrder.final_amount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Transparent Accounting Principle */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                <ShieldCheck size={14} />
                <span>Payment Gateway Verified Collection</span>
              </div>
              <p className="mt-1 text-[10px] text-emerald-700 leading-relaxed">
                Funds collected via payment gateway; bank settlement subject to gateway payout cycle (T+2 business days).
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              {selectedSubOrder.invoice_number ? (
                <button
                  type="button"
                  onClick={() => handleDownloadSubInvoice(selectedSubOrder.id, selectedSubOrder.invoice_number)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  <Download size={13} />
                  <span>Download Invoice PDF</span>
                </button>
              ) : <span />}

              <button
                type="button"
                onClick={() => setSelectedSubOrder(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
