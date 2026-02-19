"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { ChurnStats } from "@/types/api";

export function useStats(slug: string) {
  return useQuery<ChurnStats>({
    queryKey: QUERY_KEYS.stats(slug),
    queryFn: () => apiClient<ChurnStats>(`projects/${slug}/stats`),
    staleTime: STALE_TIMES.stats,
    enabled: !!slug,
  });
}
