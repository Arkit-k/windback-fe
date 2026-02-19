"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";

export function useUpdateOrigins(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { allowed_origins: string[] }>({
    mutationFn: (body) =>
      apiClient(`projects/${slug}/allowed-origins`, { method: "PUT", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(slug) });
    },
  });
}
