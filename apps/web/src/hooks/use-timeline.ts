"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CustomerTimeline } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useCustomerTimeline(slug: string, email: string) {
  return useQuery<CustomerTimeline>({
    queryKey: ["customer-timeline", slug, email],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CustomerTimeline>>(
        `projects/${slug}/customers/${encodeURIComponent(email)}/timeline`,
      );
      return res.data;
    },
    staleTime: 30_000,
    enabled: !!slug && !!email,
  });
}
