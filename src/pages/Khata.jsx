import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Menu,
  Search,
  Home,
  Bell,
  Clock,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const Khata = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("this_month");
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState("credit");
  const [saleOfProduct, setSaleOfProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState("");
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    description: "",
    dueDetails: "",
    amount: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Handler functions for header buttons
  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSearchClick = () => {
    const searchInput = document.querySelector('input[type="text"], input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      alert("🔍 Search functionality is available on this page.");
    }
  };

  const handleNotificationClick = () => {
    alert("📬 No new notifications at this time.");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const isDateInPeriod = (dateVal, p) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();

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
    return true;
  };

  const isWalkIn = (val) => {
    if (!val) return true;
    const s = String(val).trim().toLowerCase();
    return (
      s === "walk-in" ||
      s === "walk in" ||
      s === "walkin" ||
      s === "walk-in customer" ||
      s === "walk in customer"
    );
  };

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const [khataRes, custRes, stockRes] = await Promise.all([
        api.get("/api/khata"),
        api.get("/api/customers").catch(() => ({ customers: [] })),
        api.get("/api/stock").catch(() => ({ stock: [] })),
      ]);
      const serverEntries = khataRes.entries || [];
      const debitIds = new Set(
        JSON.parse(localStorage.getItem("khatanex_debit_entry_ids") || "[]").map(String)
      );
      const localDebits = JSON.parse(
        localStorage.getItem("khatanex_local_khata_debits") || "[]"
      );

      const customerMap = new Map(
        (custRes.customers || []).map((c) => [
          String(c.id),
          c.name || c.business_name || `Customer #${c.id}`,
        ])
      );

      // Merge any previously saved customer names from localStorage
      const savedCustomerNames = JSON.parse(
        localStorage.getItem("khatanex_customer_names") || "{}"
      );
      Object.entries(savedCustomerNames).forEach(([id, name]) => {
        if (!customerMap.has(String(id))) {
          customerMap.set(String(id), name);
        }
      });

      const entryCustomerMap = JSON.parse(
        localStorage.getItem("khatanex_entry_customer_map") || "{}"
      );

      const normalizedServer = serverEntries.map((e) => {
        const pType = (e.payment_type || "").toLowerCase();
        const eType = (e.type || e.entry_type || "").toLowerCase();
        let finalType = eType;
        if (eType === "debit" || pType === "debit" || debitIds.has(String(e.id))) {
          finalType = "debit";
        } else if (eType === "due" || pType === "due") {
          finalType = "due";
        } else {
          finalType = "credit";
        }

        const mappedEntry = entryCustomerMap[String(e.id)];
        const effectiveCustId =
          e.customer_id || (mappedEntry ? mappedEntry.customerId : null);

        const linkedCustName = effectiveCustId
          ? customerMap.get(String(effectiveCustId))
          : null;

        const candidateName =
          linkedCustName ||
          mappedEntry?.name ||
          (!isWalkIn(e.customer_name) ? e.customer_name : null) ||
          (!isWalkIn(e.party_name) ? e.party_name : null) ||
          (!isWalkIn(e.name) ? e.name : null);

        let resolvedName = candidateName;
        if (!resolvedName || isWalkIn(resolvedName)) {
          if (effectiveCustId) {
            resolvedName = `Customer #${effectiveCustId}`;
          } else if (finalType === "debit") {
            resolvedName = "Vendor / Payee";
          } else {
            resolvedName = "Customer";
          }
        }

        return {
          ...e,
          id: e.id || `khata_${Date.now()}_${Math.random()}`,
          type: finalType,
          name: resolvedName,
          description: e.description || e.item_name || (finalType === "debit" ? "Debit Entry" : "Khata Entry"),
          amount: Number(e.amount || 0),
          date: e.date || e.created_at || new Date().toISOString(),
        };
      });

      const combined = [...normalizedServer];
      localDebits.forEach((ld) => {
        if (!combined.some((e) => String(e.id) === String(ld.id))) {
          const mappedEntry = entryCustomerMap[String(ld.id)];
          const ldCustId = ld.customer_id || (mappedEntry ? mappedEntry.customerId : null);
          const ldCustName = ldCustId ? customerMap.get(String(ldCustId)) : null;
          const ldCandidate = ldCustName || mappedEntry?.name || ld.name || ld.party_name;
          const ldResolved = (!isWalkIn(ldCandidate) ? ldCandidate : null) || "Vendor / Payee";

          combined.unshift({
            ...ld,
            id: ld.id || `khata_debit_${Date.now()}`,
            type: "debit",
            name: ldResolved,
            description: ld.description || ld.item_name || "Debit Entry",
            amount: Number(ld.amount || 0),
            date: ld.date || new Date().toISOString(),
          });
        }
      });

      setEntries(combined);
      setCustomers(custRes.customers || []);
      setStock(stockRes.stock || []);
    } catch (err) {
      setError(err.message || "Could not load khata entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filtered = entries.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const periodEntries = entries.filter((e) => isDateInPeriod(e.date, periodFilter));
  const totalCredit = periodEntries.filter((e) => e.type === "credit").reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalDebit = periodEntries.filter((e) => e.type === "debit").reduce((s, e) => s + Number(e.amount || 0), 0);
  const netBalance = totalCredit - totalDebit;

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setSaveError("");

    const hasExisting = Boolean(form.customerId);
    const hasManual = Boolean(form.name?.trim());

    if (!hasExisting && !hasManual) {
      setSaveError(
        entryType === "debit"
          ? "Please select an existing customer or enter a vendor / payee name."
          : "Please select an existing customer or enter a customer name."
      );
      return;
    }

    setSaving(true);
    try {
      const selectedCust = hasExisting
        ? customers.find((c) => String(c.id) === String(form.customerId))
        : null;
      const custDisplayName = selectedCust
        ? (selectedCust.name || selectedCust.business_name || `Customer #${form.customerId}`)
        : form.name.trim();

      if (hasExisting && form.customerId) {
        const savedCustomerNames = JSON.parse(
          localStorage.getItem("khatanex_customer_names") || "{}"
        );
        savedCustomerNames[String(form.customerId)] = custDisplayName;
        localStorage.setItem(
          "khatanex_customer_names",
          JSON.stringify(savedCustomerNames)
        );
      }

      if (entryType === "due") {
        const payload = {
          type: "due",
          amount: Number(form.amount),
          payment_type: "due",
          item_name: form.description,
          description: form.description,
          due_date: form.dueDetails || undefined,
          notes: form.dueDetails || undefined,
          product_id: saleOfProduct && selectedProduct ? selectedProduct.id : undefined,
          quantity: saleOfProduct ? Number(productQuantity) : undefined,
        };
        if (hasExisting) {
          payload.customer_id = Number(form.customerId);
          payload.customerId = Number(form.customerId);
          payload.customer = Number(form.customerId);
        } else {
          payload.customer_name = form.name.trim();
        }

        let savedId = null;
        try {
          const res = await api.post("/api/khata/due", payload);
          savedId = res?.entry?.id || res?.due?.id || res?.id;
        } catch (_) {
          try {
            const res = await api.post("/api/khata", payload);
            savedId = res?.entry?.id || res?.due?.id || res?.id;
          } catch (__) {
            try {
              const resColl = await api.post("/api/collections", payload);
              savedId = resColl?.collection?.id || resColl?.id;
            } catch (___) {
              // fallback
            }
          }
        }

        if (savedId) {
          const entryCustomerMap = JSON.parse(
            localStorage.getItem("khatanex_entry_customer_map") || "{}"
          );
          entryCustomerMap[String(savedId)] = {
            customerId: hasExisting ? String(form.customerId) : null,
            name: custDisplayName,
            type: "due",
          };
          localStorage.setItem(
            "khatanex_entry_customer_map",
            JSON.stringify(entryCustomerMap)
          );
        }

        if (saleOfProduct && selectedProduct) {
          const currentStock = Number(selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0);
          const qtyToDeduct = Number(productQuantity || 0);
          const newQty = Math.max(0, currentStock - qtyToDeduct);
          try {
            await api.patch(`/api/stock/${selectedProduct.id}`, { quantity: newQty });
          } catch (stockErr) {
            console.warn("Could not decrement stock on due sale:", stockErr);
          }
        }
      } else if (entryType === "credit") {
        const payload = {
          type: "credit",
          amount: Number(form.amount),
          payment_type: "cash",
          item_name: form.description,
          description: form.description,
          product_id: saleOfProduct && selectedProduct ? selectedProduct.id : undefined,
          quantity: saleOfProduct ? Number(productQuantity) : undefined,
        };
        if (hasExisting) {
          payload.customer_id = Number(form.customerId);
          payload.customerId = Number(form.customerId);
          payload.customer = Number(form.customerId);
        } else {
          payload.customer_name = form.name.trim();
        }

        let savedId = null;
        try {
          const res = await api.post("/api/khata/credit", payload);
          savedId = res?.entry?.id || res?.credit?.id || res?.id;
        } catch (_) {
          try {
            const res = await api.post("/api/khata", payload);
            savedId = res?.entry?.id || res?.credit?.id || res?.id;
          } catch (__) {
            try {
              const collPayload = {
                amount: Number(form.amount),
                payment_type: "due",
                item_name: form.description,
              };
              if (hasExisting) {
                collPayload.customer_id = Number(form.customerId);
              } else {
                collPayload.customer_name = form.name.trim();
              }
              const resColl = await api.post("/api/collections", collPayload);
              savedId = resColl?.collection?.id || resColl?.id;
            } catch (___) {
              // fallback
            }
          }
        }

        if (savedId) {
          const entryCustomerMap = JSON.parse(
            localStorage.getItem("khatanex_entry_customer_map") || "{}"
          );
          entryCustomerMap[String(savedId)] = {
            customerId: hasExisting ? String(form.customerId) : null,
            name: custDisplayName,
            type: "credit",
          };
          localStorage.setItem(
            "khatanex_entry_customer_map",
            JSON.stringify(entryCustomerMap)
          );
        }

        if (saleOfProduct && selectedProduct) {
          const currentStock = Number(selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0);
          const qtyToDeduct = Number(productQuantity || 0);
          const newQty = Math.max(0, currentStock - qtyToDeduct);
          try {
            await api.patch(`/api/stock/${selectedProduct.id}`, { quantity: newQty });
          } catch (stockErr) {
            console.warn("Could not decrement stock on credit sale:", stockErr);
          }
        }
      } else {
        // Record as normal Khata debit entry — do NOT create payment entry, NO sale of product
        const debitEntry = {
          type: "debit",
          description: form.description,
          item_name: form.description,
          amount: Number(form.amount),
          date: new Date().toISOString(),
          customer_id: hasExisting ? Number(form.customerId) : undefined,
          name: custDisplayName,
          party_name: custDisplayName,
        };

        const apiPayload = {
          type: "debit",
          description: form.description,
          item_name: form.description,
          amount: Number(form.amount),
          date: new Date().toISOString(),
        };
        if (hasExisting) {
          apiPayload.customer_id = Number(form.customerId);
          apiPayload.customerId = Number(form.customerId);
          apiPayload.customer = Number(form.customerId);
        } else {
          apiPayload.name = form.name.trim();
          apiPayload.party_name = form.name.trim();
          apiPayload.customer_name = form.name.trim();
        }

        let savedId = null;
        try {
          const res = await api.post("/api/khata/debit", apiPayload);
          savedId = res?.entry?.id || res?.debit?.id || res?.id;
        } catch (_) {
          try {
            const res = await api.post("/api/khata", apiPayload);
            savedId = res?.entry?.id || res?.debit?.id || res?.id;
          } catch (__) {
            try {
              const collPayload = {
                amount: Number(form.amount),
                payment_type: "due",
                item_name: form.description,
              };
              if (hasExisting) {
                collPayload.customer_id = Number(form.customerId);
              } else {
                collPayload.customer_name = form.name.trim();
              }
              const resColl = await api.post("/api/collections", collPayload);
              savedId = resColl?.collection?.id || resColl?.id;
            } catch (___) {
              // fallback
            }
          }
        }

        const debitIds = JSON.parse(localStorage.getItem("khatanex_debit_entry_ids") || "[]");
        const entryCustomerMap = JSON.parse(
          localStorage.getItem("khatanex_entry_customer_map") || "{}"
        );

        if (savedId) {
          debitEntry.id = savedId;
          debitIds.push(String(savedId));
          localStorage.setItem("khatanex_debit_entry_ids", JSON.stringify(debitIds));

          entryCustomerMap[String(savedId)] = {
            customerId: hasExisting ? String(form.customerId) : null,
            name: custDisplayName,
            type: "debit",
          };
          localStorage.setItem(
            "khatanex_entry_customer_map",
            JSON.stringify(entryCustomerMap)
          );
        } else {
          debitEntry.id = `khata_debit_${Date.now()}`;
          debitIds.push(String(debitEntry.id));
          localStorage.setItem("khatanex_debit_entry_ids", JSON.stringify(debitIds));

          entryCustomerMap[String(debitEntry.id)] = {
            customerId: hasExisting ? String(form.customerId) : null,
            name: custDisplayName,
            type: "debit",
          };
          localStorage.setItem(
            "khatanex_entry_customer_map",
            JSON.stringify(entryCustomerMap)
          );

          const localDebits = JSON.parse(
            localStorage.getItem("khatanex_local_khata_debits") || "[]"
          );
          localDebits.unshift(debitEntry);
          localStorage.setItem(
            "khatanex_local_khata_debits",
            JSON.stringify(localDebits)
          );
        }
      }
      setShowModal(false);
      setForm({ customerId: "", name: "", description: "", dueDetails: "", amount: "" });
      setSaleOfProduct(false);
      setSelectedProduct(null);
      setProductQuantity("");
      await loadEntries();
    } catch (err) {
      setSaveError(err.message || "Could not save entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">

        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                Digital Khata
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage credit and debit entries
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              onClick={handleHomeClick}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Home"
            >
              <Home size={19} />
            </button>
            <button
              onClick={handleSearchClick}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Search"
            >
              <Search size={19} />
            </button>
            <button
              onClick={handleNotificationClick}
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button
              onClick={handleProfileClick}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 sm:ml-2 sm:h-9 sm:w-9"
              aria-label="Profile"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            <Button icon={Plus} size="sm" onClick={() => setShowModal(true)} className="ml-1">
              New
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Period Filters & Summary */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Financial Summary</h2>
              <p className="text-xs text-slate-400">Filtered by period</p>
            </div>
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {[
                { id: "today", label: "Today" },
                { id: "this_week", label: "This Week" },
                { id: "this_month", label: "This Month" },
                { id: "this_year", label: "This Year" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPeriodFilter(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    periodFilter === tab.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Credit
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "..." : `₹${totalCredit.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Total Debit
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {loading ? "..." : `₹${totalDebit.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">
                Net Balance
              </p>
              <p className={`mt-2 text-2xl font-bold ${
                netBalance >= 0 ? "text-emerald-700" : "text-red-600"
              }`}>
                {loading ? "..." : `${netBalance < 0 ? "-" : ""}₹${Math.abs(netBalance).toLocaleString("en-IN")}`}
              </p>
            </div>

          </div>

          {/* Search */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Entries */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="font-bold">
                    Ledger Entries
                  </h2>
                  <p className="text-xs text-slate-400">
                    Recent khata transactions
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="p-5 text-sm text-slate-400">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">No entries yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isDebit = item.type === "debit";
                  const isDue = item.type === "due";
                  const isCredit = !isDebit && !isDue;

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center gap-4 p-5"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isDebit
                            ? "bg-red-100 text-red-600"
                            : isDue
                            ? "bg-amber-100 text-amber-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {isDebit ? (
                          <ArrowUpRight size={18} />
                        ) : isDue ? (
                          <Clock size={18} />
                        ) : (
                          <ArrowDownLeft size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {item.name}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                              isDebit
                                ? "bg-red-50 text-red-700 border-red-200"
                                : isDue
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isDebit ? "Debit" : isDue ? "Due" : "Credit"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.description} · {new Date(item.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-bold shrink-0 ${
                          isDebit
                            ? "text-red-600"
                            : isDue
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {isDebit ? "-₹" : isCredit ? "+₹" : "₹"}
                        {Number(item.amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* NEW ENTRY MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Khata Entry">
        <form onSubmit={handleAddEntry} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntryType("credit")}
              className={`flex-1 rounded-xl border py-2.5 text-xs sm:text-sm font-semibold transition ${
                entryType === "credit"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Credit Entry
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryType("debit");
                setSaleOfProduct(false);
                setSelectedProduct(null);
                setProductQuantity("");
              }}
              className={`flex-1 rounded-xl border py-2.5 text-xs sm:text-sm font-semibold transition ${
                entryType === "debit"
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Debit Entry
            </button>
            <button
              type="button"
              onClick={() => setEntryType("due")}
              className={`flex-1 rounded-xl border py-2.5 text-xs sm:text-sm font-semibold transition ${
                entryType === "due"
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Due Entry
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">
                {entryType === "debit" ? "Paid To / Vendor / Customer" : "Customer"}
              </label>
              {customers.length > 0 && (
                <span className="text-xs text-slate-400">
                  Select customer
                </span>
              )}
            </div>

            {customers.length > 0 && (
              <select
                value={form.customerId}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    customerId: val,
                    name: "", // Keep manual customer empty when selecting existing customer
                  }));
                }}
                className="mb-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">-- Choose Existing Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.business_name || `Customer #${c.id}`}{" "}
                    {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                  customerId: "", // Clear existing customer selection when typing manual customer
                }))
              }
              placeholder={
                entryType === "debit"
                  ? "Vendor / supplier / staff / customer name"
                  : "Or enter manual customer name"
              }
              required={!form.customerId}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              {(entryType === "credit" || entryType === "due") && (
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-700 select-none">
                  <input
                    type="checkbox"
                    checked={saleOfProduct}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSaleOfProduct(checked);
                      if (!checked) {
                        setSelectedProduct(null);
                        setProductQuantity("");
                      }
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  Sale of Product
                </label>
              )}
            </div>

            {saleOfProduct && (
              <div className="mb-3 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Select Product (from Inventory)
                  </label>
                  <select
                    value={selectedProduct ? selectedProduct.id : ""}
                    onChange={(e) => {
                      const prod = stock.find((p) => String(p.id) === e.target.value) || null;
                      setSelectedProduct(prod);
                      if (prod) {
                        const price = Number(prod.price || 0);
                        const qty = Number(productQuantity || 1);
                        const computed = price * qty;
                        setForm((prev) => ({
                          ...prev,
                          amount: computed > 0 ? String(computed) : "",
                          description: prev.description || prod.product_name || prod.name || "",
                        }));
                        if (!productQuantity) setProductQuantity("1");
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    required={saleOfProduct}
                  >
                    <option value="">-- Choose Inventory Product --</option>
                    {stock.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.product_name || prod.name} (Stock: {prod.quantity ?? prod.stock_quantity ?? 0} {prod.unit || ""})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Selling Price (₹)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`₹${Number(selectedProduct.price || 0).toLocaleString("en-IN")}`}
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 outline-none cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-400">Read-only from Product Master</span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={productQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProductQuantity(val);
                          const numVal = Number(val || 0);
                          const price = Number(selectedProduct.price || 0);
                          const computed = price * numVal;
                          setForm((prev) => ({
                            ...prev,
                            amount: computed > 0 ? String(computed) : "",
                          }));
                        }}
                        placeholder="Qty"
                        required={saleOfProduct}
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                          saleOfProduct && selectedProduct && Number(productQuantity || 0) > Number(selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0)
                            ? "border-red-500 text-red-900 ring-2 ring-red-200"
                            : "border-slate-200 focus:border-emerald-500"
                        }`}
                      />
                      {saleOfProduct && selectedProduct && Number(productQuantity || 0) > Number(selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0) ? (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          Available stock: {selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0}
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Available stock: {selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder={
                entryType === "due"
                  ? "Goods or service sold on credit"
                  : "What is this for?"
              }
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {entryType === "due" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Due Details
              </label>
              <input
                type="text"
                value={form.dueDetails}
                onChange={(e) =>
                  setForm({ ...form, dueDetails: e.target.value })
                }
                placeholder="Due date, payment terms, or reference notes"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              readOnly={saleOfProduct && !!selectedProduct}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              placeholder="0"
              required
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                saleOfProduct && !!selectedProduct
                  ? "border-slate-200 bg-slate-50 font-semibold text-slate-700 cursor-not-allowed"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={
              saving ||
              (saleOfProduct &&
                (!selectedProduct ||
                  !productQuantity ||
                  Number(productQuantity || 0) <= 0 ||
                  Number(productQuantity || 0) >
                    Number(selectedProduct.quantity ?? selectedProduct.stock_quantity ?? 0)))
            }
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Entry"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Khata;