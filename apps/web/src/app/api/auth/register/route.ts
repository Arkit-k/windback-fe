import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Registration failed" },
      { status: res.status },
    );
  }

  // Do NOT set cookie — user must sign in after registration
  return NextResponse.json({
    user: data.data.user,
  });
}
