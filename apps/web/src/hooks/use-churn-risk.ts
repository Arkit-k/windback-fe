"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  ChurnRiskScore,
  ChurnRiskStats,
  ChurnRiskConfig,
  UpdateChurnRiskConfigRequest,
  CustomerDetail,
  EmailPreview,
  WebhookDeliveryListResponse,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useChurnRiskScores(slug: string) {
  return useQuery<ChurnRiskScore[]>({
    queryKey: QUERY_KEYS.churnRiskScores(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ChurnRiskScore[]>>(
        `projects/${slug}/churn-risk/scores`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.churnRiskScores,
    enabled: !!slug,
  });
}

export function useChurnRiskStats(slug: string) {
  return useQuery<ChurnRiskStats>({
    queryKey: QUERY_KEYS.churnRiskStats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ChurnRiskStats>>(
        `projects/${slug}/churn-risk/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.churnRiskStats,
    enabled: !!slug,
  });
}

export function useChurnRiskConfig(slug: string) {
  return useQuery<ChurnRiskConfig>({
    queryKey: QUERY_KEYS.churnRiskConfig(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ChurnRiskConfig>>(
        `projects/${slug}/churn-risk/config`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.churnRiskConfig,
    enabled: !!slug,
  });
}

export function useUpdateChurnRiskConfig(slug: string) {
  const queryClient = useQueryClient();
  const configKey = QUERY_KEYS.churnRiskConfig(slug);

  return useMutation<ChurnRiskConfig, Error, UpdateChurnRiskConfigRequest, { previous: ChurnRiskConfig | undefined }>({
    mutationFn: async (input) => {
      const res = await apiClient<ApiResponse<ChurnRiskConfig>>(
        `projects/${slug}/churn-risk/config`,
        { method: "PUT", body: input },
      );
      return res.data;
    },
    onMutate: async (newConfig) => {
      await queryClient.cancelQueries({ queryKey: configKey });
      const previous = queryClient.getQueryData<ChurnRiskConfig>(configKey);
      queryClient.setQueryData<ChurnRiskConfig>(configKey, (old) =>
        old ? { ...old, ...newConfig } : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(configKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: configKey });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.churnRiskStats(slug) });
    },
  });
}

export function useRecalculateChurnRisk(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient(`projects/${slug}/churn-risk/recalculate`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.churnRiskScores(slug),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.churnRiskStats(slug),
      });
    },
  });
}

export function useCustomerDetail(slug: string, email: string) {
  return useQuery<CustomerDetail>({
    queryKey: ["churn-risk-customer", slug, email],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CustomerDetail>>(
        `projects/${slug}/churn-risk/customers/${encodeURIComponent(email)}`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    enabled: !!slug && !!email,
  });
}

export function usePreviewEmail(slug: string) {
  return useMutation<EmailPreview, Error, string>({
    mutationFn: async (email: string) => {
      const res = await apiClient<ApiResponse<EmailPreview>>(
        `projects/${slug}/churn-risk/customers/${encodeURIComponent(email)}/preview-email`,
      );
      return res.data;
    },
  });
}

export function useWebhookDeliveries(slug: string, page: number = 0) {
  return useQuery<WebhookDeliveryListResponse>({
    queryKey: ["webhook-deliveries", slug, page],
    queryFn: async () => {
      const res = await apiClient<WebhookDeliveryListResponse>(
        `projects/${slug}/churn-risk/webhook-deliveries?limit=20&offset=${page * 20}`,
      );
      return res;
    },
    staleTime: 30 * 1000,
    enabled: !!slug,
  });
}

export function useTestChurnRiskWebhook(slug: string) {
  return useMutation({
    mutationFn: async () => {
      await apiClient(`projects/${slug}/churn-risk/test-webhook`, {
        method: "POST",
      });
    },
  });
}

export function useExportChurnRiskCSV(slug: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/projects/${slug}/churn-risk/export`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "churn-risk-scores.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
