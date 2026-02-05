"use server";
import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

const route = "/configured-plugins";

// Validate single plugin
export const getConfiguredPlugin = async (id: number) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}/${id}`;

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

// configure plugin
export const configurePlugin = async (id: number, value: string) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}/${id}`;

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(url, { value }, options);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response.data.message };
  }
};
