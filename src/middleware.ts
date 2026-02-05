import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ ADD THIS LINE (HERE)
  console.log("🛡️ MIDDLEWARE HIT:", pathname);

  // 🔓 Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/sso") ||
    pathname.startsWith("/api/sso-login")
  ) {
    return NextResponse.next();
  }

  // 🔐 Protected routes
  const token = req.cookies.get("token")?.value;

  // ✅ OPTIONAL: ALSO LOG COOKIE
  console.log("🍪 TOKEN FROM COOKIE:", token);

  if (!token) {
    console.log("❌ NO TOKEN → REDIRECT TO LOGIN");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("✅ TOKEN FOUND → ALLOW ACCESS");
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
