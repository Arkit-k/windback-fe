import { cookies } from "next/headers";
import { BACKEND_URL, COOKIE_NAME } from "./constants";

/** Server-side API helper — reads secret key from httpOnly cookie */
export async function serverFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const secretKey = cookieStore.get(COOKIE_NAME)?.value;

  const res = await fetch(`${BACKEND_URL}/api/v1/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(secretKey ? { "X-API-Key": secretKey } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || `Server error: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
