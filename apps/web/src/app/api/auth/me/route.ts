import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_URL, COOKIE_NAME } from "@/lib/constants";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Invalid session" },
      { status: 401 },
    );
  }

  const data = await res.json();
  return NextResponse.json({ user: data.data });
}
