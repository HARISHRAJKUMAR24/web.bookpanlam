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

        // THE FIX ⬇⬇⬇⬇⬇⬇⬇⬇
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

  // MATCHING YOUR APPOINTMENT PATH STYLE
  const url = `${apiUrl}/seller/appointments/calendar.php`;

  try {
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
      },
    });

    const raw = response.data?.records || [];

    // MAP INTO FULLCALENDAR FORMAT
const events = raw.map((item: any) => ({
  id: item.appointment_id,

  // This will not be shown because we overwrite with eventContent
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

// Get single appointment
export const getAppointment = async (appointmentId: string) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}/${appointmentId}`;

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    return false;
  }
};

// Update a appointment
export const updateAppointment = async (
  appointmentId: string,
  data: updateAppointmentData
) => {
  const token = cookies().get("token")?.value;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const url = `${apiUrl + route}/${appointmentId}`;

  try {
    const response = await axios.put(url, data, options);
    return { success: true, ...response.data };
  } catch (error: any) {
    return false;
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
  paymentMethod?: string  // Add this parameter
) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl}/seller/appointments/update-status.php`;

  try {
    // Prepare request data
    const requestData: any = {
      appointment_id: appointmentId,
      status: status
    };
    
    // Add payment_method if provided
    if (paymentMethod) {
      requestData.payment_method = paymentMethod;
    }

    console.log("Sending update request:", requestData); // Debug log

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