"use server";

import { apiUrl } from "@/config";
import { customerParams } from "@/types";
import { cookies } from "next/headers";

/* ------------------------------------------
   GET ALL CUSTOMERS (SELLER)
------------------------------------------ */
export const getAllCustomers = async (params: customerParams) => {
  const user_id = cookies().get("user_id")?.value;
  const token = cookies().get("token")?.value;

  if (!user_id) {
    return { records: [], totalPages: 1, totalRecords: 0 };
  }

  const url = `${apiUrl}/customers/get.php`;

  const res = await fetch(
    `${url}?user_id=${user_id}&limit=${params.limit ?? 100}&page=${params.page ?? 1}&q=${params.q ?? ""}`,
    { cache: "no-store" }
  );

  const json = await res.json();
  if (!json.success) return { records: [], totalPages: 1, totalRecords: 0 };

  // Process each customer and fetch their payments
  const enhancedRecords = await Promise.all(
    json.records.map(async (r: any) => {
      
      // Fetch appointment summary for this customer
      const paymentsUrl = `${apiUrl}/seller/appointments/get-user-appointments.php?customer_id=${r.customer_id}`;
      
      const paymentRes = await fetch(paymentsUrl, {
        headers: { Cookie: `token=${token}` },
        cache: "no-store"
      });
      
      const paymentJson = await paymentRes.json();
      const records = paymentJson.records ?? [];

      // Calculate totals
      const totalSpent = records.reduce((acc: number, item: any) => {
        return acc + Number(item.total_amount || 0);
      }, 0);

      return {
        customerId: r.customer_id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        photo: r.photo,
        createdAt: r.created_at,

        countData: {
          appointments: records.length,
          totalSpent,
        },

        user: {
          siteSettings: [{ currency: "INR" }],
        },
      };
    })
  );

  return {
    records: enhancedRecords,
    totalPages: json.totalPages,
    totalRecords: json.totalRecords,
  };
};


/* ------------------------------------------
   CHECK CUSTOMER LIMIT
------------------------------------------ */
export const checkCustomerLimit = async () => {
  const user_id = cookies().get("user_id")?.value;

  if (!user_id) {
    return {
      can_add: false,
      message: "User not logged in",
      current: 0,
      limit: 0,
      remaining: 0,
      plan_expired: false,
      expiry_message: ""
    };
  }

  const url = `${apiUrl}/customers/check-limit.php?user_id=${user_id}&resource_type=customers`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    return {
      can_add: json.can_add || false,
      message: json.message || "",
      current: json.current || 0,
      limit: json.limit || 0,
      remaining: json.remaining || 0,
      plan_expired: json.plan_expired || false,
      expiry_message: json.expiry_message || ""
    };
  } catch (error) {
    console.error("Error checking customer limit:", error);
    return {
      can_add: false,
      message: "Error checking limit",
      current: 0,
      limit: 0,
      remaining: 0,
      plan_expired: false,
      expiry_message: ""
    };
  }
};

export const getCustomer = async (customerId: number) => {
  const user_id = cookies().get("user_id")?.value;
  const token = cookies().get("token")?.value;

  if (!user_id) return null;

  // 1️⃣ Fetch basic customer info
  const url =
    `${apiUrl}/customers/get-single.php` +
    `?customer_id=${customerId}` +
    `&user_id=${user_id}`;

  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();

  if (!json.success) return null;

  const c = json.data;

  // 2️⃣ Fetch this customer's appointments
  const paymentsUrl = `${apiUrl}/seller/appointments/get-user-appointments.php`;

  const paymentsRes = await fetch(
    `${paymentsUrl}?customer_id=${customerId}`,
    {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store"
    }
  );

  const paymentsJson = await paymentsRes.json();
  const records = paymentsJson.records ?? [];

  // 3️⃣ Calculate totals
  const totalSpent = records.reduce((acc: number, item: any) => {
    return acc + Number(item.total_amount || 0);
  }, 0);

  const paid = records.filter((r: any) => r.status === "paid").length;
  const unpaid = records.filter((r: any) => r.status === "pending").length;
  const booked = records.filter((r: any) => r.status === "booked").length;
  const processing = records.filter((r: any) => r.status === "processing").length;
  const completed = records.filter((r: any) => r.status === "completed").length;
  const cancelled = records.filter((r: any) => r.status === "cancelled").length;

  // ⭐ NEW: Refund count
  const refund = records.filter(
    (r: any) =>
      r.status === "refunded" ||
      r.status === "refund" ||
      r.status === "cancelled_refund"
  ).length;

  // 4️⃣ Return full customer object for CustomerCard
  return {
    customerId: c.customer_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    photo: c.photo,
    createdAt: c.created_at,

    countData: {
      totalSpent,
      appointments: records.length,
      paid,
      unpaid,
      booked,
      processing,
      completed,
      cancelled,

      // ⭐ NEW FIELD
      refund,
    },

    user: {
      siteSettings: [{ currency: "INR" }],
    },
  };
};

