"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES, ITEMS_PER_PAGE } from "@/lib/constants";
import type {
  Campaign,
  CampaignWithMetrics,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export interface CampaignFilters {
  status?: string;
  type?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: number;
}

export interface CampaignListResponse {
  data: Campaign[];
  total: number;
  limit: number;
  offset: number;
}

export function useCampaigns(slug: string, filters?: CampaignFilters) {
  return useQuery<CampaignListResponse>({
    queryKey: QUERY_KEYS.campaigns(slug, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.search) params.set("search", filters.search);
      if (filters?.sort_by) params.set("sort_by", filters.sort_by);
      if (filters?.sort_dir) params.set("sort_dir", filters.sort_dir);
      params.set("limit", ITEMS_PER_PAGE.toString());
      params.set("offset", (((filters?.page ?? 1) - 1) * ITEMS_PER_PAGE).toString());
      const qs = params.toString();
      const res = await apiClient<CampaignListResponse>(
        `projects/${slug}/campaigns${qs ? `?${qs}` : ""}`,
      );
      return res;
    },
    staleTime: STALE_TIMES.campaigns,
    enabled: !!slug,
  });
}

export function useSidebarCampaigns(slug: string, enabled: boolean) {
  return useQuery<CampaignListResponse>({
    queryKey: QUERY_KEYS.campaigns(slug, { sidebar: true }),
    queryFn: async () => {
      const res = await apiClient<CampaignListResponse>(
        `projects/${slug}/campaigns?limit=20`,
      );
      return res;
    },
    staleTime: STALE_TIMES.campaigns,
    enabled: !!slug && enabled,
  });
}

export function useCampaign(slug: string, id: string) {
  return useQuery<CampaignWithMetrics>({
    queryKey: QUERY_KEYS.campaign(slug, id),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CampaignWithMetrics>>(
        `projects/${slug}/campaigns/${id}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.campaigns,
    enabled: !!slug && !!id,
  });
}

export function useCreateCampaign(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateCampaignRequest) => {
      const res = await apiClient<ApiResponse<Campaign>>(
        `projects/${slug}/campaigns`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.campaigns(slug) });
    },
  });
}

export function useUpdateCampaign(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...req
    }: UpdateCampaignRequest & { id: string }) => {
      const res = await apiClient<ApiResponse<Campaign>>(
        `projects/${slug}/campaigns/${id}`,
        { method: "PUT", body: req },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.campaigns(slug) });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.campaign(slug, variables.id),
      });
    },
  });
}

export function useDeleteCampaign(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/campaigns/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.campaigns(slug) });
    },
  });
}

export function useDuplicateCampaign(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient<ApiResponse<Campaign>>(
        `projects/${slug}/campaigns/${id}/duplicate`,
        { method: "POST" },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.campaigns(slug) });
    },
  });
}
