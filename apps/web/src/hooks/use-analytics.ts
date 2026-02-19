"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { EmailAnalytics, RecoveryTrend } from "@/types/api";

export function useEmailAnalytics(slug: string, from?: string, to?: string) {
  const queryParams = new URLSearchParams();
  if (from) queryParams.set("from", from);
  if (to) queryParams.set("to", to);

  const queryString = queryParams.toString();
  const path = `projects/${slug}/analytics/email${queryString ? `?${queryString}` : ""}`;

  return useQuery<EmailAnalytics>({
    queryKey: QUERY_KEYS.emailAnalytics(slug, from, to),
    queryFn: () => apiClient<EmailAnalytics>(path),
    staleTime: STALE_TIMES.emailAnalytics,
    enabled: !!slug,
  });
}

export function useRecoveryTrends(slug: string, days: number = 30) {
  return useQuery<{ data: RecoveryTrend[] }>({
    queryKey: QUERY_KEYS.recoveryTrends(slug, days),
    queryFn: () =>
      apiClient<{ data: RecoveryTrend[] }>(
        `projects/${slug}/analytics/recovery-trends?days=${days}`
      ),
    staleTime: STALE_TIMES.recoveryTrends,
    enabled: !!slug,
  });
}
