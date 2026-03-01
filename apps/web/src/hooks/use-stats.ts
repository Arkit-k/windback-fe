"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { ChurnStats } from "@/types/api";

interface ApiResponse<T> { data: T; }

export function useStats(slug: string) {
  return useQuery<ChurnStats>({
    queryKey: QUERY_KEYS.stats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ChurnStats>>(`projects/${slug}/stats`);
      return res.data;
    },
    staleTime: STALE_TIMES.stats,
    enabled: !!slug,
  });
}
