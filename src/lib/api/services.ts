"use server";

import { apiUrl } from "@/config";
import { serviceData, servicesParams } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

const route = "/services";

// Get all services
export const getAllServices = async (params: servicesParams) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/services/get.php`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        user_id,
        limit: params.limit ?? 10,
        page: params.page ?? 1,
        q: params.q ?? "",
      },
    });

    return response.data;
  } catch (error: any) {
    return false;
  }
};


// Get single service
export const getService = async (serviceId: string) => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/services/single.php?service_id=${serviceId}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    return false;
  }
};


// Add a service
export const addService = async (data: serviceData) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/services/create.php?user_id=${user_id}`;

  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { success: response.data.success, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "Failed" };
  }
};

export const updateService = async (serviceId: string, data: any) => {
  const token = cookies().get("token")?.value;
  const user_id = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/services/update.php?service_id=${serviceId}&user_id=${user_id}`;

  const formData = new FormData();

  // Normal fields
  Object.keys(data).forEach((key) => {
    if (key !== "newMainImage" && key !== "newAdditionalImages") {
      formData.append(key, data[key] ?? "");
    }
  });

  // NEW uploaded main image
  if (data.newMainImage instanceof File) {
    formData.append("main_image", data.newMainImage);
  } else {
    formData.append("existing_main_image", data.image);
  }

  // NEW additional images
  (data.newAdditionalImages || []).forEach((file: File) => {
    formData.append("additional_images[]", file);
  });

  // Old additional images kept
  formData.append("existing_additional_images", JSON.stringify(data.additionalImages));

  try {
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "Failed" };
  }
};




// Delete a service
export const deleteService = async (serviceId: string) => {
  const url = `${apiUrl}/seller/services/delete.php?service_id=${serviceId}`;

  try {
    const response = await axios.delete(url);
    return response.data;
  } catch (error: any) {
    return false;
  }
};


