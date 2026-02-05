// lib/api/checkout.ts
"use server";

import { apiUrl } from "@/config";
import axios from "axios";

export interface DowngradeCheck {
  success: boolean;
  is_downgrade: boolean;
  button_text: string;
  is_disabled: boolean;
  message: string;
  current_plan_name: string;
  selected_plan_name: string;
  current_plan_amount: number;
  selected_plan_amount: number;
}

export const checkDowngradeEligibility = async (
  userId: string, 
  planId: number
): Promise<DowngradeCheck> => {
  try {
    const res = await axios.get(
      `${apiUrl}/seller/payment/check-downgrade.php?user_id=${userId}&plan_id=${planId}`
    );
    return res.data;
  } catch (error) {
    return {
      success: false,
      is_downgrade: false,
      button_text: "Pay Now",
      is_disabled: false,
      message: "Unable to verify plan eligibility",
      current_plan_name: "Current Plan",
      selected_plan_name: "",
      current_plan_amount: 0,
      selected_plan_amount: 0
    };
  }
};

/* ===============================
   Billing Address (Renewal)
================================ */

export interface BillingAddress {
  name: string;
  email: string;
  phone: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  pin_code: string;
  country: string;
  gst_number?: string;
}

export const getLastBillingAddress = async (userId: string) => {
  try {
    const res = await axios.get(
      `${apiUrl}/seller/payment/get-last-billing-address.php?user_id=${userId}`,
      { withCredentials: true }
    );

    return res.data as {
      success: boolean;
      data?: BillingAddress;
      message?: string;
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to fetch billing address"
    };
  }
};
