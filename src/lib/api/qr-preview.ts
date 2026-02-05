"use server";

import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

export interface QRPreviewData {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  siteSlug?: string;
  name?: string;
}

/* ---------------------------------------------------------
   GET QR PREVIEW DATA
--------------------------------------------------------- */
export const getQRPreviewData = async () => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) {
    return { success: false, message: "User not authenticated" };
  }

  const url = `${apiUrl}/seller/settings/qr-preview/get.php`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { user_id },
    });

    return response.data;
  } catch (error: any) {
    console.error("Get QR preview data error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch QR preview data",
    };
  }
};