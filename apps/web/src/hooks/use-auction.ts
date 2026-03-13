"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { WinBackOffer, AuctionSummary, AuctionConfig } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

function buildConfigParams(config?: Partial<AuctionConfig>): string {
  if (!config) return "";
  const params = new URLSearchParams();
  if (config.max_discount_percent != null)
    params.set("max_discount", String(config.max_discount_percent));
  if (config.max_pause_days != null)
    params.set("max_pause_days", String(config.max_pause_days));
  if (config.min_roi != null)
    params.set("min_roi", String(config.min_roi));
  if (config.preferred_strategy)
    params.set("strategy", config.preferred_strategy);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useWinBackOffers(
  slug: string,
  config?: Partial<AuctionConfig>,
) {
  return useQuery<WinBackOffer[]>({
    queryKey: QUERY_KEYS.auctionOffers(slug, config),
    queryFn: async () => {
      const qs = buildConfigParams(config);
      const res = await apiClient<ApiResponse<WinBackOffer[]>>(
        `projects/${slug}/win-back/offers${qs}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.auctionOffers,
    enabled: !!slug,
  });
}

export function useAuctionSummary(
  slug: string,
  config?: Partial<AuctionConfig>,
) {
  return useQuery<AuctionSummary>({
    queryKey: QUERY_KEYS.auctionSummary(slug, config),
    queryFn: async () => {
      const qs = buildConfigParams(config);
      const res = await apiClient<ApiResponse<AuctionSummary>>(
        `projects/${slug}/win-back/summary${qs}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.auctionSummary,
    enabled: !!slug,
  });
}
