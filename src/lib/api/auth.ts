"use server";

import { apiUrl } from "@/config";
import {
  forgotPasswordData,
  loginUserData,
  registerUserData,
  sendOtp as sendOtpType,
} from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

const route = "/seller/auth";

/* -------------------------------
   SEND OTP
--------------------------------*/
export const sendOtp = async (options: sendOtpType) => {
  const url = `${apiUrl}${route}/send-otp.php`;

  try {
    const response = await axios.post(url, options, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || {
        success: false,
        message: "Server unreachable",
      }
    );
  }
};

/* -------------------------------
   REGISTER USER
--------------------------------*/
export const registerUser = async (options: registerUserData) => {
  const url = `${apiUrl}${route}/register.php`;

  try {
    const response = await axios.post(url, options, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || {
        success: false,
        message: "Server unreachable",
      }
    );
  }
};

/* -------------------------------
   LOGIN USER
--------------------------------*/
export const loginUser = async (data: loginUserData) => {
  try {
    const res = await axios.post(`${apiUrl}/seller/auth/login.php`, data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    return res.data;
  } catch (err: any) {
    return (
      err.response?.data || {
        success: false,
        message: "Login failed",
      }
    );
  }
};

/* -------------------------------
   FORGOT PASSWORD
--------------------------------*/
export const forgotPassword = async (options: forgotPasswordData) => {
  const url = `${apiUrl}${route}/forgot-password.php`;

  try {
    const response = await axios.post(url, options, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || {
        success: false,
        message: "Server unreachable",
      }
    );
  }
};

/* -------------------------------
   GET CURRENT USER (🔥 IMPORTANT)
--------------------------------*/
export const currentUser = async () => {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${apiUrl}/users/user-with-token.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
      cache: "no-store", // 🚨 THIS FIXES EVERYTHING
    });

    const raw = await res.text();
    let json;

    try {
      json = JSON.parse(raw);
    } catch {
      console.log("INVALID JSON RESPONSE:", raw);
      return null;
    }

    if (!json.success || !json.data) return null;

    const u = json.data;

    return {
      id: u.id,
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      image: u.image,
      siteName: u.site_name,
siteSlug: u.site_slug,
      country: u.country,
      service_type_id: u.service_type_id,
    };
  } catch (err) {
    console.log("currentUser error:", err);
    return null;
  }
};


export const logoutUser = async () => {
  try {
    const res = await fetch(`${apiUrl}/seller/auth/logout.php`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Logout API error:', error);
    throw error;
  }
};