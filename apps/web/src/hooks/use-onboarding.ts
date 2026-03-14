"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  OnboardingMilestone,
  OnboardingProgress,
  OnboardingStats,
  CreateMilestoneRequest,
  CompleteMilestoneRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useOnboardingMilestones(slug: string) {
  return useQuery<OnboardingMilestone[]>({
    queryKey: QUERY_KEYS.onboardingMilestones(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<OnboardingMilestone[]>>(
        `projects/${slug}/onboarding/milestones`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.onboardingMilestones,
    enabled: !!slug,
  });
}

export function useOnboardingProgress(slug: string, email: string) {
  return useQuery<OnboardingProgress>({
    queryKey: QUERY_KEYS.onboardingProgress(slug, email),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<OnboardingProgress>>(
        `projects/${slug}/onboarding/progress/${email}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.onboardingProgress,
    enabled: !!slug && !!email,
  });
}

export function useOnboardingStats(slug: string) {
  return useQuery<OnboardingStats>({
    queryKey: QUERY_KEYS.onboardingStats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<OnboardingStats>>(
        `projects/${slug}/onboarding/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.onboardingStats,
    enabled: !!slug,
  });
}

export function useCreateMilestone(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateMilestoneRequest) => {
      const res = await apiClient<ApiResponse<OnboardingMilestone>>(
        `projects/${slug}/onboarding/milestones`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.onboardingMilestones(slug) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.onboardingStats(slug) });
    },
  });
}

export function useDeleteMilestone(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/onboarding/milestones/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.onboardingMilestones(slug) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.onboardingStats(slug) });
    },
  });
}

export function useCompleteMilestone(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, customer_email }: { id: string; customer_email: string }) => {
      const res = await apiClient<ApiResponse<OnboardingMilestone>>(
        `projects/${slug}/onboarding/milestones/${id}/complete`,
        { method: "POST", body: { customer_email } as CompleteMilestoneRequest },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.onboardingProgress(slug, variables.customer_email) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.onboardingStats(slug) });
    },
  });
}
