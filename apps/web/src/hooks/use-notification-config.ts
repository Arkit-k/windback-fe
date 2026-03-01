"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { NotificationConfig, UpdateNotificationConfigRequest } from "@/types/api";

export function useNotificationConfig(slug: string) {
  return useQuery<NotificationConfig>({
    queryKey: QUERY_KEYS.notificationConfig(slug),
    queryFn: () =>
      apiClient<{ data: NotificationConfig }>(`projects/${slug}/notification-config`).then(
        (r) => r.data
      ),
    staleTime: STALE_TIMES.notificationConfig,
    enabled: !!slug,
  });
}

export function useUpdateNotificationConfig(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<NotificationConfig, Error, UpdateNotificationConfigRequest>({
    mutationFn: (body) =>
      apiClient<{ data: NotificationConfig }>(`projects/${slug}/notification-config`, {
        method: "PUT",
        body,
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationConfig(slug) });
    },
  });
}

export function useTestSlackNotification(slug: string) {
  return useMutation<void, Error>({
    mutationFn: () =>
      apiClient(`projects/${slug}/notification-config/test/slack`, { method: "POST" }),
  });
}

export function useTestWebhookNotification(slug: string) {
  return useMutation<void, Error>({
    mutationFn: () =>
      apiClient(`projects/${slug}/notification-config/test/webhook`, { method: "POST" }),
  });
}
