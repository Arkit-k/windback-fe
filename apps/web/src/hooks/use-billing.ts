"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { UsageInfo, CheckoutResponse, PortalResponse, CancelSurveyStats } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useUsage() {
  return useQuery<UsageInfo>({
    queryKey: QUERY_KEYS.usage,
    queryFn: async () => {
      const res = await apiClient<ApiResponse<UsageInfo>>("billing/usage");
      return res.data;
    },
    staleTime: STALE_TIMES.usage,
  });
}

export function useCheckout() {
  return useMutation<CheckoutResponse, Error, string>({
    mutationFn: async (planTier) => {
      const res = await apiClient<ApiResponse<CheckoutResponse>>("billing/checkout", {
        method: "POST",
        body: { plan_tier: planTier },
      });
      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

export function usePortal() {
  return useMutation<PortalResponse, Error>({
    mutationFn: async () => {
      const res = await apiClient<ApiResponse<PortalResponse>>("billing/portal", {
        method: "POST",
      });
      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

export function useCancelSurveyStats() {
  return useQuery<CancelSurveyStats>({
    queryKey: ["billing", "cancel-surveys"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CancelSurveyStats>>("billing/cancel-surveys");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCancelSubscription() {
  return useMutation<
    { status: string; message: string },
    Error,
    { reason: string; custom_reason?: string }
  >({
    mutationFn: (body) =>
      apiClient("billing/cancel", {
        method: "POST",
        body,
      }),
  });
}
