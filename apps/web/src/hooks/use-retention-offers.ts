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
  const listKey = QUERY_KEYS.retentionOffers(slug);

  return useMutation<
    RetentionOffer,
    Error,
    { reason: string; input: UpsertRetentionOfferRequest },
    { previous: RetentionOffer[] | undefined }
  >({
    mutationFn: async ({ reason, input }) => {
      const res = await apiClient<ApiResponse<RetentionOffer>>(
        `projects/${slug}/retention-offers/${reason}`,
        { method: "PUT", body: input },
      );
      return res.data;
    },
    onMutate: async ({ reason, input }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<RetentionOffer[]>(listKey);
      queryClient.setQueryData<RetentionOffer[]>(listKey, (old = []) => {
        const idx = old.findIndex((o) => o.cancel_reason === reason);
        if (idx >= 0) {
          return old.map((o, i) => (i === idx ? { ...o, ...input } : o));
        }
        return [...old, { cancel_reason: reason, ...input } as RetentionOffer];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
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
