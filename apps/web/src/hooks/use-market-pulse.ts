"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { MarketPulseLatest, MarketSnapshot, MarketDemandCell } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useMarketPulseLatest(slug: string) {
  return useQuery<MarketPulseLatest>({
    queryKey: QUERY_KEYS.marketPulseLatest(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<MarketPulseLatest>>(
        `projects/${slug}/market-pulse/latest`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.marketPulseLatest,
    refetchInterval: 30_000,
    enabled: !!slug,
  });
}

export function useMarketPulseSnapshots(slug: string, hours = 168) {
  return useQuery<MarketSnapshot[]>({
    queryKey: QUERY_KEYS.marketPulseSnapshots(slug, hours),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<MarketSnapshot[]>>(
        `projects/${slug}/market-pulse/snapshots?hours=${hours}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.marketPulseSnapshots,
    enabled: !!slug,
  });
}

export function useMarketPulseHeatmap(slug: string, days = 7) {
  return useQuery<MarketDemandCell[]>({
    queryKey: QUERY_KEYS.marketPulseHeatmap(slug, days),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<MarketDemandCell[]>>(
        `projects/${slug}/market-pulse/heatmap?days=${days}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.marketPulseHeatmap,
    enabled: !!slug,
  });
}
