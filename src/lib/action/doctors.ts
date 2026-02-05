"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { apiUrl } from "@/config";

export const getAllDoctors = async (userId: number) => {
  const token = cookies().get("token")?.value;

  try {
    const res = await axios.post(
      `${apiUrl}/seller/doctors/get.php`,
      { user_id: userId, token },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data?.data || [];
  } catch (err: any) {
    console.error("GET DOCTORS ERROR:", err.response?.data);
    return [];
  }
};
