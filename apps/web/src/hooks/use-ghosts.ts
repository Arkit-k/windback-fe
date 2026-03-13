"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { GhostCustomer, GhostStats } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useGhostCustomers(slug: string) {
  return useQuery<GhostCustomer[]>({
    queryKey: QUERY_KEYS.ghostCustomers(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<GhostCustomer[]>>(
        `projects/${slug}/ghosts`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.ghostCustomers,
    enabled: !!slug,
  });
}

export function useGhostStats(slug: string) {
  return useQuery<GhostStats>({
    queryKey: QUERY_KEYS.ghostStats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<GhostStats>>(
        `projects/${slug}/ghosts/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.ghostStats,
    enabled: !!slug,
  });
}
