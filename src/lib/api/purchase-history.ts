// lib/api/purchase-history.ts
"use server";

import axios from "axios";
import { apiUrl } from "@/config";
import { cookies } from "next/headers";
import { PurchaseHistory } from "@/types";

export const getAllPurchaseHistory = async (): Promise<{ success: boolean; data?: PurchaseHistory[]; message?: string }> => {
  try {
    const token = cookies().get("token")?.value;
    
    const url = `${apiUrl}/seller/payment/get-purchase-history.php`;
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
      },
    });
    
    console.log("📌 Purchase History API Response:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching purchase history:", error.response?.data || error.message);
    return {
      success: false,
      message: "Failed to fetch purchase history"
    };
  }
};

