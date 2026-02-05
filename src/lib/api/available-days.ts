"use server";

import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

export interface BusinessHoursData {
  sunday?: number;
  sunday_starts?: string | null;
  sunday_ends?: string | null;
  monday?: number;
  monday_starts?: string | null;
  monday_ends?: string | null;
  tuesday?: number;
  tuesday_starts?: string | null;
  tuesday_ends?: string | null;
  wednesday?: number;
  wednesday_starts?: string | null;
  wednesday_ends?: string | null;
  thursday?: number;
  thursday_starts?: string | null;
  thursday_ends?: string | null;
  friday?: number;
  friday_starts?: string | null;
  friday_ends?: string | null;
  saturday?: number;
  saturday_starts?: string | null;
  saturday_ends?: string | null;
}

/* ---------------------------------------------------------
   GET BUSINESS HOURS
--------------------------------------------------------- */
export const getBusinessHours = async () => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) {
    return { success: false, message: "User not authenticated" };
  }

  const url = `${apiUrl}/seller/oth-opts/get.php`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { user_id },
    });

    return response.data;
  } catch (error: any) {
    console.error("Get business hours error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch business hours",
    };
  }
};

/* ---------------------------------------------------------
   UPDATE BUSINESS HOURS
--------------------------------------------------------- */
export const updateBusinessHours = async (data: BusinessHoursData) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) {
    return { success: false, message: "User not authenticated" };
  }

  const url = `${apiUrl}/seller/oth-opts/update.php`;

  // Add user_id to data
  const requestData = { ...data, user_id };

  try {
    const response = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Update business hours error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Server unreachable",
    };
  }
};