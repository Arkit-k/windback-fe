"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES, ITEMS_PER_PAGE } from "@/lib/constants";
import type { ChurnEvent, ChurnEventListResponse, RecoveryVariant } from "@/types/api";

export function useChurnEvents(slug: string, params: { status?: string; page?: number }) {
  const queryParams = new URLSearchParams();
  if (params.status && params.status !== "all") queryParams.set("status", params.status);
  queryParams.set("limit", ITEMS_PER_PAGE.toString());
  queryParams.set("offset", (((params.page ?? 1) - 1) * ITEMS_PER_PAGE).toString());

  const queryString = queryParams.toString();

  return useQuery<ChurnEventListResponse>({
    queryKey: QUERY_KEYS.churnEvents(slug, params),
    queryFn: () => apiClient<ChurnEventListResponse>(`projects/${slug}/churn-events?${queryString}`),
    staleTime: STALE_TIMES.churnEvents,
    enabled: !!slug,
  });
}

export function useChurnEvent(slug: string, id: string) {
  return useQuery<ChurnEvent>({
    queryKey: QUERY_KEYS.churnEvent(slug, id),
    queryFn: () => apiClient<ChurnEvent>(`projects/${slug}/churn-events/${id}`),
    staleTime: STALE_TIMES.churnEvent,
    enabled: !!slug && !!id,
  });
}

export function useGenerateVariants(slug: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ variants: RecoveryVariant[] }, Error>({
    mutationFn: () =>
      apiClient(`projects/${slug}/churn-events/${eventId}/generate`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.churnEvent(slug, eventId) });
    },
  });
}

export function useSendVariant(slug: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (variantId) =>
      apiClient(`projects/${slug}/churn-events/${eventId}/variants/${variantId}/send`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.churnEvent(slug, eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(slug) });
    },
  });
}

export function useMarkRecovered(slug: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () =>
      apiClient(`projects/${slug}/churn-events/${eventId}/recovered`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.churnEvent(slug, eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(slug) });
    },
  });
}
