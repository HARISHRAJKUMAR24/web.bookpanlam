// lib/api/dashboard-message.ts
"use server";

import axios from "axios";
import { apiUrl } from "@/config";

export const getDashboardMessage = async (userId: number | string) => {
  console.log("🔥 getDashboardMessage CALLED WITH:", userId);

  if (!userId) return [];

  try {
    const url = `${apiUrl}/seller/dashboard-messages/get.php`;

    const res = await axios.get(url, {
      params: { user_id: userId },
    });

    console.log("🔥 RAW API RESPONSE:", res.data);

    if (!res.data?.success) return [];
    
    // Returns array of messages
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (error) {
    console.error("Error fetching dashboard messages:", error);
    return [];
  }
};