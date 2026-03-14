"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES, ITEMS_PER_PAGE } from "@/lib/constants";
import type { CustomerLTV, LTVStats } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface LTVFilters {
  segment?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: number;
}

export function useLTVList(slug: string, params?: LTVFilters) {
  return useQuery<PaginatedResponse<CustomerLTV>>({
    queryKey: QUERY_KEYS.ltv(slug, params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.segment) sp.set("segment", params.segment);
      if (params?.search) sp.set("search", params.search);
      if (params?.sort_by) sp.set("sort_by", params.sort_by);
      if (params?.sort_dir) sp.set("sort_dir", params.sort_dir);
      sp.set("limit", ITEMS_PER_PAGE.toString());
      sp.set("offset", (((params?.page ?? 1) - 1) * ITEMS_PER_PAGE).toString());
      const qs = sp.toString();
      const res = await apiClient<PaginatedResponse<CustomerLTV>>(
        `projects/${slug}/ltv${qs ? `?${qs}` : ""}`,
      );
      return res;
    },
    staleTime: STALE_TIMES.ltv,
    enabled: !!slug,
  });
}

export function useLTVStats(slug: string) {
  return useQuery<LTVStats>({
    queryKey: QUERY_KEYS.ltvStats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<LTVStats>>(
        `projects/${slug}/ltv/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.ltvStats,
    enabled: !!slug,
  });
}

export function useComputeLTV(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient(`projects/${slug}/ltv/compute`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ltv(slug) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ltvStats(slug) });
    },
  });
}
