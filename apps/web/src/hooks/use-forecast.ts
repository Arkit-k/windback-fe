"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { RevenueForecast } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useForecast(slug: string) {
  return useQuery<RevenueForecast>({
    queryKey: QUERY_KEYS.forecast(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<RevenueForecast>>(
        `projects/${slug}/forecast`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.forecast,
    enabled: !!slug,
  });
}
