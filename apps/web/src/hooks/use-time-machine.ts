"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface ApiResponse<T> {
  data: T;
}

export interface TimeMachineParams {
  recovery_rate?: number;
  churn_reduction?: number;
  price_increase?: number;
  dunning_improvement?: number;
}

export interface TimeMachineScenario {
  name: string;
  description: string;
  parameter: string;
  value: number;
}

export interface TimeMachineDataPoint {
  month: string;
  actual_cents: number;
  projected_cents: number;
  delta_cents: number;
}

export interface TimeMachineResult {
  scenario: TimeMachineScenario;
  timeline: TimeMachineDataPoint[];
  total_actual_cents: number;
  total_projected_cents: number;
  total_delta_cents: number;
  delta_percent: number;
  customers_impacted: number;
  generated_at: string;
}

export interface TimeMachineReport {
  scenarios: TimeMachineResult[];
  base_mrr_cents: number;
  total_churns: number;
  total_failures: number;
  period_months: number;
  generated_at: string;
}

function buildQueryString(params: TimeMachineParams): string {
  const parts: string[] = [];
  if (params.recovery_rate !== undefined) {
    parts.push(`recovery_rate=${params.recovery_rate}`);
  }
  if (params.churn_reduction !== undefined) {
    parts.push(`churn_reduction=${params.churn_reduction}`);
  }
  if (params.price_increase !== undefined) {
    parts.push(`price_increase=${params.price_increase}`);
  }
  if (params.dunning_improvement !== undefined) {
    parts.push(`dunning_improvement=${params.dunning_improvement}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export function useTimeMachine(slug: string, params: TimeMachineParams) {
  const qs = buildQueryString(params);

  return useQuery<TimeMachineReport>({
    queryKey: ["time-machine", slug, params],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<TimeMachineReport>>(
        `projects/${slug}/time-machine${qs}`,
      );
      return res.data;
    },
    staleTime: 60 * 1000,
    enabled: !!slug,
  });
}
