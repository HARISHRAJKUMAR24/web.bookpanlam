"use server";

import axios from "axios";
import { apiUrl } from "@/config";
import { cookies } from "next/headers";

/* ================= GET ================= */

export const getWebsiteSettings = async () => {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("❌ token missing");
    return null;
  }

  try {
    const res = await axios.get(
      `${apiUrl}/seller/website-setup/homepage-settings/get.php`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    console.log("🟢 GET SETTINGS →", res.data);

    return res.data?.success ? res.data.data : null;
  } catch (err: any) {
    console.error("🔥 GET ERROR →", err?.response?.data || err.message);
    return null;
  }
};

/* ================= SAVE ================= */

export const saveWebsiteSettings = async (data: any) => {
  const token = cookies().get("token")?.value;

  if (!token) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const res = await axios.post(
    `${apiUrl}/seller/website-setup/homepage-settings/update.php`,
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
};
