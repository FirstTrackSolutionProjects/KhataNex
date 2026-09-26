import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Menu,
  Trash2,
  Mail,
  ChevronDown,
  ChevronUp,
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
import api, { fileUrl } from "../lib/api";

const DOC_TYPE_LABEL = {
  invoice: "Invoice",
  quotation: "Quotation",
};

const EMAIL_LABEL = {
  sent: "Sent",
  failed: "Failed",
  not_sent: "Not sent",
};

const emptyItem = () => ({
  product_id: "",
  product_name: "",
  description: "",
  category: "",
  hsn_code: "",
  quantity: 1,
  price: 0,
  item_type: "goods",
  unit: "",
  discount_percent: 0,
  tax_rate: 0,
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
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const calculatePreview = (items, form) => {
  let grossSubtotal = 0;
  let itemDiscount = 0;

  items.forEach((item) => {
    const quantity = numberValue(item.quantity);
    const price = numberValue(item.price);
    const gross = quantity * price;

    const discountPercent = numberValue(item.discount_percent);
    const discount = gross * (discountPercent / 100);

    grossSubtotal += gross;
    itemDiscount += discount;
  });

  const base = Math.max(0, grossSubtotal - itemDiscount);

  const headerDiscountPercent = numberValue(form.discount_percent);
  const headerDiscount = base * (headerDiscountPercent / 100);

  const taxable = Math.max(0, base - headerDiscount);

  const cgstRate = numberValue(form.cgst_rate);
  const sgstRate = numberValue(form.sgst_rate);
  const igstRate = numberValue(form.igst_rate);
  const tcsRate = numberValue(form.tcs_rate);
  const tdsRate = numberValue(form.tds_rate);

  const cgst = taxable * (cgstRate / 100);
  const sgst = taxable * (sgstRate / 100);
  const igst = taxable * (igstRate / 100);

  const tcs = taxable * (tcsRate / 100);
  const tds = taxable * (tdsRate / 100);

  const beforeRound = taxable + cgst + sgst + igst + tcs - tds;
  const rounded = Math.round(beforeRound);
  const roundOff = rounded - beforeRound;

  return {
    grossSubtotal,
    itemDiscount,
    headerDiscount,
    discount: itemDiscount + headerDiscount,
    taxable,
    cgst,
    sgst,
    igst,
    tcs,
    tds,
    roundOff,
    total: rounded,
  };
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
  right,
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon size={18} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>

        {right}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function CustomerAutocomplete({
  customers,
  value,
  onChange,
  onSelect,
}) {
  const [open, setOpen] = useState(false);

  const selected = customers.find(
    (customer) => String(customer.id) === String(value)
  );

  const [query, setQuery] = useState(selected?.name || "");

  useEffect(() => {
    setQuery(selected?.name || "");
  }, [selected?.name]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return customers.slice(0, 8);

    return customers
      .filter((customer) => {
        const values = [
          customer.name,
          customer.business_name,
          customer.email,
          customer.phone,
          customer.mobile,
          customer.id,
        ];

        return values.some((item) =>
          String(item || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [customers, query]);

  const choose = (customer) => {
    onSelect(customer);
    onChange(String(customer.id));
    setQuery(customer.name || customer.business_name || "");
    setOpen(false);
  };

  return (
    <div className="relative">
      <span className="mb-1.5 block text-xs font-medium text-gray-600">
        Customer
      </span>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search customer by name, email, phone or ID"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              onSelect(null);
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && matches.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl">
          {matches.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(customer)}
              className="w-full border-b border-gray-50 px-4 py-3 text-left last:border-0 hover:bg-indigo-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.name || customer.business_name || "Unnamed"}
                  </p>

                  {customer.business_name &&
                    customer.business_name !== customer.name && (
                      <p className="text-xs text-gray-500">
                        {customer.business_name}
                      </p>
                    )}

                  <p className="mt-1 text-xs text-gray-500">
                    {[customer.email, customer.phone]
                      .filter(Boolean)
                      .join(" • ") || "No contact details"}
                  </p>
                </div>

                <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                  #{customer.id}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemAutocomplete({ stock, item, onSelect }) {
  const [query, setQuery] = useState(item.product_name || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(item.product_name || "");
  }, [item.product_name]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return stock.slice(0, 8);

    return stock
      .filter((product) =>
        [
          product.product_name,
          product.category,
          product.hsn_code,
          product.type,
        ].some((value) =>
          String(value || "").toLowerCase().includes(q)
        )
      )
      .slice(0, 8);
  }, [stock, query]);

  const choose = (product) => {
    onSelect(product);
    setQuery(product.product_name || "");
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSelect({
            product_name: e.target.value,
          });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search inventory item"
        className="w-full min-w-[180px] rounded-md border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      />

      {open && matches.length > 0 && (
        <div className="absolute left-0 top-full z-40 mt-1 max-h-60 w-72 overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl">
          {matches.map((product) => (
            <button
              key={product.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(product)}
              className="w-full border-b border-gray-50 px-3 py-2.5 text-left last:border-0 hover:bg-indigo-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.product_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[product.category, product.hsn_code]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>

                <span className="text-xs font-medium text-gray-700">
                  {money(product.price)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressBlock({ title, customer, type }) {
  if (!customer) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700">{title}</p>
        <p className="mt-1 text-xs text-gray-400">
          Select a customer to populate this address.
        </p>
      </div>
    );
  }

  const prefix = type === "billing" ? "billing" : "shipping";

  const state = customer[`${prefix}_state`];
  const district = customer[`${prefix}_district`];
  const city = customer[`${prefix}_city`];
  const pincode = customer[`${prefix}_pincode`];
  const landmark = customer[`${prefix}_landmark`];

  const parts = [
    state,
    district,
    city,
    pincode,
    landmark,
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-700">{title}</p>

      <div className="mt-2 space-y-1 text-sm text-gray-700">
        {parts.length > 0 ? (
          parts.map((part, index) => (
            <p key={`${part}-${index}`}>{part}</p>
          ))
        ) : (
          <p className="text-xs text-gray-400">No address saved.</p>
        )}
      </div>
    </div>
  );
}

function TotalsSection({ totals }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="space-y-3 p-5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Gross subtotal</span>
          <span>{money(totals.grossSubtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Discount</span>
            <span>- {money(totals.discount)}</span>
          </div>
        )}

        {totals.cgst > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>CGST</span>
            <span>{money(totals.cgst)}</span>
          </div>
        )}

        {totals.sgst > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>SGST</span>
            <span>{money(totals.sgst)}</span>
          </div>
        )}

        {totals.igst > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>IGST</span>
            <span>{money(totals.igst)}</span>
          </div>
        )}

        {totals.tcs > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>TCS</span>
            <span>{money(totals.tcs)}</span>
          </div>
        )}

        {totals.tds > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>TDS</span>
            <span>- {money(totals.tds)}</span>
          </div>
        )}

        <div className="flex justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
          <span>Round-off</span>
          <span>
            {totals.roundOff >= 0 ? "+" : ""}
            {money(totals.roundOff)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="text-base font-semibold text-gray-900">
            Grand Total
          </span>
          <span className="text-xl font-bold text-gray-900">
            {money(totals.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuotationForm({
  documentType = "quotation",
  onCreated,
  onCancel,
  customers,
  stock,
  banking,
}) {
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null);
  const [customerMode, setCustomerMode] = useState("existing");

  const [manualCustomer, setManualCustomer] = useState({
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

  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(false);

  const [quotationDate, setQuotationDate] = useState(todayString());
  const [validUntil, setValidUntil] = useState("");

  const [items, setItems] = useState([emptyItem()]);
  const [discountPercent, setDiscountPercent] = useState(0);

  const [taxMode, setTaxMode] = useState("gst");
  const [gstRatePreset, setGstRatePreset] = useState("18");
  const [cgstRate, setCgstRate] = useState(9);
  const [sgstRate, setSgstRate] = useState(9);
  const [igstRate, setIgstRate] = useState(18);

  const [termsConditions, setTermsConditions] = useState("1. This quotation is valid until the date mentioned above.\n2. Prices are based on the requirements and quantities specified in this quotation.\n3. Any additional work, products, taxes, delivery or other charges not mentioned in this quotation will be charged separately.\n4. Payment terms are as mutually agreed between the customer and the business.\n5. Delivery or completion timelines are subject to product availability and other agreed conditions.\n6. This quotation is subject to confirmation and may be revised if the scope or requirements change.");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(
    () =>
      calculatePreview(items, {
        discount_percent: discountPercent,
        cgst_rate: cgstRate,
        sgst_rate: sgstRate,
        igst_rate: igstRate,
      }),
    [
      items,
      discountPercent,
      cgstRate,
      sgstRate,
      igstRate,
    ]
  );

  const updateManualCustomer = (field, value) => {
    setManualCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!sameAsBusinessAddress) return;

    setManualCustomer((previous) => ({
      ...previous,
      shipping_state: previous.billing_state,
      shipping_district: previous.billing_district,
      shipping_city: previous.billing_city,
      shipping_pincode: previous.billing_pincode,
      shipping_landmark: previous.billing_landmark,
    }));
  }, [sameAsBusinessAddress, manualCustomer.billing_state, manualCustomer.billing_district, manualCustomer.billing_city, manualCustomer.billing_pincode, manualCustomer.billing_landmark]);

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const selectProduct = (index, product) => {
    setItems((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          product_id: product.id || "",
          product_name:
            product.product_name !== undefined
              ? product.product_name
              : item.product_name,
          description:
            product.description ||
            product.category ||
            item.description ||
            "",
          category: product.category || item.category || "",
          hsn_code: product.hsn_code || item.hsn_code || "",
          price:
            product.price !== undefined &&
            product.price !== null
              ? product.price
              : item.price,
          item_type:
            product.item_type ||
            (product.type === "service" ? "service" : "goods"),
        };
      })
    );
  };

  const addItem = () => {
    setItems((previous) => [...previous, emptyItem()]);
  };

  const removeItem = (index) => {
    setItems((previous) => {
      if (previous.length === 1) return previous;
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleGstRateChange = (value) => {
    setGstRatePreset(value);

    if (value === "manual") {
      return;
    }

    const rate = Number(value);

    if (taxMode === "igst") {
      setIgstRate(rate);
    } else {
      setCgstRate(rate / 2);
      setSgstRate(rate / 2);
    }
  };

  const submit = async (status = "issued") => {
    setError("");

    if (customerMode === "existing" && !customerId) {
      setError("Please select a customer or switch to manual entry.");
      return;
    }

    if (
      customerMode === "manual" &&
      !manualCustomer.name.trim() &&
      !manualCustomer.business_name.trim()
    ) {
      setError("Please enter a customer name or business name.");
      return;
    }

    if (!quotationDate) {
      setError("Please select a quotation date.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        String(item.product_name || "").trim() &&
        numberValue(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setError("Add at least one valid item.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        doc_type: documentType,

        customer_id:
          customerMode === "existing" && customerId
            ? Number(customerId)
            : null,

        manual_customer:
          customerMode === "manual"
            ? manualCustomer
            : null,

        invoice_date: `${quotationDate}T00:00:00`,

        valid_until: validUntil || undefined,

        document_status: status,

        discount_percent: numberValue(discountPercent),

        cgst_rate:
          taxMode === "gst"
            ? numberValue(cgstRate)
            : 0,

        sgst_rate:
          taxMode === "gst"
            ? numberValue(sgstRate)
            : 0,

        igst_rate:
          taxMode === "igst"
            ? numberValue(igstRate)
            : 0,

        payment_terms:
          termsConditions.trim() || undefined,

        notes:
          notes.trim() || undefined,

        items: validItems.map((item) => ({
          product_id: item.product_id
            ? Number(item.product_id)
            : undefined,

          product_name: item.product_name,

          description:
            item.description || undefined,

          category:
            item.category || undefined,

          hsn_code:
            item.hsn_code || undefined,

          quantity:
            numberValue(item.quantity),

          price:
            numberValue(item.price),

          item_type:
            item.item_type || "goods",

          unit:
            item.item_type === "service"
              ? undefined
              : item.unit || undefined,

          discount_percent:
            numberValue(item.discount_percent),

          tax_rate:
            numberValue(item.tax_rate),
        })),
      };

      const response = await api.post(
        "/api/documents",
        payload
      );

      onCreated(response);
    } catch (err) {
      setError(
        err.message || "Could not create quotation."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto max-w-7xl rounded-2xl bg-gray-50 shadow-2xl">

        <div className="sticky top-0 z-20 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={20}
                className="text-indigo-600"
              />

              <h2 className="text-lg font-semibold text-gray-900">
                Create Quotation
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Quotation number will be generated automatically when saved.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_340px]">

          <div className="space-y-5">

            <Section
              icon={CalendarDays}
              title="Quotation Details"
              description="Quotation date and validity"
            >
              <div className="grid gap-4 sm:grid-cols-2">

                <Field
                  label="Quotation Date"
                  type="date"
                  value={quotationDate}
                  onChange={setQuotationDate}
                />

                <Field
                  label="Valid Until"
                  type="date"
                  value={validUntil}
                  onChange={setValidUntil}
                />

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-gray-600">
                    Quotation Number
                  </span>

                  <div className="flex h-[42px] items-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    Generated on save
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-gray-600">
                    Currency
                  </span>

                  <div className="flex h-[42px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
                    INR ₹
                  </div>
                </div>

              </div>
            </Section>

            <Section
              icon={User}
              title="Customer"
              description="Choose an existing customer or enter one manually"
            >
              <div className="mb-4 flex gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode("existing");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    customerMode === "existing"
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  Existing Customer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode("manual");
                    setCustomer(null);
                    setCustomerId("");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    customerMode === "manual"
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  Manual Customer
                </button>

              </div>

              {customerMode === "existing" ? (
                <>
                  <CustomerAutocomplete
                    customers={customers}
                    value={customerId}
                    onChange={setCustomerId}
                    onSelect={setCustomer}
                  />

                  {customer && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold text-gray-500">
                        Selected Customer
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {customer.name || "Unnamed"}
                      </p>

                      {customer.business_name && (
                        <p className="mt-1 text-sm text-gray-600">
                          {customer.business_name}
                        </p>
                      )}

                      <div className="mt-3 space-y-1 text-xs text-gray-500">
                        {customer.email && (
                          <p>{customer.email}</p>
                        )}

                        {customer.phone && (
                          <p>{customer.phone}</p>
                        )}

                        {customer.gstin && (
                          <p>GSTIN: {customer.gstin}</p>
                        )}

                        {customer.pan && (
                          <p>PAN: {customer.pan}</p>
                        )}

                        {customer.id && (
                          <p>Customer ID: #{customer.id}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">

                  <div className="grid gap-4 md:grid-cols-2">

                    <Field
                      label="Customer Name"
                      value={manualCustomer.name}
                      onChange={(value) =>
                        updateManualCustomer("name", value)
                      }
                    />

                    <Field
                      label="Business Name"
                      value={manualCustomer.business_name}
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
                      value={manualCustomer.email}
                      onChange={(value) =>
                        updateManualCustomer("email", value)
                      }
                    />

                    <Field
                      label="Phone"
                      value={manualCustomer.phone}
                      onChange={(value) =>
                        updateManualCustomer("phone", value)
                      }
                    />

                    <Field
                      label="GSTIN"
                      value={manualCustomer.gstin}
                      onChange={(value) =>
                        updateManualCustomer("gstin", value)
                      }
                    />

                    <Field
                      label="PAN"
                      value={manualCustomer.pan}
                      onChange={(value) =>
                        updateManualCustomer("pan", value)
                      }
                    />

                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-3 text-xs font-semibold text-gray-600">
                      Billing Address
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">

                      <Field
                        label="State"
                        value={manualCustomer.billing_state}
                        onChange={(value) =>
                          updateManualCustomer(
                            "billing_state",
                            value
                          )
                        }
                      />

                      <Field
                        label="District"
                        value={manualCustomer.billing_district}
                        onChange={(value) =>
                          updateManualCustomer(
                            "billing_district",
                            value
                          )
                        }
                      />

                      <Field
                        label="City"
                        value={manualCustomer.billing_city}
                        onChange={(value) =>
                          updateManualCustomer(
                            "billing_city",
                            value
                          )
                        }
                      />

                      <Field
                        label="Pincode"
                        value={manualCustomer.billing_pincode}
                        onChange={(value) =>
                          updateManualCustomer(
                            "billing_pincode",
                            value
                          )
                        }
                      />

                      <Field
                        label="Landmark"
                        value={manualCustomer.billing_landmark}
                        onChange={(value) =>
                          updateManualCustomer(
                            "billing_landmark",
                            value
                          )
                        }
                      />

                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-gray-600">
                        Shipping Address
                      </p>

                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600">
                        <input
                          type="checkbox"
                          checked={sameAsBusinessAddress}
                          onChange={(event) =>
                            setSameAsBusinessAddress(event.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        Same as Business Address
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                      <Field
                        label="State"
                        value={manualCustomer.shipping_state}
                        onChange={(value) =>
                          updateManualCustomer(
                            "shipping_state",
                            value
                          )
                        }
                        disabled={sameAsBusinessAddress}
                      />

                      <Field
                        label="District"
                        value={manualCustomer.shipping_district}
                        onChange={(value) =>
                          updateManualCustomer(
                            "shipping_district",
                            value
                          )
                        }
                        disabled={sameAsBusinessAddress}
                      />

                      <Field
                        label="City"
                        value={manualCustomer.shipping_city}
                        onChange={(value) =>
                          updateManualCustomer(
                            "shipping_city",
                            value
                          )
                        }
                        disabled={sameAsBusinessAddress}
                      />

                      <Field
                        label="Pincode"
                        value={manualCustomer.shipping_pincode}
                        onChange={(value) =>
                          updateManualCustomer(
                            "shipping_pincode",
                            value
                          )
                        }
                        disabled={sameAsBusinessAddress}
                      />

                      <Field
                        label="Landmark"
                        value={manualCustomer.shipping_landmark}
                        onChange={(value) =>
                          updateManualCustomer(
                            "shipping_landmark",
                            value
                          )
                        }
                        disabled={sameAsBusinessAddress}
                      />

                    </div>
                  </div>

                </div>
              )}
            </Section>

            {customerMode === "existing" && customer && (
              <Section
                icon={Building2}
                title="Billing & Shipping"
                description="Pulled automatically from the selected customer"
              >
                <div className="grid gap-4 md:grid-cols-2">

                  <AddressBlock
                    title="Billing Address"
                    customer={customer}
                    type="billing"
                  />

                  <AddressBlock
                    title="Shipping Address"
                    customer={customer}
                    type="shipping"
                  />

                </div>
              </Section>
            )}

            <Section
              icon={Package}
              title="Items"
              description="Add products or services from inventory"
              right={
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <Plus size={15} />
                  Add Item
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                      <th className="pb-3 pr-3">Item</th>
                      <th className="pb-3 pr-3">Description</th>
                      <th className="pb-3 pr-3">HSN</th>
                      <th className="pb-3 pr-3">Qty</th>
                      <th className="pb-3 pr-3">Rate</th>
                      <th className="pb-3 pr-3">Discount %</th>
                      <th className="pb-3 pr-3">Amount</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => {
                      const gross =
                        numberValue(item.quantity) *
                        numberValue(item.price);

                      const discount =
                        gross *
                        (numberValue(item.discount_percent) / 100);

                      const amount = gross - discount;

                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 align-top"
                        >
                          <td className="py-3 pr-3">
                            <ItemAutocomplete
                              stock={stock}
                              item={item}
                              onSelect={(product) =>
                                selectProduct(index, product)
                              }
                            />

                            {item.category && (
                              <p className="mt-1 text-[11px] text-gray-400">
                                {item.category}
                              </p>
                            )}
                          </td>

                          <td className="py-3 pr-3">
                            <input
                              value={item.description || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Description"
                              className="w-44 rounded-md border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="py-3 pr-3">
                            <input
                              value={item.hsn_code || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "hsn_code",
                                  e.target.value
                                )
                              }
                              placeholder="HSN"
                              className="w-24 rounded-md border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="py-3 pr-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-20 rounded-md border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="py-3 pr-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="w-28 rounded-md border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="py-3 pr-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount_percent}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "discount_percent",
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-md border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                          </td>

                          <td className="whitespace-nowrap py-3 pr-3 pt-5 font-medium text-gray-900">
                            {money(amount)}
                          </td>

                          <td className="py-3 pt-4">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                              className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                Inventory selection fills the item name, category, HSN and current price. You can edit the quotation line before saving.
              </div>
            </Section>

            <Section
              icon={RotateCcw}
              title="Tax"
              description="Choose the tax type and applicable GST rate"
            >
              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Tax Type
                  </label>

                  <select
                    value={taxMode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTaxMode(value);

                      if (gstRatePreset !== "manual") {
                        const rate = Number(gstRatePreset);

                        if (value === "igst") {
                          setIgstRate(rate);
                        } else {
                          setCgstRate(rate / 2);
                          setSgstRate(rate / 2);
                        }
                      }
                    }}
                    className="h-[42px] w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="gst">CGST + SGST</option>
                    <option value="igst">IGST</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    GST Rate
                  </label>

                  <select
                    value={gstRatePreset}
                    onChange={(e) => handleGstRateChange(e.target.value)}
                    className="h-[42px] w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="0">0%</option>
                    <option value="3">3%</option>
                    <option value="5">5%</option>
                    <option value="18">18%</option>
                    <option value="40">40%</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

              </div>

              {gstRatePreset === "manual" ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">

                  {taxMode === "gst" ? (
                    <>
                      <Field
                        label="CGST %"
                        type="number"
                        min="0"
                        step="0.01"
                        value={cgstRate}
                        onChange={setCgstRate}
                      />

                      <Field
                        label="SGST %"
                        type="number"
                        min="0"
                        step="0.01"
                        value={sgstRate}
                        onChange={setSgstRate}
                      />
                    </>
                  ) : (
                    <Field
                      label="IGST %"
                      type="number"
                      min="0"
                      step="0.01"
                      value={igstRate}
                      onChange={setIgstRate}
                    />
                  )}

                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {taxMode === "gst" ? (
                    <>
                      CGST: <strong>{numberValue(cgstRate)}%</strong>
                      {" + "}
                      SGST: <strong>{numberValue(sgstRate)}%</strong>
                      {" = "}
                      <strong>{numberValue(gstRatePreset)}% GST</strong>
                    </>
                  ) : (
                    <>
                      IGST: <strong>{numberValue(igstRate)}%</strong>
                    </>
                  )}
                </div>
              )}
            </Section>

            <Section
              icon={FileText}
              title="Terms & Conditions"
              description="Terms applicable to this quotation"
            >
              <textarea
                value={termsConditions}
                onChange={(e) =>
                  setTermsConditions(e.target.value)
                }
                rows={5}
                placeholder="Enter quotation terms and conditions..."
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </Section>

            <Section
              icon={FileText}
              title="Notes"
              description="Optional notes for the customer"
            >
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Additional notes..."
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </Section>

          </div>

          <aside className="space-y-5">
            <div className="sticky top-24 space-y-5">

              

              <TotalsSection totals={totals} />

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="grid gap-2">

                  <Button
                    onClick={() => submit("issued")}
                    disabled={saving}
                    className="w-full justify-center"
                  >
                    {saving
                      ? "Creating..."
                      : "Create & Download"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => submit("draft")}
                    disabled={saving}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
const PAGE_CONFIG = {
  quotation: { title: "Quotations", description: "Create and manage quotations", createLabel: "Create Quotation" },
};

const Quotations = () => {
  const pageConfig = PAGE_CONFIG.quotation;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stock, setStock] = useState([]);
  const [banking, setBanking] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showCreate, setShowCreate] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [documentsData, customersData, stockData, bankingData] =
        await Promise.all([
          api.get("/api/documents"),
          api.get("/api/customers"),
          api.get("/api/stock"),
          api.get("/api/banking"),
        ]);

      if (false) {
        setDocuments((documentsData.receipts || []).map((receipt) => ({
          ...receipt,
          doc_type: "money_receipt",
          invoice_number: receipt.receipt_number || null,
          invoice_date: receipt.receipt_date || null,
          total_amount: receipt.amount_received ?? 0,
          customer_name: receipt.customer_name || receipt.received_from_name || null,
        })));
      } else {
        setDocuments(documentsData.documents || []);
      }

      setCustomers(customersData.customers || []);
      setStock(stockData.stock || []);
      setBanking(bankingData.banking || []);
    } catch (err) {
      setError(err.message || "Could not load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, ["quotation"]);

  const pageDocuments = documents.filter((document) => document.doc_type === "quotation");

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();

    return pageDocuments.filter((document) => {
      const matchesType =
        typeFilter === "all" ||
        document.doc_type === typeFilter;

      if (!matchesType) return false;

      if (!q) return true;

      return [
        document.invoice_number,
        document.customer_name,
        document.customer_business_name,
        document.to_name,
        document.to_business_name,
      ].some((value) =>
        String(value || "").toLowerCase().includes(q)
      );
    });
  }, [pageDocuments, search, typeFilter]);

  const totalValue = pageDocuments.reduce(
    (sum, document) => sum + numberValue(document.total_amount),
    0
  );

  const emailedCount = pageDocuments.filter(
    (document) => document.email_status === "sent"
  ).length;

  const downloadDocument = (document) => {
    const url =
      document.download_url ||
      fileUrl(document.pdf_path);

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    window.alert("PDF is not available for this document.");
  };

  const resendEmail = async (document) => {
    try {
      await api.post(
        `/api/documents/${document.id}/resend-email?doc_type=quotation`
      );

      await loadData();
    } catch (err) {
      window.alert(
        err.message || "Could not resend the document email."
      );
    }
  };

  const handleCreated = async (response) => {
    setShowCreate(false);
    await loadData();

    const url = response?.download_url
      ? fileUrl(response.download_url)
      : response?.document?.pdf_path
        ? fileUrl(response.document.pdf_path)
        : null;

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onCancel={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Quotations
                </h1>

                <p className="text-xs text-gray-500">
                  Create and manage quotations
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2"
            >
              <Plus size={17} />
              {pageConfig.createLabel}
            </Button>
          </div>
        </header>

        <div className="p-4 sm:p-6">

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-gray-500">
                Total Quotations
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {pageDocuments.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-gray-500">
                Emailed Successfully
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {emailedCount}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-gray-500">
                Total Value
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {money(totalValue)}
              </p>
            </div>

          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-3">

                <div className="relative flex-1 xl:max-w-lg">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search quotation ID, customer name or amount..."
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100"
                  >
                    Clear
                  </button>
                )}

              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-gray-500">
                Loading documents...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-12 text-center">
                <FileText
                  size={36}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  No documents found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Create your first invoice to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
                      <th className="px-4 py-3">Document</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDocuments.map((document) => (
                      <tr
                        key={document.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-900">
                            {document.invoice_number}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {DOC_TYPE_LABEL[document.doc_type] ||
                            document.doc_type}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-800">
                            {document.customer_name ||
                              document.to_name ||
                              document.customer_business_name ||
                              "Walk-in"}
                          </p>

                          {document.customer_business_name &&
                            document.customer_business_name !==
                              document.customer_name && (
                              <p className="text-xs text-gray-400">
                                {document.customer_business_name}
                              </p>
                            )}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {formatDate(document.invoice_date)}
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {money(document.total_amount)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              document.email_status === "sent"
                                ? "bg-green-50 text-green-700"
                                : document.email_status === "failed"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {EMAIL_LABEL[
                              document.email_status
                            ] || "Not sent"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                downloadDocument(document)
                              }
                              title="Download PDF"
                              className="rounded-md p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Download size={16} />
                            </button>

                            {document.customer_email && (
                              <button
                                type="button"
                                onClick={() =>
                                  resendEmail(document)
                                }
                                title="Resend email"
                                className="rounded-md p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <Mail size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <QuotationForm
          documentType="quotation"
          customers={customers}
          stock={stock}
          banking={banking}
          onCancel={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default Quotations;
