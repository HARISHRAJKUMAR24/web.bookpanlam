import { NextResponse } from "next/server";
import { currentUser } from "@/lib/api/users";

export async function GET() {
  const user = await currentUser();
  return NextResponse.json(user || null);
}
