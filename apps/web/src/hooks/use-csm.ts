"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  CSMAssignment,
  CSMTouchpoint,
  CSMStats,
  CreateCSMAssignmentRequest,
  CreateTouchpointRequest,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useCSMAssignments(slug: string) {
  return useQuery<CSMAssignment[]>({
    queryKey: QUERY_KEYS.csmAssignments(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CSMAssignment[]>>(
        `projects/${slug}/csm/assignments`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.csmAssignments,
    enabled: !!slug,
  });
}

export function useCSMStats(slug: string) {
  return useQuery<CSMStats>({
    queryKey: QUERY_KEYS.csmStats(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CSMStats>>(
        `projects/${slug}/csm/stats`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.csmStats,
    enabled: !!slug,
  });
}

export function useAssignCSM(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: CreateCSMAssignmentRequest) => {
      const res = await apiClient<ApiResponse<CSMAssignment>>(
        `projects/${slug}/csm/assignments`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.csmAssignments(slug) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.csmStats(slug) });
    },
  });
}

export function useDeleteCSMAssignment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`projects/${slug}/csm/assignments/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.csmAssignments(slug) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.csmStats(slug) });
    },
  });
}

export function useCSMTouchpoints(slug: string, assignmentId: string) {
  return useQuery<CSMTouchpoint[]>({
    queryKey: QUERY_KEYS.csmTouchpoints(slug, assignmentId),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CSMTouchpoint[]>>(
        `projects/${slug}/csm/assignments/${assignmentId}/touchpoints`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.csmTouchpoints,
    enabled: !!slug && !!assignmentId,
  });
}

export function useAddTouchpoint(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      ...req
    }: CreateTouchpointRequest & { assignmentId: string }) => {
      const res = await apiClient<ApiResponse<CSMTouchpoint>>(
        `projects/${slug}/csm/assignments/${assignmentId}/touchpoints`,
        { method: "POST", body: req },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.csmTouchpoints(slug, variables.assignmentId),
      });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.csmStats(slug) });
    },
  });
}
