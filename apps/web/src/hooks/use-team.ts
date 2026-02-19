"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { TeamMember, InviteTeamMemberRequest, TeamInvitation } from "@/types/api";

export function useTeam(slug: string) {
  return useQuery<{ data: TeamMember[] }>({
    queryKey: QUERY_KEYS.team(slug),
    queryFn: () => apiClient<{ data: TeamMember[] }>(`projects/${slug}/team`),
    staleTime: STALE_TIMES.team,
    enabled: !!slug,
  });
}

export function useInviteTeamMember(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<TeamInvitation, Error, InviteTeamMemberRequest>({
    mutationFn: (body) =>
      apiClient<TeamInvitation>(`projects/${slug}/team/invite`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team(slug) });
    },
  });
}

export function useRemoveTeamMember(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (memberId) =>
      apiClient<void>(`projects/${slug}/team/${memberId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team(slug) });
    },
  });
}

export function useAcceptInvitation() {
  return useMutation<void, Error, string>({
    mutationFn: (token) =>
      apiClient<void>(`team/accept/${token}`, {
        method: "POST",
      }),
  });
}
