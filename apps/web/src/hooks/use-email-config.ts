"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type {
  ProjectEmailConfig,
  SetEmailMethodRequest,
  InitDomainAuthRequest,
  InitDomainAuthResponse,
  GmailAuthURLResponse,
} from "@/types/api";

interface ApiResponse<T> {
  data: T;
}

export function useEmailConfig(slug: string) {
  return useQuery<ProjectEmailConfig>({
    queryKey: QUERY_KEYS.emailConfig(slug),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ProjectEmailConfig>>(`projects/${slug}/email-config`);
      return res.data;
    },
    staleTime: STALE_TIMES.emailConfig,
    enabled: !!slug,
  });
}

export function useSetEmailMethod(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, SetEmailMethodRequest>({
    mutationFn: (body) =>
      apiClient(`projects/${slug}/email-config/method`, { method: "PUT", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailConfig(slug) });
    },
  });
}

export function useGetGmailAuthURL(slug: string) {
  return useQuery<GmailAuthURLResponse>({
    queryKey: ["gmail-auth-url", slug],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<GmailAuthURLResponse>>(
        `projects/${slug}/email-config/gmail/auth-url`
      );
      return res.data;
    },
    enabled: false,
  });
}

export function useConnectGmail(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { code: string }>({
    mutationFn: (body) =>
      apiClient(`projects/${slug}/email-config/gmail/connect`, { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailConfig(slug) });
    },
  });
}

export function useDisconnectGmail(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: () =>
      apiClient(`projects/${slug}/email-config/gmail`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailConfig(slug) });
    },
  });
}

export function useInitDomainAuth(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<InitDomainAuthResponse, Error, InitDomainAuthRequest>({
    mutationFn: async (body) => {
      const res = await apiClient<ApiResponse<InitDomainAuthResponse>>(
        `projects/${slug}/email-config/domain`,
        { method: "POST", body }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailConfig(slug) });
    },
  });
}

export function useVerifyDomain(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<{ verified: boolean }, Error, void>({
    mutationFn: async () => {
      const res = await apiClient<ApiResponse<{ verified: boolean }>>(
        `projects/${slug}/email-config/domain/verify`,
        { method: "POST" }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailConfig(slug) });
    },
  });
}

export function useDisconnectDomain(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: () =>
      apiClient(`projects/${slug}/email-config/domain`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailConfig(slug) });
    },
  });
}
