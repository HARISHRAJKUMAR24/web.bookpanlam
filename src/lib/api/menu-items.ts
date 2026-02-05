// ❌ DO NOT USE "use server"
import axios from "axios";
import { apiUrl } from "@/config";

/* ================= AXIOS INSTANCE ================= */

const api = axios.create({
  baseURL: apiUrl, // http://localhost/manager.bookpanlam/public
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= TYPES ================= */

export type Menu = {
  id: number;
  name: string;
  items: number;
  description?: string;
  is_active?: boolean;
  created_at?: string;
};

export type ItemCategory = {
  id: number;
  name: string;
  items: number;
  menu_id?: number;
  created_at?: string;
};

export type Variation = {
  id?: number;
  name: string;
  mrp_price: number;
  selling_price: number;
  discount_percent?: number;
  dine_in_price?: number | null;
  takeaway_price?: number | null;
  delivery_price?: number | null;
};

// Update MenuItemFormData type
export type MenuItemFormData = {
  name: string;
  description?: string;
  hsn_code?: string | null;
  menu_id: number;
  category_id?: number;
  food_type: "veg" | "non-veg";
  halal: boolean;
  stock_type: "limited" | "unlimited" | "out_of_stock";
  stock_qty?: number;
  stock_unit?: string;
  customer_limit?: number;
  customer_limit_period?: string;
  prebooking_enabled?: boolean; // NEW
  prebooking_min_amount?: number | null; // NEW
  prebooking_max_amount?: number | null; // NEW
  prebooking_advance_days?: number | null; // NEW
  image?: string | null;
  variations: Variation[];
};

export type MenuItem = {
  id: number;
  name: string;
  description?: string;
  hsn_code?: string;
  menu_id: number;
  category_id?: number;
  category_name?: string;
  menu_name?: string;
  food_type: "veg" | "non-veg";
  halal: boolean;
  stock_type: string;
  stock_qty: number;                 // 🔥 FIXED
  stock_unit?: string;
  customer_limit?: number;
  customer_limit_period?: string;
  prebooking_enabled?: boolean;
  prebooking_min_amount?: number | null;
  prebooking_max_amount?: number | null;
  prebooking_advance_days?: number | null;
  image?: string;
  price: number;
  original_price: number;            // 🔥 FIXED
  order_count: number;               // 🔥 MAIN FIX
  is_best_seller: boolean;
  is_available: boolean;
  show_on_site: boolean;
  created_at: string;
  last_updated?: string;
};

/* ================= MENUS ================= */

// ➕ Add Menu
export const addMenu = async (name: string) => {
  const res = await api.post("/seller/menu-settings/add.php", { name });
  return res.data;
};

// 📄 Get Menus
export const getMenus = async (): Promise<Menu[]> => {
  const res = await api.get("/seller/menu-settings/list.php");
  return res.data;
};

// ❌ Delete Menu
export const deleteMenu = async (id: number) => {
  const res = await api.post("/seller/menu-settings/delete.php", { id });
  return res.data;
};

// ✏️ Update Menu
export const updateMenu = async (id: number, name: string) => {
  const res = await api.post("/seller/menu-settings/update.php", { id, name });
  return res.data;
};

export const getMenuStats = async (menuId: number) => {
  try {
    // Replace with real API later
    return {
      orders: Math.floor(Math.random() * 100),
      totalAmount: Math.floor(Math.random() * 50000),
      rating: Math.random() * 2 + 3,   // ALWAYS number ✔
    };
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return {
      orders: 0,
      totalAmount: 0,
      rating: 4,
    };
  }
};


export const getCategories = async (
  menu_id?: number
): Promise<ItemCategory[]> => {
  const res = await api.get("/seller/item-categories/list.php", {
    params: menu_id ? { menu_id } : {},
  });
  return res.data;
};


// ➕ Add Category
export const addCategory = async (name: string, menu_id?: number) => {
  const res = await api.post("/seller/item-categories/add.php", {
    name,
    menu_id,
  });
  return res.data;
};

// ✏️ Update Category
export const updateCategory = async (id: number, name: string) => {
  const res = await api.post("/seller/item-categories/update.php", {
    id,
    name,
  });
  return res.data;
};

// ❌ Delete Category
export const deleteCategory = async (id: number) => {
  const res = await api.post("/seller/item-categories/delete.php", { id });
  return res.data;
};

/* ================= MENU ITEMS ================= */

// 📄 Get Menu Items
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const res = await api.get("/seller/menu-items/list.php");

  // ✅ Always return an array
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;

  return [];
};

// 📄 Get Menu Item by ID
// ✅ FIXED: get menu item with variations
export const getMenuItem = async (id: number) => {
  const res = await api.get("/seller/menu-items/get-single.php", {
    params: { id },
  });

  if (res.data?.success) {
    return res.data.item;
  }

  throw new Error("Failed to fetch menu item");
};


// ➕ Add Menu Item
export const addMenuItem = async (data: MenuItemFormData) => {
  const res = await api.post("/seller/menu-items/add.php", data);
  return res.data;
};

// ✏️ Update Menu Item
export const updateMenuItem = async (
  id: number,
  data: Partial<MenuItemFormData>
) => {
  const res = await api.post("/seller/menu-items/update.php", {
    id,
    ...data,
  });
  return res.data;
};

// ❌ Delete Menu Item
export const deleteMenuItem = async (id: number) => {
  const res = await api.post("/seller/menu-items/delete.php", { id });
  return res.data;
};

// 🔄 Toggle Availability
export const toggleMenuItemAvailability = async (
  id: number,
  is_available: boolean
) => {
  const res = await api.post(
    "/seller/menu-items/toggle-availability.php",
    {
      id,
      available: is_available ? 1 : 0 // ✅ correct
    }
  );
  return res.data;
};



// 👁️ Toggle Visibility
export const toggleMenuItemVisibility = async (
  id: number,
  show_on_site: boolean
) => {
  const res = await api.post(
    "/seller/menu-items/toggle-visibility.php",
    { id, show_on_site }
  );
  return res.data;
};

// 🏷️ Toggle Best Seller
export const toggleMenuItemBestSeller = async (
  id: number,
  is_best_seller: boolean
) => {
  const res = await api.post(
    "/seller/menu-items/toggle-best-seller.php",
    { id, is_best_seller }
  );
  return res.data;
};


export const getMenuItemVariations = async (itemId: number) => {
  const res = await api.get("/seller/menu-items/get-variations.php", {
    params: { item_id: itemId },
  });

  if (res.data?.success) {
    return res.data.variations;
  }

  return [];
};
