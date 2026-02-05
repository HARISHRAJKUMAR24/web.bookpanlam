// lib/api/tax-settings.ts - CLEAN VERSION
"use server";

import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

export interface TaxSettingsData {
  gstNumber?: string | null;
  gstType?: string | null;
  taxPercent?: number | null;
}

/* ---------------------------------------------------------
   GET TAX SETTINGS
--------------------------------------------------------- */
export const getTaxSettings = async () => {
  try {
    const token = cookies().get("token")?.value;
    const user_id = cookies().get("user_id")?.value;

    if (!user_id) {
      return {
        success: false,
        message: "User not authenticated",
        data: null
      };
    }

    const url = `${apiUrl}/seller/settings/tax-settings/get.php`;

    const response = await axios.get(url, {
      params: { user_id },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to load tax settings",
      data: null
    };
  }
};

/* ---------------------------------------------------------
   UPDATE TAX SETTINGS
--------------------------------------------------------- */
export const updateTaxSettings = async (data: TaxSettingsData) => {
  try {
    const token = cookies().get("token")?.value;
    const user_id = cookies().get("user_id")?.value;

    if (!user_id) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }

    const url = `${apiUrl}/seller/settings/tax-settings/update.php`;

    const requestData = {
      ...data,
      user_id
    };

    const response = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data || {
        success: false,
        message: "Server error occurred"
      };
    } else {
      return {
        success: false,
        message: "Network error. Please check your connection."
      };
    }
  }
};