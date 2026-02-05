// ❌ DO NOT USE "use server"
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/config";

/* -------------------------------- TYPES -------------------------------- */
export type ManualPaymentMethod = {
  id: number;
  name: string;
  upi_id?: string | null;
  instructions: string;
  icon?: string | null;
  created_at: string;
};

/* -------------------------------- HELPERS -------------------------------- */
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Unauthorized");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* -------------------------------- LIST -------------------------------- */
export const getManualPaymentMethods = async () => {
  const token = Cookies.get("token");
  if (!token) {
    return { success: false, records: [] };
  }

  const res = await axios.get(
    `${apiUrl}/seller/settings/payment-settings/manual-payment-methods/list.php`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );

  return res.data;
};

/* -------------------------------- ADD -------------------------------- */
export const addManualPaymentMethod = async (formData: FormData) => {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "multipart/form-data",
  };

  const res = await axios.post(
    `${apiUrl}/seller/settings/payment-settings/manual-payment-methods/add.php`,
    formData,
    { headers }
  );

  return res.data;
};

/* -------------------------------- UPDATE -------------------------------- */
export const updateManualPaymentMethod = async (
  id: number,
  formData: FormData
) => {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "multipart/form-data",
  };

  const res = await axios.post(
    `${apiUrl}/seller/settings/payment-settings/manual-payment-methods/update.php?id=${id}`,
    formData,
    { headers }
  );

  return res.data;
};

/* -------------------------------- DELETE -------------------------------- */
export const deleteManualPaymentMethod = async (id: number) => {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };

  const res = await axios.post(
    `${apiUrl}/seller/settings/payment-settings/manual-payment-methods/delete.php`,
    { id },
    { headers }
  );

  return res.data;
};