"use server";

import { apiUrl } from "@/config";
import { currentUser } from "./users";

// ⭐ GET REVENUE GRAPH DATA WITH VIEW TOGGLE
export const getRevenue = async (
  view: "year" | "month" | "day" = "month",
  limit: number = 12
) => {

  const user = await currentUser();
  if (!user?.user_id) return [];

  const res = await fetch(
    `${apiUrl}/seller/analytics/get-revenue-graph.php?user_id=${user.user_id}&view=${view}&limit=${limit}`,
    {
      cache: "no-store",
      credentials: "include",
    }
  );

  const raw = await res.text();
  console.log("🔥 RAW REVENUE RESPONSE:", raw);

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    console.log("Invalid Revenue JSON => ", raw);
    return [];
  }
};

// ⭐ GET OVERVIEW DATA (keep as is)
export const getOverview = async () => {
  const user = await currentUser();
  if (!user?.user_id) {
    return {
      totalRevenue: 0,
      totalAppointments: 0,
      totalCustomers: 0,
      totalServices: 0,
      totalEmployees: 0,
    };
  }

  const res = await fetch(
    `${apiUrl}/seller/analytics/get-overview.php?user_id=${user.user_id}`,
    {
      cache: "no-store",
      credentials: "include",
    }
  );

  const raw = await res.text();

  try {
    return JSON.parse(raw);
  } catch {
    console.log("Invalid Overview JSON => ", raw);
    return {
      totalRevenue: 0,
      totalAppointments: 0,
      totalCustomers: 0,
      totalServices: 0,
      totalEmployees: 0,
    };
  }
};

// ⭐ GET TODAY'S APPOINTMENTS (keep as is)
export const getTodayAppointments = async () => {
  const user = await currentUser();
  if (!user?.user_id) return { paid: 0, pending: 0 };

  const res = await fetch(
    `${apiUrl}/seller/analytics/get-today-appointments.php?user_id=${user.user_id}`,
    { cache: "no-store" }
  );

  const raw = await res.text();

  try {
    const json = JSON.parse(raw);

    return {
      paid: json.todayPaid ?? 0,
      pending: json.todayPending ?? 0,
    };

  } catch {
    return { paid: 0, pending: 0 };
  }
};