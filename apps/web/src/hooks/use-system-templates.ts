"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SystemRecoveryTemplate } from "@/types/api";

interface ApiResponse<T> { data: T; }

const KEY = (slug: string) => ["system-templates", slug];

export function useSystemTemplates(slug: string) {
  return useQuery<SystemRecoveryTemplate[]>({
    queryKey: KEY(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<SystemRecoveryTemplate[]>>(`projects/${slug}/system-templates`);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function useActivateSystemTemplate(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (templateId) =>
      apiClient(`projects/${slug}/system-templates/${templateId}/activate`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(slug) });
      // Also invalidate custom templates since a new one was created
      queryClient.invalidateQueries({ queryKey: ["recovery-templates", slug] });
    },
  });
}
