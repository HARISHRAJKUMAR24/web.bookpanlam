"use server";

import { apiUrl } from "@/config";
import { departmentData, departmentsParams } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

export interface TokenUpdateData {
  department_id: string;
  batch_id: string;
  action: 'set' | 'increase' | 'decrease';
  value: number;
}

export interface TokenHistoryRecord {
  id: number;
  department_id: string;
  user_id: number;
  slot_batch_id: string;
  old_token: number;
  new_token: number;
  total_token: number;
  updated_by: number;
  created_at: string;
  parsed_day_index?: number;
  parsed_slot_index?: number;
}

export interface TokenHistoryResponse {
  success: boolean;
  data?: TokenHistoryRecord[];
  message?: string;
}

export interface TokenUpdateResponse {
  success: boolean;
  message?: string;
  old_token?: number;
  new_token?: number;
  total_token?: number;
  batch_id?: string;
  department_id?: string;
}

/* -------------------------------------------------------
  GET ALL DEPARTMENTS
-------------------------------------------------------- */
export const getAllDepartments = async (params: departmentsParams) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) {
    return { totalPages: 1, totalRecords: 0, records: [] };
  }

  try {
    const response = await axios.get(
      `${apiUrl}/seller/departments/get.php`,
      {
        params: {
          user_id,
          limit: params.limit ?? 10,
          page: params.page ?? 1,
          q: params.q ?? "",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch {
    return { totalPages: 1, totalRecords: 0, records: [] };
  }
};

/* -------------------------------------------------------
  GET SINGLE DEPARTMENT
-------------------------------------------------------- */
export const getDepartment = async (departmentId: string) => {
  try {
    const response = await axios.get(
      `${apiUrl}/seller/departments/single.php?department_id=${departmentId}`
    );

    if (!response.data?.success) return false;

    return response.data;
  } catch {
    return false;
  }
};

/* -------------------------------------------------------
  ADD DEPARTMENT
-------------------------------------------------------- */
export const addDepartment = async (data: departmentData) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  const finalData: any = {
    token,
    user_id,
    name: data.name,
    slug: data.slug || null,
    image: data.image || null,
    meta_title: data.metaTitle || null,
    meta_description: data.metaDescription || null,
    
    // Main type with HSN
    type_main_name: data.typeMainName || null,
    type_main_amount: data.typeMainAmount || null,
    type_main_hsn: data.typeMainHsn || null,
  };

  // Add dynamic type fields with HSN
  for (let i = 1; i <= 25; i++) {
    const nameKey = `type${i}Name` as keyof departmentData;
    const amountKey = `type${i}Amount` as keyof departmentData;
    const hsnKey = `type${i}Hsn` as keyof departmentData;

    finalData[`type_${i}_name`] = data[nameKey] || null;
    finalData[`type_${i}_amount`] = data[amountKey] || null;
    finalData[`type_${i}_hsn`] = data[hsnKey] || null;
  }

  console.log("SENDING DATA TO CREATE DEPARTMENT:", finalData);

  try {
    const response = await axios.post(
      `${apiUrl}/seller/departments/create.php`,
      finalData,
      { 
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        } 
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Add Department Error:", error.response?.data || error.message);
    return error.response?.data || { success: false, message: "Add failed" };
  }
};

/* -------------------------------------------------------
  UPDATE DEPARTMENT
-------------------------------------------------------- */
export const updateDepartment = async (
  departmentId: string,
  data: departmentData
) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  // Prepare data object with HSN fields
  const finalData: any = {
    token,
    user_id,
    department_id: departmentId,
    name: data.name,
    slug: data.slug || null,
    image: data.image || null,
    meta_title: data.metaTitle || null,
    meta_description: data.metaDescription || null,
    
    // Main type with HSN
    type_main_name: data.typeMainName || null,
    type_main_amount: data.typeMainAmount || null,
    type_main_hsn: data.typeMainHsn || null,
  };

  // Add all type fields with HSN
  for (let i = 1; i <= 25; i++) {
    const nameKey = `type${i}Name` as keyof departmentData;
    const amountKey = `type${i}Amount` as keyof departmentData;
    const hsnKey = `type${i}Hsn` as keyof departmentData;
    
    finalData[`type_${i}_name`] = data[nameKey] || null;
    finalData[`type_${i}_amount`] = data[amountKey] || null;
    finalData[`type_${i}_hsn`] = data[hsnKey] || null;
  }

  console.log("SENDING DATA TO UPDATE DEPARTMENT:", finalData);

  try {
    const response = await axios.post(
      `${apiUrl}/seller/departments/update.php?department_id=${departmentId}`,
      finalData,
      { 
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        } 
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Update Department Error:", error.response?.data || error.message);
    return error.response?.data || { success: false, message: "Update failed" };
  }
};

/* -------------------------------------------------------
  DELETE DEPARTMENT
-------------------------------------------------------- */
export const deleteDepartment = async (departmentId: string) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  try {
    const response = await axios.post(
      `${apiUrl}/seller/departments/delete.php?department_id=${departmentId}`,
      {
        department_id: departmentId,
        user_id: user_id,
        token: token
      },
      { 
        headers: { 
          "Content-Type": "application/json"
        } 
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Delete Department Error:", error.response?.data || error.message);
    return error.response?.data || { success: false, message: "Delete failed" };
  }
};

/* -------------------------------------------------------
  UPDATE APPOINTMENT SETTINGS FOR DEPARTMENT (INCLUDING LEAVE DATES)
  ✅ THIS IS THE FIXED FUNCTION
-------------------------------------------------------- */
export const updateAppointmentSettings = async (
  departmentId: string,
  appointmentSettings: any,
  leaveDates: string[] = [],
  appointmentTimeFrom?: string | null,
  appointmentTimeTo?: string | null
) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!departmentId || !appointmentSettings) {
    return {
      success: false,
      message: "Department ID and appointment settings are required"
    };
  }

  const data = {
    token: token,
    user_id: user_id,
    department_id: departmentId,
    appointment_settings: appointmentSettings,
    leave_dates: leaveDates,
    appointment_time_from: appointmentTimeFrom || null,  // Add this
    appointment_time_to: appointmentTimeTo || null       // Add this
  };

  console.log("SENDING TO create_appointment.php:", {
    department_id: departmentId,
    has_appointment_settings: !!appointmentSettings,
    leave_dates_count: leaveDates.length,
    appointment_time_from: appointmentTimeFrom,  // Log timing
    appointment_time_to: appointmentTimeTo       // Log timing
  });

  try {
    const response = await axios.post(
      `${apiUrl}/seller/departments/create_appointment-settings.php`,
      data,
      { 
        headers: { 
          "Content-Type": "application/json"
        },
        withCredentials: true
      }
    );

    console.log("RESPONSE FROM create_appointment.php:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Update Appointment Settings Error:", error.response?.data || error.message);
    return error.response?.data || { 
      success: false, 
      message: "Failed to save appointment settings" 
    };
  }
};

/* -------------------------------------------------------
  GET DEPARTMENT BY ID
-------------------------------------------------------- */
export const getDepartmentById = async (departmentId: string) => {
  try {
    const response = await axios.get(
      `${apiUrl}/seller/departments/single.php?department_id=${departmentId}`
    );

    if (!response.data?.success) return null;

    return response.data.data;
  } catch {
    return null;
  }
};



/* -------------------------------------------------------
  GET TOKEN HISTORY FOR DEPARTMENT
-------------------------------------------------------- */
export const getDepartmentTokenHistory = async (
  departmentId: string,
  batchId?: string
): Promise<TokenHistoryResponse> => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!departmentId) {
    return {
      success: false,
      message: "Department ID is required"
    };
  }

  try {
    const params: any = {
      department_id: departmentId
    };

    if (batchId) {
      params.batch_id = batchId;
    }

    if (user_id) {
      params.user_id = user_id;
    }

    const response = await axios.get(
      `${apiUrl}/seller/departments/token_history.php`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        withCredentials: true
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Get department token history error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch token history"
    };
  }
};

/* -------------------------------------------------------
  UPDATE DEPARTMENT TOKEN
-------------------------------------------------------- */
export const updateDepartmentToken = async (
  data: TokenUpdateData
): Promise<TokenUpdateResponse> => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  if (!data.department_id || !data.batch_id || !data.action || !data.value) {
    return {
      success: false,
      message: "All fields are required"
    };
  }

  try {
    const requestData = {
      ...data,
      token: token,
      user_id: user_id
    };

    const response = await axios.post(
      `${apiUrl}/seller/departments/token_history.php`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        withCredentials: true
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Update department token error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update token"
    };
  }
};