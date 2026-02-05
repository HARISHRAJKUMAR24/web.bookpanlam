"use server";

import { apiUrl } from "@/config";
import { couponData, couponsParams } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

/* ------------------------------------------
   HELPERS: camelCase ↔ snake_case
------------------------------------------ */
const camelToSnake = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);

  const newObj: any = {};
  for (const key in obj) {
    newObj[key.replace(/([A-Z])/g, "_$1").toLowerCase()] = camelToSnake(obj[key]);
  }
  return newObj;
};

const snakeToCamel = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);

  const newObj: any = {};
  for (const key in obj) {
    newObj[key.replace(/_([a-z])/g, (_, l) => l.toUpperCase())] =
      snakeToCamel(obj[key]);
  }
  return newObj;
};

/* ------------------------------------------
   GET ALL COUPONS
------------------------------------------ */
export const getAllCoupons = async (params: couponsParams) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) return { totalPages: 1, totalRecords: 0, records: [] };

  const url = `${apiUrl}/seller/coupons/get.php`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        user_id,
        limit: params.limit ?? 10,
        page: params.page ?? 1,
        q: params.q ?? "",
      },
    });

    if (response.data.success && response.data.records) {
      response.data.records = snakeToCamel(response.data.records);
    }

    return response.data;
  } catch (error) {
    console.error("Get coupons error:", error);
    return { totalPages: 1, totalRecords: 0, records: [] };
  }
};

/* ------------------------------------------
   ADD COUPON (SERVER-SIDE)
------------------------------------------ */
export const addCoupon = async (data: couponData) => {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const user_id = cookieStore.get("user_id")?.value;

  if (!user_id) return { success: false, message: "User ID not found" };
  if (!token) return { success: false, message: "Authentication token not found" };

  const url = `${apiUrl}/seller/coupons/create.php?user_id=${user_id}`;
  const formatted = camelToSnake(data);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formatted),
      cache: "no-store",
    });

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("JSON Parse Failed!", err);
      return { success: false, message: "Invalid response from server" };
    }

    return json;
  } catch (error) {
    console.error("Add coupon error:", error);
    return { success: false, message: "Error adding coupon" };
  }
};

/* ------------------------------------------
   GET SINGLE COUPON (EDIT PAGE)
------------------------------------------ */
export const getCoupon = async (couponId: string) => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/coupons/single.php?coupon_id=${couponId}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data?.success) return false;

    // Convert fields
    let camel = snakeToCamel(response.data.data);

    camel.startDate = camel.startDate ? new Date(camel.startDate) : null;
    camel.endDate = camel.endDate ? new Date(camel.endDate) : null;

    camel.discount = Number(camel.discount);
    camel.usageLimit = camel.usageLimit ? Number(camel.usageLimit) : null;
    camel.minBookingAmount = camel.minBookingAmount
      ? Number(camel.minBookingAmount)
      : null;

    return camel;
  } catch (error) {
    console.error("Get single coupon error:", error);
    return false;
  }
};

/* ------------------------------------------
   DELETE COUPON
------------------------------------------ */
export const deleteCoupon = async (couponId: string) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) return { success: false, message: "User ID not found" };

  const url = `${apiUrl}/seller/coupons/delete.php?coupon_id=${couponId}&user_id=${user_id}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Delete coupon error:", error);
    return { success: false, message: "Error deleting coupon" };
  }
};

/* ------------------------------------------
   UPDATE COUPON
------------------------------------------ */
export const updateCoupon = async (couponId: string, data: any) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) return { success: false, message: "User ID not found" };

  const url = `${apiUrl}/seller/coupons/update.php?coupon_id=${couponId}&user_id=${user_id}`;

  const formattedData = camelToSnake(data);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formattedData),
      cache: "no-store",
    });

    return response.json();
  } catch (error) {
    console.error("Update coupon error:", error);
    return { success: false, message: "Error updating coupon" };
  }
};