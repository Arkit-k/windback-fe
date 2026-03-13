"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  Segment,
  CreateSegmentRequest,
  UpdateSegmentRequest,
  SegmentRule,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useSegments(slug: string) {
  return useQuery<Segment[]>({
    queryKey: QUERY_KEYS.segments(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Segment[]>>(
        `projects/${slug}/segments`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.segments,
    enabled: !!slug,
  });
}

export function useSegment(slug: string, segmentId: string) {
  return useQuery<Segment>({
    queryKey: QUERY_KEYS.segment(slug, segmentId),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<Segment>>(
        `projects/${slug}/segments/${segmentId}`,
      );
      return res.data;
    },
    staleTime: STALE_TIMES.segments,
    enabled: !!slug && !!segmentId,
  });
}

export function useCreateSegment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSegmentRequest) => {
      const res = await apiClient<ApiResponse<Segment>>(
        `projects/${slug}/segments`,
        { method: "POST", body: JSON.stringify(data) },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.segments(slug) });
    },
  });
}

export function useUpdateSegment(slug: string, segmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateSegmentRequest) => {
      const res = await apiClient<ApiResponse<Segment>>(
        `projects/${slug}/segments/${segmentId}`,
        { method: "PATCH", body: JSON.stringify(data) },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.segments(slug) });
    },
  });
}

export function useDeleteSegment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (segmentId: string) => {
      await apiClient(`projects/${slug}/segments/${segmentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.segments(slug) });
    },
  });
}

export function useEvaluateSegmentRules(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rules: SegmentRule[]) => {
      const res = await apiClient<ApiResponse<{ matching_customers: number }>>(
        `projects/${slug}/segments/evaluate`,
        { method: "POST", body: JSON.stringify({ rules }) },
      );
      return res.data;
    },
  });
}
