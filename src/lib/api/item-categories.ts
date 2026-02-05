// ❌ DO NOT USE "use server"
import axios from "axios";
import { apiUrl } from "@/config";

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // ✅ REQUIRED
  headers: {
    "Content-Type": "application/json",
  },
});

export type ItemCategory = {
  id: number;
  name: string;
  items: number;
};

// 📄 LIST
export const getCategories = async (): Promise<ItemCategory[]> => {
  const res = await api.get("/seller/item-categories/list.php");
  return res.data;
};

// ➕ ADD
export const addCategory = async (name: string) => {
  const res = await api.post(
    "/seller/item-categories/add.php",
    JSON.stringify({ name })
  );
  return res.data;
};

// ✏️ UPDATE
export const updateCategory = async (id: number, name: string) => {
  const res = await api.post(
    "/seller/item-categories/update.php",
    JSON.stringify({ id, name })
  );
  return res.data;
};

// ❌ DELETE (POST – FIXED)
export const deleteCategory = async (id: number) => {
  const res = await api.post(
    "/seller/item-categories/delete.php",
    JSON.stringify({ id })
  );
  return res.data;
};