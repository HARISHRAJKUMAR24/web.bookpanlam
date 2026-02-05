"use server";

import axios from "axios";
import { apiUrl } from "@/config";
import { cookies } from "next/headers";

export const getTemplateSettings = async () => {
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) return { success: false, template: null };

  const res = await axios.get(`${apiUrl}/seller/settings/template/get.php`, {
    params: { user_id }
  });

  return res.data;
};

export const updateTemplateSettings = async (template_id: number) => {
  const user_id = cookies().get("user_id")?.value;

  const res = await axios.post(`${apiUrl}/seller/settings/template/update.php`, {
    user_id,
    template_id
  });

  return res.data;
};
