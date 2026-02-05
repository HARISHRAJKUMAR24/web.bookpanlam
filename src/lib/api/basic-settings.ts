"use server";

import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

export interface BasicSettingsData {
  logo?: string | null;
  favicon?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  currency?: string | null;
  country?: string | null;
  state?: string | null;
  address?: string | null;
}

/* ================= GET SETTINGS ================= */
export const getBasicSettings = async () => {
  const token = cookies().get("token")?.value;

  const res = await axios.get(
    `${apiUrl}/seller/settings/basic-settings/get.php`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

/* ================= UPDATE SETTINGS ================= */
export const updateBasicSettings = async (data: BasicSettingsData) => {
  const token = cookies().get("token")?.value;

  try {
    const res = await axios.post(
      `${apiUrl}/seller/settings/basic-settings/update.php`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("Error updating basic settings:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update settings",
    };
  }
};

/* ================= UPLOAD LOGO ================= */
export const uploadLogo = async (formData: FormData) => {
  const token = cookies().get("token")?.value;

  try {
    const res = await axios.post(
      `${apiUrl}/seller/settings/upload-logo.php`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("Error uploading logo:", err);
    return { success: false, message: "Upload failed" };
  }
};


/* ================= UPLOAD FAVICON ================= */
export const uploadFavicon = async (formData: FormData) => {
  const token = cookies().get("token")?.value;

  try {
    const res = await axios.post(
      `${apiUrl}/seller/settings/upload-favicon.php`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("Error uploading favicon:", err);
    return { success: false, message: "Upload failed" };
  }
};

