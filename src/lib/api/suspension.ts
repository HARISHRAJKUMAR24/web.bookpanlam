import axios from "axios";
import { apiUrl } from "@/config";

export const getSuspension = async (userId: number) => {
  try {
    const res = await axios.get(
      `${apiUrl}/seller/users/get-suspend-user.php?user_id=${userId}`
    );
    return res.data;
  } catch (err) {
    console.error("suspension fetch error:", err);
    return null;
  }
};
