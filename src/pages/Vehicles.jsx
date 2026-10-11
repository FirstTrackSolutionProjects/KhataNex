import React, { useEffect, useState, useRef } from "react";
import {
  Truck,
  Plus,
  PlayCircle,
  CheckCircle2,
  Download,
  Pencil,
  FileText,
  Trash2,
  Upload,
  Eye,
  Camera,
  Search,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import api, { fetchSecureFile } from "../lib/api";

const STATUS_STYLE = {
  created: "bg-slate-100 text-slate-600",
  in_transit: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const Vehicles = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripType, setTripType] = useState("outgoing");
  const [form, setForm] = useState({
    vehicle_number: "",
    driver_name: "",
    driver_phone: "",
    from_location: "",
    to_location: "",
    goods_description: "",
    invoice_id: "",
  });
  const [loadingPhoto, setLoadingPhoto] = useState(null);
  const [unloadingPhoto, setUnloadingPhoto] = useState(null);
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [tripPhoto, setTripPhoto] = useState(null);
  const [waybillFile, setWaybillFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [ewayModal, setEwayModal] = useState({
    isOpen: false,
    tripId: null,
    filePath: "",
    fileUrl: "",
    isPdf: false,
    fileName: "",
  });
  const replaceFileInputRef = useRef(null);
  const replacePhotoInputRef = useRef(null);

  const loadTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const [data, invData] = await Promise.all([
        api.get("/api/vehicles").catch(() => ({ trips: [] })),
        api.get("/api/documents?doc_type=invoice").catch(() => ({ documents: [] })),
      ]);
      const tripsList = Array.isArray(data)
        ? data
        : Array.isArray(data?.trips)
          ? data.trips
          : Array.isArray(data?.data?.trips)
            ? data.data.trips
            : Array.isArray(data?.data)
              ? data.data
              : [];
      const invoicesList = Array.isArray(invData)
        ? invData
        : Array.isArray(invData?.documents)
          ? invData.documents
          : Array.isArray(invData?.data?.documents)
            ? invData.data.documents
            : [];
      setTrips(tripsList);
      setInvoices(invoicesList);
    } catch (err) {
      setError(err.message || "Could not load vehicle trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const filtered = trips.filter((t) => {
    if (!t) return false;
    const vNum = String(t.vehicle_number || t.vehicle_no || "").toLowerCase();
    const dName = String(t.driver_name || "").toLowerCase();
    const q = (search || "").toLowerCase();
    return vNum.includes(q) || dName.includes(q);
  });

  const openEditTrip = (trip) => {
    setEditingTrip(trip);
    setTripType(trip.trip_type || "outgoing");
    setForm({
      vehicle_number: trip.vehicle_number || "",
      driver_name: trip.driver_name || "",
      driver_phone: trip.driver_phone || "",
      from_location: trip.from_location || "",
      to_location: trip.to_location || "",
      goods_description: trip.goods_description || "",
      invoice_id: trip.invoice_id ? String(trip.invoice_id) : "",
    });
    setLoadingPhoto(null);
    setUnloadingPhoto(null);
    setVehiclePhoto(null);
    setTripPhoto(null);
    setWaybillFile(null);
    setSaveError("");
    setShowModal(true);
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("trip_type", tripType);
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const appendValidFile = (fieldName, file) => {
        if (file && file instanceof File && file.size > 0) {
          formData.append(fieldName, file);
        }
      };

      appendValidFile("loading_photo", loadingPhoto);
      appendValidFile("unloading_photo", unloadingPhoto);
      appendValidFile("vehicle_photo", vehiclePhoto);
      appendValidFile("trip_photo", tripPhoto);
      appendValidFile("eway_bill_file", waybillFile);

      if (editingTrip) {
        try {
          await api.patchForm(`/api/vehicles/${editingTrip.id}`, formData);
        } catch (_) {
          await api.putForm(`/api/vehicles/${editingTrip.id}`, formData);
        }
      } else {
        await api.postForm("/api/vehicles", formData);
      }

      setShowModal(false);
      setEditingTrip(null);
      setForm({
        vehicle_number: "",
        driver_name: "",
        driver_phone: "",
        from_location: "",
        to_location: "",
        goods_description: "",
        invoice_id: "",
      });
      setLoadingPhoto(null);
      setUnloadingPhoto(null);
      setVehiclePhoto(null);
      setTripPhoto(null);
      setWaybillFile(null);
      loadTrips();
    } catch (err) {
      setSaveError(err.message || (editingTrip ? "Could not update trip." : "Could not create trip."));
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

  const markReached = async (id, unloadingFile = null) => {
    try {
      const formData = new FormData();
      if (unloadingFile && unloadingFile instanceof File && unloadingFile.size > 0) {
        formData.append("unloading_photo", unloadingFile);
      }
      await api.patchForm(`/api/vehicles/${id}/reached`, formData);
      loadTrips();
    } catch (err) {
      setError(err.message || "Could not mark as reached.");
    }
  };

  const formatDateTime = (val) => {
    if (!val) return null;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return `${d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} at ${d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle trip?")) return;
    try {
      await api.del(`/api/vehicles/${id}`);
      loadTrips();
    } catch (err) {
      setError(err.message || "Could not delete trip.");
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const res = await api.get(`/api/documents/${invoiceId}`);
      const doc = res.document || res.data || res;
      const pdfPath = doc.pdf_path || doc.download_url;
      if (pdfPath) {
        const blob = await fetchSecureFile(pdfPath);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        window.alert("Invoice PDF is not available.");
      }
    } catch (err) {
      window.alert(err.message || "Could not load invoice PDF.");
    }
  };

  const handleOpenEWayModal = async (trip) => {
    const filePath =
      trip.waybill_uploaded_file ||
      trip.eway_bill_file ||
      trip.seller_eway_bill ||
      trip.eway_bill;
    if (!filePath) return;
    try {
      const blob = await fetchSecureFile(filePath);
      const url = URL.createObjectURL(blob);
      const isPdf =
        filePath.toLowerCase().endsWith(".pdf") ||
        blob.type === "application/pdf";
      setEwayModal({
        isOpen: true,
        tripId: trip.id,
        filePath,
        fileUrl: url,
        isPdf,
        fileName: filePath.split("/").pop() || "eway-bill",
      });
    } catch (err) {
      window.alert(err.message || "Could not load E-Way Bill.");
    }
  };

  const handleUploadPhoto = async (tripId, file, fieldName = "loading_photo") => {
    if (!file || !(file instanceof File) || file.size === 0) return;
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      try {
        await api.patchForm(`/api/vehicles/${tripId}`, formData);
      } catch (_) {
        await api.putForm(`/api/vehicles/${tripId}`, formData);
      }
      loadTrips();
    } catch (err) {
      setError(err.message || "Failed to upload photo.");
    }
  };

  const handleReplaceEWayBill = async (file) => {
    if (!file || !(file instanceof File) || file.size === 0 || !ewayModal.tripId) return;
    try {
      await handleUploadEWayBill(ewayModal.tripId, file);
      setEwayModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      window.alert(err.message || "Failed to replace E-Way Bill.");
    }
  };

  const getTripPhotos = (trip) => {
    if (!trip) return [];
    const list = [];
    if (trip.loading_photo || trip.loading_photo_path) {
      list.push({
        field: "loading_photo",
        label: "Loading Photo",
        path: trip.loading_photo || trip.loading_photo_path,
      });
    }
    if (trip.unloading_photo || trip.unloading_photo_path || trip.reached_photo || trip.reached_photo_path) {
      list.push({
        field: "unloading_photo",
        label: "Unloading Photo",
        path: trip.unloading_photo || trip.unloading_photo_path || trip.reached_photo || trip.reached_photo_path,
      });
    }
    if (trip.vehicle_photo) {
      list.push({
        field: "vehicle_photo",
        label: "Vehicle Photo",
        path: trip.vehicle_photo,
      });
    }
    if (trip.trip_photo) {
      list.push({
        field: "trip_photo",
        label: "Trip Photo",
        path: trip.trip_photo,
      });
    }
    if (list.length === 0 && trip.photo_url) {
      list.push({
        field: "loading_photo",
        label: "Photo",
        path: trip.photo_url,
      });
    }
    return list;
  };

  const handleViewPhotos = async (trip, targetField = null) => {
    const list = getTripPhotos(trip);
    if (list.length === 0) {
      window.alert("No photos uploaded for this trip.");
      return;
    }
    const current = targetField ? (list.find((p) => p.field === targetField) || list[0]) : list[0];
    try {
      const blob = await fetchSecureFile(current.path);
      const url = URL.createObjectURL(blob);
      setPreviewPhoto({
        url,
        tripId: trip.id,
        trip,
        photos: list,
        activeField: current.field,
        activeLabel: current.label,
        title: `Vehicle ${trip.vehicle_number || trip.id} — ${current.label}`,
      });
    } catch (err) {
      window.alert(err.message || "Could not load photo.");
    }
  };

  const handleSelectPhotoInModal = async (photoItem) => {
    try {
      const blob = await fetchSecureFile(photoItem.path);
      const url = URL.createObjectURL(blob);
      setPreviewPhoto((prev) => ({
        ...prev,
        url,
        activeField: photoItem.field,
        activeLabel: photoItem.label,
        title: `Vehicle ${prev.trip?.vehicle_number || prev.tripId} — ${photoItem.label}`,
      }));
    } catch (err) {
      window.alert(err.message || "Could not load photo.");
    }
  };

  const handleReplaceActivePhoto = async (file) => {
    if (!file || !(file instanceof File) || file.size === 0 || !previewPhoto?.tripId) return;
    try {
      const field = previewPhoto.activeField || "loading_photo";
      await handleUploadPhoto(previewPhoto.tripId, file, field);
      setPreviewPhoto(null);
    } catch (err) {
      window.alert(err.message || "Failed to replace photo.");
    }
  };

  const handleUploadEWayBill = async (tripId, file) => {
    if (!file || !(file instanceof File) || file.size === 0) return;
    try {
      const formData = new FormData();
      formData.append("eway_bill_file", file);
      try {
        await api.patchForm(`/api/vehicles/${tripId}`, formData);
      } catch (_) {
        await api.putForm(`/api/vehicles/${tripId}`, formData);
      }
      loadTrips();
    } catch (err) {
      setError(err.message || "Failed to upload E-Way Bill.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        isOpen={sidebarOpen}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCancel={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">

        <PageHeader
          title="Vehicles"
          subtitle="Vehicle trips & E-Way bills"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showSearch={true}
          showProfile={true}
          onNew={() => {
            setEditingTrip(null);
            setTripType("outgoing");
            setForm({
              vehicle_number: "",
              driver_name: "",
              driver_phone: "",
              from_location: "",
              to_location: "",
              goods_description: "",
              invoice_id: "",
            });
            setLoadingPhoto(null);
            setUnloadingPhoto(null);
            setVehiclePhoto(null);
            setTripPhoto(null);
            setWaybillFile(null);
            setSaveError("");
            setShowModal(true);
          }}
          newLabel="Add Vehicle"
        />

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
              <p className="mt-1 text-sm text-slate-500">Add one to manage vehicle trips and E-Way bills.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filtered.map((trip) => (
                <div key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        {trip.trip_type === "outgoing" ? "Outgoing" : "Incoming"}
                      </p>
                      <p className="mt-1 text-lg font-bold">{trip.vehicle_number || "Vehicle not set"}</p>
                    </div>

                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[String(trip?.status || "created").toLowerCase()] || "bg-slate-100 text-slate-600"}`}>
                      {String(trip?.status || "created").replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                    {trip.trip_type !== "incoming" && (trip.invoice_number ? (
                      <p className="font-medium text-emerald-700">
                        Against Invoice: #{trip.invoice_number}
                      </p>
                    ) : trip.invoice_id ? (
                      <p className="font-medium text-emerald-700">
                        Against Invoice: #{trip.invoice_id}
                      </p>
                    ) : null)}
                    <p>Driver: {trip.driver_name || "-"} {trip.driver_phone ? `(${trip.driver_phone})` : ""}</p>
                    {(trip.from_location || trip.to_location) && (
                      <p>Route: {trip.from_location || "-"} → {trip.to_location || "-"}</p>
                    )}
                    {trip.goods_description && <p>Goods: {trip.goods_description}</p>}

                    {/* DATES & TIMES */}
                    <div className="mt-3 space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                      {formatDateTime(trip.trip_date || trip.created_at) && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Trip Date:</span>
                          <span className="font-medium text-slate-700">
                            {formatDateTime(trip.trip_date || trip.created_at)}
                          </span>
                        </p>
                      )}
                      {formatDateTime(trip.departure_time || trip.departed_at) && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Departure:</span>
                          <span className="font-medium text-slate-700">
                            {formatDateTime(trip.departure_time || trip.departed_at)}
                          </span>
                        </p>
                      )}
                      {formatDateTime(
                        trip.reach_date ||
                          trip.reach_time ||
                          trip.reached_at ||
                          trip.completed_at
                      ) && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Reach Date & Time:</span>
                          <span className="font-medium text-slate-700">
                            {formatDateTime(
                              trip.reach_date ||
                                trip.reach_time ||
                                trip.reached_at ||
                                trip.completed_at
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() => openEditTrip(trip)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      <Pencil size={13} /> Edit
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 size={13} /> Delete
                    </button>

                    {/* VIEW INVOICE (Outgoing only) */}
                    {trip.trip_type !== "incoming" && trip.invoice_id && (
                      <button
                        type="button"
                        onClick={() => handleViewInvoice(trip.invoice_id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <FileText size={13} /> View Invoice
                      </button>
                    )}

                    {/* E-WAY BILL: VIEW if uploaded, else UPLOAD */}
                    {trip.waybill_uploaded_file ||
                    trip.eway_bill_file ||
                    trip.seller_eway_bill ||
                    trip.eway_bill ? (
                      <button
                        type="button"
                        onClick={() => handleOpenEWayModal(trip)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        <Eye size={13} /> View E-Way Bill
                      </button>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                        <Upload size={13} /> Upload E-Way Bill
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadEWayBill(trip.id, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}

                    {/* PHOTOS: VIEW if uploaded, else UPLOAD */}
                    {getTripPhotos(trip).length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleViewPhotos(trip)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                      >
                        <Camera size={13} /> View Photos ({getTripPhotos(trip).length})
                      </button>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                        <Camera size={13} /> Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadPhoto(trip.id, file, "loading_photo");
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}

                    {/* START TRIP */}
                    {trip.trip_type === "outgoing" && trip.status === "created" && (
                      <button
                        type="button"
                        onClick={() => startTrip(trip.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        <PlayCircle size={13} /> Start Trip
                      </button>
                    )}

                    {/* MARK REACHED */}
                    {trip.trip_type === "outgoing" && trip.status === "in_transit" && (
                      <button
                        type="button"
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

      {/* ADD / EDIT VEHICLE MODAL */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTrip(null);
        }}
        title={editingTrip ? "Edit Vehicle Trip" : "Add Vehicle"}
      >
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

          {tripType === "outgoing" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Against Invoice <span className="text-slate-400">(optional)</span>
              </label>
              <select
                value={form.invoice_id}
                onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">None / Not linked to invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number || `Invoice #${inv.id}`} {inv.customer_name || inv.to_name ? `— ${inv.customer_name || inv.to_name}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {tripType === "outgoing" ? "Upload E-Way Bill" : "Upload Seller's E-Way Bill"} <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setWaybillFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Loading Photo <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLoadingPhoto(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Unloading Photo <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUnloadingPhoto(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Vehicle Photo <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setVehiclePhoto(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Trip Photo <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTripPhoto(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : (editingTrip ? "Update Vehicle" : "Add Vehicle")}
          </button>
        </form>
      </Modal>

      {/* PHOTO PREVIEW MODAL */}
      <Modal
        open={Boolean(previewPhoto)}
        onClose={() => setPreviewPhoto(null)}
        title={previewPhoto?.title || "Trip Photo"}
      >
        <div className="space-y-4">
          {previewPhoto?.photos?.length > 1 && (
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
              {previewPhoto.photos.map((p) => (
                <button
                  key={p.field}
                  type="button"
                  onClick={() => handleSelectPhotoInModal(p)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    previewPhoto.activeField === p.field
                      ? "bg-purple-600 text-white shadow-sm"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {previewPhoto?.url && (
            <img
              src={previewPhoto.url}
              alt={previewPhoto.activeLabel || "Trip Photo"}
              className="max-h-[70vh] w-full rounded-xl bg-slate-900 object-contain"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500">
              {previewPhoto?.activeLabel}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {previewPhoto?.url && (
                <a
                  href={previewPhoto.url}
                  download={`${previewPhoto.activeField || "vehicle-photo"}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download size={14} /> Download
                </a>
              )}
              {previewPhoto?.tripId && (
                <>
                  <button
                    type="button"
                    onClick={() => replacePhotoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                  >
                    <Pencil size={14} /> Replace {previewPhoto.activeLabel || "Photo"}
                  </button>
                  <input
                    ref={replacePhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleReplaceActivePhoto(file);
                      }
                      e.target.value = "";
                    }}
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* SMALL MODAL FOR E-WAY BILL */}
      <Modal
        open={ewayModal.isOpen}
        onClose={() => setEwayModal((prev) => ({ ...prev, isOpen: false }))}
        title="E-Way Bill"
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2 min-h-56 max-h-96">
            {ewayModal.isPdf ? (
              <iframe
                src={ewayModal.fileUrl}
                title="E-Way Bill Preview"
                className="w-full h-80 rounded-lg border-0"
              />
            ) : (
              <img
                src={ewayModal.fileUrl}
                alt="E-Way Bill"
                className="max-h-80 w-full object-contain rounded-lg"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
            {/* Download */}
            <a
              href={ewayModal.fileUrl}
              download={ewayModal.fileName || "eway-bill"}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download size={14} /> Download
            </a>

            {/* Edit / Replace */}
            <button
              type="button"
              onClick={() => replaceFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Pencil size={14} /> Edit / Replace
            </button>
            <input
              ref={replaceFileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleReplaceEWayBill(file);
                e.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => setEwayModal((prev) => ({ ...prev, isOpen: false }))}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Vehicles;
