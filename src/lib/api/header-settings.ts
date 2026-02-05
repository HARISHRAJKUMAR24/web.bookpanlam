"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { apiUrl } from "@/config";

// -------------------------------------
// GET HEADER SETTINGS
// -------------------------------------
export const getHeaderSettings = async () => {
  try {
    const publicUserId = cookies().get("user_id")?.value;
    const token = cookies().get("token")?.value;

    if (!publicUserId) {
      return { success: false, data: null };
    }

    const res = await axios.get(
      `${apiUrl}/seller/website-setup/header-settings/get.php?user_id=${publicUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error: any) {
    console.log("GET HEADER SETTINGS ERROR →", error?.response?.data);
    return { success: false, data: null };
  }
};

// -------------------------------------
// UPDATE HEADER SETTINGS
// -------------------------------------
export const updateHeaderSettings = async (data: any) => {
  try {
    const token = cookies().get("token")?.value;

    const res = await axios.post(
      `${apiUrl}/seller/website-setup/header-settings/update.php`,
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
    console.log("UPDATE HEADER SETTINGS ERROR →", err?.response?.data);

    return {
      success: false,
      message:
        err?.response?.data?.message || "Failed to update header settings",
    };
  }
};
