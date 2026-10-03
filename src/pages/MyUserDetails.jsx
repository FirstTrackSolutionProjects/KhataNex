import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api, { secureFileObjectUrl } from "../lib/api";

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

const getResponseData = (response) => response?.data || response || {};

const extractRecordsFromResponse = (data, type) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  // 1. Direct key match
  if (Array.isArray(data[type])) return data[type];

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
    if (Array.isArray(data.khata)) return data.khata;
    if (Array.isArray(data.entries)) return data.entries;
    if (Array.isArray(data.ledger)) return data.ledger;
  }

  if (type === "vehicles" || type === "vehicle") {
    if (Array.isArray(data.vehicles)) return data.vehicles;
    if (Array.isArray(data.trips)) return data.trips;
    if (Array.isArray(data.vehicle_trips)) return data.vehicle_trips;
  }

  if (type === "payments") {
    if (Array.isArray(data.payments)) return data.payments;
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

  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null);
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
  const [showReports, setShowReports] = useState(false);
  const [selectedBusinessSection, setSelectedBusinessSection] = useState("");

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/superadmin/users/${id}/overview`
      );

      const data = getResponseData(response);

      setUser(data.user || null);
      setOverview(data.overview || null);
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
    if (section === "reports") {
      setActiveType("");
      setRecords([]);
      setRecordsError("");
      setShowReports(true);
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

      setRecords(recordsList);
    } catch (err) {
      console.error(`Failed to load ${type}:`, err);
      setRecords([]);
      setRecordsError(err.message || `Could not load ${type}.`);
    } finally {
      setRecordsLoading(false);
    }
  };

  const openRecord = async (type, recordId) => {
    try {
      const response = await api.get(
        `/api/superadmin/users/${id}/records/${recordId}?type=${encodeURIComponent(
          type
        )}`
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
    if (type === "expenses") return "expense";
    if (type === "vehicles") return "vehicle";
    if (type === "inventory" || type === "stock") return "stock";
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

    return record.name || record.title || "Record";
  };

  const recordSubtitle = (record, type) => {
    if (!record) return "";

    if (type === "customers") {
      return record.phone || record.email || record.city || "Customer";
    }

    if (type === "khata") {
      const rawType = String(record.type || record.entry_type || "").toLowerCase();
      const badge =
        rawType === "debit"
          ? "Debit"
          : rawType === "credit"
            ? "Credit"
            : rawType === "due"
              ? "Due"
              : rawType;
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
      if (!query) return true;

      return [
        recordTitle(record, activeType),
        recordSubtitle(record, activeType),
        record.invoice_number,
        record.quotation_number,
        record.receipt_number,
        record.customer_name,
        record.customer_phone,
        record.customer_email,
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
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {!filteredRecords.length ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-600">
                No matching records.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try a different search term.
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 transition hover:bg-emerald-50/40"
              >
                <button
                  type="button"
                  onClick={() =>
                    openRecord(
                      getRecordTypeForDetails(activeType),
                      getRecordId(record, activeType)
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
                          const kType = String(record.type || record.entry_type || "").toLowerCase();
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
                    ["invoices", "quotations"].includes(activeType) && (
                      <span className="text-sm font-semibold text-slate-800 mr-1">
                        {formatMoney(record.total_amount)}
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
                        getRecordId(record, activeType)
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

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Subscription
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Current subscription period
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Ends
                    </p>
                    <p className="mt-1 text-sm font-bold text-amber-700">
                      31 Dec
                    </p>
                  </div>
                </div>
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
                  <option value="customers">Customers ({overview?.customer_count || 0})</option>
                  <option value="khata">Khata ({Number(overview?.khata_count || 0)})</option>
                  <option value="reports">Reports (Sales, Expenses & Profit)</option>
                  <option value="inventory">Inventory / Stock ({overview?.stock_count || 0})</option>
                  <option value="vehicles">Vehicles ({overview?.vehicle_trip_count || 0})</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ActivityCard
                title="Customers"
                count={overview?.customer_count}
                icon={Users}
                description="Customer accounts"
                onClick={() => handleBusinessSectionChange("customers")}
              />

              <ActivityCard
                title="Khata"
                count={Number(overview?.khata_count || 0)}
                icon={BookOpen}
                description="Credit & debit entries"
                onClick={() => handleBusinessSectionChange("khata")}
              />

              <ActivityCard
                title="Reports"
                count={null}
                icon={BarChart3}
                description="Business performance"
                showCount={false}
                onClick={() => handleBusinessSectionChange("reports")}
              />

              <ActivityCard
                title="Inventory / Stock"
                count={overview?.stock_count}
                icon={Package}
                description="Stock items"
                onClick={() => handleBusinessSectionChange("inventory")}
              />

              <ActivityCard
                title="Vehicles"
                count={overview?.vehicle_trip_count}
                icon={Truck}
                description="Vehicle trips"
                onClick={() => handleBusinessSectionChange("vehicles")}
              />
            </div>

            {["customers", "khata", "inventory", "stock", "vehicles"].includes(activeType) && (
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReports(false);
                      setRecordSearch("");
                      loadRecords("khata");
                    }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <p className="text-xs font-medium text-slate-500">
                      Total Sales
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">
                      {formatMoney(overview?.reports?.total_sales ?? overview?.reports?.sales ?? overview?.total_sales)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReports(false);
                      setRecordSearch("");
                      loadRecords("payments");
                    }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <p className="text-xs font-medium text-slate-500">
                      Due Received
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">
                      {formatMoney(overview?.reports?.due_received ?? overview?.reports?.received ?? overview?.due_received)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReports(false);
                      setRecordSearch("");
                      loadRecords("expenses");
                    }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <p className="text-xs font-medium text-slate-500">
                      Expenses
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">
                      {formatMoney(overview?.reports?.expenses ?? overview?.reports?.total_expenses ?? overview?.expenses)}
                    </p>
                  </button>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-700">
                      Net Profit
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">
                      {formatMoney(
                        overview?.reports?.net_profit ??
                          overview?.net_profit ??
                          (Number(overview?.reports?.total_sales ?? overview?.reports?.sales ?? 0) -
                            Number(overview?.reports?.expenses ?? overview?.reports?.total_expenses ?? 0))
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">
                      Sales vs Expenses
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Monthly business performance
                    </p>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Sales
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      Expenses
                    </span>
                  </div>

                  {Array.isArray(overview?.reports?.monthly_trend) &&
                  overview.reports.monthly_trend.length ? (
                    <div className="space-y-3">
                      {overview.reports.monthly_trend.map((item) => {
                        const sales = Number(item.sales || 0);
                        const expenses = Number(item.expenses || 0);
                        const max = Math.max(sales, expenses, 1);

                        return (
                          <div key={item.month}>
                            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                              <span className="font-semibold text-slate-700">
                                {item.month}
                              </span>
                              <span className="text-slate-500">
                                Sales {formatMoney(sales)} · Expenses{" "}
                                {formatMoney(expenses)}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{
                                    width: `${Math.max(
                                      (sales / max) * 100,
                                      sales > 0 ? 3 : 0
                                    )}%`,
                                  }}
                                />
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-red-400"
                                  style={{
                                    width: `${Math.max(
                                      (expenses / max) * 100,
                                      expenses > 0 ? 3 : 0
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No data yet for this period.
                    </p>
                  )}

                  <p className="mt-4 text-xs font-semibold text-slate-500">
                    Last 6 Months
                  </p>
                </div>

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
                        loadRecords("khata");
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <p className="text-xs text-slate-500">Credit Entries</p>
                      <p className="mt-1 text-xl font-bold text-emerald-600">
                        {Number(overview?.credit_entries || 0).toLocaleString("en-IN")}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowReports(false);
                        setRecordSearch("");
                        loadRecords("khata");
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-red-300 hover:bg-red-50"
                    >
                      <p className="text-xs text-slate-500">Debit Entries</p>
                      <p className="mt-1 text-xl font-bold text-red-600">
                        {Number(overview?.debit_entries || 0).toLocaleString("en-IN")}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowReports(false);
                        setRecordSearch("");
                        loadRecords("customers");
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <p className="text-xs text-slate-500">Total Customers</p>
                      <p className="mt-1 text-xl font-bold text-slate-800">
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
    </div>
  );
};

export default MyUserDetails;
