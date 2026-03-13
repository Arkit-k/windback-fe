"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";

export interface AuditLog {
  id: string;
  user_id: string | null;
  project_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
}

export function useAuditLogs(slug: string, offset = 0, limit = 50, action?: string) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (action) params.set("action", action);

  return useQuery<{ data: AuditLog[] }>({
    queryKey: QUERY_KEYS.auditLogs(slug, offset, action),
    queryFn: () =>
      apiClient<{ data: AuditLog[] }>(
        `projects/${slug}/audit-logs?${params.toString()}`
      ),
    staleTime: STALE_TIMES.auditLogs,
    enabled: !!slug,
  });
}
