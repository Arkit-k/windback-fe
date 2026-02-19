"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { QUERY_KEYS, STALE_TIMES } from "@/lib/constants";
import type { AuthMeResponse, LoginRequest, LoginResponse, OnboardingRequest, OnboardingResponse, RegisterRequest, RegisterResponse, User } from "@/types/api";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error } = useQuery<AuthMeResponse>({
    queryKey: QUERY_KEYS.auth,
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    staleTime: STALE_TIMES.auth,
    retry: false,
  });

  const registerMutation = useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: async (body) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const loginMutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (body) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth, { user: data.user });
      router.refresh();
      if (!data.user.onboarding_completed) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard/projects");
      }
    },
  });

  const onboardingMutation = useMutation<OnboardingResponse, Error, OnboardingRequest>({
    mutationFn: async (body) => {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Onboarding failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.auth, { user: data.user });
      router.push("/dashboard/projects");
    },
  });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    register: registerMutation,
    login: loginMutation,
    onboarding: onboardingMutation,
    logout: logoutMutation,
  };
}
