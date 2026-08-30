import React, { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Menu,
  Search,
  PlayCircle,
  CheckCircle2,
  Download,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api, { fileUrl } from "../lib/api";

const STATUS_STYLE = {
  created: "bg-slate-100 text-slate-600",
  in_transit: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const Vehicles = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [tripType, setTripType] = useState("outgoing");
  const [form, setForm] = useState({
    vehicle_number: "",
    driver_name: "",
    driver_phone: "",
    from_location: "",
    to_location: "",
    goods_description: "",
  });
  const [loadingPhoto, setLoadingPhoto] = useState(null);
  const [waybillFile, setWaybillFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/vehicles");
      setTrips(data.trips || []);
    } catch (err) {
      setError(err.message || "Could not load vehicle trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const filtered = trips.filter((t) =>
    (t.vehicle_number || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("trip_type", tripType);
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (tripType === "outgoing" && loadingPhoto) formData.append("loading_photo", loadingPhoto);
      if (tripType === "incoming" && waybillFile) formData.append("waybill_file", waybillFile);

      await api.postForm("/api/vehicles", formData);

      setShowModal(false);
      setForm({
        vehicle_number: "",
        driver_name: "",
        driver_phone: "",
        from_location: "",
        to_location: "",
        goods_description: "",
      });
      setLoadingPhoto(null);
      setWaybillFile(null);
      loadTrips();
    } catch (err) {
      setSaveError(err.message || "Could not create trip.");
    } finally {
      setSaving(false);
    }
  };

  const startTrip = async (id) => {
    try {
      await api.patch(`/api/vehicles/${id}/start-trip`, {});
      loadTrips();
    } catch (err) {
      setError(err.message || "Could not start trip.");
    }
  };

  const markReached = async (id) => {
    try {
      const formData = new FormData();
      await api.patchForm(`/api/vehicles/${id}/reached`, formData);
      loadTrips();
    } catch (err) {
      setError(err.message || "Could not mark as reached.");
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
              <h1 className="text-lg font-bold">Vehicles</h1>
              <p className="hidden text-xs text-slate-400 sm:block">Way bills & vehicle trips</p>
            </div>

          </div>

          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)}>
            Add Vehicle
          </Button>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by vehicle number..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {loading ? (
            <p className="mt-8 text-center text-sm text-slate-400">Loading trips...</p>
          ) : filtered.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Truck size={35} className="mx-auto text-slate-300" />
              <h3 className="mt-4 font-semibold">No vehicle trips yet</h3>
              <p className="mt-1 text-sm text-slate-500">Add one to generate or upload a way bill.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filtered.map((trip) => (
                <div key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {trip.trip_type === "outgoing" ? "Outgoing" : "Incoming"} · {trip.waybill_number || "No number yet"}
                      </p>
                      <p className="mt-1 text-lg font-bold">{trip.vehicle_number || "Vehicle not set"}</p>
                    </div>

                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[trip.status]}`}>
                      {trip.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-slate-500">
                    <p>Driver: {trip.driver_name || "-"} {trip.driver_phone ? `(${trip.driver_phone})` : ""}</p>
                    {(trip.from_location || trip.to_location) && (
                      <p>Route: {trip.from_location || "-"} → {trip.to_location || "-"}</p>
                    )}
                    {trip.goods_description && <p>Goods: {trip.goods_description}</p>}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">

                    {trip.waybill_pdf_path && (
                      <a
                        href={fileUrl(trip.waybill_pdf_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                      >
                        <Download size={13} /> Way Bill
                      </a>
                    )}

                    {trip.waybill_uploaded_file && (
                      <a
                        href={fileUrl(trip.waybill_uploaded_file)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                      >
                        <Download size={13} /> Uploaded Way Bill
                      </a>
                    )}

                    {trip.trip_type === "outgoing" && trip.status === "created" && (
                      <button
                        onClick={() => startTrip(trip.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        <PlayCircle size={13} /> Start Trip
                      </button>
                    )}

                    {trip.trip_type === "outgoing" && trip.status === "in_transit" && (
                      <button
                        onClick={() => markReached(trip.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                      >
                        <CheckCircle2 size={13} /> Mark Reached
                      </button>
                    )}

                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ADD VEHICLE MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Vehicle">
        <form onSubmit={handleCreateTrip} className="space-y-4">
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTripType("outgoing")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                tripType === "outgoing"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              Outgoing (we're sending)
            </button>
            <button
              type="button"
              onClick={() => setTripType("incoming")}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                tripType === "incoming"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              Incoming (we're receiving)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Vehicle Number</label>
              <input
                type="text"
                value={form.vehicle_number}
                onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Driver Name</label>
              <input
                type="text"
                value={form.driver_name}
                onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Driver Phone</label>
            <input
              type="tel"
              value={form.driver_phone}
              onChange={(e) => setForm({ ...form, driver_phone: e.target.value })}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">From</label>
              <input
                type="text"
                value={form.from_location}
                onChange={(e) => setForm({ ...form, from_location: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">To</label>
              <input
                type="text"
                value={form.to_location}
                onChange={(e) => setForm({ ...form, to_location: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Goods Description</label>
            <input
              type="text"
              value={form.goods_description}
              onChange={(e) => setForm({ ...form, goods_description: e.target.value })}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {tripType === "outgoing" ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Photo After Loading <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLoadingPhoto(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
              />
              <p className="mt-1 text-xs text-slate-400">A way bill will be generated automatically for you.</p>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Upload Seller's Way Bill <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setWaybillFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Vehicle"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
