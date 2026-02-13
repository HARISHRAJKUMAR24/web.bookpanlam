"use server";

import axios from "axios";
import { apiUrl } from "@/config";
import { cookies } from "next/headers";
import { PurchaseHistory } from "@/types";

export const getAllPurchaseHistory = async (): Promise<{ 
  success: boolean; 
  data?: PurchaseHistory[]; 
  message?: string;
  has_subscription?: boolean;
  has_customer_payments?: boolean;
}> => {
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
    
    // Filter for paid invoices only
    if (response.data?.success && Array.isArray(response.data.data)) {
      const paidInvoices = response.data.data.filter((inv: any) => 
        inv.status === 'Paid' || inv.status === 'paid' || inv.status === 'completed'
      );
      
      return {
        ...response.data,
        data: paidInvoices,
        has_subscription: response.data.has_subscription || false,
        has_customer_payments: response.data.has_customer_payments || false
      };
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching purchase history:", error.response?.data || error.message);
    return {
      success: false,
      message: "Failed to fetch purchase history"
    };
  }
};