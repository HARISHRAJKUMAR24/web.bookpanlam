"use server";

import { apiUrl } from "@/config";
import { categoryData, categoriesParams } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

// camelCase → snake_case
const camelToSnake = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);

  const newObj: any = {};
  for (const key in obj) {
    newObj[key.replace(/([A-Z])/g, "_$1").toLowerCase()] = camelToSnake(obj[key]);
  }
  return newObj;
};

// snake_case → camelCase
const snakeToCamel = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);

  const newObj: any = {};
  for (const key in obj) {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    newObj[camel] = snakeToCamel(obj[key]);
  }
  return newObj;
};

/* -------------------------------------------------------
  GET ALL CATEGORIES (with doctor data)
-------------------------------------------------------- */
export const getAllCategories = async (params: categoriesParams) => {
  const token = cookies().get("token")?.value;
  const userId = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/categories/get.php`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      user_id: userId,
      limit: params?.limit ?? 10,
      page: params?.page ?? 1,
      q: params?.q ?? "",
    },
  });

  const rows = (res.data.records || []).map((r: any) => ({
    id: r.id,
    categoryId: r.category_id,
    name: r.name,
    slug: r.slug,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    createdAt: r.created_at,

    doctorName: r.doctor_name,
    specialization: r.specialization,
    qualification: r.qualification,
    experience: r.experience,
    regNumber: r.reg_number,
    doctorImage: r.doctor_image,

    doctorDetails: {
      doctorName: r.doctor_name,
      specialization: r.specialization,
      qualification: r.qualification,
      experience: r.experience,
      regNumber: r.reg_number,
      doctorImage: r.doctor_image,
    },
  }));

  return { ...res.data, records: rows };
};


/* -------------------------------------------------------
  GET SINGLE CATEGORY (with doctor data)
-------------------------------------------------------- */
export const getCategory = async (categoryId: string) => {
  const token = cookies().get("token")?.value;
  const userId = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/categories/single.php`;

  try {
    const response = await axios.get(url, {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
      params: {
        category_id: categoryId,
        user_id: userId,
        token: token,
      },
    });

    if (!response.data.success) return false;

    let data = snakeToCamel(response.data.data);

    return { ...response.data, data };
  } catch (err: any) {
    console.error("❌ GET SINGLE CATEGORY ERROR:", err.response?.data);
    return false;
  }
};

/* -------------------------------------------------------
  CREATE CATEGORY (WITH DOCTOR DATA)
  - Sends both category and doctor fields in one request
-------------------------------------------------------- */
export const addCategory = async (data: any) => {
  const token = cookies().get("token")?.value;
  const userId = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/categories/create.php`;

  const formatted = camelToSnake({
    ...data,
    user_id: userId,
  });

  console.log("🚀 SENDING TO CATEGORY CREATE (with doctor):", formatted);

  try {
    const response = await axios.post(
      url,
      {
        ...formatted,
        token,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("🔥 CATEGORY CREATE RESPONSE:", response.data);

    return response.data;
  } catch (err: any) {
    console.log("💣 CATEGORY CREATE ERROR RESPONSE:", err.response?.data);
    return err.response?.data || { 
      success: false,
      message: "Create failed" 
    };
  }
};

/* -------------------------------------------------------
  UPDATE CATEGORY (WITH DOCTOR DATA)
  - Updates both category and doctor fields in one request
-------------------------------------------------------- */
export const updateCategory = async (categoryId: string, data: any) => {
  const token = cookies().get("token")?.value;
  const userId = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/categories/update.php?id=${categoryId}`;

  const formatted = {
    ...camelToSnake(data),
    user_id: userId,
    category_id: categoryId,
  };

  console.log("UPDATE API → sending data (with doctor):", formatted);

  try {
    const response = await axios.post(
      url,
      {
        ...formatted,
        token,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    console.log("UPDATE API → response:", response.data);

    return response.data;
  } catch (err: any) {
    console.log("UPDATE API → ERROR:", err.response?.data);
    return err.response?.data || { 
      success: false, 
      message: "Update failed" 
    };
  }
};

/* -------------------------------------------------------
  DELETE CATEGORY (and its doctor data)
-------------------------------------------------------- */
export const deleteCategory = async (categoryId: string) => {
  const token = cookies().get("token")?.value;
  const userId = cookies().get("user_id")?.value;

  const url = `${apiUrl}/seller/categories/delete.php`;

  try {
    const response = await axios.post(
      url,
      {
        category_id: categoryId,
        user_id: userId,
        token,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    console.error("❌ DELETE CATEGORY ERROR:", err.response?.data);
    return err.response?.data || { 
      success: false, 
      message: "Delete failed" 
    };
  }
};

/* -------------------------------------------------------
  GET ALL DOCTORS (filter categories with doctor data)
  - Optional helper function if you need just doctors
-------------------------------------------------------- */
export const getAllDoctors = async (userId: number) => {
  const token = cookies().get("token")?.value;

  const url = `${apiUrl}/seller/categories/get.php`;

  try {
    const res = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          user_id: userId,
        },
      }
    );

    // Filter categories that have doctor data
    const doctors = (res.data?.records || [])
      .filter((category: any) => category.doctor_name)
      .map((category: any) => ({
        id: category.id,
        categoryId: category.category_id,
        name: category.name,
        slug: category.slug,
        doctorName: category.doctor_name,
        specialization: category.specialization,
        qualification: category.qualification,
        experience: category.experience,
        regNumber: category.reg_number,
        doctorImage: category.doctor_image,
      }));

    return doctors;
  } catch (err: any) {
    console.error("❌ GET DOCTORS ERROR:", err.response?.data);
    return [];
  }
};

/* -------------------------------------------------------
  GET DOCTOR BY CATEGORY ID (helper function)
-------------------------------------------------------- */
export const getDoctorByCategory = async (categoryId: number, userId: number) => {
  const token = cookies().get("token")?.value;

  try {
    const url = `${apiUrl}/seller/categories/single.php`;
    
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        category_id: categoryId,
        user_id: userId,
        token: token,
      },
    });

    if (!res.data.success || !res.data.data) {
      return null;
    }

    const category = res.data.data;
    
    return {
      id: category.id,
      categoryId: category.category_id,
      doctorName: category.doctor_name,
      specialization: category.specialization,
      qualification: category.qualification,
      experience: category.experience,
      regNumber: category.reg_number,
      doctorImage: category.doctor_image,
    };
  } catch (err: any) {
    console.log("❌ GET DOCTOR BY CATEGORY ERROR:", err.response?.data);
    return null;
  }
};