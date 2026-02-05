// lib/api/razorpay.ts
"use server";

import { apiUrl } from "@/config";
import axios from "axios";

export interface RazorpayCredentials {
  razorpay_key_id: string;
  razorpay_key_secret: string;
}

export interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  plan_id: string | number;
  user_email: string;
  user_phone: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    [key: string]: any;
  };
  message?: string;
}

export interface RazorpayVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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
  };
}

export interface RazorpayVerificationResponse {
  success: boolean;
  invoice_number?: string;
  redirect_url?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Get Razorpay credentials from the server
 */
export const getRazorpayCredentials = async (): Promise<RazorpayCredentials> => {
  try {
    const res = await axios.get(`${apiUrl}/seller/payment/razorpay-credentials.php`);
    return res.data;
  } catch (error) {
    console.error("Error fetching Razorpay credentials:", error);
    // Return fallback test credentials if API fails
    return {
      razorpay_key_id: "", // Your test key from settings table
      razorpay_key_secret: "" // You'll need to add this to your settings table
    };
  }
};

/**
 * Create a Razorpay order on the server
 */
export const createRazorpayOrder = async (data: RazorpayOrderRequest): Promise<RazorpayOrderResponse> => {
  try {
    const response = await fetch(
      `${apiUrl}/seller/payment/create-razorpay-order.php`,
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
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      order: {
        id: "",
        amount: 0,
        currency: ""
      },
      message: "Failed to create payment order"
    };
  }
};

/**
 * Verify Razorpay payment on the server
 */
export const verifyRazorpayPayment = async (data: RazorpayVerificationRequest): Promise<RazorpayVerificationResponse> => {
  try {
    const response = await fetch(
      `${apiUrl}/seller/payment/verify-razorpay-payment.php`,
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
    console.error("Error verifying Razorpay payment:", error);
    return {
      success: false,
      message: "Payment verification failed"
    };
  }
};

/**
 * Load Razorpay script dynamically - IMPROVED VERSION
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';

    // Set timeout for script loading
    const timeoutId = setTimeout(() => {
      reject(new Error('Razorpay script loading timeout'));
    }, 10000); // 10 seconds timeout

    script.onload = () => {
      clearTimeout(timeoutId);
      console.log("Razorpay script loaded successfully");

      // Check if Razorpay is available
      if (window.Razorpay) {
        resolve(true);
      } else {
        reject(new Error('Razorpay object not available after script load'));
      }
    };

    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error("Failed to load Razorpay script:", error);
      reject(new Error('Failed to load Razorpay script. Please check your internet connection.'));
    };

    // Append to document head
    document.head.appendChild(script);
  });
};