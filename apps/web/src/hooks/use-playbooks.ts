"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  Playbook,
  CreatePlaybookRequest,
  PlaybookRun,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function usePlaybooks(slug: string) {
  return useQuery<Playbook[]>({
    queryKey: QUERY_KEYS.playbooks(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Playbook[]>>(
        `projects/${slug}/playbooks`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.playbooks,
    enabled: !!slug,
  });
}

export function usePlaybook(slug: string, id: string) {
  return useQuery<Playbook>({
    queryKey: QUERY_KEYS.playbook(slug, id),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Playbook>>(
        `projects/${slug}/playbooks/${id}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.playbooks,
    enabled: !!slug && !!id,
  });
}

export function useCreatePlaybook(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<Playbook, Error, CreatePlaybookRequest>({
    mutationFn: async (input) => {
      const res = await apiClient<ApiResponse<Playbook>>(
        `projects/${slug}/playbooks`,
        { method: "POST", body: input },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.playbooks(slug) });
    },
  });
}

export function useUpdatePlaybook(slug: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation<Playbook, Error, Partial<CreatePlaybookRequest>>({
    mutationFn: async (input) => {
      const res = await apiClient<ApiResponse<Playbook>>(
        `projects/${slug}/playbooks/${id}`,
        { method: "PUT", body: input },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.playbooks(slug) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.playbook(slug, id) });
    },
  });
}

export function useDeletePlaybook(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient(`projects/${slug}/playbooks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.playbooks(slug) });
    },
  });
}

export function useTogglePlaybook(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<{ is_active: boolean }, Error, string>({
    mutationFn: async (id) => {
      const res = await apiClient<ApiResponse<{ is_active: boolean }>>(
        `projects/${slug}/playbooks/${id}/toggle`,
        { method: "POST" },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.playbooks(slug) });
    },
  });
}

export function usePlaybookRuns(slug: string, playbookId: string) {
  return useQuery<PlaybookRun[]>({
    queryKey: QUERY_KEYS.playbookRuns(slug, playbookId),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<PlaybookRun[]>>(
        `projects/${slug}/playbooks/${playbookId}/runs`,
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    enabled: !!slug && !!playbookId,
  });
}
