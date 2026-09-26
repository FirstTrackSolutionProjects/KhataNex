import React, { useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Button from "./Button";
import api from "../lib/api";

const today = () => new Date().toISOString().slice(0, 10);

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-gray-600">
      {label}
    </span>
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        props.className || ""
      }`}
    />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-gray-600">
      {label}
    </span>
    <select
      {...props}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
    >
      {children}
    </select>
  </label>
);

const Modal = ({ title, children, onCancel, width = "max-w-5xl" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div
      className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X size={19} />
        </button>
      </div>

      <div className="overflow-y-auto p-6">{children}</div>
    </div>
  </div>
);

function CustomerChoice({ customers, mode, setMode, customerId, setCustomerId, manual, setManual }) {
  const selected = customers.find((c) => String(c.id) === String(customerId));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === "existing"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Existing Customer
        </button>

        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === "manual"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Enter Manually
        </button>
      </div>

      {mode === "existing" ? (
        <div>
          <Select
            label="Customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select customer (optional)</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.display_name ||
                  customer.name ||
                  customer.business_name ||
                  `Customer #${customer.id}`}
                {customer.phone ? ` — ${customer.phone}` : ""}
              </option>
            ))}
          </Select>

          {selected && (
            <p className="mt-2 text-xs text-gray-500">
              {selected.email || "No email"}{" "}
              {selected.phone ? `• ${selected.phone}` : ""}
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Customer Name"
            value={manual.name}
            onChange={(e) => setManual({ ...manual, name: e.target.value })}
            placeholder="Customer name"
          />
          <Field
            label="Business Name"
            value={manual.business_name}
            onChange={(e) =>
              setManual({ ...manual, business_name: e.target.value })
            }
            placeholder="Business name"
          />
          <Field
            label="Phone"
            value={manual.phone}
            onChange={(e) => setManual({ ...manual, phone: e.target.value })}
            placeholder="Phone"
          />
          <Field
            label="Email"
            value={manual.email}
            onChange={(e) => setManual({ ...manual, email: e.target.value })}
            placeholder="Email"
            type="email"
          />
        </div>
      )}
    </div>
  );
}

function ItemRows({ items, setItems }) {
  const update = (index, key, value) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  const add = () =>
    setItems((current) => [
      ...current,
      {
        product_name: "",
        description: "",
        quantity: 1,
        price: 0,
        unit: "",
        tax_rate: 0,
      },
    ]);

  const remove = (index) =>
    setItems((current) => current.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 md:grid-cols-[1.5fr_2fr_90px_120px_90px_40px]"
        >
          <Field
            label="Item"
            value={item.product_name}
            onChange={(e) =>
              update(index, "product_name", e.target.value)
            }
            placeholder="Item / service"
          />

          <Field
            label="Description"
            value={item.description}
            onChange={(e) =>
              update(index, "description", e.target.value)
            }
            placeholder="Description"
          />

          <Field
            label="Qty"
            type="number"
            min="0"
            value={item.quantity}
            onChange={(e) =>
              update(index, "quantity", e.target.value)
            }
          />

          <Field
            label="Rate"
            type="number"
            min="0"
            value={item.price}
            onChange={(e) =>
              update(index, "price", e.target.value)
            }
          />

          <Field
            label="Unit"
            value={item.unit}
            onChange={(e) => update(index, "unit", e.target.value)}
            placeholder="pcs"
          />

          <button
            type="button"
            onClick={() => remove(index)}
            className="mt-6 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <Plus size={16} />
        Add Item
      </button>
    </div>
  );
}

export function QuotationForm({ customers, onCancel, onCreated }) {
  const [customerMode, setCustomerMode] = useState("existing");
  const [customerId, setCustomerId] = useState("");
  const [manual, setManual] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
  });

  const [quotationDate, setQuotationDate] = useState(today());
  const [validUntil, setValidUntil] = useState("");
  const [discount, setDiscount] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState([
    {
      product_name: "",
      description: "",
      quantity: 1,
      price: 0,
      unit: "",
      tax_rate: 0,
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0) * Number(item.price || 0),
      0
    );

    const discountAmount = subtotal * (Number(discount || 0) / 100);
    const taxable = Math.max(0, subtotal - discountAmount);
    const cgstAmount = taxable * (Number(cgst || 0) / 100);
    const sgstAmount = taxable * (Number(sgst || 0) / 100);

    return {
      subtotal,
      discountAmount,
      cgstAmount,
      sgstAmount,
      total: taxable + cgstAmount + sgstAmount,
    };
  }, [items, discount, cgst, sgst]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      customerMode === "manual" &&
      !manual.name.trim() &&
      !manual.business_name.trim()
    ) {
      setError("Please enter a customer name or business name.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.product_name.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.price) >= 0
    );

    if (!validItems.length) {
      setError("Please add at least one valid quotation item.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/api/documents", {
        doc_type: "quotation",
        customer_id: customerId ? Number(customerId) : null,
        manual_customer:
          customerMode === "manual" ? manual : null,
        invoice_date: quotationDate
          ? `${quotationDate}T00:00:00`
          : undefined,
        due_date: validUntil || undefined,
        discount_percent: Number(discount || 0),
        cgst_rate: Number(cgst || 0),
        sgst_rate: Number(sgst || 0),
        igst_rate: 0,
        tcs_rate: 0,
        tds_rate: 0,
        payment_terms: terms || undefined,
        terms_conditions: terms || undefined,
        notes: notes || undefined,
        items: validItems.map((item) => ({
          product_name: item.product_name,
          description: item.description || undefined,
          quantity: Number(item.quantity),
          price: Number(item.price),
          unit: item.unit || undefined,
          item_type: "goods",
          discount_percent: 0,
          tax_rate: Number(item.tax_rate || 0),
        })),
      });

      onCreated(response);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not create quotation."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create Quotation" onCancel={onCancel}>
      <form onSubmit={submit} className="space-y-6">
        <CustomerChoice
          customers={customers}
          mode={customerMode}
          setMode={setCustomerMode}
          customerId={customerId}
          setCustomerId={setCustomerId}
          manual={manual}
          setManual={setManual}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Quotation Date"
            type="date"
            value={quotationDate}
            onChange={(e) => setQuotationDate(e.target.value)}
          />
          <Field
            label="Valid Until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
          <Field
            label="Discount %"
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Items
          </h3>
          <ItemRows items={items} setItems={setItems} />
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="CGST %"
            type="number"
            min="0"
            value={cgst}
            onChange={(e) => setCgst(e.target.value)}
          />
          <Field
            label="SGST %"
            type="number"
            min="0"
            value={sgst}
            onChange={(e) => setSgst(e.target.value)}
          />
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Grand Total</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {money(totals.total)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">
              Terms & Conditions
            </span>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Payment and quotation terms..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Optional notes..."
            />
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Quotation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function MoneyReceiptForm({ customers, banking, documents, onCancel, onCreated }) {
  const invoices = documents.filter((doc) => doc.doc_type === "invoice");

  const defaultBank = banking.find((bank) => Number(bank.is_default) === 1);

  const [customerMode, setCustomerMode] = useState("existing");
  const [customerId, setCustomerId] = useState("");
  const [manual, setManual] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
  });

  const [receiptDate, setReceiptDate] = useState(today());
  const [againstType, setAgainstType] = useState("invoice");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [transactionReference, setTransactionReference] = useState("");
  const [bankId, setBankId] = useState(
    defaultBank ? String(defaultBank.id) : ""
  );
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedInvoice = invoices.find(
    (invoice) => String(invoice.id) === String(invoiceId)
  );

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const received = Number(amount);

    if (received <= 0) {
      setError("Please enter a valid amount received.");
      return;
    }

    if (
      customerMode === "manual" &&
      !manual.name.trim() &&
      !manual.business_name.trim()
    ) {
      setError("Please enter the received-from name or business name.");
      return;
    }

    if (againstType === "invoice" && !invoiceId) {
      setError("Please select an invoice or choose Advance / Other.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/api/documents/money-receipts", {
        customer_id: customerId ? Number(customerId) : null,
        received_from_name:
          customerMode === "manual"
            ? manual.name || manual.business_name
            : undefined,
        received_from_email:
          customerMode === "manual" ? manual.email || null : undefined,
        received_from_phone:
          customerMode === "manual" ? manual.phone || null : undefined,
        receipt_date: receiptDate
          ? `${receiptDate}T00:00:00`
          : undefined,
        against_type: againstType,
        amount_received: received,
        payment_mode: paymentMode,
        transaction_reference: transactionReference || undefined,
        bank_account_id: bankId ? Number(bankId) : undefined,
        description: description || undefined,
        notes: notes || undefined,
        allocations:
          againstType === "invoice"
            ? [
                {
                  invoice_id: Number(invoiceId),
                  amount_applied: received,
                },
              ]
            : [],
      });

      onCreated(response);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not create money receipt."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create Money Receipt" onCancel={onCancel}>
      <form onSubmit={submit} className="space-y-6">
        <CustomerChoice
          customers={customers}
          mode={customerMode}
          setMode={setCustomerMode}
          customerId={customerId}
          setCustomerId={setCustomerId}
          manual={manual}
          setManual={setManual}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Receipt Date"
            type="date"
            value={receiptDate}
            onChange={(e) => setReceiptDate(e.target.value)}
          />

          <Select
            label="Against"
            value={againstType}
            onChange={(e) => {
              setAgainstType(e.target.value);
              setInvoiceId("");
            }}
          >
            <option value="invoice">Invoice</option>
            <option value="advance">Advance</option>
            <option value="other">Other</option>
          </Select>

          {againstType === "invoice" ? (
            <Select
              label="Invoice"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
            >
              <option value="">Select invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} — {money(invoice.total_amount)}
                </option>
              ))}
            </Select>
          ) : (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Receipt Type</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {againstType === "advance" ? "Advance Payment" : "Other"}
              </p>
            </div>
          )}
        </div>

        {selectedInvoice && (
          <div className="grid gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Invoice</p>
              <p className="font-semibold text-gray-900">
                {selectedInvoice.invoice_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Invoice Amount</p>
              <p className="font-semibold text-gray-900">
                {money(selectedInvoice.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Receipt Amount</p>
              <p className="font-semibold text-gray-900">
                {money(amount)}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Amount Received"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />

          <Select
            label="Payment Mode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </Select>

          <Field
            label="Transaction Reference"
            value={transactionReference}
            onChange={(e) => setTransactionReference(e.target.value)}
            placeholder="UTR / cheque no. / reference"
          />
        </div>

        <Select
          label="Bank Account"
          value={bankId}
          onChange={(e) => setBankId(e.target.value)}
        >
          <option value="">Use default / no bank account</option>
          {banking.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.bank_name || "Bank"} —{" "}
              {bank.account_number || "Account"}{" "}
              {Number(bank.is_default) === 1 ? "(Default)" : ""}
            </option>
          ))}
        </Select>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Payment description..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Optional notes..."
            />
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Money Receipt"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
