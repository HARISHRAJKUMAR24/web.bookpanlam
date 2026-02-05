"use client";

import Cookies from "js-cookie";
import { apiUrl } from "@/config";

/**
 * Upload banner image
 * Backend URL (CONFIRMED):
 * /seller/website-setup/homepage-settings/banner-upload.php
 */
export const uploadBannerImage = async (formData: FormData) => {
  const token = Cookies.get("token");

  const res = await fetch(
    `${apiUrl}/seller/website-setup/homepage-settings/banner-upload.php`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return await res.json();
};
