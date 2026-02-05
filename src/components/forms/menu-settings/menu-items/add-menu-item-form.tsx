"use client";

import { useState, useEffect } from "react";
import {
  X, Trash2, Plus, Info, AlertCircle,
  ShoppingBag, Users, Tag, IndianRupee,
  Percent, Calendar, Clock, Shield, CalendarDays, CreditCard
} from "lucide-react";

interface Props {
  onClose: () => void;
  onItemAdded?: () => void;
  onItemSaved?: () => Promise<void>;   // ✅ ADD THIS
  item?: any | null;
  title?: string;
}

import { getMenuItemVariations } from "@/lib/api/menu-items";

import {
  getMenus, getCategories,
} from "@/lib/api/menu-items";
import type { Menu, ItemCategory } from "@/lib/api/menu-items";

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60" onClick={onClose} />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-50 to-rose-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 shadow-sm font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

type Variation = {
  id: number;
  name: string;
  mrpPrice: string;
  sellingPrice: string;
  discountPercent: string;
  isActive: boolean;
  dineInPrice: string | null;
  takeawayPrice: string | null;
  deliveryPrice: string | null;
};

export default function AddMenuItemForm({
  onClose,
  onItemAdded,
  item,
  title,
}: Props) {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [hasVariations, setHasVariations] = useState(true);
  const [foodType, setFoodType] = useState<"veg" | "nonveg">("veg");
  const [isHalal, setIsHalal] = useState(false);
  const [stockType, setStockType] = useState<"unlimited" | "out" | "limited">("unlimited");
  const [stockQty, setStockQty] = useState("");
  const [stockUnit, setStockUnit] = useState("pcs");
  const [customerLimitEnabled, setCustomerLimitEnabled] = useState(false);
  const [customerLimitQty, setCustomerLimitQty] = useState("");
  const [customerLimitPeriod, setCustomerLimitPeriod] = useState<"per_order" | "per_day" | "per_week" | "per_month">("per_order");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuCategory, setMenuCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
const [removeImage, setRemoveImage] = useState(false);
const [oldImage, setOldImage] = useState("");


  // =============== PREBOOKING STATE ===============
  const [prebookingEnabled, setPrebookingEnabled] = useState(false);
  const [prebookingMinAmount, setPrebookingMinAmount] = useState("");
  const [prebookingMaxAmount, setPrebookingMaxAmount] = useState("");
  const [prebookingAdvanceDays, setPrebookingAdvanceDays] = useState("7");
  // ===============================================

  const [variations, setVariations] = useState<Variation[]>([
    {
      id: 1,
      name: "",
      mrpPrice: "",
      sellingPrice: "",
      discountPercent: "",
      isActive: true,
      dineInPrice: null,
      takeawayPrice: null,
      deliveryPrice: null,
    },
  ]);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    if (!menuCategory) {
      setCategories([]);
      setSubCategory("");
      return;
    }

    getCategories(Number(menuCategory))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [menuCategory]);

  useEffect(() => {
    getMenus().then(setMenus);
  }, []);

  // New form state fields
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hsnCode, setHsnCode] = useState("");

  const addVariation = () => {
    setVariations([
      ...variations,
      {
        id: variations.length + 1,
        name: `Variation ${variations.length + 1}`,
        mrpPrice: "",
        sellingPrice: "",
        discountPercent: "",
        isActive: true,
        dineInPrice: "",
        takeawayPrice: "",
        deliveryPrice: ""
      }
    ]);
  };

  const removeVariation = (id: number) => {
    if (variations.length > 1) {
      setDeleteMessage(`Are you sure you want to remove Variation ${id}? This action cannot be undone.`);
      setShowDeleteConfirm(true);

      const confirmDelete = () => {
        setVariations(variations.filter(v => v.id !== id));
        setShowDeleteConfirm(false);
      };

      window.confirmDeleteAction = confirmDelete;
    }
  };

  const handleConfirmDelete = () => {
    if (window.confirmDeleteAction) {
      window.confirmDeleteAction();
      window.confirmDeleteAction = null;
    }
    setShowDeleteConfirm(false);
  };

  const getFullImageUrl = (image?: string | null) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    if (!image.startsWith("/")) image = "/" + image;
    return `http://localhost/manager.bookpanlam/public${image}`;
  };
useEffect(() => {
  if (!item) return;

  console.log('Item data from API:', item);

  /* ================= BASIC FIELDS ================= */
  setItemName(item.name ?? "");
  setDescription(item.description ?? "");
  setHsnCode(item.hsn_code ?? "");
  setMenuCategory(item.menu_id ? String(item.menu_id) : "");
  setSubCategory(item.category_id ? String(item.category_id) : "");

  /* ================= FOOD TYPE ================= */
  const ft = item.food_type;
  setFoodType(ft === "non-veg" || ft === "nonveg" ? "nonveg" : "veg");
  setIsHalal(Boolean(item.halal));

  /* ================= STOCK ================= */
  setStockType(
    item.stock_type === "out_of_stock"
      ? "out"
      : item.stock_type ?? "unlimited"
  );
  setStockQty(item.stock_qty ? String(item.stock_qty) : "");
  setStockUnit(item.stock_unit ?? "pcs");

  /* ================= CUSTOMER LIMIT ================= */
  setCustomerLimitEnabled(Boolean(item.customer_limit));
  setCustomerLimitQty(item.customer_limit ? String(item.customer_limit) : "");
  setCustomerLimitPeriod(item.customer_limit_period ?? "per_order");

  /* ================= PREBOOKING ================= */
  // IMPORTANT: Check if prebooking fields exist in the API response
  const prebookingEnabled = item.prebooking_enabled !== undefined 
    ? Boolean(item.prebooking_enabled) 
    : false;
  
  setPrebookingEnabled(prebookingEnabled);
  
  setPrebookingMinAmount(
    item.prebooking_min_amount !== null && item.prebooking_min_amount !== undefined 
      ? String(item.prebooking_min_amount) 
      : ""
  );
  
  setPrebookingMaxAmount(
    item.prebooking_max_amount !== null && item.prebooking_max_amount !== undefined 
      ? String(item.prebooking_max_amount) 
      : ""
  );
  
  setPrebookingAdvanceDays(
    item.prebooking_advance_days !== null && item.prebooking_advance_days !== undefined 
      ? String(item.prebooking_advance_days) 
      : "7"
  );

  /* ================= VARIATIONS ================= */
  if (item.variations && item.variations.length > 0) {
    setHasVariations(true);
    setVariations(
      item.variations.map((v: any, i: number) => ({
        id: i + 1, // You might want to use v.id instead if you need the actual DB ID
        name: v.name ?? "",
        mrpPrice: String(v.mrp_price ?? ""),
        sellingPrice: String(v.selling_price ?? ""),
        discountPercent: String(v.discount_percent ?? ""),
        isActive: Boolean(v.is_active),
        dineInPrice: v.dine_in_price?.toString() ?? "",
        takeawayPrice: v.takeaway_price?.toString() ?? "",
        deliveryPrice: v.delivery_price?.toString() ?? "",
      }))
    );
  } else {
    setHasVariations(false);
    setVariations([]);
  }

  /* ================= IMAGE ================= */
  if (item.image) {
    setImagePreview(getFullImageUrl(item.image));
  } else {
    setImagePreview(null);
  }
}, [item]);

  useEffect(() => {
    if (!item?.id) return;

    const loadVariations = async () => {
      const data = await getMenuItemVariations(item.id);

      if (data.length > 0) {
        setHasVariations(true);
        setVariations(
          data.map((v: any, i: number) => ({
            id: i + 1,
            name: v.name ?? "",
            mrpPrice: String(v.mrp_price ?? ""),
            sellingPrice: String(v.selling_price ?? ""),
            discountPercent: String(v.discount_percent ?? ""),
            isActive: true,
            dineInPrice: v.dine_in_price?.toString() ?? "",
            takeawayPrice: v.takeaway_price?.toString() ?? "",
            deliveryPrice: v.delivery_price?.toString() ?? "",
          }))
        );
      } else {
        setHasVariations(false);
        setVariations([]);
      }
    };

    loadVariations();
  }, [item?.id]);

  const updateVariation = (id: number, field: keyof Variation, value: string) => {
    setVariations(variations.map(v => {
      if (v.id === id) {
        const updated = { ...v, [field]: value };

        if (field === 'mrpPrice' || field === 'sellingPrice' ||
          field === 'dineInPrice' || field === 'takeawayPrice' || field === 'deliveryPrice') {
          const numericValue = value.replace(/[^0-9.]/g, '');
          const parts = numericValue.split('.');
          if (parts.length > 2) {
            updated[field] = parts[0] + '.' + parts.slice(1).join('');
          } else {
            updated[field] = numericValue;
          }
        }

        if (field === 'mrpPrice' || field === 'sellingPrice') {
          const mrp = parseFloat(updated.mrpPrice) || 0;
          const selling = parseFloat(updated.sellingPrice) || 0;

          if (mrp > 0 && selling > 0 && selling <= mrp) {
            const discount = ((mrp - selling) / mrp) * 100;
            updated.discountPercent = discount.toFixed(0);
          } else {
            updated.discountPercent = "";
          }
        }

        return updated;
      }
      return v;
    }));
  };

  // Handle image upload
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "File size must be less than 5MB" }));
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: "Please upload JPG, PNG or WebP image" }));
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: "" }));

    // 🚀 FIX : NEW UPLOAD SHOULD DELETE OLD IMAGE
    setRemoveImage(true);
    setOldImage(item?.image || "");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};


  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!itemName.trim()) newErrors.itemName = "Item name is required";
    if (!menuCategory) newErrors.menuCategory = "Menu category is required";

    // Stock validation
    if (stockType === "limited") {
      if (!stockQty.trim()) newErrors.stockQty = "Stock quantity is required";
      else if (parseInt(stockQty) <= 0) newErrors.stockQty = "Stock quantity must be greater than 0";
    }

    // Customer limit validation
    if (customerLimitEnabled) {
      if (!customerLimitQty.trim()) newErrors.customerLimitQty = "Customer limit quantity is required";
      else if (parseInt(customerLimitQty) <= 0) newErrors.customerLimitQty = "Quantity must be greater than 0";
    }

    // HSN validation
    if (hsnCode && !/^[A-Za-z0-9]{4,12}$/.test(hsnCode)) {
      newErrors.hsnCode = "HSN code should be 4-12 alphanumeric characters";
    }

    // Prebooking validation - REMOVED PRICE RESTRICTIONS
    if (prebookingEnabled) {
      if (!prebookingMinAmount.trim()) {
        newErrors.prebookingMinAmount = "Minimum prebooking amount is required";
      } else {
        const minAmount = parseFloat(prebookingMinAmount);
        if (minAmount <= 0) {
          newErrors.prebookingMinAmount = "Amount must be greater than 0";
        }
      }

      if (!prebookingMaxAmount.trim()) {
        newErrors.prebookingMaxAmount = "Maximum prebooking amount is required";
      } else {
        const maxAmount = parseFloat(prebookingMaxAmount);
        if (maxAmount <= 0) {
          newErrors.prebookingMaxAmount = "Amount must be greater than 0";
        } else if (maxAmount < parseFloat(prebookingMinAmount || "0")) {
          newErrors.prebookingMaxAmount = "Cannot be less than minimum amount";
        }
      }

      if (!prebookingAdvanceDays.trim()) {
        newErrors.prebookingAdvanceDays = "Advance days is required";
      } else {
        const days = parseInt(prebookingAdvanceDays);
        if (days < 1 || days > 365) {
          newErrors.prebookingAdvanceDays = "Advance days must be between 1 and 365";
        }
      }
    }

    // Variations validation
    if (hasVariations) {
      variations.forEach((variation, index) => {
        if (!variation.name.trim()) {
          newErrors[`variation_${variation.id}_name`] = `Variation ${index + 1} name is required`;
        }
        if (!variation.mrpPrice.trim()) {
          newErrors[`variation_${variation.id}_mrp`] = `MRP price is required`;
        } else if (parseFloat(variation.mrpPrice) <= 0) {
          newErrors[`variation_${variation.id}_mrp`] = `MRP price must be greater than 0`;
        }
        if (!variation.sellingPrice.trim()) {
          newErrors[`variation_${variation.id}_selling`] = `Selling price is required`;
        } else if (parseFloat(variation.sellingPrice) <= 0) {
          newErrors[`variation_${variation.id}_selling`] = `Selling price must be greater than 0`;
        }
        if (parseFloat(variation.sellingPrice) > parseFloat(variation.mrpPrice)) {
          newErrors[`variation_${variation.id}_selling`] = `Selling price cannot be greater than MRP`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[data-error="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data
// Update the formData object in handleSubmit:
const formData = {
  name: itemName,
  description: description,
  menu_id: Number(menuCategory),
  category_id: subCategory ? parseInt(subCategory) : null,
  hsn_code: hsnCode || null,
  food_type: foodType === "nonveg" ? "non-veg" : "veg",
  halal: isHalal,
  stock_type: stockType === "out" ? "out_of_stock" : stockType,
  stock_qty: stockType === "limited" ? parseInt(stockQty) || 0 : null,
  stock_unit: stockType === "limited" ? stockUnit : null,
  customer_limit: customerLimitEnabled ? parseInt(customerLimitQty) || 0 : null,
  customer_limit_period: customerLimitEnabled ? customerLimitPeriod : null,
  // Prebooking data
  prebooking_enabled: prebookingEnabled ? 1 : 0,
  prebooking_min_amount: prebookingEnabled ? parseFloat(prebookingMinAmount) || 0 : null,
  prebooking_max_amount: prebookingEnabled ? parseFloat(prebookingMaxAmount) || 0 : null,
  prebooking_advance_days: prebookingEnabled ? parseInt(prebookingAdvanceDays) || 7 : null,
  variations: hasVariations ? variations.map(v => ({
    name: v.name,
    mrp_price: parseFloat(v.mrpPrice) || 0,
    selling_price: parseFloat(v.sellingPrice) || 0,
    discount_percent: parseFloat(v.discountPercent) || 0,
    dine_in_price: v.dineInPrice ? parseFloat(v.dineInPrice) : null,
    takeaway_price: v.takeawayPrice ? parseFloat(v.takeawayPrice) : null,
    delivery_price: v.deliveryPrice ? parseFloat(v.deliveryPrice) : null
  })) : [],
};

      // First, upload image if exists
      let imageUrl = item?.image || "";
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const uploadResponse = await fetch(
          'http://localhost/manager.bookpanlam/public/seller/menu-items/upload.php',
          {
            method: 'POST',
            body: imageFormData,
            credentials: 'include',
          }
        );

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.imageUrl || "";
        }
      }



// Add image URL to form data
const finalData: any = {
  ...formData,
  image: imageUrl
};

// 🚀 If user removed the image
if (removeImage && item?.image) {
  finalData.remove_image = 1;
  finalData.old_image = item.image;
}

// 🚀 If user uploaded a new image (and old_image exists)
if (imageFile && imageUrl) {
  finalData.image = imageUrl;
}


      // Send to API
      const url = item?.id
        ? 'http://localhost/manager.bookpanlam/public/seller/menu-items/update.php'
        : 'http://localhost/manager.bookpanlam/public/seller/menu-items/add.php';

      const payload = item?.id
        ? { id: item.id, ...finalData }
        : finalData;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("SERVER RESPONSE:", text);
        setErrors({ submit: "Server error. Check PHP logs." });
        return;
      }

      if (result.success) {
        alert(item ? "Menu item updated successfully!" : "Menu item added successfully!");
        if (onItemAdded) onItemAdded();
        onClose();
      } else {
        setErrors({ submit: result.message || "Failed to save menu item" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft
  const handleSaveAsDraft = async () => {
    alert("Draft saved! (You can implement draft functionality similarly)");
  };

  return (
    <>
      {/* 🔴 Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-200"
        onClick={onClose}
      />

      {/* 🟢 Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-8 py-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {title || (item ? "Edit Menu Item" : "Add Menu Item")}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {item
                      ? "Update item details, pricing, stock, and restrictions"
                      : "Add a new item to your menu with all details including pricing, stock, and restrictions"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8" onSubmit={handleSubmit}>
            {/* ================= LEFT: PRODUCT INFO ================= */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">📦</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
                </div>

                <div className="space-y-5">
                  {/* Item Name */}
                  <div data-error="itemName">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Butter Chicken, Margherita Pizza"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.itemName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      value={itemName}
                      onChange={(e) => {
                        setItemName(e.target.value);
                        if (errors.itemName) setErrors(prev => ({ ...prev, itemName: "" }));
                      }}
                      required
                    />
                    {errors.itemName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.itemName}
                      </p>
                    )}
                  </div>

                  {/* HSN Code Field */}
                  <div data-error="hsnCode">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 21069099"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.hsnCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      value={hsnCode}
                      onChange={(e) => {
                        setHsnCode(e.target.value);
                        if (errors.hsnCode) setErrors(prev => ({ ...prev, hsnCode: "" }));
                      }}
                      maxLength={8}
                    />
                    {errors.hsnCode && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.hsnCode}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Harmonized System of Nomenclature code for GST purposes (optional)
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your dish, ingredients, special notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-error="menuCategory">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Menu Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.menuCategory ? 'border-red-500' : 'border-gray-300'
                          }`}
                        value={menuCategory}
                        onChange={(e) => {
                          setMenuCategory(e.target.value);
                          if (errors.menuCategory) setErrors(prev => ({ ...prev, menuCategory: "" }));
                        }}
                        required
                      >
                        <option value="">Select Menu</option>
                        {menus.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name}
                          </option>
                        ))}
                      </select>
                      {errors.menuCategory && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.menuCategory}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Category
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        disabled={!menuCategory}
                      >
                        <option value="">Select Item Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= STOCK MANAGEMENT ================= */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Stock Management</h3>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Status <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setStockType("unlimited")}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200
                        ${stockType === "unlimited"
                          ? "border-purple-600 bg-purple-50 text-purple-700 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${stockType === "unlimited" ? "bg-purple-100" : "bg-gray-100"}`}>
                        <span className="text-xl">♾️</span>
                      </div>
                      <span className="text-sm font-medium">Unlimited</span>
                      <span className="text-xs text-gray-500 text-center">Always available</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockType("limited")}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200
                        ${stockType === "limited"
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${stockType === "limited" ? "bg-blue-100" : "bg-gray-100"}`}>
                        <span className="text-xl">📦</span>
                      </div>
                      <span className="text-sm font-medium">Limited Stock</span>
                      <span className="text-xs text-gray-500 text-center">Track inventory</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockType("out")}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200
                        ${stockType === "out"
                          ? "border-red-600 bg-red-50 text-red-700 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${stockType === "out" ? "bg-red-100" : "bg-gray-100"}`}>
                        <span className="text-xl">🚫</span>
                      </div>
                      <span className="text-sm font-medium">Out of Stock</span>
                      <span className="text-xs text-gray-500 text-center">Hidden from menu</span>
                    </button>
                  </div>

                  {/* Limited Stock Input */}
                  {stockType === "limited" && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          Set available stock quantity
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div data-error="stockQty">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Available Quantity <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="100"
                              value={stockQty}
                              onChange={(e) => {
                                setStockQty(e.target.value);
                                if (errors.stockQty) setErrors(prev => ({ ...prev, stockQty: "" }));
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${errors.stockQty ? 'border-red-500' : 'border-blue-300'
                                }`}
                              required
                            />
                          </div>
                          {errors.stockQty && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.stockQty}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unit <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={stockUnit}
                            onChange={(e) => setStockUnit(e.target.value)}
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            required
                          >
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="g">Grams (g)</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="ltr">Liters (ltr)</option>
                            <option value="plates">Plates</option>
                            <option value="servings">Servings</option>
                            <option value="portions">Portions</option>
                            <option value="bowls">Bowls</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600">
                        Item will be automatically marked "Sold Out" when stock reaches zero.
                      </p>
                    </div>
                  )}

                  {/* Stock Type Messages */}
                  {stockType === "unlimited" && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span className="text-sm text-purple-700">
                          This item will always be available for ordering. No inventory tracking required.
                        </span>
                      </div>
                    </div>
                  )}

                  {stockType === "out" && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <span className="text-sm text-red-700">
                          This item will not be visible to customers and cannot be ordered.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ================= CUSTOMER PURCHASE LIMIT ================= */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Customer Purchase Limit</h3>
                      <p className="text-sm text-gray-500">Restrict how many items a customer can buy</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customerLimitEnabled}
                      onChange={(e) => setCustomerLimitEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                      peer-checked:after:translate-x-full peer-checked:after:border-white 
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                    </div>
                  </label>
                </div>

                {customerLimitEnabled && (
                  <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div data-error="customerLimitQty">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Quantity Per Customer <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={customerLimitQty}
                          onChange={(e) => {
                            setCustomerLimitQty(e.target.value);
                            if (errors.customerLimitQty) setErrors(prev => ({ ...prev, customerLimitQty: "" }));
                          }}
                          placeholder="e.g., 2"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.customerLimitQty ? 'border-red-500' : 'border-orange-300'
                            }`}
                          required
                        />
                        {errors.customerLimitQty && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.customerLimitQty}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum items a single customer can order
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Limit Period <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={customerLimitPeriod}
                          onChange={(e) => setCustomerLimitPeriod(e.target.value as any)}
                          className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        >
                          <option value="per_order">Per Order</option>
                          <option value="per_day">Per Day</option>
                          <option value="per_week">Per Week</option>
                          <option value="per_month">Per Month</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          How often the limit resets
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Limit Details:</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Customers will be restricted to {customerLimitQty || "_"} items
                            {customerLimitPeriod === "per_order" && " per order"}
                            {customerLimitPeriod === "per_day" && " per day"}
                            {customerLimitPeriod === "per_week" && " per week"}
                            {customerLimitPeriod === "per_month" && " per month"}
                            . This helps prevent bulk buying and ensures fair distribution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ================= RIGHT: PRICING & VARIATIONS ================= */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">💰</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Pricing & Variations</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Item Variations
                      </label>
                      <p className="text-sm text-gray-500">Add different sizes or types</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasVariations}
                        onChange={() => setHasVariations(!hasVariations)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:border-gray-300 after:border after:rounded-full 
                        after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                      </div>
                    </label>
                  </div>

                  {hasVariations ? (
                    <div className="space-y-4">
                      {variations.map((variation) => (
                        <div key={variation.id} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">V{variation.id}</span>
                              </div>
                              <h4 className="font-medium text-gray-900">Variation {variation.id}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariation(variation.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={variations.length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div data-error={`variation_${variation.id}_name`}>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Variation Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                value={variation.name}
                                onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                                placeholder="e.g., Small, Medium, Large, Family Pack"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors[`variation_${variation.id}_name`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                              />
                              {errors[`variation_${variation.id}_name`] && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {errors[`variation_${variation.id}_name`]}
                                </p>
                              )}
                            </div>

                            {/* MRP and Selling Price */}
                            <div className="grid grid-cols-2 gap-3">
                              <div data-error={`variation_${variation.id}_mrp`}>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  MRP Price (₹) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
                                  <input
                                    value={variation.mrpPrice}
                                    onChange={(e) => updateVariation(variation.id, 'mrpPrice', e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors[`variation_${variation.id}_mrp`] ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                  />
                                </div>
                                {errors[`variation_${variation.id}_mrp`] && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors[`variation_${variation.id}_mrp`]}
                                  </p>
                                )}
                              </div>
                              <div data-error={`variation_${variation.id}_selling`}>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Selling Price (₹) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
                                  <input
                                    value={variation.sellingPrice}
                                    onChange={(e) => updateVariation(variation.id, 'sellingPrice', e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors[`variation_${variation.id}_selling`] ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                  />
                                </div>
                                {errors[`variation_${variation.id}_selling`] && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors[`variation_${variation.id}_selling`]}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Discount Display */}
                            {variation.discountPercent && (
                              <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Percent className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">Discount Applied</span>
                                  </div>
                                  <span className="text-sm font-bold text-green-700">
                                    {variation.discountPercent}% OFF
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  MRP: ₹{variation.mrpPrice} → Selling: ₹{variation.sellingPrice}
                                </div>
                              </div>
                            )}

                            {/* Service Type Prices */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-700 font-medium">Service Type</span>
                                <span className="text-gray-700 font-medium">Price (₹)</span>
                              </div>
                              {[
                                { type: "Dine In", value: variation.dineInPrice ?? variation.sellingPrice ?? "", key: 'dineInPrice' },
                                { type: "Takeaway", value: variation.takeawayPrice ?? variation.sellingPrice ?? "", key: 'takeawayPrice' },
                                { type: "Delivery", value: variation.deliveryPrice ?? variation.sellingPrice ?? "", key: 'deliveryPrice' },
                              ]
                                .map((service) => (
                                  <div key={service.type} className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50">
                                    <span className="text-sm text-gray-700">{service.type}</span>
                                    <div className="flex items-center gap-2">
                                      <IndianRupee className="w-3 h-3 text-gray-500" />
                                      <input
                                        value={service.value}
                                        onChange={(e) => updateVariation(variation.id, service.key as any, e.target.value)}
                                        placeholder="0.00"
                                        className="w-24 px-3 py-1 border border-gray-300 rounded text-right"
                                        type="text"
                                        pattern="[0-9]*\.?[0-9]*"
                                      />
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addVariation}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Another Variation
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">💲</span>
                      </div>
                      <p className="text-gray-600">No variations. Single price for all customers.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Enable variations to add different sizes or types with separate pricing
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ================= PREBOOKING SYSTEM ================= */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Prebooking System</h3>
                      <p className="text-sm text-gray-500">Allow customers to book in advance with partial payment</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prebookingEnabled}
                      onChange={(e) => {
                        setPrebookingEnabled(e.target.checked);
                        if (e.target.checked) {
                          // Auto-set default values when enabled
                          setPrebookingMinAmount("100");
                          setPrebookingMaxAmount("500");
                        } else {
                          // Clear values when disabled
                          setPrebookingMinAmount("");
                          setPrebookingMaxAmount("");
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                      peer-checked:after:translate-x-full peer-checked:after:border-white 
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600">
                    </div>
                  </label>
                </div>

                {prebookingEnabled && (
                  <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    {/* Information Box */}
                    <div className="p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Prebooking Information</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Set any amount you wish for prebooking. Customers will pay this amount in advance.
                            <br />
                            <span className="text-indigo-600 font-medium">Note: These amounts are independent of item prices.</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div data-error="prebookingMinAmount">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Prebooking Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={prebookingMinAmount}
                            onChange={(e) => {
                              setPrebookingMinAmount(e.target.value);
                              if (errors.prebookingMinAmount) {
                                setErrors(prev => ({ ...prev, prebookingMinAmount: "" }));
                              }
                            }}
                            placeholder="e.g., 100"
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.prebookingMinAmount ? 'border-red-500' : 'border-indigo-300'
                              }`}
                            required
                          />
                        </div>
                        {errors.prebookingMinAmount && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.prebookingMinAmount}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum amount customers must pay to prebook
                        </p>
                      </div>

                      <div data-error="prebookingMaxAmount">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Prebooking Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={prebookingMaxAmount}
                            onChange={(e) => {
                              setPrebookingMaxAmount(e.target.value);
                              if (errors.prebookingMaxAmount) setErrors(prev => ({ ...prev, prebookingMaxAmount: "" }));
                            }}
                            placeholder="e.g., 500"
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.prebookingMaxAmount ? 'border-red-500' : 'border-indigo-300'
                              }`}
                            required
                          />
                        </div>
                        {errors.prebookingMaxAmount && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.prebookingMaxAmount}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum amount customers can pay for prebooking
                        </p>
                      </div>
                    </div>

                    <div data-error="prebookingAdvanceDays">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Advance Booking Days <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="number"
                          min="1"
                          max="365"
                          step="1"
                          value={prebookingAdvanceDays}
                          onChange={(e) => {
                            setPrebookingAdvanceDays(e.target.value);
                            if (errors.prebookingAdvanceDays) setErrors(prev => ({ ...prev, prebookingAdvanceDays: "" }));
                          }}
                          placeholder="e.g., 7"
                          className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.prebookingAdvanceDays ? 'border-red-500' : 'border-indigo-300'
                            }`}
                          required
                        />
                      </div>
                      {errors.prebookingAdvanceDays && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.prebookingAdvanceDays}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        How many days in advance customers can book this item (1-365 days)
                      </p>
                    </div>

                    {/* Amount Range Display */}
                    <div className="p-4 bg-white rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Amount Range</span>
                        <span className="text-sm font-bold text-indigo-700">
                          ₹{prebookingMinAmount || "0"} - ₹{prebookingMaxAmount || "0"}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Min: ₹{prebookingMinAmount || "0"}</span>
                        <span>Max: ₹{prebookingMaxAmount || "0"}</span>
                      </div>
                    </div>

                    {/* Summary Box */}
                    <div className="p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Prebooking Summary:</p>
                          <p className="text-xs text-gray-600 mt-1">
                            • Customers can prebook this item up to {prebookingAdvanceDays} days in advance
                            <br />
                            • Prebooking amount range: ₹{prebookingMinAmount || "0"} - ₹{prebookingMaxAmount || "0"}
                            <br />
                            • Customers choose any amount within this range
                            <br />
                            • Amount paid in advance, remaining balance at pickup/delivery
                            <br />
                            • Prebooking ensures item availability on selected date
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!prebookingEnabled && (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarDays className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-600">Prebooking is disabled for this item</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Enable prebooking to allow customers to book in advance with partial payment.
                      Set any amount you wish for prebooking.
                    </p>
                  </div>
                )}
              </div>

              {/* ================= ADDITIONAL SETTINGS ================= */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">⚙️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Additional Settings</h3>
                </div>

                <div className="space-y-5">
                  {/* Food Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Food Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFoodType("veg")}
                        className={`flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-xl transition-all
                          ${foodType === "veg"
                            ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center
                            ${foodType === "veg" ? "border-green-600" : "border-gray-300"}`}>
                            <div className={`w-2.5 h-2.5 rounded-full
                              ${foodType === "veg" ? "bg-green-600" : "bg-transparent"}`} />
                          </div>
                          <span className="font-medium">Vegetarian</span>
                        </div>
                        <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          🥬
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFoodType("nonveg")}
                        className={`flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-xl transition-all
                          ${foodType === "nonveg"
                            ? "border-red-600 bg-red-50 text-red-700 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center
                            ${foodType === "nonveg" ? "border-red-600" : "border-gray-300"}`}>
                            <div className={`w-2.5 h-2.5 rounded-full
                              ${foodType === "nonveg" ? "bg-red-600" : "bg-transparent"}`} />
                          </div>
                          <span className="font-medium">Non-Vegetarian</span>
                        </div>
                        <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                          🍗
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Halal Certification - Only show for non-veg */}
                  {foodType === "nonveg" && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Halal Certified</h4>
                          <p className="text-xs text-gray-600">Mark if this item is Halal certified</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isHalal}
                          onChange={(e) => setIsHalal(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                          after:bg-white after:border-gray-300 after:border after:rounded-full 
                          after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600">
                        </div>
                      </label>
                    </div>
                  )}

                  {isHalal && foodType === "nonveg" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Halal Certification</p>
                          <p className="text-xs text-amber-700 mt-1">
                            This item will display a Halal certified badge on customer menus.
                            Ensure all ingredients meet Halal certification standards.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Food Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                      {imagePreview ? (
                        <div className="mb-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg mx-auto"
                          />
                    <button
  type="button"
  onClick={() => {
    setImageFile(null);
    setImagePreview(null);

    // 🚀 ADD THIS
    setRemoveImage(true);
    setOldImage(item?.image || "");
  }}
  className="mt-2 text-sm text-red-600 hover:text-red-800"
>
  Remove Image
</button>

                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">📷</span>
                        </div>
                      )}
                      <p className="text-gray-700 font-medium">Upload Food Image</p>
                      <p className="text-sm text-gray-500 mt-1 mb-3">JPG, PNG or WebP. Max 5MB</p>
                      {errors.image && (
                        <p className="text-red-500 text-sm mb-2 flex items-center justify-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.image}
                        </p>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="food-image"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="food-image" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Browse Files
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields must be filled
                {errors.submit && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.submit}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : (item ? "Update Item" : "Save & Publish Item")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        message={deleteMessage}
      />
    </>
  );
}

// Add global type for confirm delete action
declare global {
  interface Window {
    confirmDeleteAction: (() => void) | null;
  }
}

// Initialize
if (typeof window !== 'undefined') {
  window.confirmDeleteAction = null;
}