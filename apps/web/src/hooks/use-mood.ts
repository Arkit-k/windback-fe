"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { MoodSnapshot } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useMoodSnapshot(slug: string) {
  return useQuery<MoodSnapshot>({
    queryKey: QUERY_KEYS.moodSnapshot(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<MoodSnapshot>>(
        `projects/${slug}/mood`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.moodSnapshot,
    refetchInterval: 30_000,
    enabled: !!slug,
  });
}
