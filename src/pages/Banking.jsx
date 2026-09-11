import React, { useEffect, useState } from "react";
import {
  Plus,
  Landmark,
  Menu,
  Pencil,
  Trash2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../lib/api";

const Banking = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banking, setBanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    bank_name: "",
    branch: "",
    ifsc_code: "",
  });

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
      bank_name: "",
      branch: "",
      ifsc_code: "",
    });
    setSaveError("");
    setShowModal(true);
  };

  const openEditModal = (bank) => {
    setEditingId(bank.id);
    setForm({
      bank_name: bank.bank_name || "",
      branch: bank.branch || "",
      ifsc_code: bank.ifsc_code || "",
    });
    setSaveError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSaveError("");

    try {
      if (editingId) {
        await api.patch(`/api/banking/${editingId}`, form);
      } else {
        await api.post("/api/banking", form);
      }

      setShowModal(false);
      setEditingId(null);

      setForm({
        bank_name: "",
        branch: "",
        ifsc_code: "",
      });

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
              <h1 className="text-lg font-bold">
                Banking
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your bank account details
              </p>
            </div>

          </div>

          <Button
            icon={Plus}
            size="sm"
            onClick={openAddModal}
          >
            Add Bank
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                <Landmark size={22} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Bank Accounts
                </p>

                <p className="text-2xl font-bold">
                  {loading ? "..." : banking.length}
                </p>
              </div>

            </div>

          </div>

          {/* Banking records */}
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

              <h3 className="mt-4 font-semibold">
                No bank accounts added
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first bank account to get started.
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

                  <div className="flex items-start justify-between">

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

                  <div className="mt-5 border-t border-slate-100 pt-4">

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      IFSC Code
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {bank.ifsc_code || "Not specified"}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

        </main>

      </div>

      {/* ADD / EDIT BANK MODAL */}
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
              onChange={(e) =>
                setForm({ ...form, bank_name: e.target.value })
              }
              placeholder="Bank name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Branch
            </label>

            <input
              type="text"
              value={form.branch}
              onChange={(e) =>
                setForm({ ...form, branch: e.target.value })
              }
              placeholder="Branch name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                setForm({
                  ...form,
                  ifsc_code: e.target.value.toUpperCase(),
                })
              }
              placeholder="e.g. SBIN0001234"
              maxLength={20}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Bank"
                : "Add Bank"}
          </button>

        </form>

      </Modal>

    </div>
  );
};

export default Banking;
