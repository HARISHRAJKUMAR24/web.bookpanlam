// get-payment-details.ts
//"use server";

import axios from "axios";
import { apiUrl } from "@/config";

export interface PaymentDetails {
  invoice: {
    invoice_number: string;
    date: string;
    due_date: string;
    status: string;
  };
  company: {
    name: string;
    address: string;
    logo: string;
    gst_number?: string;
    email?: string;
    phone?: string;
    hsn?: string;
  };
  customer: {
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
  };
  plan: {
    name: string;
    duration: number;
    plan_id: number;
  };
  payment: {
    method: string;
    payment_id: string;
    currency: string;
    currency_symbol: string;
    amount: number;
    gst_amount: number;
    gst_type: string;
    gst_percentage: number;
    discount: number;
    total: number;
    place_of_supply: string;
    country_of_supply: string;
    amount_in_words: string;
    sgst_amount?: number;
    cgst_amount?: number;
    igst_amount?: number;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

export const getPaymentDetails = async (invoiceNumber: string): Promise<{ success: boolean; data?: PaymentDetails; message?: string }> => {
  try {
    const res = await axios.get(`${apiUrl}/seller/payment/get-payment-details.php?invoice=${invoiceNumber}`, {
      withCredentials: true // CRITICAL: This sends cookies for authentication
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return {
      success: false,
      message: "Error fetching payment details"
    };
  }
};

export const downloadInvoicePDF = async (invoiceNumber: string): Promise<Blob> => {
  try {
    const response = await fetch(`${apiUrl}/seller/payment/generate-invoice-pdf.php?invoice=${invoiceNumber}`, {
      credentials: 'include' // CRITICAL: This sends cookies for authentication
    });
    
    if (!response.ok) {
      // Try to get error message from response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to download invoice');
      }
      throw new Error('Failed to download invoice');
    }
    
    return await response.blob();
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw new Error('Error downloading invoice');
  }
};

export const emailInvoice = async (invoiceNumber: string, email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await axios.post(`${apiUrl}/seller/payment/email-invoice.php`, {
      invoice_number: invoiceNumber,
      email
    }, {
      withCredentials: true // CRITICAL: This sends cookies for authentication
    });
    return res.data;
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Error sending email"
    };
  }
};