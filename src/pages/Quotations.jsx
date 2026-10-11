import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Pencil,
  Eye,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import api, { secureFileObjectUrl, fetchSecureFile } from "../lib/api";

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

  const d = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const t = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${d} at ${t}`;
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
  const [filterType, setFilterType] = useState("all");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(item.product_name || "");
  }, [item.product_name]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matches = useMemo(() => {
    let list = stock || [];
    if (filterType === "goods") {
      list = list.filter((p) => {
        const t = (p.item_type || p.type || "").toLowerCase();
        const c = (p.category || "").toLowerCase();
        return t !== "service" && c !== "service" && c !== "services";
      });
    } else if (filterType === "service") {
      list = list.filter((p) => {
        const t = (p.item_type || p.type || "").toLowerCase();
        const c = (p.category || "").toLowerCase();
        return t === "service" || c === "service" || c === "services";
      });
    }

    const q = query.trim().toLowerCase();

    if (!q) return list.slice(0, 8);

    return list
      .filter((product) =>
        [
          product.product_name,
          product.name,
          product.category,
          product.hsn_code,
          product.type,
          product.item_type,
        ].some((value) =>
          String(value || "").toLowerCase().includes(q)
        )
      )
      .slice(0, 8);
  }, [stock, query, filterType]);

  const choose = (product) => {
    onSelect(product);
    setQuery(product.product_name || product.name || "");
    setOpen(false);
  };

  return (
    <div className="relative min-w-[200px]" ref={wrapperRef}>
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
        className="w-full rounded-md border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      />

      {open && (
        <div className="absolute left-0 top-full z-40 mt-1 flex max-h-72 w-80 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="flex shrink-0 items-center gap-1 border-b border-gray-100 bg-gray-50 p-1.5">
            {[
              { id: "all", label: "All" },
              { id: "goods", label: "Goods" },
              { id: "service", label: "Service" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setFilterType(id)}
                className={`flex-1 rounded py-1 text-xs font-medium transition ${
                  filterType === id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-200/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-56 overflow-y-auto">
            {matches.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-gray-500">
                No {filterType !== "all" ? filterType : ""} items found.
              </div>
            ) : (
              matches.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(product)}
                  className="w-full border-b border-gray-50 px-3 py-2.5 text-left transition last:border-0 hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.product_name || product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {[product.category, product.hsn_code]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-xs font-semibold text-emerald-700">
                      {money(product.price)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
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
  initialData = null,
  onCreated,
  onCancel,
  customers,
  stock,
  banking,
}) {
  const isEditing = Boolean(initialData);

  const [customerId, setCustomerId] = useState(() =>
    initialData?.customer_id ? String(initialData.customer_id) : ""
  );
  const [customer, setCustomer] = useState(() => {
    if (initialData?.customer_id && Array.isArray(customers)) {
      return customers.find((c) => String(c.id) === String(initialData.customer_id)) || null;
    }
    return null;
  });
  const [customerMode, setCustomerMode] = useState(() =>
    initialData?.customer_id ? "existing" : (initialData?.manual_customer || initialData?.customer_name || initialData?.to_name ? "manual" : "existing")
  );

  const [manualCustomer, setManualCustomer] = useState(() => {
    if (initialData) {
      const mc = initialData.manual_customer || {};
      return {
        name: mc.name || initialData.customer_name || initialData.to_name || "",
        business_name: mc.business_name || initialData.customer_business_name || initialData.to_business_name || "",
        email: mc.email || initialData.customer_email || initialData.to_email || "",
        phone: mc.phone || initialData.customer_phone || initialData.to_phone || "",
        gstin: mc.gstin || initialData.customer_gstin || initialData.to_gstin || "",
        pan: mc.pan || initialData.customer_pan || initialData.to_pan || "",
        billing_state: mc.billing_state || initialData.billing_state || "",
        billing_district: mc.billing_district || initialData.billing_district || "",
        billing_city: mc.billing_city || initialData.billing_city || "",
        billing_pincode: mc.billing_pincode || initialData.billing_pincode || "",
        billing_landmark: mc.billing_landmark || initialData.billing_landmark || "",
        shipping_state: mc.shipping_state || initialData.shipping_state || "",
        shipping_district: mc.shipping_district || initialData.shipping_district || "",
        shipping_city: mc.shipping_city || initialData.shipping_city || "",
        shipping_pincode: mc.shipping_pincode || initialData.shipping_pincode || "",
        shipping_landmark: mc.shipping_landmark || initialData.shipping_landmark || "",
      };
    }
    return {
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
    };
  });

  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(false);

  const [quotationDate, setQuotationDate] = useState(() =>
    initialData?.invoice_date ? initialData.invoice_date.slice(0, 10) : todayString()
  );
  const [validUntil, setValidUntil] = useState(() =>
    initialData?.valid_until ? initialData.valid_until.slice(0, 10) : ""
  );

  const [items, setItems] = useState(() => {
    if (initialData?.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
      return initialData.items.map((it) => ({
        product_id: it.product_id ? String(it.product_id) : "",
        product_name: it.product_name || it.name || it.item_name || "",
        description: it.description || "",
        category: it.category || "",
        hsn_code: it.hsn_code || it.hsn_sac || "",
        quantity: it.quantity !== undefined ? it.quantity : 1,
        unit: it.unit || "PCS",
        price: it.price !== undefined ? it.price : 0,
        item_type: it.item_type || "goods",
        discount_percent: it.discount_percent || 0,
        tax_rate: it.tax_rate || 0,
      }));
    }
    return [emptyItem()];
  });
  const [discountPercent, setDiscountPercent] = useState(() =>
    Number(initialData?.discount_percent || 0)
  );

  const [taxMode, setTaxMode] = useState(() => {
    if (initialData) {
      const igst = Number(initialData.igst_rate || 0);
      const cgst = Number(initialData.cgst_rate || 0);
      const sgst = Number(initialData.sgst_rate || 0);
      if (igst > 0) return "igst";
      if (cgst > 0 || sgst > 0) return "gst";
      return "none";
    }
    return "gst";
  });
  const [gstRatePreset, setGstRatePreset] = useState("18");
  const [cgstRate, setCgstRate] = useState(() =>
    Number(initialData?.cgst_rate !== undefined ? initialData.cgst_rate : 9)
  );
  const [sgstRate, setSgstRate] = useState(() =>
    Number(initialData?.sgst_rate !== undefined ? initialData.sgst_rate : 9)
  );
  const [igstRate, setIgstRate] = useState(() =>
    Number(initialData?.igst_rate !== undefined ? initialData.igst_rate : 18)
  );

  const [termsConditions, setTermsConditions] = useState(() =>
    initialData?.terms_conditions || initialData?.payment_terms || "1. This quotation is valid until the date mentioned above.\n2. Prices are based on the requirements and quantities specified in this quotation.\n3. Any additional work, products, taxes, delivery or other charges not mentioned in this quotation will be charged separately.\n4. Payment terms are as mutually agreed between the customer and the business.\n5. Delivery or completion timelines are subject to product availability and other agreed conditions.\n6. This quotation is subject to confirmation and may be revised if the scope or requirements change."
  );
  const [notes, setNotes] = useState(() => initialData?.notes || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) return;
    if (initialData.customer_id) {
      setCustomerId(String(initialData.customer_id));
      if (Array.isArray(customers)) {
        setCustomer(customers.find((c) => String(c.id) === String(initialData.customer_id)) || null);
      }
      setCustomerMode("existing");
    } else if (initialData.manual_customer || initialData.customer_name || initialData.to_name) {
      setCustomerMode("manual");
      const mc = initialData.manual_customer || {};
      setManualCustomer({
        name: mc.name || initialData.customer_name || initialData.to_name || "",
        business_name: mc.business_name || initialData.customer_business_name || initialData.to_business_name || "",
        email: mc.email || initialData.customer_email || initialData.to_email || "",
        phone: mc.phone || initialData.customer_phone || initialData.to_phone || "",
        gstin: mc.gstin || initialData.customer_gstin || initialData.to_gstin || "",
        pan: mc.pan || initialData.customer_pan || initialData.to_pan || "",
        billing_state: mc.billing_state || initialData.billing_state || "",
        billing_district: mc.billing_district || initialData.billing_district || "",
        billing_city: mc.billing_city || initialData.billing_city || "",
        billing_pincode: mc.billing_pincode || initialData.billing_pincode || "",
        billing_landmark: mc.billing_landmark || initialData.billing_landmark || "",
        shipping_state: mc.shipping_state || initialData.shipping_state || "",
        shipping_district: mc.shipping_district || initialData.shipping_district || "",
        shipping_city: mc.shipping_city || initialData.shipping_city || "",
        shipping_pincode: mc.shipping_pincode || initialData.shipping_pincode || "",
        shipping_landmark: mc.shipping_landmark || initialData.shipping_landmark || "",
      });
    }

    if (initialData.invoice_date) {
      setQuotationDate(initialData.invoice_date.slice(0, 10));
    }
    if (initialData.valid_until) {
      setValidUntil(initialData.valid_until.slice(0, 10));
    }
    if (initialData.discount_percent !== undefined) {
      setDiscountPercent(Number(initialData.discount_percent));
    }
    if (initialData.terms_conditions || initialData.payment_terms) {
      setTermsConditions(initialData.terms_conditions || initialData.payment_terms);
    }
    if (initialData.notes) {
      setNotes(initialData.notes);
    }
    const igst = Number(initialData.igst_rate || 0);
    const cgst = Number(initialData.cgst_rate || 0);
    const sgst = Number(initialData.sgst_rate || 0);
    if (igst > 0) {
      setTaxMode("igst");
      setIgstRate(igst);
    } else if (cgst > 0 || sgst > 0) {
      setTaxMode("gst");
      setCgstRate(cgst);
      setSgstRate(sgst);
    }
    if (Array.isArray(initialData.items) && initialData.items.length > 0) {
      setItems(initialData.items.map((it) => ({
        product_id: it.product_id ? String(it.product_id) : "",
        product_name: it.product_name || it.name || it.item_name || "",
        description: it.description || "",
        category: it.category || "",
        hsn_code: it.hsn_code || it.hsn_sac || "",
        quantity: it.quantity !== undefined ? it.quantity : 1,
        unit: it.unit || "PCS",
        price: it.price !== undefined ? it.price : 0,
        item_type: it.item_type || "goods",
        discount_percent: it.discount_percent || 0,
        tax_rate: it.tax_rate || 0,
      })));
    }
  }, [initialData, customers]);

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

    for (const item of validItems) {
      if (item.product_id && Array.isArray(stock)) {
        const prod = stock.find((p) => String(p.id) === String(item.product_id));
        if (
          prod &&
          prod.type !== "service" &&
          (prod.quantity !== undefined || prod.stock_quantity !== undefined || prod.stock !== undefined)
        ) {
          const avail = Number(prod.quantity ?? prod.stock_quantity ?? prod.stock ?? 0);
          if (numberValue(item.quantity) > avail) {
            setError(
              `Quantity for "${item.product_name}" exceeds available stock (${avail} available).`
            );
            return;
          }
        }
      }
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

      let response;
      if (initialData) {
        try {
          response = await api.patch(
            `/api/documents/${initialData.id}`,
            payload
          );
        } catch (_) {
          response = await api.put(
            `/api/documents/${initialData.id}`,
            payload
          );
        }
      } else {
        response = await api.post(
          "/api/documents",
          payload
        );
      }

      onCreated(response);
    } catch (err) {
      setError(
        err.message || (isEditing ? "Could not update quotation." : "Could not create quotation.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:left-64 overflow-y-auto overflow-x-hidden bg-black/40 p-2 sm:p-4 lg:p-6">
      <div className="mx-auto w-full max-w-full overflow-hidden rounded-2xl bg-gray-50 shadow-2xl lg:max-w-7xl">

        <div className="sticky top-0 z-20 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={20}
                className="text-indigo-600"
              />

              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Quotation" : "Create Quotation"}
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              {isEditing
                ? `Editing ${initialData?.invoice_number || "Quotation"}`
                : ""}
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

        <div className="grid gap-5 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_340px]">

          <div className="min-w-0 space-y-5">

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
                            {(() => {
                              const prod = item.product_id && Array.isArray(stock) ? stock.find((p) => String(p.id) === String(item.product_id)) : null;
                              const availStock = prod && prod.type !== "service" && (prod.quantity !== undefined || prod.stock_quantity !== undefined || prod.stock !== undefined) ? Number(prod.quantity ?? prod.stock_quantity ?? prod.stock ?? 0) : null;
                              const isOverStock = availStock !== null && Number(item.quantity || 0) > availStock;

                              return (
                                <div>
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
                                    className={`w-20 rounded-md border px-2.5 py-2 text-sm outline-none transition ${
                                      isOverStock
                                        ? "border-rose-400 bg-rose-50 text-rose-700 focus:border-rose-500"
                                        : "border-gray-200 focus:border-indigo-500"
                                    }`}
                                  />
                                  {isOverStock && (
                                    <p className="mt-0.5 text-[10px] font-semibold text-rose-600">
                                      Max {availStock}
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
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
                      ? (isEditing ? "Updating..." : "Creating...")
                      : (isEditing ? "Update & Download" : "Create & Download")}
                  </Button>

                  <button
                    type="button"
                    onClick={() => submit("draft")}
                    disabled={saving}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : (isEditing ? "Update as Draft" : "Save Draft")}
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
  const [editingQuotation, setEditingQuotation] = useState(null);

  const [quotationPreviewModal, setQuotationPreviewModal] = useState({
    isOpen: false,
    document: null,
    pdfUrl: "",
    loading: false,
  });

  const handleOpenQuotationPreview = async (doc) => {
    const pdfPath = doc?.pdf_path || doc?.download_url;
    setQuotationPreviewModal({
      isOpen: true,
      document: doc,
      pdfUrl: "",
      loading: true,
    });
    if (!pdfPath) {
      setQuotationPreviewModal((prev) => ({ ...prev, loading: false }));
      return;
    }
    try {
      const pdfUrl = await secureFileObjectUrl(pdfPath);
      setQuotationPreviewModal({
        isOpen: true,
        document: doc,
        pdfUrl,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to load quotation PDF preview:", err);
      setQuotationPreviewModal((prev) => ({
        ...prev,
        loading: false,
      }));
      window.alert(err.message || "Failed to load quotation PDF preview.");
    }
  };

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

  const downloadDocument = async (document) => {
    const url = document?.pdf_path || document?.download_url;
    if (!url) {
      window.alert("PDF is not available for this document.");
      return;
    }

    try {
      const pdfBlob = await fetchSecureFile(url);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = window.document.createElement("a");

      link.href = pdfUrl;
      link.download = document.quotation_number
        ? `${document.quotation_number}.pdf`
        : "quotation.pdf";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (err) {
      console.error("Failed to download quotation PDF:", err);
      window.alert(err.message || "Could not download the quotation PDF.");
    }
  };

  const handleDeleteQuotation = async (quotation) => {
    const quotationLabel =
      quotation.quotation_number || `Quotation #${quotation.id}`;
    if (
      !window.confirm(
        `Are you sure you want to delete ${quotationLabel}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.del(`/api/documents/${quotation.id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== quotation.id));
    } catch (err) {
      console.error("Failed to delete quotation:", err);
      window.alert(
        err.message || "Failed to delete quotation. Please try again."
      );
    }
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

  const handleEditQuotation = async (doc) => {
    try {
      let fullDoc = doc;
      try {
        const res = await api.get(`/api/documents/${doc.id}`);
        if (res?.document || res?.data) {
          fullDoc = res.document || res.data;
        } else if (res?.id) {
          fullDoc = res;
        }
      } catch (_) {
        // Fallback to doc from list
      }
      setEditingQuotation(fullDoc);
      setShowCreate(true);
    } catch (err) {
      setEditingQuotation(doc);
      setShowCreate(true);
    }
  };

  const handleCreated = async (response) => {
    setShowCreate(false);
    setEditingQuotation(null);
    await loadData();

    const pdfPath =
      response?.document?.pdf_path ||
      response?.pdf_path ||
      response?.download_url;

    if (!pdfPath) {
      const errorMsg =
        response?.error ||
        response?.message ||
        response?.pdf_error ||
        "Quotation was created, but PDF generation failed on the server.";
      window.alert(errorMsg);
      return;
    }

    try {
      const pdfUrl = await secureFileObjectUrl(pdfPath);
      setQuotationPreviewModal({
        isOpen: true,
        document: response?.document || null,
        pdfUrl,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to open quotation PDF:", err);
      window.alert(err.message || "Could not open the quotation PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCancel={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64">
        <PageHeader
          title="Quotations"
          subtitle="Create and manage quotations"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showSearch={true}
          showProfile={true}
          onNew={() => {
            setEditingQuotation(null);
            setShowCreate(true);
          }}
          newLabel={pageConfig?.createLabel || "Create Quotation"}
        />

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

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center gap-3">

                <div className="relative flex-1 xl:max-w-lg">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search quotation ID, customer name or amount..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100"
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
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="bg-emerald-600 text-white">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Document</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Type</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Customer</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Amount</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Email</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((document) => (
                      <tr
                        key={document.id}
                        className="hover:bg-slate-50"
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
                          {formatDate(document.invoice_date || document.created_at)}
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {money(document.total_amount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              document.email_status === "sent"
                                ? "bg-emerald-50 text-emerald-700"
                                : document.email_status === "failed"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {EMAIL_LABEL[
                              document.email_status
                            ] || "Not sent"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenQuotationPreview(document)
                              }
                              title="View Quotation"
                              className="rounded-lg p-2 sm:p-2.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                            >
                              <Eye size={16} className="sm:w-5 sm:h-5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEditQuotation(document)
                              }
                              title="Edit Quotation"
                              className="rounded-lg p-2 sm:p-2.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                            >
                              <Pencil size={16} className="sm:w-5 sm:h-5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                downloadDocument(document)
                              }
                              title="Download PDF"
                              className="rounded-lg p-2 sm:p-2.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                            >
                              <Download size={16} className="sm:w-5 sm:h-5" />
                            </button>

                            {document.customer_email && (
                              <button
                                type="button"
                                onClick={() =>
                                  resendEmail(document)
                                }
                                title="Resend email"
                                className="rounded-lg p-2 sm:p-2.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                              >
                                <Mail size={16} className="sm:w-5 sm:h-5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteQuotation(document)
                              }
                              title="Delete Quotation"
                              className="rounded-lg p-2 sm:p-2.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <Trash2 size={16} className="sm:w-5 sm:h-5" />
                            </button>
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
          initialData={editingQuotation}
          customers={customers}
          stock={stock}
          banking={banking}
          onCancel={() => {
            setShowCreate(false);
            setEditingQuotation(null);
          }}
          onCreated={handleCreated}
        />
      )}

      {/* IN-PAGE QUOTATION PREVIEW MODAL */}
      <Modal
        open={quotationPreviewModal.isOpen}
        onClose={() => {
          if (quotationPreviewModal.pdfUrl) {
            URL.revokeObjectURL(quotationPreviewModal.pdfUrl);
          }
          setQuotationPreviewModal({
            isOpen: false,
            document: null,
            pdfUrl: "",
            loading: false,
          });
        }}
        title={`Quotation ${quotationPreviewModal.document?.quotation_number ? `#${quotationPreviewModal.document.quotation_number}` : ""}`}
      >
        <div className="space-y-4">
          <div className="flex min-h-[300px] max-h-[70vh] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {quotationPreviewModal.loading ? (
              <p className="text-sm text-slate-500">Loading quotation document...</p>
            ) : quotationPreviewModal.pdfUrl ? (
              <iframe
                src={quotationPreviewModal.pdfUrl}
                title="Quotation Document"
                className="h-[65vh] w-full rounded-lg border-0"
              />
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                <FileText size={36} className="mx-auto mb-2 text-slate-400" />
                <p>Quotation PDF is not attached or generated yet.</p>
                <p className="mt-1 text-xs text-slate-400">
                  Customer: {quotationPreviewModal.document?.customer_name || quotationPreviewModal.document?.to_name || "—"}
                </p>
                <p className="text-xs text-slate-400">
                  Total: {money(quotationPreviewModal.document?.total_amount)}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            {/* Delete Action */}
            <button
              type="button"
              onClick={() => {
                const docToDelete = quotationPreviewModal.document;
                if (quotationPreviewModal.pdfUrl) {
                  URL.revokeObjectURL(quotationPreviewModal.pdfUrl);
                }
                setQuotationPreviewModal({
                  isOpen: false,
                  document: null,
                  pdfUrl: "",
                  loading: false,
                });
                if (docToDelete) handleDeleteQuotation(docToDelete);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <Trash2 size={15} className="sm:w-4 sm:h-4" /> Delete
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Download Action */}
              {quotationPreviewModal.pdfUrl && (
                <a
                  href={quotationPreviewModal.pdfUrl}
                  download={
                    quotationPreviewModal.document?.quotation_number
                      ? `${quotationPreviewModal.document.quotation_number}.pdf`
                      : "quotation.pdf"
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download size={15} className="sm:w-4 sm:h-4" /> Download
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  if (quotationPreviewModal.pdfUrl) {
                    URL.revokeObjectURL(quotationPreviewModal.pdfUrl);
                  }
                  setQuotationPreviewModal({
                    isOpen: false,
                    document: null,
                    pdfUrl: "",
                    loading: false,
                  });
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Quotations;
