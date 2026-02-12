"use server";

import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

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
        leave_dates: item.leave_dates || [],  // 🔥 ADD THIS
      },
    }));

    return events;
  } catch (error) {
    console.log("Calendar fetch error:", error);
    return [];
  }
};
