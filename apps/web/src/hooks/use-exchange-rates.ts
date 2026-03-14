"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { ExchangeRate, ConvertedAmount } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useExchangeRates(slug: string) {
  return useQuery<ExchangeRate[]>({
    queryKey: QUERY_KEYS.exchangeRates(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ExchangeRate[]>>(
        `projects/${slug}/exchange-rates`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.exchangeRates,
    enabled: !!slug,
  });
}

export function useConvertCurrency(slug: string) {
  return useMutation({
    mutationFn: async (req: { from: string; to: string; amount_cents: number }) => {
      const res = await apiClient<ApiResponse<ConvertedAmount>>(
        `projects/${slug}/exchange-rates/convert`,
        { method: "POST", body: req },
      );
      return res.data;
    },
  });
}

export function useUpsertExchangeRate(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: Partial<ExchangeRate>) => {
      const res = await apiClient<ApiResponse<ExchangeRate>>(
        `projects/${slug}/exchange-rates`,
        { method: "PUT", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.exchangeRates(slug) });
    },
  });
}
