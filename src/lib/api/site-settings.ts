import { apiUrl } from "@/config";
import axios from "axios";
import Cookies from "js-cookie";

export const updateSiteSettings = async (data: any) => {
  // ✅ Read token from browser cookie
  const token = Cookies.get("token");

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  const url = `${apiUrl}/seller/settings/payment-settings/update.php`;

  try {
    const response = await axios.post(
      url,
      data, // ✅ ONLY data, no token here
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ SAME AS WORKING API
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Server unreachable",
    };
  }
};



export const getPaymentSettings = async () => {
  const token = Cookies.get("token");

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const res = await axios.get(
      `${apiUrl}/seller/settings/payment-settings/get.php`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("❌ PAYMENT SETTINGS FETCH ERROR:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch payment settings",
    };
  }
};
