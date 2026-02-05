// lib/api/current-user.ts
"use server";

import { cookies } from "next/headers";

export async function currentUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;

  const res = await fetch(
    `${process.env.API_URL}/users/user-with-token.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (!data.success) return null;

  return data.data;
}
