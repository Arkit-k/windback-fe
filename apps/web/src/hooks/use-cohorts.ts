"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { CohortSummary } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useCohorts(slug: string, months = 12) {
  return useQuery<CohortSummary>({
    queryKey: QUERY_KEYS.cohorts(slug, months),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CohortSummary>>(
        `projects/${slug}/cohorts?months=${months}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.cohorts,
    enabled: !!slug,
  });
}
