import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ProfileDropdown from "../components/ProfileDropdown";
import PageHeader from "../components/PageHeader";
import useSubscriptionAccess from "../hooks/useSubscriptionAccess";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const KhataCustomerPicker = ({
  entryType,
  customers,
  customerId,
  manualName,
  onChange,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (customerId) {
      const match = customers.find((c) => String(c.id) === String(customerId));
      if (match) {
        setQuery(match.name || match.business_name || `Customer #${customerId}`);
        return;
      }
    }
    if (manualName) {
      setQuery(manualName);
    } else if (!customerId) {
      setQuery("");
    }
  }, [customerId, manualName, customers]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!trimmed) return [];
    const startsWith = [];
    const contains = [];
    for (const c of customers) {
      const name = (c.name || c.business_name || "").toLowerCase();
      const phone = String(c.phone || "");
      if (name.startsWith(trimmed)) {
        startsWith.push(c);
      } else if (name.includes(trimmed) || phone.includes(trimmed)) {
        contains.push(c);
      }
    }
    return [...startsWith, ...contains].slice(0, 10);
  }, [customers, trimmed]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    const valTrim = val.trim();
    if (!valTrim) {
      onChange({ customerId: "", name: "" });
      return;
    }

    const exact = customers.find(
      (c) => (c.name || c.business_name || "").toLowerCase() === valTrim.toLowerCase()
    );
    if (exact) {
      onChange({ customerId: String(exact.id), name: exact.name || exact.business_name });
    } else {
      if (entryType === "due") {
        onChange({ customerId: "", name: "" });
      } else {
        onChange({ customerId: "", name: valTrim });
      }
    }
  };

  const handleSelectSuggestion = (c) => {
    const name = c.name || c.business_name || `Customer #${c.id}`;
    setQuery(name);
    setIsOpen(false);
    onChange({ customerId: String(c.id), name });
  };

  const isDueNoMatch = entryType === "due" && trimmed && suggestions.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">
          Customer{" "}
          {entryType === "due" ? (
            <span className="text-red-500 font-semibold"></span>
          ) : entryType === "debit" ? (
            <span className="text-red-500 font-semibold"></span>
          ) : (
            <span className="text-slate-400 font-normal">(Please enter details)</span>
          )}
        </label>
        <span className="text-xs text-slate-400">
          {entryType === "due"
            ? "Existing customer required"
            : entryType === "credit"
            ? "Optional"
            : "Search or enter name"}
        </span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (trimmed) setIsOpen(true);
          }}
          placeholder={
            entryType === "due"
              ? "Type to search customer..."
              : entryType === "debit"
              ? "Type to search or enter payee name..."
              : "Type to search or enter customer (or leave blank)..."
          }
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
            isDueNoMatch
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              onChange({ customerId: "", name: "" });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isOpen && trimmed && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.length > 0 ? (
            suggestions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectSuggestion(c)}
                className="flex w-full items-center justify-between border-b border-slate-50 px-4 py-2.5 text-left text-xs transition last:border-b-0 hover:bg-emerald-50"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {c.name || c.business_name || `Customer #${c.id}`}
                  </p>
                  {c.phone && <p className="text-[11px] text-slate-400">{c.phone}</p>}
                </div>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Existing
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              {entryType === "due" ? (
                <span className="font-medium text-red-600">No customer found</span>
              ) : (
                <span>
                  No match. Saved as: <strong className="text-slate-700">"{query}"</strong>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {entryType === "due" && !customerId && trimmed && suggestions.length === 0 && (
        <p className="mt-1 text-xs text-red-600">No customer found. Existing customer is required for Due entries.</p>
      )}
    </div>
  );
};

const KhataProductPicker = ({
  item,
  stock,
  stockFilter,
  onSelect,
  onClear,
}) => {
  const [query, setQuery] = useState(item.product_name || item.search || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(item.product_name || item.search || "");
  }, [item.product_name, item.search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!trimmed) return [];
    const startsWith = [];
    const contains = [];
    for (const prod of stock) {
      if (stockFilter !== "all") {
        const itemType = (prod.item_type || prod.type || "goods").toLowerCase();
        if (itemType !== stockFilter) continue;
      }
      const name = (prod.product_name || prod.name || "").toLowerCase();
      if (name.startsWith(trimmed)) {
        startsWith.push(prod);
      } else if (name.includes(trimmed)) {
        contains.push(prod);
      }
    }
    return [...startsWith, ...contains].slice(0, 10);
  }, [stock, stockFilter, trimmed]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (!val.trim()) {
      onClear();
    }
  };

  const handleSelect = (prod) => {
    const name = prod.product_name || prod.name;
    setQuery(name);
    setIsOpen(false);
    onSelect(prod);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (trimmed) setIsOpen(true);
          }}
          placeholder="Type product name to search suggestions..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              onClear();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && trimmed && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.length > 0 ? (
            suggestions.map((prod) => {
              const pName = prod.product_name || prod.name;
              const pPrice = Number(prod.price || 0);
              const pStock = Number(prod.quantity ?? prod.stock_quantity ?? 0);
              const pUnit = prod.unit || "";
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleSelect(prod)}
                  className="flex w-full items-center justify-between border-b border-slate-50 px-3.5 py-2.5 text-left text-xs transition hover:bg-emerald-50 last:border-0"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{pName}</p>
                    <p className="text-[11px] text-slate-400">
                      Stock: {pStock} {pUnit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">₹{pPrice.toLocaleString("en-IN")}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-slate-400">
              No matching products found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Khata = () => {
  const { user } = useAuth();
  const { canWrite, isRestricted, openSubscriptionPrompt } = useSubscriptionAccess();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("this_month");
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState("credit");
  const [saleOfProduct, setSaleOfProduct] = useState(false);
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "goods" | "service"
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [productItems, setProductItems] = useState([
    { id: 1, product_id: "", product_name: "", price: 0, quantity: 1, stock_quantity: 0, search: "" },
  ]);
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    description: "",
    dueDetails: "",
    amount: "",
    paymentMode: "cash", // "cash" | "upi" only
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    customerId: "",
    name: "",
    description: "",
    amount: "",
    type: "credit",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

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
          source: e.source || (e.payment_type ? "collection" : "khata_entry"),
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
            source: ld.source || "local_debit",
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

  const periodEntries = entries.filter((e) =>
    isDateInPeriod(e.date, periodFilter, customStartDate, customEndDate)
  );

  const filtered = periodEntries.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCredit = periodEntries
    .filter((e) => e.type === "credit")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalDebit = periodEntries
    .filter((e) => e.type === "debit")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const netBalance = totalCredit - totalDebit;

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!canWrite) {
      openSubscriptionPrompt("Khata Ledger");
      return;
    }
    setSaveError("");

    const hasExisting = Boolean(form.customerId);
    const hasManual = Boolean(form.name?.trim());

    if (entryType === "due") {
      if (!hasExisting) {
        setSaveError("Customer is mandatory for Due entries. Please select an existing customer.");
        return;
      }
    } else if (entryType === "debit") {
      if (!hasExisting && !hasManual) {
        setSaveError("Please select an existing customer or enter a vendor / payee name.");
        return;
      }
    }
    // For credit: customer is optional, no customer selected means Walk-in Customer

    const validProductItems = saleOfProduct
      ? productItems.filter((p) => p.product_id && Number(p.quantity || 0) > 0)
      : [];

    if (saleOfProduct) {
      if (validProductItems.length === 0) {
        setSaveError("Please select at least one product with quantity > 0.");
        return;
      }
      for (const it of validProductItems) {
        if (Number(it.quantity) > Number(it.stock_quantity || 0)) {
          setSaveError(`Quantity for "${it.product_name}" exceeds available stock (${it.stock_quantity}).`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const selectedCust = hasExisting
        ? customers.find((c) => String(c.id) === String(form.customerId))
        : null;
      let custDisplayName = "Walk-in Customer";
      if (hasExisting) {
        custDisplayName = selectedCust
          ? (selectedCust.name || selectedCust.business_name || `Customer #${form.customerId}`)
          : `Customer #${form.customerId}`;
      } else if (hasManual) {
        custDisplayName = form.name.trim();
      }

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

      const productDesc = validProductItems.length > 0
        ? validProductItems.map((p) => `${p.product_name} (x${p.quantity})`).join(", ")
        : "";
      const finalDescription = form.description || productDesc || (entryType === "debit" ? "Debit Entry" : "Khata Entry");

      if (entryType === "due") {
        const payload = {
          type: "due",
          amount: Number(form.amount),
          payment_type: "due",
          item_name: finalDescription,
          description: finalDescription,
          due_date: form.dueDetails || undefined,
          notes: form.dueDetails || undefined,
          product_id: validProductItems[0]?.product_id ? Number(validProductItems[0].product_id) : undefined,
          quantity: validProductItems[0]?.quantity ? Number(validProductItems[0].quantity) : undefined,
          items: validProductItems.map((p) => ({
            product_id: Number(p.product_id),
            quantity: Number(p.quantity),
            price: Number(p.price),
          })),
        };
        if (hasExisting) {
          payload.customer_id = Number(form.customerId);
          payload.customerId = Number(form.customerId);
          payload.customer = Number(form.customerId);
        } else {
          payload.customer_name = custDisplayName;
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

        if (saleOfProduct && validProductItems.length > 0) {
          for (const it of validProductItems) {
            const currentStock = Number(it.stock_quantity || 0);
            const qtyToDeduct = Number(it.quantity || 0);
            const newQty = Math.max(0, currentStock - qtyToDeduct);
            try {
              await api.patch(`/api/stock/${it.product_id}`, { quantity: newQty });
            } catch (stockErr) {
              console.warn("Could not decrement stock on due sale:", stockErr);
            }
          }
        }
      } else if (entryType === "credit") {
        const payload = {
          type: "credit",
          amount: Number(form.amount),
          payment_type: form.paymentMode === "upi" ? "upi" : "cash",
          payment_mode: form.paymentMode === "upi" ? "upi" : "cash",
          payment_category: "money_received",
          item_name: finalDescription,
          description: finalDescription,
          product_id: validProductItems[0]?.product_id ? Number(validProductItems[0].product_id) : undefined,
          quantity: validProductItems[0]?.quantity ? Number(validProductItems[0].quantity) : undefined,
          items: validProductItems.map((p) => ({
            product_id: Number(p.product_id),
            quantity: Number(p.quantity),
            price: Number(p.price),
          })),
        };
        if (hasExisting) {
          payload.customer_id = Number(form.customerId);
          payload.customerId = Number(form.customerId);
          payload.customer = Number(form.customerId);
        } else {
          payload.customer_name = custDisplayName;
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
                item_name: finalDescription,
              };
              if (hasExisting) {
                collPayload.customer_id = Number(form.customerId);
              } else {
                collPayload.customer_name = custDisplayName;
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

        if (saleOfProduct && validProductItems.length > 0) {
          for (const it of validProductItems) {
            const currentStock = Number(it.stock_quantity || 0);
            const qtyToDeduct = Number(it.quantity || 0);
            const newQty = Math.max(0, currentStock - qtyToDeduct);
            try {
              await api.patch(`/api/stock/${it.product_id}`, { quantity: newQty });
            } catch (stockErr) {
              console.warn("Could not decrement stock on credit sale:", stockErr);
            }
          }
        }
      } else {
        const debitDate = new Date().toISOString().split("T")[0];
        const debitEntry = {
          type: "debit",
          description: finalDescription,
          item_name: finalDescription,
          amount: Number(form.amount),
          date: debitDate,
          customer_id: hasExisting ? Number(form.customerId) : undefined,
          name: custDisplayName,
          party_name: custDisplayName,
          payment_mode: form.paymentMode === "upi" ? "upi" : "cash",
        };

        const apiPayload = {
          type: "debit",
          description: finalDescription,
          item_name: finalDescription,
          amount: Number(form.amount),
          date: debitDate,
          payment_mode: form.paymentMode === "upi" ? "upi" : "cash",
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
      setForm({ customerId: "", name: "", description: "", dueDetails: "", amount: "", paymentMode: "cash" });
      setSaleOfProduct(false);
      setCustomerSearchQuery("");
      setProductItems([
        { id: 1, product_id: "", product_name: "", price: 0, quantity: 1, stock_quantity: 0, search: "" },
      ]);
      await loadEntries();
    } catch (err) {
      setSaveError(err.message || "Could not save entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingEntry(item);
    setEditError("");
    setEditForm({
      id: item.id,
      customerId: item.customer_id ? String(item.customer_id) : "",
      name: item.name || "",
      description: item.description || "",
      amount: String(item.amount || ""),
      type: item.type || "credit",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!canWrite) {
      openSubscriptionPrompt("Khata Ledger");
      return;
    }
    setEditError("");
    setEditSaving(true);
    try {
      const payload = {
        amount: Number(editForm.amount),
        description: editForm.description,
        item_name: editForm.description,
        type: editForm.type,
      };
      if (editForm.customerId) {
        payload.customer_id = Number(editForm.customerId);
      } else if (editForm.name) {
        payload.customer_name = editForm.name.trim();
        payload.name = editForm.name.trim();
        payload.party_name = editForm.name.trim();
      }

      try {
        await api.patch(`/api/khata/${editForm.id}`, payload);
      } catch (_) {
        await api.put(`/api/khata/${editForm.id}`, payload);
      }

      setEditModalOpen(false);
      setEditingEntry(null);
      await loadEntries();
    } catch (err) {
      setEditError(err.message || "Could not update Khata entry.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteEntry = async (item) => {
    if (!canWrite) {
      openSubscriptionPrompt("Khata Ledger");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete this ${item.type} entry of ₹${Number(item.amount).toLocaleString("en-IN")}?`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/api/khata/${item.id}`);

      const debitIds = JSON.parse(localStorage.getItem("khatanex_debit_entry_ids") || "[]");
      const nextDebitIds = debitIds.filter((id) => String(id) !== String(item.id));
      localStorage.setItem("khatanex_debit_entry_ids", JSON.stringify(nextDebitIds));

      const entryMap = JSON.parse(localStorage.getItem("khatanex_entry_customer_map") || "{}");
      delete entryMap[String(item.id)];
      localStorage.setItem("khatanex_entry_customer_map", JSON.stringify(entryMap));

      const localDebits = JSON.parse(localStorage.getItem("khatanex_local_khata_debits") || "[]");
      const nextLocalDebits = localDebits.filter((d) => String(d.id) !== String(item.id));
      localStorage.setItem("khatanex_local_khata_debits", JSON.stringify(nextLocalDebits));

      await loadEntries();
    } catch (err) {
      window.alert(err.message || "Failed to delete Khata entry.");
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
        <PageHeader
          title="Digital Khata"
          subtitle="Manage credit and debit entries"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showSearch={true}
          onSearchClick={handleSearchClick}
          showProfile={true}
          onNew={() => {
            if (!canWrite) {
              openSubscriptionPrompt("Khata Ledger");
              return;
            }
            setShowModal(true);
            setForm({
              customerId: "",
              name: "",
              description: "",
              dueDetails: "",
              amount: "",
              paymentMode: "cash",
            });
            setSaleOfProduct(false);
          }}
          newLabel="New"
        />

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm items-center">
                {[
                  { id: "today", label: "Today" },
                  { id: "this_week", label: "This Week" },
                  { id: "this_month", label: "This Month" },
                  { id: "this_year", label: "This Year" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setPeriodFilter(tab.id);
                      setShowCustomCalendar(false);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      periodFilter === tab.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCalendar((prev) => !prev);
                    if (!showCustomCalendar) setPeriodFilter("custom");
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ml-1 flex items-center gap-1 ${
                    periodFilter === "custom" || showCustomCalendar
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Custom Date Range"
                >
                  <Calendar size={14} />
                </button>
              </div>

              {showCustomCalendar && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setPeriodFilter("custom");
                    }}
                    className="text-xs text-slate-700 outline-none"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setPeriodFilter("custom");
                    }}
                    className="text-xs text-slate-700 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">
                Total Credit
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "..." : `₹${totalCredit.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">
                Total Debit
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {loading ? "..." : `₹${totalDebit.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                      key={`${item.source || item.type || "khata"}-${item.type || "entry"}-${item.id}`}
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
                          {item.description} · {(() => {
                            const d = new Date(item.date);
                            if (Number.isNaN(d.getTime())) return "—";
                            return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} at ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
                          })()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p
                          className={`text-sm font-bold ${
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
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition"
                            title="Edit Entry"
                            aria-label="Edit entry"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete Entry"
                            aria-label="Delete entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
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
                setProductItems([
                  { id: 1, product_id: "", product_name: "", price: 0, quantity: 1, stock_quantity: 0, search: "" },
                ]);
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

          {/* CUSTOMER SELECTION */}
          {/* CUSTOMER SELECTION (ONE UNIFIED FIELD) */}
          <KhataCustomerPicker
            entryType={entryType}
            customers={customers}
            customerId={form.customerId}
            manualName={form.name}
            onChange={({ customerId, name }) => {
              setForm((prev) => ({
                ...prev,
                customerId,
                name,
              }));
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">
                {entryType === "due" ? "Due Description" : "Purpose"}
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
                        setProductItems([
                          { id: 1, product_id: "", product_name: "", price: 0, quantity: 1, stock_quantity: 0, search: "" },
                        ]);
                      }
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  Sale of Product
                </label>
              )}
            </div>

            {/* SALE OF PRODUCT: MULTI-PRODUCT ITEM ROWS */}
            {saleOfProduct && (
              <div className="mb-3 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Product ({productItems.length})
                  </span>
                  <div className="flex items-center gap-1">
                    {["all", "goods", "service"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setStockFilter(opt)}
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase transition ${
                          stockFilter === opt
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {productItems.map((item, index) => {
                    const filteredStockList = stock.filter((prod) => {
                      if (stockFilter !== "all") {
                        const itemType = (prod.item_type || prod.type || "goods").toLowerCase();
                        if (itemType !== stockFilter) return false;
                      }
                      if (!item.search.trim()) return true;
                      const q = item.search.trim().toLowerCase();
                      const pName = (prod.product_name || prod.name || "").toLowerCase();
                      return pName.includes(q);
                    });

                    const isOverStock =
                      Boolean(item.product_id) &&
                      Number(item.quantity || 0) > Number(item.stock_quantity || 0);

                    return (
                      <div
                        key={item.id || index}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">
                            Item #{index + 1}
                          </span>
                          {productItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setProductItems((prev) => {
                                  const next = prev.filter((it) => it.id !== item.id);
                                  const total = next.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
                                  setForm((f) => ({ ...f, amount: total > 0 ? String(total) : "" }));
                                  return next;
                                });
                              }}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Single Product Autocomplete Input */}
                        <KhataProductPicker
                          item={item}
                          stock={stock}
                          stockFilter={stockFilter}
                          onSelect={(prod) => {
                            setProductItems((prev) => {
                              const next = prev.map((it) => {
                                if (it.id === item.id) {
                                  return {
                                    ...it,
                                    product_id: String(prod.id),
                                    product_name: prod.product_name || prod.name || "",
                                    price: Number(prod.price || 0),
                                    stock_quantity: Number(prod.quantity ?? prod.stock_quantity ?? 0),
                                    quantity: it.quantity || 1,
                                    search: prod.product_name || prod.name || "",
                                  };
                                }
                                return it;
                              });
                              const total = next.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
                              const descs = next.map((it) => it.product_name).filter(Boolean).join(", ");
                              setForm((f) => ({
                                ...f,
                                amount: total > 0 ? String(total) : "",
                                description: descs || f.description,
                              }));
                              return next;
                            });
                          }}
                          onClear={() => {
                            setProductItems((prev) => {
                              const next = prev.map((it) => {
                                if (it.id === item.id) {
                                  return {
                                    ...it,
                                    product_id: "",
                                    product_name: "",
                                    price: 0,
                                    stock_quantity: 0,
                                    search: "",
                                  };
                                }
                                return it;
                              });
                              const total = next.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
                              const descs = next.map((it) => it.product_name).filter(Boolean).join(", ");
                              setForm((f) => ({
                                ...f,
                                amount: total > 0 ? String(total) : "",
                                description: descs || f.description,
                              }));
                              return next;
                            });
                          }}
                        />

                        {item.product_id && (
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Selling Price (₹)
                              </label>
                              <input
                                type="text"
                                readOnly
                                value={`₹${Number(item.price || 0).toLocaleString("en-IN")}`}
                                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none cursor-not-allowed"
                              />
                              <span className="text-[9px] text-slate-400">Read-only Master</span>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const q = Math.max(1, Number(val || 1));
                                  setProductItems((prev) => {
                                    const next = prev.map((it) => (it.id === item.id ? { ...it, quantity: q } : it));
                                    const total = next.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
                                    setForm((f) => ({ ...f, amount: total > 0 ? String(total) : "" }));
                                    return next;
                                  });
                                }}
                                className={`w-full rounded-lg border px-3 py-1.5 text-xs outline-none transition ${
                                  isOverStock
                                    ? "border-red-500 text-red-900 ring-2 ring-red-200"
                                    : "border-slate-200 focus:border-emerald-500"
                                }`}
                              />
                              <span className={`text-[9px] ${isOverStock ? "font-bold text-red-600" : "text-slate-500"}`}>
                                Avail: {item.stock_quantity}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setProductItems((prev) => [
                        ...prev,
                        { id: Date.now() + Math.random(), product_id: "", product_name: "", price: 0, quantity: 1, stock_quantity: 0, search: "" },
                      ]);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    <Plus size={13} /> Add Another Product
                  </button>

                  <span className="text-xs font-semibold text-slate-700">
                    Total: ₹{Number(form.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
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
                  : entryType === "debit"
                  ? "What was this payout for?"
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
              readOnly={saleOfProduct && productItems.some((p) => p.product_id)}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              placeholder="0"
              required
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                saleOfProduct && productItems.some((p) => p.product_id)
                  ? "border-slate-200 bg-slate-50 font-semibold text-slate-700 cursor-not-allowed"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
          </div>

          {/* PAYMENT MODE: ONLY CASH AND UPI (For Credit and Debit) */}
          {(entryType === "credit" || entryType === "debit") && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Payment Mode (Cash &amp; UPI only)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "cash", label: "Cash" },
                  { id: "upi", label: "UPI" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, paymentMode: m.id }))}
                    className={`rounded-xl border py-2.5 text-xs sm:text-sm font-semibold transition ${
                      (form.paymentMode || "cash") === m.id
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              saving ||
              (saleOfProduct &&
                (productItems.filter((p) => p.product_id).length === 0 ||
                  productItems.some(
                    (p) =>
                      p.product_id &&
                      (Number(p.quantity || 0) <= 0 ||
                        Number(p.quantity || 0) > Number(p.stock_quantity || 0))
                  )))
            }
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Entry"}
          </button>
        </form>
      </Modal>

      {/* EDIT ENTRY MODAL */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Khata Entry"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {editError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Customer / Party
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              type="text"
              required
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Entry Type
            </label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="due">Due</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={editSaving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {editSaving ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Khata;