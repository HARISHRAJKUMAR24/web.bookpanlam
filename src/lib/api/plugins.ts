import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

const route = "/plugins";

// Get all plugins
export const getAllPlugins = async () => {
  const token = cookies().get("token")?.value;
  const url = `${apiUrl + route}`;

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
