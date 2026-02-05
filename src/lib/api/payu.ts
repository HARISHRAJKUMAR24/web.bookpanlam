// lib/api/payu.ts
"use server";

import { apiUrl } from "@/config";
import axios from "axios";

export interface PayUCredentials {
  payu_merchant_key: string;
  payu_salt: string;
  payu_client_id: string;
  payu_client_secret: string;
  payu_mode: 'test' | 'live';
  payu_endpoint: string;
}

export interface PayUOrderRequest {
  amount: number;
  currency: string;
  plan_id: string | number;
  user_email: string;
  user_phone: string;
  user_name: string;
  billing_data: {
    name: string;
    phone: string;
    email: string;
    pin_code: string;
    address_1: string;
    address_2: string;
    state: string;
    city: string;
    country: string;
    gstin?: string;
    user_id?: string | number;
  };
  plan_data: {
    plan_id: string | number;
    amount: number;
    gst_amount: number;
    gst_type: 'inclusive' | 'exclusive';
    gst_percentage: number;
    discount: number;
    currency: string;
    currency_symbol: string;
    plan_name: string;
  };
}

export interface PayUOrderResponse {
  success: boolean;
  endpoint: string;
  key: string;
  txnid: string;
  amount: string | number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;

  // Add currency support
  currency?: string;

  // Add all UDF fields (PayU always supports these)
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;

  // If your backend sends extra UDFs
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
    service_provider?: string;
    message?: string;
  
}

export interface PayUVerificationRequest {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  hash: string;
  payuMoneyId?: string;
  logged_in_user_id?: string | number;
  billing_data: {
    name: string;
    phone: string;
    email: string;
    pin_code: string;
    address_1: string;
    address_2: string;
    state: string;
    city: string;
    country: string;
    gstin?: string;
    user_id?: string | number;
  };
  plan_data: {
    plan_id: string | number;
    amount: number;
    gst_amount: number;
    gst_type: 'inclusive' | 'exclusive';
    gst_percentage: number;
    discount: number;
    currency: string;
    currency_symbol: string;
    plan_name: string;
  };
}

export interface PayUVerificationResponse {
  success: boolean;
  invoice_number?: string;
  redirect_url?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Get PayU credentials from the server
 */
export const getPayUCredentials = async (): Promise<PayUCredentials> => {
  try {
    const res = await axios.get(`${apiUrl}/seller/payment/payu-credentials.php`);
    return res.data;
  } catch (error) {
    console.error("Error fetching PayU credentials:", error);
    return {
      payu_merchant_key: "",
      payu_salt: "",
      payu_client_id: "",
      payu_client_secret: "",
      payu_mode: 'test',
      payu_endpoint: 'https://test.payu.in/_payment'
    };
  }
};

/**
 * Create a PayU transaction on the server
 */
export const createPayUOrder = async (data: PayUOrderRequest): Promise<PayUOrderResponse> => {
  try {
    const response = await fetch(
      `${apiUrl}/seller/payment/create-payu-order.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error creating PayU order:", error);
    return {
      success: false,
      txnid: "",
      hash: "",
      key: "",
      amount: 0,
      productinfo: "",
      firstname: "",
      email: "",
      phone: "",
      surl: "",
      furl: "",
      endpoint: "",
      service_provider: "",
      message: "Failed to create payment order"
    };
  }
};

/**
 * Verify PayU payment on the server
 */
export const verifyPayUPayment = async (data: PayUVerificationRequest): Promise<PayUVerificationResponse> => {
  try {
    const response = await fetch(
      `${apiUrl}/seller/payment/verify-payu-payment.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error verifying PayU payment:", error);
    return {
      success: false,
      message: "Payment verification failed"
    };
  }
};

/**
 * Load PayU script dynamically (not needed for PayU as it uses form POST)
 */
export const loadPayUScript = (): Promise<boolean> => {
  return Promise.resolve(true);
};