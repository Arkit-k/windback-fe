"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { DunningConfig, UpdateDunningConfigRequest } from "@/types/api";

interface ApiResponse<T> { data: T; }

export function useDunningConfig(slug: string) {
  return useQuery<DunningConfig>({
    queryKey: QUERY_KEYS.dunningConfig(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<DunningConfig>>(`projects/${slug}/dunning-config`);
      return res.data;
    },
    staleTime: STALE_TIMES.dunningConfig,
    enabled: !!slug,
  });
}

export function useUpdateDunningConfig(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<DunningConfig, Error, UpdateDunningConfigRequest>({
    mutationFn: async (body) => {
      const res = await apiClient<ApiResponse<DunningConfig>>(`projects/${slug}/dunning-config`, {
        method: "PUT",
        body,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dunningConfig(slug) });
    },
  });
}
