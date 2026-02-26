
import { apiUrl } from "@/config";
import {
  forgotPasswordData,
  loginUserData,
  registerUserData,
  sendOtp as sendOtpType,
} from "@/types";
import axios from "axios";

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




export const logoutUser = async () => {
  try {
    const res = await fetch(`${apiUrl}/seller/auth/logout.php`, {
      method: 'GET',
      credentials: 'include',
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      return { success: true };
    }

  } catch (error) {
    console.error('Logout API error:', error);
    return { success: false };
  }
};
