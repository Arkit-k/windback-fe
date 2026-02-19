import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_URL, COOKIE_NAME } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Invalid email or password" },
      { status: res.status },
    );
  }

  // Store JWT token in httpOnly cookie
  const token = data.data.token;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days (matches JWT expiry)
  });

  return NextResponse.json({ user: data.data.user, token });
}
