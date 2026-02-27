"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { apiUrl } from "@/config";

// -------------------------------------
// GET DOMAIN REQUEST SETTINGS
// -------------------------------------
export const getDomainRequestSettings = async () => {
  try {
    const publicUserId = cookies().get("user_id")?.value;
    const token = cookies().get("token")?.value;

    if (!publicUserId) {
      return { success: false, data: null };
    }

    const res = await axios.get(
      `${apiUrl}/seller/website-setup/domain-request/get.php?user_id=${publicUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error: any) {
    console.log("GET DOMAIN REQUEST ERROR →", error?.response?.data);
    return { success: false, data: null };
  }
};

// -------------------------------------
// UPDATE DOMAIN REQUEST
// -------------------------------------
export const updateDomainRequest = async (data: any) => {
  try {
    const token = cookies().get("token")?.value;

    const res = await axios.post(
      `${apiUrl}/seller/website-setup/domain-request/update.php`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("UPDATE DOMAIN REQUEST ERROR →", err?.response?.data);

    return {
      success: false,
      message:
        err?.response?.data?.message || "Failed to update domain request",
    };
  }
};

// -------------------------------------
// CANCEL DOMAIN REQUEST
// -------------------------------------
export const cancelDomainRequest = async (userId: string) => {
  try {
    const token = cookies().get("token")?.value;

    const res = await axios.post(
      `${apiUrl}/seller/website-setup/domain-request/cancel.php`,
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (err: any) {
    console.log("CANCEL DOMAIN REQUEST ERROR →", err?.response?.data);

    return {
      success: false,
      message:
        err?.response?.data?.message || "Failed to cancel domain request",
    };
  }
};

// -------------------------------------
// CHECK CUSTOM DOMAIN ACCESS
// -------------------------------------
export const checkCustomDomainAccess = async (userId: string) => {
  try {
    const token = cookies().get("token")?.value;

    const res = await axios.get(
      `${apiUrl}/seller/website-setup/domain-request/check-access.php?user_id=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error: any) {
    console.log("CHECK DOMAIN ACCESS ERROR →", error?.response?.data);
    return { 
      success: false, 
      can_access: false,
      message: "Error checking plan access",
      custom_domain_enabled: false,
      plan_name: "Unknown"
    };
  }
};