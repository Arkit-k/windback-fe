"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  Integration,
  IntegrationProvider,
  ConnectIntegrationRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useIntegrations(slug: string) {
  return useQuery<Integration[]>({
    queryKey: QUERY_KEYS.integrations(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Integration[]>>(
        `projects/${slug}/integrations`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.integrations,
    enabled: !!slug,
  });
}

export function useIntegrationProviders(slug: string) {
  return useQuery<IntegrationProvider[]>({
    queryKey: QUERY_KEYS.integrationProviders(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<IntegrationProvider[]>>(
        `projects/${slug}/integrations/providers`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.integrationProviders,
    enabled: !!slug,
  });
}

export function useConnectIntegration(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: ConnectIntegrationRequest) => {
      const res = await apiClient<ApiResponse<Integration>>(
        `projects/${slug}/integrations`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.integrations(slug) });
    },
  });
}

export function useDisconnectIntegration(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/integrations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.integrations(slug) });
    },
  });
}
