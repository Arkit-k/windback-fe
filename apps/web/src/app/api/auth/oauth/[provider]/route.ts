import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  return NextResponse.redirect(`${BACKEND_URL}/api/v1/auth/oauth/${provider}`);
}
