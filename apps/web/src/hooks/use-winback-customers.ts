"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";

export interface WinBackCustomer {
  id: string;
  customer_email: string;
  customer_name: string;
  plan_name: string;
  mrr_cents: number;
  currency: string;
  cancel_reason?: string;
  churned_at: string;
  winback_status: "not_contacted" | "email_sent" | "recovered";
}

interface WinBackListResponse {
  data: WinBackCustomer[];
  total: number;
  limit: number;
  offset: number;
}

export function useWinBackCustomers(slug: string, page = 1) {
  const limit = 20;
  const offset = (page - 1) * limit;
  return useQuery<WinBackListResponse>({
    queryKey: QUERY_KEYS.winBackCustomers(slug, page),
    queryFn: () =>
      apiClient<WinBackListResponse>(
        `projects/${slug}/win-back/customers?limit=${limit}&offset=${offset}`
      ),
    staleTime: STALE_TIMES.winBackCustomers,
    enabled: !!slug,
  });
}

export function useSendWinBackEmail(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient(`projects/${slug}/win-back/customers/${eventId}/send`, {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["winback-customers", slug] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats(slug) });
    },
  });
}
