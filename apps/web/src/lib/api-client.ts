/** Client-side fetch wrapper — calls Next.js BFF proxy routes */

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiClient<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`/api/proxy/${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(res.status, data.error || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { apiClient, ApiError };
