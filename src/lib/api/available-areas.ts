"use server";

import { apiUrl } from "@/config";
import { availableAreaData, availableAreasParams } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

const route = "/available-areas";

// Get all areas
export const getAllAvailableAreas = async (params: availableAreasParams) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}`;

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      limit: params.limit ? params.limit : 10,
      page: params.page && params.page >= 1 ? params.page : 1,
      q: params.q,
    },
  };

  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error: any) {
    return false;
  }
};

// Get single area
export const getAvailableArea = async (areaId: string) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}/${areaId}`;

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

// Add a available area
export const addAvailableArea = async (data: availableAreaData) => {
  const token = cookies().get("token")?.value;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const url = `${apiUrl + route}`;

  try {
    const response = await axios.post(url, data, options);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response.data.message };
  }
};

// Update a available area
export const updateAvailableArea = async (
  areaId: string,
  data: availableAreaData
) => {
  const token = cookies().get("token")?.value;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const url = `${apiUrl + route}/${areaId}`;

  try {
    const response = await axios.put(url, data, options);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response.data.message };
  }
};

// Delete a available area
export const deleteAvailableArea = async (id: number) => {
  const token = cookies().get("token")?.value;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const url = `${apiUrl + route}/${id}`;

  try {
    const response = await axios.delete(url, options);
    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
