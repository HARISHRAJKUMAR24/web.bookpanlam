"use client";

import axios from "axios";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      "http://localhost/manager.bookpanlam/public/seller/files/upload.php",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    return res.data; // { success: true, url: "/uploads/xxxx.png" }
  } catch (err: any) {
    return { success: false, message: "Upload failed" };
  }
};
