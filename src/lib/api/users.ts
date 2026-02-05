"use server";
import { apiUrl } from "@/config";
import { changePasswordData, updateUserData } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";
import { uploadsUrl } from "@/config";

const route = "/users";

export const currentUser = async () => {
  const token = cookies().get("token")?.value;
  console.log("SERVER TOKEN =>", cookies().get("token")?.value);


  if (!token) return null;

  try {
    const res = await fetch(`${apiUrl}/users/user-with-token.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
      cache: "no-store", // 🔥 IMPORTANT FOR SSO
    });


    const raw = await res.text();

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      console.log(" INVALID JSON RESPONSE => ", raw);
      return null;
    }

    if (!json.success || !json.data) return null;
    console.log("🔥 FULL RAW USER RESPONSE =>", json);

    const u = json.data;

    // ⭐ NORMALIZE THE USER OBJECT HERE
    return {
      id: u.id,
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      image: u.image,

      siteSlug: u.site_slug || "",
      siteName: u.site_name ?? "",
      country: u.country,

      service_type_id: Number(u.service_type_id),

      siteSettings: {
        logo_url: u.siteSettings && typeof u.siteSettings === "object" && !Array.isArray(u.siteSettings)
          ? u.siteSettings.logo_url
          : null,

        favicon_url: u.siteSettings && typeof u.siteSettings === "object" && !Array.isArray(u.siteSettings)
          ? u.siteSettings.favicon_url
          : null,
      },



      // ⭐ ADD THESE TWO LINES ⭐
      is_suspended: Number(u.is_suspended),
      suspension_reason: u.suspension_reason ?? null,
    };


  } catch (err) {
    console.log("currentUser ERROR:", err);
    return null;
  }
};



// Update a user data
export const updateUser = async (data: {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  image?: File;
}) => {
  const token = cookies().get("token")?.value;

  const formData = new FormData();
  formData.append("user_id", String(data.user_id));
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("phone", data.phone);
  formData.append("country", data.country);

  if (data.image) {
    formData.append("image", data.image); // 🔥 actual file
  }

  const response = await axios.post(
    `${apiUrl}/seller/users/update-profile.php`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ DO NOT set Content-Type manually
      },
    }
  );

  return response.data;
};



// Change password

export const changePassword = async (data: {
  currentPassword: string;
  password: string;
  token: string;
}) => {
  if (!data.token) {
    return { success: false, message: "Unauthorized (no token)" };
  }

  try {
    const response = await axios.post(
      `${apiUrl}/seller/users/change-password.php`,
      {
        currentPassword: data.currentPassword,
        password: data.password,
        token: data.token, // ✅ RELIABLE
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Password update failed",
    };
  }
};


