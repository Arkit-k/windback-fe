"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { DunningConfig, UpdateDunningConfigRequest } from "@/types/api";

export function useDunningConfig(slug: string) {
  return useQuery<DunningConfig>({
    queryKey: QUERY_KEYS.dunningConfig(slug),
    queryFn: () => apiClient<DunningConfig>(`projects/${slug}/dunning-config`),
    staleTime: STALE_TIMES.dunningConfig,
    enabled: !!slug,
  });
}

export function useUpdateDunningConfig(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<DunningConfig, Error, UpdateDunningConfigRequest>({
    mutationFn: (body) =>
      apiClient<DunningConfig>(`projects/${slug}/dunning-config`, {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dunningConfig(slug) });
    },
  });
}
