import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Menu,
  ClipboardList,
  IndianRupee,
  Trash2,
  ChevronDown,
  Eye,
  Pencil,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import api from "../lib/api";
import useSubscriptionAccess from "../hooks/useSubscriptionAccess";

const LOW_STOCK_THRESHOLD = 10;

const UNIT_OPTIONS = [
  "Unit",
  "Pcs",
  "Ltr",
  "Grm",
  "Kg",
  "Ml",
  "Ton",
  "Gallon",
];

const GST_OPTIONS = ["0", "3", "12", "18", "28", "40", "Manual"];

const getStockStatus = (quantity, itemType) => {
  if (itemType === "service") {
    return {
      label: "N/A",
      className: "bg-slate-100 text-slate-600",
      isLow: false,
    };
  }
  const q = Number(quantity || 0);
  if (q > 10) {
    return {
      label: "In Stock",
      className: "bg-emerald-100 text-emerald-700",
      isLow: false,
    };
  }
  if (q > 5 && q <= 10) {
    return {
      label: "Low Stock",
      className: "bg-amber-100 text-amber-700",
      isLow: true,
    };
  }
  if (q > 0 && q <= 5) {
    return {
      label: "Low Stock",
      className: "bg-red-100 text-red-700",
      isLow: true,
    };
  }
  return {
    label: "Out of Stock",
    className: "bg-rose-100 text-rose-700",
    isLow: true,
  };
};

const emptyProduct = {
  product_name: "",
  category: "",
  item_type: "goods",
  type: "goods",
  hsn_code: "",
  unit: "Unit",
  gst_rate: "0",
  gst_mode: "preset",
  manual_gst_rate: "",
  price: "",
  price_inclusive_gst: false,
  description: "",
  quantity: "",
  purchase_bill_id: "",
};

const createPurchaseItem = () => ({
  item_name: "",
  quantity: "",
  price: "",
  discount: "",
  unit: "Unit",
  item_type: "goods",
  gst_rate: "0",
  hsn_code: "",
});

const getCurrentDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);
};

const emptyPurchase = {
  bill_number: "",
  vendor_name: "",
  bill_date: getCurrentDateTime(),
  items: [],
};

const Inventory = () => {
  const { canWrite, isRestricted, subscriptionRequiredMessage, openSubscriptionPrompt } = useSubscriptionAccess();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [productError, setProductError] = useState("");
  const [productPurchaseSearch, setProductPurchaseSearch] = useState("");

  const [purchaseBills, setPurchaseBills] = useState([]);
  const [loadingPurchaseBills, setLoadingPurchaseBills] = useState(false);
  const [showPurchaseBills, setShowPurchaseBills] = useState(true);
  const [viewPurchaseBill, setViewPurchaseBill] = useState(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    ...emptyPurchase,
    items: [],
  });
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const loadStock = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.get("/api/stock");
      setStock(data.stock || []);
    } catch (err) {
      setError(err.message || "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseBills = async (query = "") => {
    setLoadingPurchaseBills(true);

    try {
      const suffix = query
        ? `?search=${encodeURIComponent(query)}`
        : "";

      const data = await api.get(
        `/api/purchase-bills${suffix}`
      );

      setPurchaseBills(data.purchase_bills || []);
    } catch (_) {
      setPurchaseBills([]);
    } finally {
      setLoadingPurchaseBills(false);
    }
  };

  useEffect(() => {
    loadStock();
    loadPurchaseBills();
  }, []);

  const filtered = stock.filter((p) => {
    const q = search.trim().toLowerCase();
    const type = p.item_type || p.type || "goods";

    const matchesType =
      productTypeFilter === "all" ||
      type === productTypeFilter;

    if (!matchesType) return false;

    return (
      !q ||
      (p.product_name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.hsn_code || "").toLowerCase().includes(q)
    );
  });

  const stockValue = stock.reduce(
    (sum, p) =>
      sum +
      Number(p.price || 0) *
        Number(p.quantity || 0),
    0
  );

  const lowStockCount = stock.filter((p) => {
    const type = p.item_type || p.type || "goods";
    return type === "goods" && Number(p.quantity || 0) <= 10;
  }).length;

  const updateProduct = (field, value) => {
    setProductForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleProductTypeChange = (type) => {
    setProductForm((previous) => ({
      ...previous,
      item_type: type,
      type,
      unit: type === "service" ? "" : previous.unit || "Unit",
      expense_type:
        type === "service"
          ? "sales_service"
          : "sales_product",
    }));
  };

  const handleGstChange = (value) => {
    if (value === "Manual") {
      setProductForm((previous) => ({
        ...previous,
        gst_mode: "manual",
        manual_gst_rate:
          previous.manual_gst_rate || "",
      }));
      return;
    }

    setProductForm((previous) => ({
      ...previous,
      gst_mode: "preset",
      gst_rate: value,
      manual_gst_rate: "",
    }));
  };

  const effectiveProductGst =
    productForm.gst_mode === "manual"
      ? productForm.manual_gst_rate
      : productForm.gst_rate;

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!canWrite) {
      setProductError(subscriptionRequiredMessage);
      return;
    }

    setProductError("");

    const gstRate = Number(
      effectiveProductGst || 0
    );

    const quantity = Number(
      productForm.quantity || 0
    );

    const price = Number(
      productForm.price || 0
    );

    if (
      Number.isNaN(gstRate) ||
      gstRate < 0
    ) {
      setProductError(
        "Enter a valid GST percentage."
      );
      return;
    }

    if (
      Number.isNaN(quantity) ||
      quantity < 0
    ) {
      setProductError(
        "Enter a valid quantity."
      );
      return;
    }

    if (
      productForm.item_type === "goods" &&
      !productForm.unit
    ) {
      setProductError(
        "Please select a unit for Goods."
      );
      return;
    }

    if (!productForm.product_name.trim()) {
      setProductError(
        "Please enter a product name."
      );
      return;
    }

    setSavingProduct(true);

    try {
      const basePayload = {
        product_name:
          productForm.product_name.trim(),
        category:
          productForm.category,
        item_type:
          productForm.item_type,
        type:
          productForm.item_type,
        hsn_code:
          productForm.hsn_code,
        unit:
          productForm.item_type === "goods"
            ? productForm.unit
            : null,
        gst_rate: gstRate,
        price_inclusive_gst:
          productForm.price_inclusive_gst,
        description:
          productForm.description,
        expense_type:
          productForm.expense_type,
        price,
        quantity:
          productForm.item_type === "goods"
            ? quantity
            : 0,
      };

      const payloadWithPurchase = productForm.purchase_bill_id
        ? {
            ...basePayload,
            purchase_bill_id:
              productForm.purchase_bill_id,
          }
        : basePayload;

      try {
        if (editingProductId) {
          await api.patch(
            `/api/stock/${editingProductId}`,
            payloadWithPurchase
          );
        } else {
          await api.post(
            "/api/stock",
            payloadWithPurchase
          );
        }
      } catch (postErr) {
        if (
          productForm.purchase_bill_id &&
          (postErr.message?.includes("purchase_bill_id") ||
            postErr.status === 400 ||
            postErr.status === 500)
        ) {
          if (editingProductId) {
            await api.patch(
              `/api/stock/${editingProductId}`,
              basePayload
            );
          } else {
            await api.post(
              "/api/stock",
              basePayload
            );
          }
        } else {
          throw postErr;
        }
      }

      setShowProductModal(false);
      setEditingProductId(null);
      setProductForm({
        ...emptyProduct,
      });
      setProductPurchaseSearch("");

      await loadStock();
    } catch (err) {
      setProductError(
        err.message ||
          (editingProductId
            ? "Could not update product."
            : "Could not add product.")
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const openEditProduct = (product) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    const type =
      product.item_type ||
      product.type ||
      "goods";

    setEditingProductId(product.id);
    setProductError("");
    setProductPurchaseSearch("");

    setProductForm({
      ...emptyProduct,
      product_name:
        product.product_name || "",
      category:
        product.category || "",
      item_type: type,
      type,
      hsn_code:
        product.hsn_code || "",
      unit:
        type === "service"
          ? ""
          : product.unit || "Unit",
      gst_rate:
        String(product.gst_rate ?? 0),
      gst_mode: "preset",
      manual_gst_rate: "",
      price:
        product.price ?? "",
      price_inclusive_gst:
        Boolean(product.price_inclusive_gst),
      description:
        product.description || "",
      expense_type:
        product.expense_type ||
        (type === "service"
          ? "sales_service"
          : "sales_product"),
      quantity:
        type === "service"
          ? ""
          : product.quantity ?? "",
      purchase_bill_id:
        product.purchase_bill_id || "",
    });

    setShowProductModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    const name =
      product.product_name ||
      "this product";

    if (
      !window.confirm(
        `Delete "${name}" from Product Master? This does not edit the original purchase bill. If the purchase price needs to change, delete the old purchase bill and record a new one.`
      )
    ) {
      return;
    }

    try {
      setStock((prev) => prev.filter((p) => p.id !== product.id));
      await api.del(`/api/stock/${product.id}`);
      await loadStock();
    } catch (err) {
      console.error("Failed to delete product:", err);
      window.alert(err.message || "Could not delete product.");
      await loadStock();
    }
  };

  const updatePurchaseField = (
    field,
    value
  ) => {
    setPurchaseForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updatePurchaseItem = (
    index,
    field,
    value
  ) => {
    setPurchaseForm((previous) => ({
      ...previous,
      items: previous.items.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      ),
    }));
  };

  const addPurchaseItem = () => {
    setPurchaseForm((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        createPurchaseItem(),
      ],
    }));
  };

  const removePurchaseItem = (index) => {
    setPurchaseForm((previous) => {
      if (previous.items.length === 1) {
        return {
          ...previous,
          items: [createPurchaseItem()],
        };
      }

      return {
        ...previous,
        items: previous.items.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
      };
    });
  };

  const handlePurchaseTypeChange = (
    index,
    type
  ) => {
    updatePurchaseItem(
      index,
      "item_type",
      type
    );

    if (type === "service") {
      updatePurchaseItem(
        index,
        "unit",
        ""
      );
    } else {
      updatePurchaseItem(
        index,
        "unit",
        "Unit"
      );
    }
  };
  const getProductPurchaseMatches = (value) => {
    const query = String(value || "")
      .trim()
      .toLowerCase();

    if (!query) return [];

    return purchaseBills
      .flatMap((bill) =>
        (bill.items || []).map((item) => ({
          ...item,
          bill_number: bill.bill_number,
          vendor_name: bill.vendor_name,
          bill_date: bill.bill_date,
          purchase_bill_id: bill.id,
        }))
      )
      .filter((item) => {
        const haystack = [
          item.item_name,
          item.product_name,
          item.hsn_code,
          item.unit,
          item.item_type,
          item.type,
          item.vendor_name,
          item.bill_number,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 8);
  };

  const handleProductPurchaseSelect = (purchaseItem) => {
    const type =
      purchaseItem.item_type ||
      purchaseItem.type ||
      "goods";

    const itemName = (
      purchaseItem.item_name ||
      purchaseItem.product_name ||
      ""
    ).trim();

    // If creating a product from purchase history, quantity represents accumulated purchased quantity where applicable
    let accumulatedQuantity = Number(purchaseItem.quantity || 0);

    if (type === "goods" && itemName) {
      const allPurchasedItems = purchaseBills.flatMap(
        (bill) => bill.items || []
      );
      const matchingItems = allPurchasedItems.filter((it) => {
        const name = (it.item_name || it.product_name || "").trim().toLowerCase();
        const targetName = itemName.toLowerCase();
        const hsn = (it.hsn_code || "").trim();
        const targetHsn = (purchaseItem.hsn_code || "").trim();
        return (
          (name && targetName && name === targetName) ||
          (hsn && targetHsn && hsn === targetHsn)
        );
      });

      if (matchingItems.length > 0) {
        accumulatedQuantity = matchingItems.reduce(
          (sum, it) => sum + Number(it.quantity || 0),
          0
        );
      }
    }

    setProductPurchaseSearch(itemName);

    setProductForm((previous) => ({
      ...previous,
      product_name: itemName,
      item_type: type,
      type,
      unit:
        type === "service"
          ? ""
          : purchaseItem.unit || "Unit",
      gst_rate: String(purchaseItem.gst_rate ?? "0"),
      hsn_code:
        purchaseItem.hsn_code || "",
      quantity:
        type === "service"
          ? ""
          : accumulatedQuantity > 0
            ? accumulatedQuantity
            : (purchaseItem.quantity ?? ""),
      purchase_bill_id:
        purchaseItem.purchase_bill_id || "",
      // Selling price is NOT modified here; it remains separate and is never filled with purchase price
    }));
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({
      ...emptyPurchase,
      bill_date: getCurrentDateTime(),
      items: [],
    });
    setEditingPurchaseId(null);
    setPurchaseError("");
  };


  const openNewPurchaseBill = () => {
    resetPurchaseForm();
    setShowPurchaseModal(true);
  };

  const handleViewPurchaseBill = async (bill) => {
    try {
      const data = await api.get(`/api/purchase-bills/${bill.id}`);
      setViewPurchaseBill(data.purchase_bill || data.bill || bill);
    } catch (_) {
      setViewPurchaseBill(bill);
    }
  };

  const openEditPurchaseBill = async (bill) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    setPurchaseError("");

    try {
      const data = await api.get(
        `/api/purchase-bills/${bill.id}`
      );

      const detail = data.purchase_bill || data.bill;

      if (!detail) {
        throw new Error("Purchase bill not found.");
      }

      setEditingPurchaseId(detail.id);

      setPurchaseForm({
        bill_number: detail.bill_number || "",
        vendor_name: detail.vendor_name || "",
        bill_date: detail.bill_date
          ? String(detail.bill_date).slice(0, 16)
          : getCurrentDateTime(),
        gst_rate:
          detail.gst_rate ?? "0",
        items:
          (detail.items || []).length
            ? detail.items.map((item) => ({
                item_name:
                  item.item_name ||
                  item.product_name ||
                  "",
                quantity:
                  item.quantity ?? "",
                price:
                  item.price ?? "",
                discount:
                  item.discount ?? "",
                unit:
                  item.item_type === "service" ||
                  item.type === "service"
                    ? ""
                    : item.unit || "Unit",
                item_type:
                  item.item_type ||
                  item.type ||
                  "goods",
                gst_rate:
                  item.gst_rate ?? "0",
                hsn_code:
                  item.hsn_code || "",
              }))
            : [createPurchaseItem()],
      });

      setShowPurchaseModal(true);
    } catch (err) {
      setPurchaseError(
        err.message ||
        "Could not load purchase bill."
      );
    }
  };

  const handleDeletePurchaseBill = async (bill) => {
    if (!canWrite) {
      alert(subscriptionRequiredMessage);
      return;
    }
    const confirmed = window.confirm(
      `Delete purchase bill ${bill.bill_number || bill.id}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/api/purchase-bills/${bill.id}`
      );

      if (
        viewPurchaseBill &&
        viewPurchaseBill.id === bill.id
      ) {
        setViewPurchaseBill(null);
      }

      await loadPurchaseBills();
      await loadStock();
    } catch (err) {
      window.alert(
        err.message ||
        "Could not delete purchase bill."
      );
    }
  };


  const handleAddPurchase = async (e) => {
    e.preventDefault();

    if (!canWrite) {
      setPurchaseError(subscriptionRequiredMessage);
      return;
    }

    setPurchaseError("");

    const validItems =
      purchaseForm.items.map((item) => ({
        ...item,
        quantity:
          Number(item.quantity || 0),
        price:
          Number(item.price || 0),
        discount:
          Number(item.discount || 0),
        gst_rate:
          Number(item.gst_rate || 0),
        type:
          item.item_type,
      }));

    for (const item of validItems) {
      if (
        item.item_type === "goods" &&
        !item.unit
      ) {
        setPurchaseError(
          "Goods items must have a unit."
        );
        return;
      }

      if (
        Number.isNaN(item.gst_rate) ||
        item.gst_rate < 0
      ) {
        setPurchaseError(
          "Enter valid GST rates."
        );
        return;
      }
    }

    setSavingPurchase(true);

    try {
      const subtotal = validItems.reduce(
        (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1) - Number(item.discount || 0)),
        0
      );
      const totalGst = validItems.reduce(
        (sum, item) => {
          const taxable = Number(item.price || 0) * Number(item.quantity || 1) - Number(item.discount || 0);
          return sum + (taxable * (Number(item.gst_rate || 0) / 100));
        },
        0
      );
      const grandTotal = subtotal + totalGst;

      const purchasePayload = {
        bill_number: purchaseForm.bill_number,
        vendor_name: purchaseForm.vendor_name,
        bill_date: purchaseForm.bill_date,
        total_amount: grandTotal,
        gst_amount: totalGst,
        items: validItems,
      };

      if (editingPurchaseId) {
        await api.put(
          `/api/purchase-bills/${editingPurchaseId}`,
          purchasePayload
        );
      } else {
        await api.post(
          "/api/purchase-bills",
          purchasePayload
        );

        // Auto-update/create inventory stock items
        for (const it of validItems) {
          const itemName = (it.item_name || "").trim();
          if (!itemName) continue;
          const existing = (stock || []).find(
            (p) =>
              (p.product_name || p.name || "").trim().toLowerCase() ===
              itemName.toLowerCase()
          );
          if (existing) {
            try {
              await api.patch(`/api/stock/${existing.id}`, {
                quantity:
                  Number(existing.quantity || 0) + Number(it.quantity || 0),
              });
            } catch (_) {}
          } else if (it.item_type !== "service") {
            try {
              await api.post("/api/stock", {
                product_name: itemName,
                item_type: it.item_type || "goods",
                type: it.item_type || "goods",
                unit: it.unit || "Unit",
                hsn_code: it.hsn_code || "",
                gst_rate: String(it.gst_rate || 0),
                quantity: Number(it.quantity || 0),
                price: Number(it.price || 0),
                category: "Purchases",
              });
            } catch (_) {}
          }
        }

        // Trigger payment workflow for purchase bill
        if (grandTotal > 0) {
          try {
            await api.post("/api/payments", {
              party_type: "vendor",
              vendor_name: purchaseForm.vendor_name || "Vendor",
              recipient_name: purchaseForm.vendor_name || "Vendor",
              category: "purchase_bill",
              type: "out",
              payment_mode: "bank_transfer",
              amount: grandTotal,
              payment_date: purchaseForm.bill_date
                ? String(purchaseForm.bill_date).slice(0, 10)
                : new Date().toISOString().slice(0, 10),
              bill_number: purchaseForm.bill_number,
              purpose: `Purchase Bill ${
                purchaseForm.bill_number
                  ? `#${purchaseForm.bill_number}`
                  : ""
              }`.trim(),
            });
          } catch (_) {}
        }
      }

      setShowPurchaseModal(false);

      resetPurchaseForm();

      await loadPurchaseBills();
      await loadStock();
    } catch (err) {
      setPurchaseError(
        err.message ||
          "Could not record purchase bill."
      );
    } finally {
      setSavingPurchase(false);
    }
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProductId(null);
    setProductError("");
    setProductPurchaseSearch("");
    setProductForm({
      ...emptyProduct,
    });
  };

  const openProductModal = () => {
    if (!canWrite) {
      openSubscriptionPrompt("Inventory");
      return;
    }
    setEditingProductId(null);
    setProductError("");
    setProductPurchaseSearch("");

    setProductForm({
      ...emptyProduct,
    });

    setShowProductModal(true);

    if (!purchaseBills.length) {
      loadPurchaseBills();
    }
  };

  const openPurchaseModal = () => {
    if (!canWrite) {
      openSubscriptionPrompt("Inventory");
      return;
    }
    setPurchaseError("");

    setPurchaseForm({
      ...emptyPurchase,
      bill_date: getCurrentDateTime(),
      items: [],
    });

    setShowPurchaseModal(true);
  };

  const productTypeLabel = useMemo(
    () =>
      productForm.item_type === "service"
        ? "Service"
        : "Goods",
    [productForm.item_type]
  );

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
          title="Inventory"
          subtitle="Manage products and stock"
          onMenuClick={() => setSidebarOpen(true)}
          showHome={true}
          showSearch={true}
          showProfile={true}
        >
          <div className="hidden sm:flex items-center gap-2">
            <Button
              icon={Plus}
              size="sm"
              disabled={!canWrite}
              onDisabledClick={() => openSubscriptionPrompt("Inventory")}
              title={!canWrite ? subscriptionRequiredMessage : undefined}
              onClick={openProductModal}
              className="px-2.5 py-1.5 text-xs font-semibold"
            >
              Add Product
            </Button>
          </div>
        </PageHeader>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Mobile Action Bar */}
          <div className="mb-4 flex items-center gap-2.5 sm:hidden">
            <Button
              icon={Plus}
              size="sm"
              disabled={!canWrite}
              onDisabledClick={() => openSubscriptionPrompt("Inventory")}
              title={!canWrite ? subscriptionRequiredMessage : undefined}
              onClick={openProductModal}
              className="flex-1 justify-center px-2 py-2 text-xs font-semibold"
            >
              Add Product
            </Button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Package size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Products
                  </p>
                  <p className="text-2xl font-bold">
                    {loading
                      ? "..."
                      : stock.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <IndianRupee size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Stock Value
                  </p>

                  <p className="text-2xl font-bold text-emerald-600">
                    {loading
                      ? "..."
                      : `₹${stockValue.toLocaleString(
                          "en-IN"
                        )}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Low Stock
                  </p>

                  <p className="text-2xl font-bold text-amber-600">
                    {loading
                      ? "..."
                      : lowStockCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["goods", "Goods"],
                ["service", "Service"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setProductTypeFilter(value)
                  }
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    productTypeFilter === value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

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
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Product
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Type
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Unit
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    GST
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    HSN
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Quantity
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Selling Price
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-6 text-center text-sm text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-6 text-center text-sm text-slate-400"
                    >
                      No products yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const type =
                      product.item_type ||
                      product.type ||
                      "goods";

                    const status = getStockStatus(product.quantity, type);

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-semibold">
                          {product.product_name}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {type === "service"
                            ? "Service"
                            : "Goods"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {type === "service"
                            ? "-"
                            : product.unit ||
                              "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {Number(
                            product.gst_rate || 0
                          )}
                          %
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {product.hsn_code ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold">
                          {type === "service"
                            ? "-"
                            : product.quantity}
                        </td>

                        <td className="px-5 py-4 text-sm font-bold">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!canWrite}
                              onClick={() =>
                                openEditProduct(product)
                              }
                              title={!canWrite ? subscriptionRequiredMessage : "Update"}
                              className={`min-h-10 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold transition ${
                                !canWrite ? "opacity-40 cursor-not-allowed text-emerald-400" : "text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              Update
                            </button>

                            <button
                              type="button"
                              disabled={!canWrite}
                              onClick={() =>
                                handleDeleteProduct(product)
                              }
                              title={!canWrite ? subscriptionRequiredMessage : "Delete"}
                              className={`min-h-10 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold transition ${
                                !canWrite ? "opacity-40 cursor-not-allowed text-red-300" : "text-red-600 hover:bg-red-100"
                              }`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ADD PRODUCT */}
      <Modal
        open={showProductModal}
        onClose={closeProductModal}
        title={
          editingProductId
            ? "Update Product"
            : "Add Product"
        }
      >
        <form
          onSubmit={handleAddProduct}
          className="space-y-5"
        >
          {productError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {productError}
            </div>
          )}

          {/* SEARCH PURCHASE / AUTO-FETCH */}
          {!editingProductId && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Search Purchase Bills / Items
              </label>

              <div className="relative">
                <input
                  value={productPurchaseSearch}
                  onChange={(e) =>
                    setProductPurchaseSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search previous purchase or enter item name manually"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />

                {productPurchaseSearch.trim() &&
                  getProductPurchaseMatches(
                    productPurchaseSearch
                  ).length > 0 && (
                    <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                      {getProductPurchaseMatches(
                        productPurchaseSearch
                      ).map((item, index) => (
                        <button
                          key={
                            `${item.purchase_bill_id || "purchase"}-${item.id || index}`
                          }
                          type="button"
                          onClick={() =>
                            handleProductPurchaseSelect(
                              item
                            )
                          }
                          className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-emerald-50"
                        >
                          <div className="text-sm font-semibold text-slate-800">
                            {item.item_name ||
                              item.product_name ||
                              "Unnamed item"}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {item.bill_number
                              ? `Bill ${item.bill_number}`
                              : "Previous purchase"}
                            {item.vendor_name
                              ? ` • ${item.vendor_name}`
                              : ""}
                            {item.hsn_code
                              ? ` • HSN/SAC ${item.hsn_code}`
                              : ""}
                            {item.price
                              ? ` • Purchase: ₹${Number(item.price).toLocaleString("en-IN")}`
                              : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Search a previous purchase to autofill product details, or enter a new product/service manually.
                Purchase price is never copied as selling price. Set your selling price separately.
              </p>
            </div>
          )}

          {/* TYPE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Type
            </label>

            <div className="grid grid-cols-2 gap-2">
              {["goods", "service"].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      handleProductTypeChange(
                        type
                      )
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      productForm.item_type ===
                      type
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type === "goods"
                      ? "Goods"
                      : "Service"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* PRODUCT NAME */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Product Name
            </label>

            <input
              value={productForm.product_name}
              onChange={(e) =>
                updateProduct(
                  "product_name",
                  e.target.value
                )
              }
              placeholder="Product name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* UNIT + HSN */}
          <div className="grid grid-cols-2 gap-3">
            {productForm.item_type ===
              "goods" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Unit
                </label>

                <div className="relative">
                  <select
                    value={
                      productForm.unit
                    }
                    onChange={(e) =>
                      updateProduct(
                        "unit",
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-emerald-500"
                  >
                    {UNIT_OPTIONS.map(
                      (unit) => (
                        <option
                          key={unit}
                          value={unit}
                        >
                          {unit}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            )}

            <div
              className={
                productForm.item_type ===
                "service"
                  ? "col-span-2"
                  : ""
              }
            >
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                SKU / HSN Code
              </label>

              <input
                value={productForm.hsn_code}
                onChange={(e) =>
                  updateProduct(
                    "hsn_code",
                    e.target.value
                  )
                }
                placeholder="HSN / SAC code"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* GST */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              GST Rate
            </label>

            <div className="relative">
              <select
                value={
                  productForm.gst_mode ===
                  "manual"
                    ? "Manual"
                    : productForm.gst_rate
                }
                onChange={(e) =>
                  handleGstChange(
                    e.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-emerald-500"
              >
                {GST_OPTIONS.map(
                  (rate) => (
                    <option
                      key={rate}
                      value={rate}
                    >
                      {rate === "Manual"
                        ? "Manual"
                        : `${rate}%`}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {productForm.gst_mode ===
              "manual" && (
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  productForm.manual_gst_rate
                }
                onChange={(e) =>
                  updateProduct(
                    "manual_gst_rate",
                    e.target.value
                  )
                }
                placeholder="Enter GST %"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            )}
          </div>

          {/* PRICE + TOGGLE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Selling Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={(e) =>
                updateProduct(
                  "price",
                  e.target.value
                )
              }
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  updateProduct(
                    "price_inclusive_gst",
                    true
                  )
                }
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                  productForm.price_inclusive_gst
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Inclusive GST
              </button>

              <button
                type="button"
                onClick={() =>
                  updateProduct(
                    "price_inclusive_gst",
                    false
                  )
                }
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                  !productForm.price_inclusive_gst
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Exclusive GST
              </button>
            </div>

            {Number(productForm.price || 0) > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5">
                {(() => {
                  const p = Number(productForm.price || 0);
                  const r = Number(
                    productForm.gst_mode === "manual"
                      ? productForm.manual_gst_rate || 0
                      : productForm.gst_rate || 0
                  );
                  if (productForm.price_inclusive_gst) {
                    const base = r > 0 ? p / (1 + r / 100) : p;
                    const gst = p - base;
                    return (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>Base Taxable Amount:</span>
                          <span className="font-semibold text-slate-800">₹{base.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST ({r}%):</span>
                          <span className="font-semibold text-slate-800">₹{gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200">
                          <span>Final Selling Price (Inclusive):</span>
                          <span>₹{p.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  } else {
                    const gst = p * (r / 100);
                    const total = p + gst;
                    return (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>Base Selling Price:</span>
                          <span className="font-semibold text-slate-800">₹{p.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST ({r}%):</span>
                          <span className="font-semibold text-slate-800">₹{gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200">
                          <span>Total Price with GST (Exclusive):</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  }
                })()}
              </div>
            )}

            <p className="mt-1.5 text-xs text-slate-500">
              Purchase price is never copied as selling price. Set your selling price separately.
            </p>
          </div>

          {/* QUANTITY */}
          {productForm.item_type === "goods" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={productForm.quantity}
                onChange={(e) =>
                  updateProduct(
                    "quantity",
                    e.target.value
                  )
                }
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Quantity can be copied from purchase history because it represents stock. You can update the Product Master quantity anytime.
              </p>
            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              rows={3}
              value={productForm.description}
              onChange={(e) =>
                updateProduct(
                  "description",
                  e.target.value
                )
              }
              placeholder="Product/service description"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingProduct}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingProduct
              ? editingProductId
                ? "Updating..."
                : "Saving..."
              : editingProductId
                ? "Update Product"
                : `Add ${productTypeLabel}`}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
