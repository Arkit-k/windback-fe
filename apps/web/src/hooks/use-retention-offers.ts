"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { RetentionOffer, UpsertRetentionOfferRequest } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useRetentionOffers(slug: string) {
  return useQuery<RetentionOffer[]>({
    queryKey: QUERY_KEYS.retentionOffers(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<RetentionOffer[]>>(
        `projects/${slug}/retention-offers`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.retentionOffers,
    enabled: !!slug,
  });
}

export function useUpsertRetentionOffer(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reason,
      input,
    }: {
      reason: string;
      input: UpsertRetentionOfferRequest;
    }) => {
      const res = await apiClient<ApiResponse<RetentionOffer>>(
        `projects/${slug}/retention-offers/${reason}`,
        { method: "PUT", body: input },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.retentionOffers(slug),
      });
    },
  });
}

export function useDeleteRetentionOffer(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      await apiClient(`projects/${slug}/retention-offers/${reason}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.retentionOffers(slug),
      });
    },
  });
}
