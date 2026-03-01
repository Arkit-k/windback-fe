"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";
import type { StripeConnectStatus } from "@/types/api";

export function useStripeConnectStatus(slug: string) {
  return useQuery<StripeConnectStatus>({
    queryKey: QUERY_KEYS.stripeConnectStatus(slug),
    queryFn: () =>
      apiClient<{ data: StripeConnectStatus }>(`projects/${slug}/stripe-connect/status`).then(
        (r) => r.data
      ),
    enabled: !!slug,
  });
}

export function useStripeConnectAuthURL(slug: string) {
  return useQuery<string>({
    queryKey: ["stripe-connect-auth-url", slug],
    queryFn: () =>
      apiClient<{ data: { url: string } }>(`projects/${slug}/stripe-connect/auth-url`).then(
        (r) => r.data.url
      ),
    enabled: false, // fetched on demand via refetch()
  });
}

export function useStripeConnectDisconnect(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: () =>
      apiClient(`projects/${slug}/stripe-connect`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stripeConnectStatus(slug) });
    },
  });
}
