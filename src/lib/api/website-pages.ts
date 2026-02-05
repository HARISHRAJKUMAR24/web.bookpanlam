"use server";

import { apiUrl } from "@/config";
import { pageData, pagesParams } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

const route = "/website-pages";

// Get all pages
export const getAllPages = async (params: pagesParams) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}/index.php`;

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

// Get single page
export const getPage = async (pageId: string) => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}/${pageId}`;

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

// Add a page
export const addPage = async (data: pageData) => {
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

// Update a page
export const updatePage = async (pageId: string, data: pageData) => {
  const token = cookies().get("token")?.value;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const url = `${apiUrl + route}/${pageId}`;

  try {
    const response = await axios.put(url, data, options);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response.data.message };
  }
};

// Delete a page
export const deletePage = async (id: number) => {
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
