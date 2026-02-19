"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants";

interface Enable2FAResponse {
  data: {
    secret: string;
    qr_url: string;
  };
}

export function useEnable2FA() {
  return useMutation<Enable2FAResponse, Error>({
    mutationFn: () =>
      apiClient<Enable2FAResponse>("auth/2fa/enable", {
        method: "POST",
      }),
  });
}

export function useVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (code) =>
      apiClient<void>("auth/2fa/verify", {
        method: "POST",
        body: { code },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (code) =>
      apiClient<void>("auth/2fa/disable", {
        method: "POST",
        body: { code },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
    },
  });
}
