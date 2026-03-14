"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES, ITEMS_PER_PAGE } from "@/lib/constants";
import type {
  AlertRule,
  AlertHistory,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AlertHistoryFilters {
  acknowledged?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: number;
}

export function useAlertRules(slug: string) {
  return useQuery<AlertRule[]>({
    queryKey: QUERY_KEYS.alertRules(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<AlertRule[]>>(
        `projects/${slug}/alerts`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.alertRules,
    enabled: !!slug,
  });
}

export function useAlertHistory(slug: string, params?: AlertHistoryFilters) {
  return useQuery<PaginatedResponse<AlertHistory>>({
    queryKey: QUERY_KEYS.alertHistory(slug, params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.acknowledged) sp.set("acknowledged", params.acknowledged);
      if (params?.search) sp.set("search", params.search);
      if (params?.sort_by) sp.set("sort_by", params.sort_by);
      if (params?.sort_dir) sp.set("sort_dir", params.sort_dir);
      sp.set("limit", ITEMS_PER_PAGE.toString());
      sp.set("offset", (((params?.page ?? 1) - 1) * ITEMS_PER_PAGE).toString());
      const qs = sp.toString();
      const res = await apiClient<PaginatedResponse<AlertHistory>>(
        `projects/${slug}/alerts/history${qs ? `?${qs}` : ""}`,
      );
      return res;
    },
    staleTime: STALE_TIMES.alertHistory,
    enabled: !!slug,
  });
}

export function useCreateAlertRule(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateAlertRuleRequest) => {
      const res = await apiClient<ApiResponse<AlertRule>>(
        `projects/${slug}/alerts`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.alertRules(slug) });
    },
  });
}

export function useUpdateAlertRule(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...req
    }: UpdateAlertRuleRequest & { id: string }) => {
      const res = await apiClient<ApiResponse<AlertRule>>(
        `projects/${slug}/alerts/${id}`,
        { method: "PUT", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.alertRules(slug) });
    },
  });
}

export function useDeleteAlertRule(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/alerts/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.alertRules(slug) });
    },
  });
}

export function useAcknowledgeAlert(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/alerts/history/${id}/acknowledge`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.alertHistory(slug) });
    },
  });
}
