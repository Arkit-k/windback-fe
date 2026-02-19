import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_URL, COOKIE_NAME } from "@/lib/constants";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Onboarding failed" },
      { status: res.status },
    );
  }

  return NextResponse.json({ user: data.data });
}
