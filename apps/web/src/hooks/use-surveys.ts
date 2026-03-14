"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  Survey,
  SurveyStats,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SubmitSurveyResponseRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useSurveys(slug: string) {
  return useQuery<Survey[]>({
    queryKey: QUERY_KEYS.surveys(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Survey[]>>(
        `projects/${slug}/surveys`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.surveys,
    enabled: !!slug,
  });
}

export function useSurvey(slug: string, id: string) {
  return useQuery<Survey>({
    queryKey: QUERY_KEYS.survey(slug, id),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Survey>>(
        `projects/${slug}/surveys/${id}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.surveys,
    enabled: !!slug && !!id,
  });
}

export function useSurveyStats(slug: string, id: string) {
  return useQuery<SurveyStats>({
    queryKey: QUERY_KEYS.surveyStats(slug, id),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<SurveyStats>>(
        `projects/${slug}/surveys/${id}/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.surveyStats,
    enabled: !!slug && !!id,
  });
}

export function useCreateSurvey(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateSurveyRequest) => {
      const res = await apiClient<ApiResponse<Survey>>(
        `projects/${slug}/surveys`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.surveys(slug) });
    },
  });
}

export function useUpdateSurvey(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...req
    }: UpdateSurveyRequest & { id: string }) => {
      const res = await apiClient<ApiResponse<Survey>>(
        `projects/${slug}/surveys/${id}`,
        { method: "PUT", body: req },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.surveys(slug) });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.survey(slug, variables.id),
      });
    },
  });
}

export function useDeleteSurvey(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/surveys/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.surveys(slug) });
    },
  });
}

export function useSubmitSurveyResponse(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...req
    }: SubmitSurveyResponseRequest & { id: string }) => {
      const res = await apiClient<ApiResponse<unknown>>(
        `projects/${slug}/surveys/${id}/responses`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.surveyStats(slug, variables.id),
      });
    },
  });
}
