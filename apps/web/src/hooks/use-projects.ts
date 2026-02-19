"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { Project, CreateProjectRequest, UpdateProjectRequest } from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: QUERY_KEYS.projects,
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Project[]>>("projects");
      return res.data;
    },
    staleTime: STALE_TIMES.projects,
  });
}

export function useProject(slug: string) {
  return useQuery<Project>({
    queryKey: QUERY_KEYS.project(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Project>>(`projects/${slug}`);
      return res.data;
    },
    staleTime: STALE_TIMES.projects,
    enabled: !!slug,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, CreateProjectRequest>({
    mutationFn: async (body) => {
      const res = await apiClient<ApiResponse<Project>>("projects", {
        method: "POST",
        body,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}

export function useUpdateProject(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, UpdateProjectRequest>({
    mutationFn: async (body) => {
      const res = await apiClient<ApiResponse<Project>>(`projects/${slug}`, {
        method: "PUT",
        body,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(slug) });
    },
  });
}

export function useDeleteProject(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () =>
      apiClient(`projects/${slug}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}
