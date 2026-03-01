"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { RecoveryTemplate, CreateTemplateRequest, UpdateTemplateRequest } from "@/types/api";

interface ApiResponse<T> { data: T; }

const KEY = (slug: string) => ["recovery-templates", slug];

export function useRecoveryTemplates(slug: string) {
  return useQuery<RecoveryTemplate[]>({
    queryKey: KEY(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<RecoveryTemplate[]>>(`projects/${slug}/recovery-templates`);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function useCreateTemplate(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<RecoveryTemplate, Error, CreateTemplateRequest>({
    mutationFn: async (body) => {
      const res = await apiClient<ApiResponse<RecoveryTemplate>>(`projects/${slug}/recovery-templates`, { method: "POST", body });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(slug) });
    },
  });
}

export function useUpdateTemplate(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<RecoveryTemplate, Error, { id: string; data: UpdateTemplateRequest }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient<ApiResponse<RecoveryTemplate>>(`projects/${slug}/recovery-templates/${id}`, { method: "PUT", body: data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(slug) });
    },
  });
}

export function useDeleteTemplate(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiClient(`projects/${slug}/recovery-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(slug) });
    },
  });
}
