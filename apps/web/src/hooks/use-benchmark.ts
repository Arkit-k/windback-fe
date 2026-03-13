"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { BenchmarkData } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useBenchmark(slug: string) {
  return useQuery<BenchmarkData>({
    queryKey: QUERY_KEYS.benchmark(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<BenchmarkData>>(
        `projects/${slug}/benchmark`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.benchmark,
    enabled: !!slug,
  });
}
