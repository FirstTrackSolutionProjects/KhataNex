import React, { useEffect, useState } from "react";
import {
  Plus,
  Landmark,
  Menu,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";

const EMPTY_FORM = {
  bank_name: "",
  account_holder_name: "",
  account_number: "",
  account_type: "",
  branch: "",
  ifsc_code: "",
  is_default: false,
};

const Banking = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banking, setBanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadBanking = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.get("/api/banking");
      setBanking(data.banking || []);
    } catch (err) {
      setError(err.message || "Could not load banking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanking();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      is_default: banking.length === 0,
    });
    setSaveError("");
    setShowModal(true);
  };

  const openEditModal = (bank) => {
    setEditingId(bank.id);
    setForm({
      bank_name: bank.bank_name || "",
      account_holder_name: bank.account_holder_name || "",
      account_number: bank.account_number || "",
      account_type: bank.account_type || "",
      branch: bank.branch || "",
      ifsc_code: bank.ifsc_code || "",
      is_default: Boolean(bank.is_default),
    });
    setSaveError("");
    setShowModal(true);
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSaveError("");

    try {
      const payload = {
        ...form,
        is_default: Boolean(form.is_default),
      };

      if (editingId) {
        await api.patch(`/api/banking/${editingId}`, payload);
      } else {
        await api.post("/api/banking", payload);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadBanking();
    } catch (err) {
      setSaveError(err.message || "Could not save banking details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bank account?"
    );

    if (!confirmed) return;

    try {
      await api.del(`/api/banking/${id}`);
      await loadBanking();
    } catch (err) {
      setError(err.message || "Could not delete banking details.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Banking
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage bank accounts used on your documents
              </p>
            </div>
          </div>

          <Button icon={Plus} size="sm" onClick={openAddModal}>
            Add Bank
          </Button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                <Landmark size={22} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Bank Accounts
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {loading ? "..." : banking.length}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="mt-8 text-center text-sm text-slate-400">
              Loading banking details...
            </p>
          ) : banking.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Landmark
                size={38}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No bank accounts added
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add a bank account to automatically use it on invoices,
                quotations and money receipts.
              </p>

              <button
                onClick={openAddModal}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Add Bank Account
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {banking.map((bank) => (
                <div
                  key={bank.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                        <Landmark size={21} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {bank.bank_name || "Unnamed Bank"}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {bank.branch || "Branch not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(bank)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-emerald-600"
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => handleDelete(bank.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  {Boolean(bank.is_default) && (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={14} />
                      Default for Documents
                    </div>
                  )}

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Account Holder
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {bank.account_holder_name || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Account Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {bank.account_number || "Not specified"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Account Type
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {bank.account_type || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          IFSC
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {bank.ifsc_code || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Bank" : "Add Bank"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Bank Name
            </label>
            <input
              type="text"
              value={form.bank_name}
              onChange={(e) => updateField("bank_name", e.target.value)}
              placeholder="e.g. State Bank of India"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Account Holder Name
            </label>
            <input
              type="text"
              value={form.account_holder_name}
              onChange={(e) =>
                updateField("account_holder_name", e.target.value)
              }
              placeholder="Account holder name"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Account Number
            </label>
            <input
              type="text"
              value={form.account_number}
              onChange={(e) =>
                updateField("account_number", e.target.value)
              }
              placeholder="Account number"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Account Type
            </label>
            <select
              value={form.account_type}
              onChange={(e) =>
                updateField("account_type", e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">Select account type</option>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Cash Credit">Cash Credit</option>
              <option value="Overdraft">Overdraft</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Branch
            </label>
            <input
              type="text"
              value={form.branch}
              onChange={(e) => updateField("branch", e.target.value)}
              placeholder="Branch name"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              IFSC Code
            </label>
            <input
              type="text"
              value={form.ifsc_code}
              onChange={(e) =>
                updateField("ifsc_code", e.target.value.toUpperCase())
              }
              placeholder="e.g. SBIN0001234"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={Boolean(form.is_default)}
              onChange={(e) =>
                updateField("is_default", e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Use as default bank
              </p>
              <p className="text-xs text-slate-500">
                Documents will automatically use this account.
              </p>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Bank"
                  : "Save Bank"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Banking;
