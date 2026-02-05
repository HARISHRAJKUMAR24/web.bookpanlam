import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔥 SSO LOGIN API HIT");

  const { token } = await req.json();
  console.log("🔥 TOKEN RECEIVED:", token);

  if (!token) {
    return NextResponse.json({ success: false });
  }

  // 🔥 Call PHP
  const phpRes = await fetch(
    "http://localhost/manager.bookpanlam/public/api/verify-sso.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    }
  );

  const raw = await phpRes.text();
  console.log("🔍 PHP RAW RESPONSE:", raw);

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json({ success: false });
  }

  if (!data.success || !data.api_token) {
    return NextResponse.json({ success: false });
  }

  // ✅ THIS IS THE FIX
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: "token",
    value: data.api_token,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  console.log("✅ COOKIE ATTACHED TO RESPONSE");

  return res;
}
