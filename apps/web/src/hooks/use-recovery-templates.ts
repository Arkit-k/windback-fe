"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { RecoveryTemplate, CreateTemplateRequest, UpdateTemplateRequest } from "@/types/api";

const KEY = (slug: string) => ["recovery-templates", slug];

export function useRecoveryTemplates(slug: string) {
  return useQuery<RecoveryTemplate[]>({
    queryKey: KEY(slug),
    queryFn: () => apiClient<RecoveryTemplate[]>(`projects/${slug}/recovery-templates`),
    enabled: !!slug,
  });
}

export function useCreateTemplate(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<RecoveryTemplate, Error, CreateTemplateRequest>({
    mutationFn: (body) =>
      apiClient<RecoveryTemplate>(`projects/${slug}/recovery-templates`, { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(slug) });
    },
  });
}

export function useUpdateTemplate(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<RecoveryTemplate, Error, { id: string; data: UpdateTemplateRequest }>({
    mutationFn: ({ id, data }) =>
      apiClient<RecoveryTemplate>(`projects/${slug}/recovery-templates/${id}`, { method: "PUT", body: data }),
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
