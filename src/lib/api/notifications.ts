"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { apiUrl } from "@/config";

export const getNotifications = async () => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/appointments/notifications.php`;

  try {
    const response = await axios.get(url, {
      withCredentials: true,
      headers: { Cookie: `token=${token}` }
    });

    return response.data?.records || [];
  } catch (err) {
    console.log("NOTIFICATION FETCH ERROR:", err);
    return [];
  }
};
