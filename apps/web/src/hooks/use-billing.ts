"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { UsageInfo, CheckoutResponse, PortalResponse } from "@/types/api";

export function useUsage() {
  return useQuery<UsageInfo>({
    queryKey: QUERY_KEYS.usage,
    queryFn: () => apiClient<UsageInfo>("billing/usage"),
    staleTime: STALE_TIMES.usage,
  });
}

export function useCheckout() {
  return useMutation<CheckoutResponse, Error, string>({
    mutationFn: (planTier) =>
      apiClient<CheckoutResponse>("billing/checkout", {
        method: "POST",
        body: { plan_tier: planTier },
      }),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

export function usePortal() {
  return useMutation<PortalResponse, Error>({
    mutationFn: () =>
      apiClient<PortalResponse>("billing/portal", {
        method: "POST",
      }),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}
