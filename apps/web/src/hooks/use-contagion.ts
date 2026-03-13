"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────

export interface ContagionNode {
  customer_email: string;
  customer_name: string;
  churned_at?: string;
  risk_score: number;
  segment: string;
  is_churned: boolean;
  connected_churns: number;
}

export interface ContagionEdge {
  source: string;
  target: string;
  weight: number;
  relation: string;
}

export interface ContagionCluster {
  id: number;
  segment: string;
  node_count: number;
  churned_count: number;
  churn_rate: number;
  contagion_risk: string;
  avg_risk_score: number;
}

export interface ContagionMap {
  nodes: ContagionNode[];
  edges: ContagionEdge[];
  clusters: ContagionCluster[];
  total_nodes: number;
  total_edges: number;
  overall_contagion_score: number;
  generated_at: string;
}

// ── Hook ─────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T;
}

export function useContagionMap(slug: string) {
  return useQuery<ContagionMap>({
    queryKey: ["contagion", slug],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ContagionMap>>(
        `projects/${slug}/contagion`,
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!slug,
  });
}
