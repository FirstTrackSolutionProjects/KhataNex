import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Menu,
  Trash2,
  Mail,
  X,
  CalendarDays,
  User,
  Package,
  Building2,
  CreditCard,
  RotateCcw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import api, { secureFileObjectUrl, fetchSecureFile } from "../lib/api";

const EMAIL_STYLE = {
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-amber-100 text-amber-700",
  not_sent: "bg-slate-100 text-slate-600",
};

const emptyItem = () => ({
  product_id: "",
  product_name: "",
  description: "",
  category: "",
  item_type: "goods",
  hsn_code: "",
  quantity: 1,
  unit: "",
  price: 0,
});

const todayString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();

  return new Date(d.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const numberValue = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const calculatePreview = (items, form) => {
  let subtotal = 0;

  items.forEach((item) => {
    const quantity = numberValue(item.quantity);
    const price = numberValue(item.price);

    subtotal += quantity * price;
  });

  const discountPercent = numberValue(
    form.discountPercent
  );

  const discountAmount =
    subtotal * (discountPercent / 100);

  const taxable = Math.max(
    0,
    subtotal - discountAmount
  );

  const cgstRate = numberValue(form.cgstRate);
  const sgstRate = numberValue(form.sgstRate);
  const igstRate = numberValue(form.igstRate);
  const tcsRate = numberValue(form.tcsRate);
  const tdsRate = numberValue(form.tdsRate);
  const roundOff = numberValue(form.roundOff);

  const cgst = taxable * (cgstRate / 100);
  const sgst = taxable * (sgstRate / 100);
  const igst = taxable * (igstRate / 100);

  const tcs = taxable * (tcsRate / 100);
  const tds = taxable * (tdsRate / 100);

  const total =
    taxable +
    cgst +
    sgst +
    igst +
    tcs -
    tds +
    roundOff;

  return {
    subtotal,
    discountAmount,
    taxable,
    cgst,
    sgst,
    igst,
    tcs,
    tds,
    roundOff,
    total,
  };
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  min,
  step,
  error = false,
  errorText = "",
  className = "",
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      step={step}
      className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 ${
        error
          ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
          : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      } ${className}`}
    />
    {errorText && (
      <p className="mt-1 text-xs font-semibold text-red-600">{errorText}</p>
    )}
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  children,
  required = false,
  disabled = false,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}

      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>

    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
    >
      {children}
    </select>
  </div>
);

const Section = ({
  icon: Icon,
  title,
  description,
  children,
  action,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
          <Icon size={18} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>

    <div className="p-5">{children}</div>
  </section>
);

const CustomerAutocomplete = ({
  customers,
  value,
  onChange,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  const query = String(value || "")
    .trim()
    .toLowerCase();

  const matches = useMemo(() => {
    if (!query) return [];

    return customers
      .filter((customer) =>
        [
          customer.name,
          customer.display_name,
          customer.business_name,
          customer.email,
          customer.phone,
          customer.mobile,
          customer.id,
        ]
          .filter(Boolean)
          .some((field) =>
            String(field)
              .toLowerCase()
              .includes(query)
          )
      )
      .slice(0, 8);
  }, [customers, query]);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Search Customer
      </label>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search name, business, phone, email or customer ID"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {open && query && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {matches.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-500">
              No customer found.
            </div>
          ) : (
            matches.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  onSelect(customer);
                  setOpen(false);
                }}
                className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-emerald-50"
              >
                <div className="font-medium text-slate-900">
                  {customer.display_name ||
                    customer.name ||
                    "Unnamed Customer"}
                </div>

                {customer.business_name && (
                  <div className="text-xs text-slate-600">
                    {customer.business_name}
                  </div>
                )}

                <div className="mt-1 text-xs text-slate-500">
                  {[
                    customer.email,
                    customer.phone ||
                      customer.mobile,
                    customer.id
                      ? `ID: ${customer.id}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ItemAutocomplete = ({
  stock,
  item,
  onSelect,
}) => {
  const [query, setQuery] = useState(
    item.product_name || ""
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(item.product_name || "");
  }, [item.product_name]);

  const matches = useMemo(() => {
    const q = String(query || "")
      .trim()
      .toLowerCase();

    if (!q) return [];

    return stock
      .filter((product) =>
        [
          product.product_name,
          product.name,
          product.category,
          product.hsn_code,
          product.type,
          product.item_type,
        ]
          .filter(Boolean)
          .some((field) =>
            String(field)
              .toLowerCase()
              .includes(q)
          )
      )
      .slice(0, 8);
  }, [stock, query]);

  return (
    <div className="relative min-w-[220px]">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search inventory..."
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />

      {open && query && (
        <div className="absolute left-0 top-full z-40 mt-1 w-[320px] max-w-[90vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {matches.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No inventory item found.
            </div>
          ) : (
            matches.map((product) => (
              <button
                type="button"
                key={product.id}
                onClick={() => {
                  onSelect(product);

                  setQuery(
                    product.product_name ||
                      product.name ||
                      ""
                  );

                  setOpen(false);
                }}
                className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-emerald-50"
              >
                <div className="font-medium text-slate-900">
                  {product.product_name ||
                    product.name ||
                    "Item"}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {[
                    product.category,
                    product.hsn_code
                      ? `HSN/SAC: ${product.hsn_code}`
                      : "",
                    product.price !== undefined &&
                    product.price !== null
                      ? money(product.price)
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const AddressBlock = ({
  prefix,
  title,
  customer,
  onChange,
  disabled = false,
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <h4 className="mb-4 font-medium text-slate-800">
      {title}
    </h4>

    <div className="grid gap-4 md:grid-cols-2">
      <Field
        label="State"
        value={customer[`${prefix}_state`]}
        onChange={(value) =>
          onChange(`${prefix}_state`, value)
        }
        disabled={disabled}
      />

      <Field
        label="District"
        value={customer[`${prefix}_district`]}
        onChange={(value) =>
          onChange(
            `${prefix}_district`,
            value
          )
        }
        disabled={disabled}
      />

      <Field
        label="City"
        value={customer[`${prefix}_city`]}
        onChange={(value) =>
          onChange(`${prefix}_city`, value)
        }
        disabled={disabled}
      />

      <Field
        label="Pincode"
        value={customer[`${prefix}_pincode`]}
        onChange={(value) =>
          onChange(
            `${prefix}_pincode`,
            value
          )
        }
        disabled={disabled}
      />

      <div className="md:col-span-2">
        <Field
          label="Landmark"
          value={customer[`${prefix}_landmark`]}
          onChange={(value) =>
            onChange(
              `${prefix}_landmark`,
              value
            )
          }
          disabled={disabled}
        />
      </div>
    </div>
  </div>
);

const TotalsSection = ({ totals }) => (
  <div className="rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-100 px-5 py-4">
      <h3 className="font-semibold text-slate-900">
        Invoice Summary
      </h3>
    </div>

    <div className="space-y-3 p-5 text-sm">
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">
          Subtotal
        </span>

        <span className="font-medium text-slate-800">
          {money(totals.subtotal)}
        </span>
      </div>

      {totals.discountAmount > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            Discount
          </span>

          <span className="text-slate-700">
            -{money(totals.discountAmount)}
          </span>
        </div>
      )}

      <div className="flex justify-between gap-4">
        <span className="text-slate-500">
          Taxable Amount
        </span>

        <span className="font-medium text-slate-800">
          {money(totals.taxable)}
        </span>
      </div>

      {totals.cgst > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            CGST
          </span>

          <span>{money(totals.cgst)}</span>
        </div>
      )}

      {totals.sgst > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            SGST
          </span>

          <span>{money(totals.sgst)}</span>
        </div>
      )}

      {totals.igst > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            IGST
          </span>

          <span>{money(totals.igst)}</span>
        </div>
      )}

      {totals.tcs > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            TCS
          </span>

          <span>{money(totals.tcs)}</span>
        </div>
      )}

      {totals.tds > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            TDS
          </span>

          <span>-{money(totals.tds)}</span>
        </div>
      )}

      {totals.roundOff !== 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            Round Off
          </span>

          <span>{money(totals.roundOff)}</span>
        </div>
      )}

      <div className="my-3 border-t border-slate-200" />

      <div className="flex items-end justify-between gap-4">
        <span className="font-semibold text-slate-900">
          Grand Total
        </span>

        <span className="text-2xl font-bold text-emerald-700">
          {money(totals.total)}
        </span>
      </div>
    </div>
  </div>
);

const Invoices = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [documents, setDocuments] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);

  const [stock, setStock] = useState([]);

  const [bankAccounts, setBankAccounts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [customerId, setCustomerId] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [customer, setCustomer] =
    useState(null);

  const [customerMode, setCustomerMode] =
    useState("existing");

  const [manualCustomer, setManualCustomer] =
    useState({
      name: "",
      business_name: "",
      email: "",
      phone: "",
      gstin: "",
      pan: "",

      billing_state: "",
      billing_district: "",
      billing_city: "",
      billing_pincode: "",
      billing_landmark: "",

      shipping_state: "",
      shipping_district: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_landmark: "",
    });

  const [
    sameAsBillingAddress,
    setSameAsBillingAddress,
  ] = useState(true);

  const [invoiceDate, setInvoiceDate] =
    useState(todayString());

  const [dueDate, setDueDate] =
    useState("");

  const [paymentTerms, setPaymentTerms] =
    useState("");

  const [currency, setCurrency] =
    useState("INR");

  const [notes, setNotes] =
    useState("");

  const [
    termsConditions,
    setTermsConditions,
  ] = useState("");

  const [
    discountPercent,
    setDiscountPercent,
  ] = useState(0);

  const [taxMode, setTaxMode] =
    useState("gst");

  const [
    gstRatePreset,
    setGstRatePreset,
  ] = useState("18");

  const [igstRatePreset, setIgstRatePreset] =
    useState("18");

  const [cgstRate, setCgstRate] =
    useState(9);

  const [sgstRate, setSgstRate] =
    useState(9);

  const [igstRate, setIgstRate] =
    useState(18);

  const [tcsRate, setTcsRate] =
    useState(0);

  const [tdsRate, setTdsRate] =
    useState(0);

  const [roundOff, setRoundOff] =
    useState(0);

  const [bankAccountId, setBankAccountId] =
    useState("");

  const [items, setItems] =
    useState([emptyItem()]);

  const hasStockError = useMemo(() => {
    return items.some((item) => {
      const matched = stock.find(
        (s) =>
          (item.product_id && String(s.id) === String(item.product_id)) ||
          (item.product_name &&
            s.product_name &&
            s.product_name.trim().toLowerCase() ===
              item.product_name.trim().toLowerCase())
      );
      if (
        !matched ||
        matched.item_type === "service" ||
        matched.type === "service" ||
        item.item_type === "service"
      ) {
        return false;
      }
      const avail = Number(matched.quantity ?? matched.stock_quantity ?? 0);
      return Number(item.quantity || 0) > avail;
    });
  }, [items, stock]);

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const selectedCustomer =
    customers.find(
      (customerItem) =>
        String(customerItem.id) ===
        String(customerId)
    );

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        docsRes,
        custRes,
        stockRes,
        bankRes,
      ] = await Promise.all([
        api.get("/api/documents"),
        api.get("/api/customers"),
        api.get("/api/stock"),
        api.get("/api/banking"),
      ]);

      setDocuments(
        docsRes.documents || []
      );

      setCustomers(
        custRes.customers || []
      );

      setStock(
        stockRes.stock || []
      );

      setBankAccounts(
        bankRes.banking ||
          bankRes.banks ||
          bankRes.accounts ||
          bankRes.data ||
          []
      );
    } catch (err) {
      setError(
        err.message ||
          "Could not load invoices."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    const invoiceLabel = invoice.invoice_number || `Invoice #${invoice.id}`;
    if (!window.confirm(`Are you sure you want to delete ${invoiceLabel}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.del(`/api/documents/${invoice.id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== invoice.id));
    } catch (err) {
      console.error("Failed to delete invoice:", err);
      window.alert(err.message || "Failed to delete invoice. Please try again.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!sameAsBillingAddress) {
      return;
    }

    setManualCustomer((previous) => ({
      ...previous,

      shipping_state:
        previous.billing_state,

      shipping_district:
        previous.billing_district,

      shipping_city:
        previous.billing_city,

      shipping_pincode:
        previous.billing_pincode,

      shipping_landmark:
        previous.billing_landmark,
    }));
  }, [
    sameAsBillingAddress,
    manualCustomer.billing_state,
    manualCustomer.billing_district,
    manualCustomer.billing_city,
    manualCustomer.billing_pincode,
    manualCustomer.billing_landmark,
  ]);

  const filtered = documents.filter(
    (document) => {
      if (document.doc_type !== "invoice") {
        return false;
      }

      const q = search
        .trim()
        .toLowerCase();

      return (
        String(
          document.customer_name || ""
        )
          .toLowerCase()
          .includes(q) ||
        String(
          document.invoice_number || ""
        )
          .toLowerCase()
          .includes(q)
      );
    }
  );

  const totalAmount = filtered.reduce(
    (sum, document) =>
      sum +
      Number(document.total_amount || 0),
    0
  );

  const sentCount = filtered.filter(
    (document) =>
      document.email_status === "sent"
  ).length;

  const totals = useMemo(
    () =>
      calculatePreview(items, {
        discountPercent,
        cgstRate:
          taxMode === "gst"
            ? cgstRate
            : 0,
        sgstRate:
          taxMode === "gst"
            ? sgstRate
            : 0,
        igstRate:
          taxMode === "igst"
            ? igstRate
            : 0,
        tcsRate,
        tdsRate,
        roundOff,
      }),
    [
      items,
      discountPercent,
      cgstRate,
      sgstRate,
      igstRate,
      tcsRate,
      tdsRate,
      roundOff,
      taxMode,
    ]
  );

  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItemRow = () => {
    setItems((previous) => [
      ...previous,
      emptyItem(),
    ]);
  };

  const removeItemRow = (index) => {
    setItems((previous) => {
      if (previous.length === 1) {
        return [emptyItem()];
      }

      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  };

  const selectProduct = (
    index,
    product
  ) => {
    setItems((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,

          product_id:
            product.id || "",

          product_name:
            product.product_name !==
            undefined
              ? product.product_name
              : product.name ||
                item.product_name,

          description:
            product.description ||
            item.description ||
            "",

          category:
            product.category ||
            item.category ||
            "",

          hsn_code:
            product.hsn_code ||
            item.hsn_code ||
            "",

          item_type:
            product.item_type ||
            (product.type === "service"
              ? "service"
              : "goods"),

          unit:
            product.unit ||
            item.unit ||
            "",

          price:
            product.price !== undefined &&
            product.price !== null
              ? product.price
              : item.price,
        };
      })
    );
  };

  const handleSelectCustomer = (
    selected
  ) => {
    setCustomerId(selected.id);
    setCustomer(selected);
    setCustomerMode("existing");

    setCustomerSearch(
      selected.display_name ||
        selected.name ||
        ""
    );
  };

  const updateManualCustomer = (
    field,
    value
  ) => {
    setManualCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const applyGstPreset = (value) => {
    setGstRatePreset(value);

    if (value === "manual") {
      return;
    }

    const rate = Number(value || 0);

    setCgstRate(rate / 2);
    setSgstRate(rate / 2);
  };

  const applyIgstPreset = (value) => {
    setIgstRatePreset(value);

    if (value === "manual") {
      return;
    }

    setIgstRate(Number(value || 0));
  };

  const resetForm = () => {
    setCustomerId("");
    setCustomer(null);
    setCustomerSearch("");
    setCustomerMode("existing");

    setManualCustomer({
      name: "",
      business_name: "",
      email: "",
      phone: "",
      gstin: "",
      pan: "",

      billing_state: "",
      billing_district: "",
      billing_city: "",
      billing_pincode: "",
      billing_landmark: "",

      shipping_state: "",
      shipping_district: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_landmark: "",
    });

    setSameAsBillingAddress(true);

    setInvoiceDate(todayString());
    setDueDate("");
    setPaymentTerms("");
    setCurrency("INR");

    setNotes("");
    setTermsConditions("");

    setDiscountPercent(0);

    setTaxMode("gst");

    setGstRatePreset("18");
    setIgstRatePreset("18");

    setCgstRate(9);
    setSgstRate(9);
    setIgstRate(18);

    setTcsRate(0);
    setTdsRate(0);
    setRoundOff(0);

    setBankAccountId("");

    setItems([emptyItem()]);

    setSaveError("");
  };

  const handleCreateInvoice = async (
    event
  ) => {
    event.preventDefault();

    setSaveError("");

    if (
      customerMode === "manual" &&
      !manualCustomer.name.trim()
    ) {
      setSaveError(
        "Customer name is required."
      );
      return;
    }

    const cleanItems = items
      .filter(
        (item) =>
          item.product_name ||
          item.price ||
          item.quantity
      )
      .map((item) => ({
        product_id:
          item.product_id || undefined,

        product_name:
          item.product_name,

        description:
          item.description,

        category:
          item.category,

        item_type:
          item.item_type,

        hsn_code:
          item.hsn_code,

        quantity:
          item.quantity || 1,

        unit:
          item.unit,

        price:
          item.price || 0,

        discount_percent: 0,

        tax_rate: 0,
      }));

    if (cleanItems.length === 0) {
      setSaveError(
        "Please add at least one invoice item."
      );
      return;
    }

    setSaving(true);

    try {
      let previewWindow = null;
      try {
        previewWindow = window.open("", "_blank");
      } catch (_) {}

      const createdDocument = await api.post(
        "/api/documents",
        {
          doc_type: "invoice",

          customer_id:
            customerMode === "existing"
              ? customerId || undefined
              : undefined,

          manual_customer:
            customerMode === "manual"
              ? manualCustomer
              : undefined,

          invoice_date:
            invoiceDate || undefined,

          due_date:
            dueDate || undefined,

          payment_terms:
            paymentTerms || undefined,

          currency,

          notes:
            notes || undefined,

          terms_conditions:
            termsConditions || undefined,

          discount_percent:
            discountPercent || 0,

          cgst_rate:
            taxMode === "gst"
              ? cgstRate || 0
              : 0,

          sgst_rate:
            taxMode === "gst"
              ? sgstRate || 0
              : 0,

          igst_rate:
            taxMode === "igst"
              ? igstRate || 0
              : 0,

          tcs_rate:
            tcsRate || 0,

          tds_rate:
            tdsRate || 0,

          round_off:
            roundOff || 0,

          bank_account_id:
            bankAccountId || undefined,

          items: cleanItems,
        }
      );

      const pdfPath =
        createdDocument?.document?.pdf_path ||
        createdDocument?.pdf_path ||
        createdDocument?.download_url;

      if (pdfPath) {
        try {
          const pdfUrl = await secureFileObjectUrl(pdfPath);

          if (previewWindow && !previewWindow.closed) {
            previewWindow.location.href = pdfUrl;
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
          } else {
            const pdfWindow = window.open(pdfUrl, "_blank");
            if (!pdfWindow) URL.revokeObjectURL(pdfUrl);
            else setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
          }
        } catch (pdfErr) {
          console.error("Failed to load invoice PDF:", pdfErr);
          if (previewWindow) previewWindow.close();
        }
      } else if (previewWindow) {
        previewWindow.close();
      }

      setShowModal(false);

      resetForm();

      await loadData();
    } catch (err) {
      setSaveError(
        err.message ||
          "Could not create invoice."
      );
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <main className="lg:ml-64">
        <div className="border-b border-slate-200 bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Invoices
                </h1>

                <p className="text-xs text-slate-500">
                  Create and manage your invoices
                </p>
              </div>
            </div>

            <Button
              icon={Plus}
              size="sm"
              onClick={openCreateModal}
            >
              Create Invoice
            </Button>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Total Invoices
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {filtered.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Invoice Value
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {money(totalAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Emails Sent
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {sentCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search invoices by customer or invoice number..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading invoices...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText
                  size={40}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-3 font-semibold text-slate-900">
                  No invoices found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create your first invoice to get started.
                </p>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Plus size={16} />
                  Create Invoice
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="bg-emerald-600 text-white">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Invoice
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Customer
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Date
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Due Date
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Email
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(
                      (document) => (
                        <tr
                          key={document.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">
                              {document.invoice_number ||
                                `#${document.id}`}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">
                              {document.customer_name ||
                                document.to_name ||
                                "—"}
                            </div>

                            {document.customer_business_name && (
                              <div className="text-xs text-slate-500">
                                {
                                  document.customer_business_name
                                }
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDate(
                              document.invoice_date
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDate(
                              document.due_date
                            )}
                          </td>

                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {money(
                              document.total_amount
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                EMAIL_STYLE[
                                  document
                                    .email_status
                                ] ||
                                EMAIL_STYLE.not_sent
                              }`}
                            >
                              {document.email_status ===
                              "sent"
                                ? "Sent"
                                : document.email_status ===
                                  "failed"
                                ? "Failed"
                                : "Not sent"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              {(document.pdf_path || document.download_url) && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const pdfBlob = await fetchSecureFile(document.pdf_path || document.download_url);
                                      const pdfUrl = URL.createObjectURL(pdfBlob);
                                      const link = window.document.createElement("a");
                                      link.href = pdfUrl;
                                      link.download = document.invoice_number ? `${document.invoice_number}.pdf` : "invoice.pdf";
                                      window.document.body.appendChild(link);
                                      link.click();
                                      link.remove();
                                      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
                                    } catch (err) {
                                      console.error("Failed to download invoice PDF:", err);
                                      window.alert(err.message || "Could not download the invoice PDF.");
                                    }
                                  }}
                                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
                                  title="Download PDF"
                                >
                                  <Download size={17} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteInvoice(document)}
                                className="rounded-lg p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                                title="Delete Invoice"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3 sm:p-5">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
            <div className="sticky top-0 z-50 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <FileText size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Create Invoice
                    </h2>

                    <p className="text-xs text-slate-500">
                      Invoice number will be generated automatically when saved.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form
              onSubmit={
                handleCreateInvoice
              }
              className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
              <div className="space-y-5">
                {saveError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {saveError}
                  </div>
                )}

                <Section
                  icon={CalendarDays}
                  title="Invoice Details"
                  description="Set the invoice date, due date and payment terms."
                >
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Field
                      label="Invoice Date"
                      type="date"
                      value={invoiceDate}
                      onChange={setInvoiceDate}
                      required
                    />

                    <Field
                      label="Due Date"
                      type="date"
                      value={dueDate}
                      onChange={setDueDate}
                    />

                    <Field
                      label="Payment Terms"
                      value={paymentTerms}
                      onChange={setPaymentTerms}
                      placeholder="e.g. Due within 30 days"
                    />

                    <SelectField
                      label="Currency"
                      value={currency}
                      onChange={setCurrency}
                    >
                      <option value="INR">
                        INR ₹ - Indian Rupee
                      </option>
                    </SelectField>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Invoice Number:{" "}
                    <span className="font-semibold text-slate-800">
                      Generated automatically on save
                    </span>
                  </div>
                </Section>

                <Section
                  icon={User}
                  title="Customer"
                  description="Select an existing customer or enter customer details manually."
                >
                  <div className="mb-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomerMode(
                          "existing"
                        )
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        customerMode ===
                        "existing"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Existing Customer
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode(
                          "manual"
                        );

                        setCustomerId("");
                        setCustomer(null);
                        setCustomerSearch("");
                      }}
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        customerMode ===
                        "manual"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Manual Customer
                    </button>
                  </div>

                  {customerMode ===
                  "existing" ? (
                    <div className="space-y-4">
                      <CustomerAutocomplete
                        customers={customers}
                        value={
                          customerSearch
                        }
                        onChange={(value) => {
                          setCustomerSearch(
                            value
                          );

                          if (!value) {
                            setCustomerId(
                              ""
                            );
                            setCustomer(
                              null
                            );
                          }
                        }}
                        onSelect={
                          handleSelectCustomer
                        }
                      />

                      {selectedCustomer && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {selectedCustomer.display_name ||
                                  selectedCustomer.name ||
                                  "Unnamed Customer"}
                              </p>

                              {selectedCustomer.business_name && (
                                <p className="mt-1 text-sm text-slate-600">
                                  {
                                    selectedCustomer.business_name
                                  }
                                </p>
                              )}
                            </div>

                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700">
                              Selected
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            {selectedCustomer.email && (
                              <div>
                                Email:{" "}
                                {
                                  selectedCustomer.email
                                }
                              </div>
                            )}

                            {(selectedCustomer.phone ||
                              selectedCustomer.mobile) && (
                              <div>
                                Phone:{" "}
                                {selectedCustomer.phone ||
                                  selectedCustomer.mobile}
                              </div>
                            )}

                            {selectedCustomer.gstin && (
                              <div>
                                GSTIN:{" "}
                                {
                                  selectedCustomer.gstin
                                }
                              </div>
                            )}

                            {selectedCustomer.pan && (
                              <div>
                                PAN:{" "}
                                {
                                  selectedCustomer.pan
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!selectedCustomer && (
                        <p className="text-xs text-slate-500">
                          Search and select a customer. Saved customer billing and shipping details will be used automatically.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Customer Name"
                          value={
                            manualCustomer.name
                          }
                          onChange={(value) =>
                            updateManualCustomer(
                              "name",
                              value
                            )
                          }
                          required
                        />

                        <Field
                          label="Business Name"
                          value={
                            manualCustomer.business_name
                          }
                          onChange={(value) =>
                            updateManualCustomer(
                              "business_name",
                              value
                            )
                          }
                        />

                        <Field
                          label="Email"
                          type="email"
                          value={
                            manualCustomer.email
                          }
                          onChange={(value) =>
                            updateManualCustomer(
                              "email",
                              value
                            )
                          }
                        />

                        <Field
                          label="Phone"
                          value={
                            manualCustomer.phone
                          }
                          onChange={(value) =>
                            updateManualCustomer(
                              "phone",
                              value
                            )
                          }
                        />

                        <Field
                          label="GSTIN"
                          value={
                            manualCustomer.gstin
                          }
                          onChange={(value) =>
                            updateManualCustomer(
                              "gstin",
                              value
                            )
                          }
                        />

                        <Field
                          label="PAN"
                          value={
                            manualCustomer.pan
                          }
                          onChange={(value) =>
                            updateManualCustomer(
                              "pan",
                              value
                            )
                          }
                        />
                      </div>

                      <AddressBlock
                        prefix="billing"
                        title="Billing Address"
                        customer={
                          manualCustomer
                        }
                        onChange={
                          updateManualCustomer
                        }
                      />

                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={
                              sameAsBillingAddress
                            }
                            onChange={(e) =>
                              setSameAsBillingAddress(
                                e.target.checked
                              )
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />

                          <span>
                            <span className="block text-sm font-medium text-slate-800">
                              Same as Billing Address
                            </span>

                            <span className="mt-0.5 block text-xs text-slate-500">
                              Uncheck this if the shipping address is different.
                            </span>
                          </span>
                        </label>
                      </div>

                      <AddressBlock
                        prefix="shipping"
                        title="Shipping Address"
                        customer={
                          manualCustomer
                        }
                        onChange={
                          updateManualCustomer
                        }
                        disabled={
                          sameAsBillingAddress
                        }
                      />
                    </div>
                  )}
                </Section>

                {customerMode ===
                  "existing" &&
                  selectedCustomer && (
                    <Section
                      icon={Building2}
                      title="Customer Addresses"
                      description="Saved customer billing and shipping addresses."
                    >
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <h4 className="mb-3 font-medium text-slate-800">
                            Billing Address
                          </h4>

                          <p className="text-sm leading-6 text-slate-600">
                            {[
                              selectedCustomer.billing_state,
                              selectedCustomer.billing_district,
                              selectedCustomer.billing_city,
                              selectedCustomer.billing_pincode,
                              selectedCustomer.billing_landmark,
                            ]
                              .filter(Boolean)
                              .join(", ") ||
                              "No billing address saved."}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <h4 className="mb-3 font-medium text-slate-800">
                            Shipping Address
                          </h4>

                          <p className="text-sm leading-6 text-slate-600">
                            {[
                              selectedCustomer.shipping_state ||
                                selectedCustomer.billing_state,
                              selectedCustomer.shipping_district ||
                                selectedCustomer.billing_district,
                              selectedCustomer.shipping_city ||
                                selectedCustomer.billing_city,
                              selectedCustomer.shipping_pincode ||
                                selectedCustomer.billing_pincode,
                              selectedCustomer.shipping_landmark ||
                                selectedCustomer.billing_landmark,
                            ]
                              .filter(Boolean)
                              .join(", ") ||
                              "No shipping address saved."}
                          </p>
                        </div>
                      </div>
                    </Section>
                  )}

                <Section
                  icon={Package}
                  title="Items"
                  description="Add products or services from inventory."
                  action={
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  }
                >
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const matchedStock = stock.find(
                        (s) =>
                          (item.product_id && String(s.id) === String(item.product_id)) ||
                          (item.product_name &&
                            s.product_name &&
                            s.product_name.trim().toLowerCase() ===
                              item.product_name.trim().toLowerCase())
                      );
                      const isStockTracked =
                        matchedStock &&
                        matchedStock.item_type !== "service" &&
                        matchedStock.type !== "service" &&
                        item.item_type !== "service";
                      const availStock = isStockTracked
                        ? Number(matchedStock.quantity ?? matchedStock.stock_quantity ?? 0)
                        : null;
                      const isOverStock =
                        isStockTracked && Number(item.quantity || 0) > availStock;

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-800">
                                Item {index + 1}
                              </p>

                              <p className="text-xs text-slate-500">
                                Select from inventory to autofill available details.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                              title="Remove item"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-12">
                            <div className="lg:col-span-5">
                              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Item / Product
                              </label>

                              <ItemAutocomplete
                                stock={stock}
                                item={item}
                                onSelect={(product) =>
                                  selectProduct(index, product)
                                }
                              />

                              {item.category && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Category: {item.category}
                                </p>
                              )}
                            </div>

                            <div className="lg:col-span-3">
                              <Field
                                label="Description"
                                value={item.description}
                                onChange={(value) =>
                                  updateItem(index, "description", value)
                                }
                                placeholder="Item description"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <Field
                                label="HSN / SAC"
                                value={item.hsn_code}
                                onChange={(value) =>
                                  updateItem(index, "hsn_code", value)
                                }
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <SelectField
                                label="Type"
                                value={item.item_type}
                                onChange={(value) =>
                                  updateItem(index, "item_type", value)
                                }
                              >
                                <option value="goods">Goods</option>
                                <option value="service">Service</option>
                              </SelectField>
                            </div>

                            <div className="lg:col-span-2">
                              <Field
                                label="Quantity"
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.quantity}
                                onChange={(value) =>
                                  updateItem(index, "quantity", value)
                                }
                                error={isOverStock}
                                errorText={
                                  isOverStock
                                    ? `Available stock: ${availStock}`
                                    : ""
                                }
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <Field
                                label="Unit"
                                value={
                                  item.unit
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateItem(
                                    index,
                                    "unit",
                                    value
                                  )
                                }
                                placeholder="pcs, kg, hrs"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <Field
                                label="Rate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.price
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateItem(
                                    index,
                                    "price",
                                    value
                                  )
                                }
                              />
                            </div>

                            <div className="flex items-end lg:col-span-4">
                              <div className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                                <div className="text-xs text-slate-500">
                                  Amount
                                </div>

                                <div className="mt-0.5 font-semibold text-slate-900">
                                  {money(
                                    numberValue(
                                      item.quantity
                                    ) *
                                      numberValue(
                                        item.price
                                      )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <p className="text-xs text-slate-500">
                      Inventory selection fills item name, category, HSN/SAC, type, unit and price when those values are available.
                    </p>
                  </div>
                </Section>

                <Section
                  icon={CreditCard}
                  title="Tax & Discounts"
                  description="Configure invoice-level discount and applicable taxes."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Invoice Discount %"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        discountPercent
                      }
                      onChange={
                        setDiscountPercent
                      }
                    />

                    <SelectField
                      label="Tax Type"
                      value={taxMode}
                      onChange={(value) => {
                        setTaxMode(value);

                        if (
                          value ===
                          "gst"
                        ) {
                          applyGstPreset(
                            gstRatePreset
                          );
                        }

                        if (
                          value ===
                          "igst"
                        ) {
                          applyIgstPreset(
                            igstRatePreset
                          );
                        }
                      }}
                    >
                      <option value="gst">
                        CGST + SGST
                      </option>

                      <option value="igst">
                        IGST
                      </option>

                      <option value="none">
                        No Tax
                      </option>
                    </SelectField>
                  </div>

                  {taxMode === "gst" && (
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <SelectField
                        label="GST Rate"
                        value={
                          gstRatePreset
                        }
                        onChange={
                          applyGstPreset
                        }
                      >
                        <option value="0">
                          0%
                        </option>

                        <option value="3">
                          3%
                        </option>

                        <option value="5">
                          5%
                        </option>

                        <option value="12">
                          12%
                        </option>

                        <option value="18">
                          18%
                        </option>

                        <option value="28">
                          28%
                        </option>

                        <option value="40">
                          40%
                        </option>

                        <option value="manual">
                          Manual
                        </option>
                      </SelectField>

                      <Field
                        label="CGST %"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          cgstRate
                        }
                        onChange={(value) => {
                          setCgstRate(
                            value
                          );
                          setGstRatePreset(
                            "manual"
                          );
                        }}
                      />

                      <Field
                        label="SGST %"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          sgstRate
                        }
                        onChange={(value) => {
                          setSgstRate(
                            value
                          );
                          setGstRatePreset(
                            "manual"
                          );
                        }}
                      />
                    </div>
                  )}

                  {taxMode ===
                    "igst" && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <SelectField
                        label="IGST Rate"
                        value={
                          igstRatePreset
                        }
                        onChange={
                          applyIgstPreset
                        }
                      >
                        <option value="0">
                          0%
                        </option>

                        <option value="3">
                          3%
                        </option>

                        <option value="5">
                          5%
                        </option>

                        <option value="12">
                          12%
                        </option>

                        <option value="18">
                          18%
                        </option>

                        <option value="28">
                          28%
                        </option>

                        <option value="40">
                          40%
                        </option>

                        <option value="manual">
                          Manual
                        </option>
                      </SelectField>

                      <Field
                        label="IGST %"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          igstRate
                        }
                        onChange={(value) => {
                          setIgstRate(
                            value
                          );
                          setIgstRatePreset(
                            "manual"
                          );
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <Field
                      label="TCS %"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tcsRate}
                      onChange={setTcsRate}
                    />

                    <Field
                      label="TDS %"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tdsRate}
                      onChange={setTdsRate}
                    />

                    <Field
                      label="Round Off"
                      type="number"
                      step="0.01"
                      value={roundOff}
                      onChange={setRoundOff}
                    />
                  </div>
                </Section>

                <Section
                  icon={CreditCard}
                  title="Bank Details"
                  description="Select a bank account from the Banking section."
                >
                  <SelectField
                    label="Bank Account"
                    value={
                      bankAccountId
                    }
                    onChange={
                      setBankAccountId
                    }
                  >
                    <option value="">
                      Use Default Bank Account
                    </option>

                    {bankAccounts.map(
                      (bank) => (
                        <option
                          key={bank.id}
                          value={bank.id}
                        >
                          {[
                            bank.bank_name,
                            bank.branch,
                          ]
                            .filter(Boolean)
                            .join(
                              " • "
                            ) ||
                            `Bank Account ${bank.id}`}
                        </option>
                      )
                    )}
                  </SelectField>

                  {bankAccountId && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      {(() => {
                        const bank =
                          bankAccounts.find(
                            (account) =>
                              String(
                                account.id
                              ) ===
                              String(
                                bankAccountId
                              )
                          );

                        if (!bank) {
                          return null;
                        }

                        return (
                          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                            {bank.bank_name && (
                              <div>
                                Bank:{" "}
                                <span className="font-medium text-slate-800">
                                  {
                                    bank.bank_name
                                  }
                                </span>
                              </div>
                            )}

                            {bank.branch && (
                              <div>
                                Branch:{" "}
                                <span className="font-medium text-slate-800">
                                  {
                                    bank.branch
                                  }
                                </span>
                              </div>
                            )}

                            {bank.account_holder_name && (
                              <div>
                                Account Holder:{" "}
                                <span className="font-medium text-slate-800">
                                  {
                                    bank.account_holder_name
                                  }
                                </span>
                              </div>
                            )}

                            {bank.account_number && (
                              <div>
                                Account Number:{" "}
                                <span className="font-medium text-slate-800">
                                  {
                                    bank.account_number
                                  }
                                </span>
                              </div>
                            )}

                            {bank.ifsc_code && (
                              <div>
                                IFSC:{" "}
                                <span className="font-medium text-slate-800">
                                  {
                                    bank.ifsc_code
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </Section>

                <Section
                  icon={FileText}
                  title="Terms & Conditions"
                  description="Add the terms that should appear on the invoice."
                >
                  <textarea
                    value={
                      termsConditions
                    }
                    onChange={(e) =>
                      setTermsConditions(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Enter invoice terms and conditions..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </Section>

                <Section
                  icon={FileText}
                  title="Notes"
                  description="Optional notes for the customer."
                >
                  <textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Add notes..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </Section>
              </div>

              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <TotalsSection
                  totals={totals}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold text-slate-900">
                    Actions
                  </h3>

                  <div className="mt-4 space-y-3">
                    <button
                      type="submit"
                      disabled={saving || hasStockError}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={17} />

                      {saving
                        ? "Creating Invoice..."
                        : "Create & Download Invoice"}
                    </button>
                    {hasStockError && (
                      <p className="text-center text-xs font-semibold text-red-600">
                        Item quantity exceeds available stock.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={
                        resetForm
                      }
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <RotateCcw
                        size={16}
                      />
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(
                          false
                        );
                        resetForm();
                      }}
                      disabled={saving}
                      className="w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

               
              </aside>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;