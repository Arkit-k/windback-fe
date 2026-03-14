"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  StatusIncident,
  StatusPageConfig,
  CreateIncidentRequest,
  UpdateIncidentRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useStatusIncidents(slug: string) {
  return useQuery<StatusIncident[]>({
    queryKey: QUERY_KEYS.statusIncidents(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<StatusIncident[]>>(
        `projects/${slug}/status-page/incidents`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.statusIncidents,
    enabled: !!slug,
  });
}

export function useStatusPageConfig(slug: string) {
  return useQuery<StatusPageConfig>({
    queryKey: QUERY_KEYS.statusPageConfig(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<StatusPageConfig>>(
        `projects/${slug}/status-page/config`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.statusPageConfig,
    enabled: !!slug,
  });
}

export function useCreateIncident(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateIncidentRequest) => {
      const res = await apiClient<ApiResponse<StatusIncident>>(
        `projects/${slug}/status-page/incidents`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.statusIncidents(slug) });
    },
  });
}

export function useUpdateIncident(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...req }: UpdateIncidentRequest & { id: string }) => {
      const res = await apiClient<ApiResponse<StatusIncident>>(
        `projects/${slug}/status-page/incidents/${id}`,
        { method: "PUT", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.statusIncidents(slug) });
    },
  });
}

export function useDeleteIncident(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/status-page/incidents/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.statusIncidents(slug) });
    },
  });
}

export function useUpdateStatusPageConfig(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: Partial<StatusPageConfig>) => {
      const res = await apiClient<ApiResponse<StatusPageConfig>>(
        `projects/${slug}/status-page/config`,
        { method: "PUT", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.statusPageConfig(slug) });
    },
  });
}
