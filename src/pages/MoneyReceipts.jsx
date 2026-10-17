import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Menu,
  X,
  User,
  Building2,
  CreditCard,
  FileText,
  RefreshCw,
  Trash2,
  Pencil,
  Eye,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import api, { secureFileObjectUrl, fetchSecureFile } from "../lib/api";
import useSubscriptionAccess from "../hooks/useSubscriptionAccess";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const numberValue = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const todayString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

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

const getCustomerLabel = (customer) =>
  customer?.business_name ||
  customer?.display_name ||
  customer?.name ||
  "Unnamed Customer";

const getCustomerDetails = (customer) =>
  [
    customer?.name,
    customer?.email,
    customer?.phone,
    customer?.id,
  ]
    .filter(Boolean)
    .join(" • ");

const getInvoiceLabel = (invoice) =>
  invoice?.invoice_number ||
  invoice?.document_number ||
  `Invoice #${invoice?.id || ""}`;

const getInvoiceCustomer = (invoice) =>
  invoice?.customer_name ||
  invoice?.to_name ||
  invoice?.to_business_name ||
  "Customer";

function ReceiptCustomerPicker({
  customers,
  mode,
  setMode,
  selectedCustomer,
  setSelectedCustomer,
  manualCustomer,
  updateManualCustomer,
}) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return customers.slice(0, 10);

    return customers
      .filter((customer) =>
        [
          customer?.name,
          customer?.display_name,
          customer?.business_name,
          customer?.email,
          customer?.phone,
          customer?.customer_code,
          customer?.id,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(q)
          )
      )
      .slice(0, 10);
  }, [customers, search]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Received From
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Select an existing customer or enter the customer manually.
          </p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`rounded-md px-4 py-2 text-xs font-medium transition ${mode === "existing"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Existing Customer
          </button>

          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`rounded-md px-4 py-2 text-xs font-medium transition ${mode === "manual"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {mode === "existing" ? (
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCustomer(null);
              }}
              placeholder="Search name, business, phone, email or customer ID..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {!selectedCustomer && (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  {search
                    ? "No customers found."
                    : "Start typing to search customers."}
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setSearch(getCustomerLabel(customer));
                    }}
                    className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <User size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {getCustomerLabel(customer)}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {getCustomerDetails(customer)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedCustomer && (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                  <User size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {getCustomerLabel(selectedCustomer)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {getCustomerDetails(selectedCustomer)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setSearch("");
                }}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-700"
              >
                <X size={17} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Customer Name
            </label>

            <input
              value={manualCustomer.name}
              onChange={(e) =>
                updateManualCustomer("name", e.target.value)
              }
              placeholder="Customer name"
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceAllocation({
  invoices,
  allocations,
  setAllocations,
  customerId,
  amountReceived,
}) {
  const availableInvoices = useMemo(() => {
    if (!customerId) return invoices;

    return invoices.filter((invoice) => {
      if (!invoice.customer_id) return true;

      return (
        Number(invoice.customer_id) === Number(customerId)
      );
    });
  }, [invoices, customerId]);

  const receivedAmount = numberValue(amountReceived);

  const allocationTotal = allocations.reduce(
    (sum, item) =>
      sum + numberValue(item.amount_applied),
    0
  );

  const remainingAmount = Math.max(
    receivedAmount - allocationTotal,
    0
  );

  const addAllocation = () => {
    setAllocations((prev) => [
      ...prev,
      {
        invoice_id: "",
        amount_applied: "",
      },
    ]);
  };

  const removeAllocation = (index) => {
    setAllocations((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateAllocation = (index, field, value) => {
    setAllocations((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "amount_applied") {
          const requested = Math.max(
            numberValue(value),
            0
          );

          const otherAllocated = prev.reduce(
            (sum, allocation, allocationIndex) =>
              allocationIndex === index
                ? sum
                : sum +
                numberValue(
                  allocation.amount_applied
                ),
            0
          );

          const selectedInvoice = invoices.find(
            (invoice) =>
              String(invoice.id) ===
              String(item.invoice_id)
          );

          const invoiceTotal = selectedInvoice
            ? Math.max(
              numberValue(
                selectedInvoice.total_amount
              ),
              0
            )
            : Infinity;

          const maxAllowed = Math.max(
            Math.min(
              invoiceTotal,
              receivedAmount - otherAllocated
            ),
            0
          );

          return {
            ...item,
            [field]:
              requested > maxAllowed
                ? maxAllowed.toFixed(2)
                : value,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const selectInvoice = (index, invoiceId) => {
    const selectedInvoice = invoices.find(
      (invoice) =>
        String(invoice.id) === String(invoiceId)
    );

    setAllocations((prev) => {
      const otherAllocated = prev.reduce(
        (sum, item, itemIndex) =>
          itemIndex === index
            ? sum
            : sum +
            numberValue(item.amount_applied),
        0
      );

      if (!invoiceId || !selectedInvoice) {
        return prev.map((item, itemIndex) =>
          itemIndex === index
            ? {
              ...item,
              invoice_id: invoiceId,
              amount_applied: "",
            }
            : item
        );
      }

      const invoiceTotal = Math.max(
        numberValue(
          selectedInvoice.total_amount
        ),
        0
      );

      const availableReceived = Math.max(
        receivedAmount - otherAllocated,
        0
      );

      const amountToApply = Math.min(
        invoiceTotal,
        availableReceived
      );

      return prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
            ...item,
            invoice_id: invoiceId,
            amount_applied:
              amountToApply > 0
                ? amountToApply.toFixed(2)
                : "0.00",
          }
          : item
      );
    });
  };

  useEffect(() => {
    if (!allocations.length) return;

    if (receivedAmount <= 0) {
      setAllocations((prev) =>
        prev.map((item) => ({
          ...item,
          amount_applied: "",
        }))
      );
      return;
    }

    setAllocations((prev) => {
      let remaining = receivedAmount;
      let changed = false;

      const next = prev.map((item) => {
        if (!item.invoice_id) {
          if (item.amount_applied !== "") {
            changed = true;
          }

          return {
            ...item,
            amount_applied: "",
          };
        }

        const invoice = invoices.find(
          (candidate) =>
            String(candidate.id) ===
            String(item.invoice_id)
        );

        if (!invoice) {
          if (item.amount_applied !== "") {
            changed = true;
          }

          return {
            ...item,
            amount_applied: "",
          };
        }

        const invoiceTotal = Math.max(
          numberValue(invoice.total_amount),
          0
        );

        const nextAmount = Math.min(
          invoiceTotal,
          remaining
        );

        remaining = Math.max(
          remaining - nextAmount,
          0
        );

        const formatted =
          nextAmount > 0
            ? nextAmount.toFixed(2)
            : "";

        if (
          String(item.amount_applied) !==
          formatted
        ) {
          changed = true;
        }

        return {
          ...item,
          amount_applied: formatted,
        };
      });

      return changed ? next : prev;
    });
  }, [receivedAmount, invoices]);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Invoice Allocation
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Allocate the received amount against one or more invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={addAllocation}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
        >
          <Plus size={15} />
          Add Invoice
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">
            Amount Received
          </p>

          <p className="mt-1 text-base font-semibold text-emerald-700">
            {money(receivedAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">
            Remaining to Allocate
          </p>

          <p className="mt-1 text-base font-semibold text-gray-900">
            {money(remainingAmount)}
          </p>
        </div>
      </div>

      {allocations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <FileText className="mx-auto text-gray-400" size={24} />

          <p className="mt-2 text-sm font-medium text-gray-700">
            No invoice selected
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Add the invoice against which this payment was received.
          </p>

          <button
            type="button"
            onClick={addAllocation}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
          >
            Add Invoice
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {allocations.map((allocation, index) => {
            const selectedInvoice = invoices.find(
              (invoice) =>
                String(invoice.id) ===
                String(allocation.invoice_id)
            );

            return (
              <div
                key={`${index}-${allocation.invoice_id}`}
                className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_180px_auto]"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Invoice
                  </label>

                  <select
                    value={allocation.invoice_id}
                    onChange={(e) =>
                      selectInvoice(
                        index,
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">
                      Select invoice
                    </option>

                    {availableInvoices.map((invoice) => (
                      <option
                        key={invoice.id}
                        value={invoice.id}
                      >
                        {getInvoiceLabel(invoice)} —{" "}
                        {getInvoiceCustomer(invoice)} —{" "}
                        {money(invoice.total_amount)}
                      </option>
                    ))}
                  </select>

                  {selectedInvoice && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Invoice total:{" "}
                      {money(selectedInvoice.total_amount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Amount Applied
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={Math.max(
                      Math.min(
                        numberValue(
                          selectedInvoice?.total_amount
                        ),
                        receivedAmount
                      ),
                      0
                    )}
                    value={allocation.amount_applied}
                    onChange={(e) =>
                      updateAllocation(
                        index,
                        "amount_applied",
                        e.target.value
                      )
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeAllocation(index)}
                  className="self-end rounded-lg p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Remove invoice"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">
              Allocation Total
            </span>

            <span className="text-base font-semibold text-emerald-700">
              {money(allocationTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function MoneyReceiptForm({
  initialData = null,
  customers,
  banking,
  invoices,
  onCreated,
  onCancel,
}) {
  const { canWrite, subscriptionRequiredMessage } = useSubscriptionAccess();
  const isEditing = Boolean(initialData);

  const [customerMode, setCustomerMode] = useState(() =>
    initialData?.customer_id
      ? "existing"
      : initialData?.received_from_name || initialData?.customer_name
      ? "manual"
      : "existing"
  );

  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    if (initialData?.customer_id && Array.isArray(customers)) {
      return (
        customers.find(
          (c) => String(c.id) === String(initialData.customer_id)
        ) || null
      );
    }
    return null;
  });

  const [manualCustomer, setManualCustomer] = useState(() => ({
    name:
      initialData?.received_from_name ||
      initialData?.customer_name ||
      "",
  }));

  const [receiptDate, setReceiptDate] = useState(() =>
    initialData?.receipt_date
      ? initialData.receipt_date.slice(0, 10)
      : todayString()
  );

  const [amount, setAmount] = useState(() =>
    initialData
      ? String(
          initialData.amount_received ??
            initialData.amount ??
            ""
        )
      : ""
  );

  const [againstType, setAgainstType] = useState(
    () => initialData?.against_type || "invoice"
  );

  const [allocations, setAllocations] = useState(() => {
    if (
      initialData?.allocations &&
      Array.isArray(initialData.allocations) &&
      initialData.allocations.length > 0
    ) {
      return initialData.allocations.map((a) => ({
        invoice_id: a.invoice_id ? String(a.invoice_id) : "",
        amount_applied:
          a.amount_applied !== undefined
            ? String(a.amount_applied)
            : "",
      }));
    }
    if (initialData?.invoice_id) {
      return [
        {
          invoice_id: String(initialData.invoice_id),
          amount_applied: String(
            initialData.amount_received ??
              initialData.amount ??
              ""
          ),
        },
      ];
    }
    return [];
  });

  const [paymentMode, setPaymentMode] = useState(
    () => initialData?.payment_mode || "cash"
  );

  const [transferType, setTransferType] = useState(
    () => initialData?.transfer_type || ""
  );

  const [transactionReference, setTransactionReference] = useState(
    () => initialData?.transaction_reference || ""
  );

  const [bankAccountId, setBankAccountId] = useState(() =>
    initialData?.bank_account_id
      ? String(initialData.bank_account_id)
      : ""
  );

  const [description, setDescription] = useState(
    () => initialData?.description || ""
  );

  const [notes, setNotes] = useState(
    () => initialData?.notes || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) return;
    if (initialData.customer_id) {
      setCustomerMode("existing");
      if (Array.isArray(customers)) {
        setSelectedCustomer(
          customers.find(
            (c) => String(c.id) === String(initialData.customer_id)
          ) || null
        );
      }
    } else if (
      initialData.received_from_name ||
      initialData.customer_name
    ) {
      setCustomerMode("manual");
      setManualCustomer({
        name:
          initialData.received_from_name ||
          initialData.customer_name ||
          "",
      });
    }

    if (initialData.receipt_date) {
      setReceiptDate(initialData.receipt_date.slice(0, 10));
    }
    if (
      initialData.amount_received !== undefined ||
      initialData.amount !== undefined
    ) {
      setAmount(
        String(
          initialData.amount_received ?? initialData.amount
        )
      );
    }
    if (initialData.against_type) {
      setAgainstType(initialData.against_type);
    }
    if (initialData.payment_mode) {
      setPaymentMode(initialData.payment_mode);
    }
    if (initialData.transaction_reference) {
      setTransactionReference(initialData.transaction_reference);
    }
    if (initialData.bank_account_id) {
      setBankAccountId(String(initialData.bank_account_id));
    }
    if (initialData.description) {
      setDescription(initialData.description);
    }
    if (initialData.notes) {
      setNotes(initialData.notes);
    }
    if (
      Array.isArray(initialData.allocations) &&
      initialData.allocations.length > 0
    ) {
      setAllocations(
        initialData.allocations.map((a) => ({
          invoice_id: a.invoice_id ? String(a.invoice_id) : "",
          amount_applied:
            a.amount_applied !== undefined
              ? String(a.amount_applied)
              : "",
        }))
      );
    } else if (initialData.invoice_id) {
      setAllocations([
        {
          invoice_id: String(initialData.invoice_id),
          amount_applied: String(
            initialData.amount_received ??
              initialData.amount ??
              ""
          ),
        },
      ]);
    }
  }, [initialData, customers]);

  const selectedBank = banking.find(
    (account) =>
      String(account.id) === String(bankAccountId)
  );

  const allocationTotal = allocations.reduce(
    (sum, item) =>
      sum + numberValue(item.amount_applied),
    0
  );

  useEffect(() => {
    if (againstType === "invoice" && allocations.length === 0) {
      setAllocations([
        {
          invoice_id: "",
          amount_applied: "",
        },
      ]);
    }

    if (
      againstType !== "invoice" &&
      againstType !== "multiple_invoices"
    ) {
      setAllocations([]);
    }
  }, [againstType]);

  const updateManualCustomer = (field, value) => {
    setManualCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (draft = false) => {
    setError("");

    if (!canWrite) {
      setError(subscriptionRequiredMessage);
      return;
    }

    const numericAmount = numberValue(amount);

    if (numericAmount <= 0) {
      setError("Please enter a valid amount received.");
      return;
    }

    if (
      customerMode === "manual" &&
      !manualCustomer.name.trim()
    ) {
      setError(
        "Please enter the customer name."
      );
      return;
    }

    if (
      (againstType === "invoice" ||
        againstType === "multiple_invoices") &&
      allocations.length === 0
    ) {
      setError(
        "Please allocate this receipt to at least one invoice."
      );
      return;
    }

    if (
      againstType === "invoice" ||
      againstType === "multiple_invoices"
    ) {
      const validAllocations = allocations.filter(
        (item) =>
          Number(item.invoice_id) > 0 &&
          numberValue(item.amount_applied) > 0
      );

      if (validAllocations.length !== allocations.length) {
        setError(
          "Every invoice allocation must have an invoice and a positive amount."
        );
        return;
      }

      if (
        allocationTotal - numericAmount >
        0.01
      ) {
        setError(
          `Invoice allocation total (${money(
            allocationTotal
          )}) cannot exceed the amount received (${money(
            numericAmount
          )}).`
        );
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        doc_type: "money_receipt",
        document_status: draft ? "draft" : "issued",
        receipt_date: receiptDate,

        customer_id:
          customerMode === "existing" &&
            selectedCustomer
            ? selectedCustomer.id
            : null,

        received_from_name:
          customerMode === "existing"
            ? selectedCustomer?.display_name ||
              selectedCustomer?.name ||
              selectedCustomer?.business_name ||
              null
            : manualCustomer.name.trim() || null,
        against_type: againstType,
        amount_received: numericAmount,
        amount: numericAmount,
        payment_mode: paymentMode,
        transfer_type:
          paymentMode === "bank_transfer"
            ? transferType.trim() || null
            : null,
        transaction_reference:
          transactionReference.trim() || null,

        bank_account_id:
          bankAccountId || null,

        description: description.trim() || null,
        notes: notes.trim() || null,

        allocations:
          againstType === "invoice" ||
            againstType === "multiple_invoices"
            ? allocations.map((item) => ({
              invoice_id: Number(item.invoice_id),
              amount_applied: numberValue(
                item.amount_applied
              ),
            }))
            : [],
      };

      let response;
      if (initialData) {
        try {
          response = await api.patch(
            `/api/documents/money-receipts/${initialData.id}`,
            payload
          );
        } catch (_) {
          try {
            response = await api.put(
              `/api/documents/money-receipts/${initialData.id}`,
              payload
            );
          } catch (__) {
            response = await api.patch(
              `/api/documents/${initialData.id}`,
              payload
            );
          }
        }
      } else {
        response = await api.post(
          "/api/documents/money-receipts",
          payload
        );
      }

      const receipt =
        response?.data?.receipt ||
        response?.receipt ||
        response?.data?.document ||
        response?.document;

      const downloadUrl =
  response?.download_url ||
  response?.receipt?.pdf_path ||
  response?.data?.download_url ||
  response?.data?.receipt?.pdf_path;

      console.log("MONEY RECEIPT RESPONSE:", response);
      console.log("MONEY RECEIPT DOWNLOAD URL:", downloadUrl);

      if (!receipt) {
        throw new Error(
          isEditing
            ? "Receipt was updated but the server returned no receipt data."
            : "Receipt was created but the server returned no receipt data."
        );
      }

      const pdfPath = receipt?.pdf_path || downloadUrl || response?.pdf_path;

      if (!draft && pdfPath) {
        try {
          const pdfUrl = await secureFileObjectUrl(pdfPath);
          const pdfWindow = window.open(pdfUrl, "_blank");

          if (!pdfWindow) URL.revokeObjectURL(pdfUrl);
          else setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
        } catch (err) {
          console.error("Failed to open money receipt PDF:", err);
          window.alert(err.message || "Could not open the money receipt PDF.");
        }
      }

      onCreated?.(receipt);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        (isEditing ? "Unable to update money receipt." : "Unable to create money receipt.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!saving) onCancel();
        }}
      />

      <div className="relative z-10 flex min-h-screen items-start justify-center p-3 sm:p-6">
        <div className="my-4 w-full max-w-5xl overflow-hidden rounded-2xl bg-gray-50 shadow-2xl sm:my-8">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Money Receipt" : "Create Money Receipt"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {isEditing
                  ? `Editing ${initialData?.receipt_number || "Receipt"}`
                  : "Record a payment received from a customer."}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-4 sm:p-6">
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-gray-900">
                    Receipt Details
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Enter the payment information.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Receipt Date
                    </label>

                    <input
                      type="date"
                      value={receiptDate}
                      onChange={(e) =>
                        setReceiptDate(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Amount Received
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Against
                    </label>

                    <select
                      value={againstType}
                      onChange={(e) =>
                        setAgainstType(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="invoice">
                        Invoice
                      </option>
                      <option value="multiple_invoices">
                        Multiple Invoices
                      </option>
                      <option value="advance">
                        Advance
                      </option>
                      <option value="other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Payment Mode
                    </label>

                    <select
                      value={paymentMode}
                      onChange={(e) =>
                        setPaymentMode(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">
                        Bank Transfer
                      </option>
                    </select>
                  </div>

                  {paymentMode === "bank_transfer" && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Transfer Type <span className="text-gray-400 font-normal">(optional)</span>
                      </label>

                      <select
                        value={transferType}
                        onChange={(e) =>
                          setTransferType(e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">None / Standard</option>
                        <option value="RTGS">RTGS</option>
                        <option value="IMPS">IMPS</option>
                        <option value="NEFT">NEFT</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Transaction Reference
                    </label>

                    <input
                      value={transactionReference}
                      onChange={(e) =>
                        setTransactionReference(
                          e.target.value
                        )
                      }
                      placeholder="UPI ID, cheque number, transaction ID..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Bank Account
                    </label>

                    <select
                      value={bankAccountId}
                      onChange={(e) =>
                        setBankAccountId(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">
                        Use default / no selected account
                      </option>

                      {banking.map((account) => (
                        <option
                          key={account.id}
                          value={account.id}
                        >
                          {account.bank_name}
                          {account.account_number
                            ? ` • A/C ${account.account_number}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    {selectedBank && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        {[
                          selectedBank.account_holder_name,
                          selectedBank.branch,
                          selectedBank.ifsc_code,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ReceiptCustomerPicker
                customers={customers}
                mode={customerMode}
                setMode={setCustomerMode}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                manualCustomer={manualCustomer}
                updateManualCustomer={
                  updateManualCustomer
                }
              />

              {(againstType === "invoice" ||
                againstType === "multiple_invoices") && (
                  <InvoiceAllocation
                    invoices={invoices}
                    allocations={allocations}
                    setAllocations={setAllocations}
                    customerId={
                      customerMode === "existing"
                        ? selectedCustomer?.id
                        : null
                    }
                    amountReceived={amount}
                  />
                )}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-gray-900">
                    Additional Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Purpose / For
                    </label>

                    <input
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      placeholder="Payment received for..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Notes
                    </label>

                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value)
                      }
                      placeholder="Optional notes..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {saving ? "Saving..." : (isEditing ? "Update as Draft" : "Save Draft")}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download size={17} />
                  {saving
                    ? (isEditing ? "Updating..." : "Creating...")
                    : (isEditing ? "Update & Download" : "Create & Download")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MoneyReceipts = () => {
  const { canWrite, isRestricted, subscriptionRequiredMessage } = useSubscriptionAccess();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banking, setBanking] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        receiptsResponse,
        customersResponse,
        bankingResponse,
        invoicesResponse,
      ] = await Promise.all([
        api.get("/api/documents/money-receipts/list"),
        api.get("/api/customers"),
        api.get("/api/banking"),
        api.get("/api/documents?doc_type=invoice"),
      ]);

      const receipts =
        receiptsResponse?.receipts ||
        receiptsResponse?.data?.receipts ||
        [];

      const customerRows =
        customersResponse?.customers ||
        customersResponse?.data?.customers ||
        [];

      const bankingRows =
        bankingResponse?.banking ||
        bankingResponse?.data?.banking ||
        [];

      const invoiceRows =
        invoicesResponse?.documents ||
        invoicesResponse?.data?.documents ||
        [];

      setDocuments(receipts);
      setCustomers(customerRows);
      setBanking(bankingRows);
      setInvoices(invoiceRows);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Could not load receipts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReceipts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return documents;

    return documents.filter((receipt) =>
      [
        receipt?.receipt_number,
        receipt?.received_from_name,
        receipt?.received_from_email,
        receipt?.received_from_phone,
        receipt?.customer_name,
        receipt?.customer_business_name,
        receipt?.against_type,
        receipt?.payment_mode,
        receipt?.transfer_type,
        receipt?.transaction_reference,
        receipt?.amount_received,
        receipt?.amount,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(q)
        )
    );
  }, [documents, search]);

  const totalValue = documents.reduce(
    (sum, receipt) =>
      sum + numberValue(receipt?.amount_received ?? receipt?.amount),
    0
  );

  const paidCount = documents.filter(
    (receipt) =>
      String(receipt?.document_status || "").toLowerCase() ===
      "issued"
  ).length;

  const draftCount = documents.filter(
    (receipt) =>
      String(receipt?.document_status || "").toLowerCase() ===
      "draft"
  ).length;

  const downloadReceipt = async (receipt) => {
    const url = receipt?.pdf_path || receipt?.download_url;

    if (!url) {
      window.alert(
        "PDF is not available for this receipt."
      );
      return;
    }

    try {
      const pdfBlob = await fetchSecureFile(url);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = window.document.createElement("a");

      link.href = pdfUrl;
      link.download = receipt.receipt_number
        ? `${receipt.receipt_number}.pdf`
        : "money-receipt.pdf";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (err) {
      console.error("Failed to download money receipt PDF:", err);
      window.alert(err.message || "Could not download the money receipt PDF.");
    }
  };

  const handleEditReceipt = async (receipt) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    try {
      let fullReceipt = receipt;
      try {
        const res = await api.get(`/api/documents/money-receipts/${receipt.id}`);
        if (res?.data?.receipt || res?.receipt || res?.data) {
          fullReceipt = res.data?.receipt || res.receipt || res.data;
        } else if (res?.id) {
          fullReceipt = res;
        }
      } catch (_) {
        // Fallback to receipt from list
      }
      setEditingReceipt(fullReceipt);
      setShowCreate(true);
    } catch (err) {
      setEditingReceipt(receipt);
      setShowCreate(true);
    }
  };

  const handleCreated = async () => {
    setShowCreate(false);
    setEditingReceipt(null);
    await loadData();
  };

  const handleDeleteReceipt = async (receipt) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    const num = receipt.receipt_number || `#${receipt.id}`;
    if (!window.confirm(`Are you sure you want to delete Money Receipt ${num}?`)) return;
    try {
      try {
        await api.del(`/api/documents/money-receipts/${receipt.id}`);
      } catch (_) {
        await api.del(`/api/documents/${receipt.id}`);
      }
      setDocuments((prev) => prev.filter((r) => r.id !== receipt.id));
      if (viewingReceipt?.id === receipt.id) setViewingReceipt(null);
    } catch (err) {
      window.alert(err.message || "Failed to delete Money Receipt.");
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
          title="Receipts"
          subtitle="Create and manage money receipts"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showSearch={true}
          showProfile={true}
          onNew={() => {
            if (!canWrite) {
              alert(subscriptionRequiredMessage);
              return;
            }
            setEditingReceipt(null);
            setShowCreate(true);
          }}
          newLabel="Create Receipt"
          newDisabled={!canWrite}
          newTooltip={!canWrite ? subscriptionRequiredMessage : undefined}
        />

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={loadData}
                className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:underline"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Receipts
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {documents.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Issued
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {paidCount}
              </p>

              {draftCount > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {draftCount} draft
                  {draftCount === 1 ? "" : "s"}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Received
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {money(totalValue)}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4 sm:p-5">
              <div className="relative max-w-xl">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search receipt number, customer, amount or payment reference..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading receipts...
                </p>
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <CreditCard
                    size={22}
                    className="text-slate-500"
                  />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  {search
                    ? "No receipts found"
                    : "No receipts yet"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try a different search term."
                    : "Create your first money receipt to record a payment."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    <Plus size={16} />
                    Create Receipt
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="bg-emerald-600 text-white">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Receipt
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Received From
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Date
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Payment
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                        Status
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredReceipts.map((receipt) => {
                      const customerName =
                        receipt?.customer_name ||
                        receipt?.received_from_name ||
                        "Manual Customer";

                      const status =
                        String(
                          receipt?.document_status || ""
                        ).toLowerCase();

                      return (
                        <tr
                          key={receipt.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                                <FileText size={16} />
                              </div>

                              <div>
                                <p className="font-medium text-slate-900">
                                  {receipt?.receipt_number ||
                                    `Receipt #${receipt.id}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <User
                                size={15}
                                className="shrink-0 text-slate-400"
                              />

                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">
                                  {customerName}
                                </p>

                                {receipt?.received_from_phone && (
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {receipt.received_from_phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                            {formatDate(receipt?.receipt_date)}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium capitalize text-slate-800">
                              {receipt?.payment_mode === "bank_transfer" && receipt?.transfer_type
                                ? `Bank Transfer · ${receipt.transfer_type}`
                                : String(
                                    receipt?.payment_mode || "cash"
                                  ).replace(/_/g, " ")}
                            </p>

                            {receipt?.transaction_reference && (
                              <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500">
                                {receipt.transaction_reference}
                              </p>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            {money(
                              receipt?.amount_received ??
                                receipt?.amount
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                status === "draft"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {status === "draft" ? "Draft" : "Issued"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              {/* VIEW */}
                              <button
                                type="button"
                                onClick={() => setViewingReceipt(receipt)}
                                title="View Receipt"
                                className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                              >
                                <Eye size={14} className="sm:w-4 sm:h-4" />
                                View
                              </button>

                              {/* EDIT */}
                              <button
                                type="button"
                                disabled={!canWrite}
                                onClick={() => handleEditReceipt(receipt)}
                                title={!canWrite ? subscriptionRequiredMessage : "Edit Receipt"}
                                className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition ${
                                  !canWrite
                                    ? "opacity-40 cursor-not-allowed text-slate-400"
                                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                                }`}
                              >
                                <Pencil size={14} className="sm:w-4 sm:h-4" />
                                Edit
                              </button>

                              {/* DELETE */}
                              <button
                                type="button"
                                disabled={!canWrite}
                                onClick={() => handleDeleteReceipt(receipt)}
                                title={!canWrite ? subscriptionRequiredMessage : "Delete Receipt"}
                                className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition ${
                                  !canWrite
                                    ? "opacity-40 cursor-not-allowed text-rose-400"
                                    : "text-rose-700 hover:bg-rose-50 hover:text-rose-600"
                                }`}
                              >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                Delete
                              </button>

                              {/* PDF */}
                              <button
                                type="button"
                                onClick={() => downloadReceipt(receipt)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                              >
                                <Download size={14} className="sm:w-4 sm:h-4" />
                                PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <MoneyReceiptForm
          initialData={editingReceipt}
          customers={customers}
          banking={banking}
          invoices={invoices}
          onCancel={() => {
            setShowCreate(false);
            setEditingReceipt(null);
          }}
          onCreated={handleCreated}
        />
      )}

      {/* IN-PAGE VIEW RECEIPT DETAIL MODAL */}
      <Modal
        open={Boolean(viewingReceipt)}
        onClose={() => setViewingReceipt(null)}
        title="Money Receipt Details"
      >
        {viewingReceipt && (
          <div className="space-y-5">
            {/* Amount Banner */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Amount Received
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {money(viewingReceipt.amount_received ?? viewingReceipt.amount ?? 0)}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {viewingReceipt.receipt_number || `Receipt #${viewingReceipt.id}`}
                </span>
                <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  Mode: {viewingReceipt.payment_mode || "Cash"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {String(viewingReceipt.document_status || "").toLowerCase() === "draft" ? "Draft" : "Issued"}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs font-medium text-slate-400">Received From</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {viewingReceipt.customer_name || viewingReceipt.received_from_name || "—"}
                </p>
                {viewingReceipt.customer_phone && (
                  <p className="text-xs text-slate-500 mt-0.5">Phone: {viewingReceipt.customer_phone}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs font-medium text-slate-400">Date & Time</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {viewingReceipt.receipt_date || viewingReceipt.created_at
                    ? new Date(viewingReceipt.receipt_date || viewingReceipt.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 sm:col-span-2">
                <p className="text-xs font-medium text-slate-400">Against / Purpose</p>
                <p className="mt-1 font-medium text-slate-800 break-words">
                  {viewingReceipt.against_type === "invoice" && viewingReceipt.invoice_number
                    ? `Against Invoice #${viewingReceipt.invoice_number}`
                    : viewingReceipt.against_type === "advance"
                    ? "Advance from Customer / Investor"
                    : viewingReceipt.purpose || viewingReceipt.description || "General Payment"}
                </p>
              </div>

              {viewingReceipt.notes && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-400">Notes / Remarks</p>
                  <p className="mt-1 text-slate-700">{viewingReceipt.notes}</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                disabled={!canWrite}
                onClick={() => handleDeleteReceipt(viewingReceipt)}
                title={!canWrite ? subscriptionRequiredMessage : "Delete"}
                className={`inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold transition ${
                  !canWrite ? "opacity-40 cursor-not-allowed text-rose-400" : "text-rose-700 hover:bg-rose-100"
                }`}
              >
                <Trash2 size={15} className="sm:w-4 sm:h-4" /> Delete
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={!canWrite}
                  onClick={() => {
                    const r = viewingReceipt;
                    setViewingReceipt(null);
                    handleEditReceipt(r);
                  }}
                  title={!canWrite ? subscriptionRequiredMessage : "Edit"}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold transition ${
                    !canWrite ? "opacity-40 cursor-not-allowed text-slate-400" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Pencil size={15} className="sm:w-4 sm:h-4" /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => downloadReceipt(viewingReceipt)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Download size={15} className="sm:w-4 sm:h-4" /> PDF
                </button>

                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800"
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

export default MoneyReceipts;
