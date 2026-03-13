"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  ABTestWithResults,
  CreateABTestRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useABTests(slug: string) {
  return useQuery<ABTestWithResults[]>({
    queryKey: QUERY_KEYS.abTests(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ABTestWithResults[]>>(
        `projects/${slug}/ab-tests`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.abTests,
    enabled: !!slug,
  });
}

export function useABTest(slug: string, testId: string) {
  return useQuery<ABTestWithResults>({
    queryKey: QUERY_KEYS.abTest(slug, testId),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ABTestWithResults>>(
        `projects/${slug}/ab-tests/${testId}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.abTests,
    enabled: !!slug && !!testId,
  });
}

export function useCreateABTest(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateABTestRequest) => {
      const res = await apiClient<ApiResponse<ABTestWithResults>>(
        `projects/${slug}/ab-tests`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.abTests(slug) });
    },
  });
}

export function useStartABTest(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testId: string) => {
      const res = await apiClient<ApiResponse<{ status: string }>>(
        `projects/${slug}/ab-tests/${testId}/start`,
        { method: "POST" },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.abTests(slug) });
    },
  });
}

export function useCompleteABTest(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      testId,
      winnerVariantId,
    }: {
      testId: string;
      winnerVariantId: string;
    }) => {
      const res = await apiClient<
        ApiResponse<{ status: string; winner_variant_id: string }>
      >(`projects/${slug}/ab-tests/${testId}/complete`, {
        method: "POST",
        body: { winner_variant_id: winnerVariantId },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.abTests(slug) });
    },
  });
}

export function useDeleteABTest(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testId: string) => {
      await apiClient(`projects/${slug}/ab-tests/${testId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.abTests(slug) });
    },
  });
}
