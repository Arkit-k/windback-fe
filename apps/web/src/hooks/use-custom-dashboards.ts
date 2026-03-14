"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  CustomDashboard,
  CreateDashboardRequest,
  UpdateDashboardRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useCustomDashboards(slug: string) {
  return useQuery<CustomDashboard[]>({
    queryKey: QUERY_KEYS.customDashboards(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CustomDashboard[]>>(
        `projects/${slug}/dashboards`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.customDashboards,
    enabled: !!slug,
  });
}

export function useCustomDashboard(slug: string, id: string) {
  return useQuery<CustomDashboard>({
    queryKey: QUERY_KEYS.customDashboard(slug, id),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CustomDashboard>>(
        `projects/${slug}/dashboards/${id}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.customDashboards,
    enabled: !!slug && !!id,
  });
}

export function useCreateDashboard(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateDashboardRequest) => {
      const res = await apiClient<ApiResponse<CustomDashboard>>(
        `projects/${slug}/dashboards`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.customDashboards(slug) });
    },
  });
}

export function useUpdateDashboard(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...req }: UpdateDashboardRequest & { id: string }) => {
      const res = await apiClient<ApiResponse<CustomDashboard>>(
        `projects/${slug}/dashboards/${id}`,
        { method: "PUT", body: req },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.customDashboards(slug) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.customDashboard(slug, variables.id) });
    },
  });
}

export function useDeleteDashboard(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/dashboards/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.customDashboards(slug) });
    },
  });
}
