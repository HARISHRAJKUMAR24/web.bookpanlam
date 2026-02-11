"use server";

import { apiUrl } from "@/config";
import { appointmentsParams, updateAppointmentData } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

const route = "/appointments";

// Get all appointments
export const getAllAppointments = async (params: appointmentsParams) => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/appointments/get-user-appointments.php`;

  try {
    const response = await axios.get(url, {
      params: {
        limit: params.limit || 10,
        page: params.page || 1,
        q: params.q || "",
        status: params.status || "",
        paymentStatus: params.paymentStatus || "",
        paymentMethod: params.paymentMethod || "",
        fromDate: params.fromDate || "",
        toDate: params.toDate || "",
        customer_id: params.customerId ?? "",
      },
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Appointments fetch error:", error);
    return false;
  }
};

// Get calendar
export const getCalendar = async () => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl}/seller/appointments/calendar.php`;

  try {
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
      },
    });

    const raw = response.data?.records || [];

    const events = raw.map((item: any) => ({
      id: item.appointment_id,
      title: item.doctor_name || item.service_name,
      start: `${item.appointment_date}T${item.slot_from}`,
      end: `${item.appointment_date}T${item.slot_to}`,
      extendedProps: {
        doctor_name: item.doctor_name,
        doctor_image: item.doctor_image,
        specialization: item.specialization,
        qualification: item.qualification,
        customer_id: item.customer_id,
        status: item.status,
        amount: item.total_amount,
        service: item.service_name,
      },
    }));

    return events;
  } catch (error) {
    console.log("Calendar fetch error:", error);
    return [];
  }
};


// In your appointments.ts file
// Get single appointment - UPDATED VERSION
export const getAppointment = async (appointmentId: string) => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/appointments/get-single-appointment.php`;

  try {
    const response = await axios.get(url, {
      params: {
        id: appointmentId
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `token=${token}`
      },
      withCredentials: true,
    });

    console.log("📌 Appointment Details API Response:", response.data);

    if (!response.data || response.data.success === false) {
      console.log("❌ Appointment not found or API error");
      return false;
    }

    // Return the entire response.data (which contains all appointment fields at root)
    return response.data;
  } catch (error: any) {
    console.log("❌ Get appointment error:", error.response?.data || error.message);
    return false;
  }
};

// Update a appointment - UPDATED for your PHP endpoint
export const updateAppointment = async (
  appointmentId: string,
  data: updateAppointmentData
) => {
  const token = cookies().get("token")?.value;

  // Use the update-status.php endpoint
  const url = `${apiUrl}/seller/appointments/update-status.php`;

  try {
    const requestData: any = {
      appointment_id: appointmentId,
      status: data.status
    };

    // Add additional fields if needed
    if (data.paymentStatus) {
      requestData.payment_status = data.paymentStatus;
    }

    if (data.employeeId) {
      requestData.employee_id = data.employeeId;
    }

    if (data.employeeCommission) {
      requestData.employee_commission = data.employeeCommission;
    }

    const response = await axios.post(url, requestData, {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
        'Content-Type': 'application/json'
      },
    });

    return response.data;
  } catch (error: any) {
    console.log("Update appointment error:", error);
    return { success: false, message: "Failed to update appointment" };
  }
};

// Get Reports
export const getReports = async (timeFrame: string) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}/reports`;

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      timeFrame: timeFrame,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    return false;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: string,
  paymentMethod?: string
) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl}/seller/appointments/update-status.php`;

  try {
    const requestData: any = {
      appointment_id: appointmentId,
      status: status
    };

    if (paymentMethod) {
      requestData.payment_method = paymentMethod;
    }

    const response = await axios.post(url, requestData, {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
        'Content-Type': 'application/json'
      },
    });

    return response.data;
  } catch (error) {
    console.log("Update status error:", error);
    return { success: false, message: "Failed to update status" };
  }
};