"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES, ITEMS_PER_PAGE } from "@/lib/constants";
import type {
  PaymentFailure,
  PaymentFailureListResponse,
  PaymentFailureStats,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function usePaymentFailures(
  slug: string,
  params: { status?: string; page?: number },
) {
  const queryParams = new URLSearchParams();
  if (params.status && params.status !== "all")
    queryParams.set("status", params.status);
  queryParams.set("limit", ITEMS_PER_PAGE.toString());
  queryParams.set(
    "offset",
    (((params.page ?? 1) - 1) * ITEMS_PER_PAGE).toString(),
  );

  const queryString = queryParams.toString();

  return useQuery<PaymentFailureListResponse>({
    queryKey: QUERY_KEYS.paymentFailures(slug, params),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<PaymentFailureListResponse>>(
        `projects/${slug}/payment-failures?${queryString}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.paymentFailures,
    enabled: !!slug,
  });
}

export function usePaymentFailure(slug: string, id: string) {
  return useQuery<PaymentFailure>({
    queryKey: QUERY_KEYS.paymentFailure(slug, id),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<PaymentFailure>>(
        `projects/${slug}/payment-failures/${id}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.paymentFailure,
    enabled: !!slug && !!id,
  });
}

export function usePaymentFailureStats(slug: string) {
  return useQuery<PaymentFailureStats>({
    queryKey: QUERY_KEYS.paymentFailureStats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<PaymentFailureStats>>(
        `projects/${slug}/payment-failures/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.paymentFailureStats,
    enabled: !!slug,
  });
}
