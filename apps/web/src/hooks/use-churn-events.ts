"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES, ITEMS_PER_PAGE } from "@/lib/constants";
import type { ChurnEvent, ChurnEventListResponse, RecoveryVariant, CreateChurnEventRequest } from "@/types/api";

interface ApiResponse<T> { data: T; }

interface UpdateVariantRequest {
  subject: string;
  body: string;
}

export function useChurnEvents(slug: string, params: { status?: string; page?: number }) {
  const queryParams = new URLSearchParams();
  if (params.status && params.status !== "all") queryParams.set("status", params.status);
  queryParams.set("limit", ITEMS_PER_PAGE.toString());
  queryParams.set("offset", (((params.page ?? 1) - 1) * ITEMS_PER_PAGE).toString());

  const queryString = queryParams.toString();

  return useQuery<ChurnEventListResponse>({
    queryKey: QUERY_KEYS.churnEvents(slug, params),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ChurnEventListResponse>>(`projects/${slug}/churn-events?${queryString}`);
      return res.data;
    },
    staleTime: STALE_TIMES.churnEvents,
    enabled: !!slug,
  });
}

export function useChurnEvent(slug: string, id: string) {
  return useQuery<ChurnEvent>({
    queryKey: QUERY_KEYS.churnEvent(slug, id),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ChurnEvent>>(`projects/${slug}/churn-events/${id}`);
      return res.data;
    },
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

export function useUpdateVariant(slug: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { variantId: string; subject: string; body: string }>({
    mutationFn: ({ variantId, subject, body }) =>
      apiClient(`projects/${slug}/churn-events/${eventId}/variants/${variantId}`, {
        method: "PATCH",
        body: { subject, body } satisfies UpdateVariantRequest,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.churnEvent(slug, eventId) });
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

export function useCreateChurnEvent(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<ChurnEvent, Error, CreateChurnEventRequest>({
    mutationFn: async (body) => {
      const res = await apiClient<ApiResponse<ChurnEvent>>(`projects/${slug}/churn-events`, { method: "POST", body });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.churnEvents(slug) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats(slug) });
    },
  });
}

export function useRotateAPIKey(slug: string) {
  return useMutation<{ key: string; message: string }, Error, { key_type: "secret" | "public" }>({
    mutationFn: (body) =>
      apiClient<{ key: string; message: string }>(`projects/${slug}/api-keys/rotate`, {
        method: "POST",
        body,
      }),
  });
}
