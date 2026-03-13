"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CompetitorSignal {
  customer_email: string;
  customer_name: string;
  signal_type: string;
  signal_strength: number;
  description: string;
  detected_at: string;
}

export interface CompetitorThreat {
  customer_email: string;
  customer_name: string;
  threat_level: string;
  threat_score: number;
  risk_score: number;
  signals: CompetitorSignal[];
  estimated_mrr_cents: number;
  days_since_last_event: number;
  recommended_action: string;
}

export interface CompetitorRadarSummary {
  total_monitored: number;
  critical_threats: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;
  at_risk_mrr_cents: number;
  top_signal_types: Record<string, number>;
  threat_trend: string;
  threats: CompetitorThreat[];
  generated_at: string;
}

interface ApiResponse<T> {
  data: T;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCompetitorRadar(slug: string) {
  return useQuery<CompetitorRadarSummary>({
    queryKey: ["competitor-radar", slug],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<CompetitorRadarSummary>>(
        `projects/${slug}/competitor-radar`,
      );
      return res.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!slug,
  });
}
