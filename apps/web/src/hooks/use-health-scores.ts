"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES, ITEMS_PER_PAGE } from "@/lib/constants";
import type { CustomerHealthScore, HealthScoreStats } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface HealthScoreFilters {
  risk_level?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: number;
}

export function useHealthScores(slug: string, params?: HealthScoreFilters) {
  return useQuery<PaginatedResponse<CustomerHealthScore>>({
    queryKey: QUERY_KEYS.healthScores(slug, params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.risk_level) sp.set("risk_level", params.risk_level);
      if (params?.search) sp.set("search", params.search);
      if (params?.sort_by) sp.set("sort_by", params.sort_by);
      if (params?.sort_dir) sp.set("sort_dir", params.sort_dir);
      sp.set("limit", ITEMS_PER_PAGE.toString());
      sp.set("offset", (((params?.page ?? 1) - 1) * ITEMS_PER_PAGE).toString());
      const qs = sp.toString();
      const res = await apiClient<PaginatedResponse<CustomerHealthScore>>(
        `projects/${slug}/health-scores${qs ? `?${qs}` : ""}`,
      );
      return res;
    },
    staleTime: STALE_TIMES.healthScores,
    enabled: !!slug,
  });
}

export function useHealthScoreStats(slug: string) {
  return useQuery<HealthScoreStats>({
    queryKey: QUERY_KEYS.healthScoreStats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<HealthScoreStats>>(
        `projects/${slug}/health-scores/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.healthScoreStats,
    enabled: !!slug,
  });
}

export function useComputeHealthScores(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient(`projects/${slug}/health-scores/compute`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.healthScores(slug) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.healthScoreStats(slug) });
    },
  });
}
