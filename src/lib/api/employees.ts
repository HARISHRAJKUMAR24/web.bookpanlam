"use server";

import { apiUrl } from "@/config";
import { employeeData, employeeParams } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

/* ---------------------------------------------------------
   GET ALL EMPLOYEES
--------------------------------------------------------- */
export const getAllEmployees = async (params: employeeParams) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) {
    return { totalPages: 1, totalRecords: 0, records: [] };
  }

  const url = `${apiUrl}/seller/employees/get.php`;

  try {
    const response = await axios.get(url, {
      params: {
        user_id,
        limit: params.limit ?? 10,
        page: params.page ?? 1,
        q: params.q ?? "",
      },
    });

    return response.data;
  } catch (error) {
    return { totalPages: 1, totalRecords: 0, records: [] };
  }
};

/* ---------------------------------------------------------
   ADD EMPLOYEE  ⭐ FIXED (token now in JSON body)
--------------------------------------------------------- */
export const addEmployee = async (data: employeeData) => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/employees/add.php`;

  const finalData = {
    ...data,
    token, // ⭐ REQUIRED FOR PHP AUTH
  };

  try {
    const response = await axios.post(url, finalData, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error: any) {
    return (
      error.response?.data || {
        success: false,
        message: "Server unreachable",
      }
    );
  }
};

/* ---------------------------------------------------------
   GET SINGLE EMPLOYEE
--------------------------------------------------------- */
export const getEmployee = async (employeeId: string) => {
  const url = `${apiUrl}/seller/employees/single.php?id=${employeeId}`;

  try {
    const response = await axios.get(url);

    if (!response.data?.success) return false;

    return response.data;
  } catch {
    return false;
  }
};

/* ---------------------------------------------------------
   DELETE EMPLOYEE  ⭐ FIXED (token must be sent)
--------------------------------------------------------- */
export const deleteEmployee = async (id: number) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl}/seller/employees/delete.php?id=${id}`;

  try {
    const response = await axios.post(url, { token });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || {
      success: false,
      message: "Delete failed",
    };
  }
};

/* ---------------------------------------------------------
   UPDATE EMPLOYEE  ⭐ FIXED
--------------------------------------------------------- */
export const updateEmployee = async (employeeId: string, data: any) => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/employees/update.php?id=${employeeId}`;

  const finalData = {
    ...data,
    token, // ⭐ REQUIRED
  };

  try {
    const response = await axios.post(url, finalData, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error: any) {
    return (
      error.response?.data || {
        success: false,
        message: "Server unreachable",
      }
    );
  }
};
