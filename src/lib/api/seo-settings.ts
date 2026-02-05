"use server";

import { apiUrl } from "@/config";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

/* ------------------------------------------
   UPDATE SEO SETTINGS
------------------------------------------- */
export const updateSeoSettings = async (data: any) => {
  const token = cookies().get("token")?.value;

  try {
    const res = await axios.post(
      `${apiUrl}/seller/settings/seo-settings/update.php`,
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
  } catch (err: unknown) {
    const error = err as AxiosError<any>; // ← SAFE CAST

    console.log("SEO UPDATE ERROR →", error.response?.data);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to update SEO settings",
    };
  }
};

/* ------------------------------------------
   GET SEO SETTINGS
------------------------------------------- */
export const getSeoSettings = async () => {
  const userId = cookies().get("user_id")?.value;
  const token = cookies().get("token")?.value;

  try {
    const res = await axios.get(
      `${apiUrl}/seller/settings/seo-settings/get.php?user_id=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError<any>; // ← SAFE CAST

    console.log("SEO GET ERROR →", error.response?.data);

    return {
      success: false,
      data: null,
      message: error.response?.data?.message || "Failed to fetch SEO settings",
    };
  }
};
