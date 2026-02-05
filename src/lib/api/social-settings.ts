"use server";

import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

export interface SocialSettingsData {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  pinterest?: string;
}

/* ---------------------------------------------------------
   GET SOCIAL SETTINGS
--------------------------------------------------------- */
export const getSocialSettings = async () => {
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

    const url = `${apiUrl}/seller/settings/social-settings/get.php`;

    const response = await axios.get(url, {
      params: { user_id },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to load social settings",
      data: null
    };
  }
};

/* ---------------------------------------------------------
   UPDATE SOCIAL SETTINGS
--------------------------------------------------------- */
export const updateSocialSettings = async (data: SocialSettingsData) => {
  try {
    const token = cookies().get("token")?.value;
    const user_id = cookies().get("user_id")?.value;

    if (!user_id) {
      return {
        success: false,
        message: "User not authenticated"
      };
    }

    const url = `${apiUrl}/seller/settings/social-settings/update.php`;

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