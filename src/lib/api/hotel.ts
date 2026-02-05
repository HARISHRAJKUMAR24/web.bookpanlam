// ❌ DO NOT USE "use server"

import axios from "axios";
import { apiUrl } from "@/config";

/* =========================================================
   TYPES
========================================================= */
export type FoodItem = {
  food: string;
  price: string;
};

export type MenuSlot = {
  slotName: string;
  items: FoodItem[];
};

export type SaveHotelSettingsData = {
  day: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  time_slot: "morning" | "afternoon" | "evening" | "night";
  time_from: string;
  time_to: string;
  menu: MenuSlot[];
};

/* =========================================================
   AXIOS INSTANCE (CLIENT-SIDE)
========================================================= */
const api = axios.create({
  baseURL: apiUrl, // http://localhost/manager.bookpanlam/public
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ sends cookies (token, user_id)
});

/* =========================================================
   SAVE HOTEL SETTINGS
========================================================= */
export const saveHotelSettings = async (
  data: SaveHotelSettingsData
) => {
  try {
    const response = await api.post(
      "/seller/hotel/save-settings.php",
      JSON.stringify(data) // ✅ REQUIRED for PHP
    );

    return response.data;
  } catch (error: any) {
    console.error("HOTEL SAVE ERROR:", error);
    return {
      success: false,
      message: "Server unreachable",
    };
  }
};

/* =========================================================
   GET HOTEL SETTINGS
========================================================= */
export const getHotelSettings = async () => {
  try {
    const response = await api.get(
      "/seller/hotel/get-settings.php"
    );

    return response.data;
  } catch {
    return false;
  }
};
