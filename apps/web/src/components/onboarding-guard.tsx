"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (!user.onboarding_completed) {
      router.replace("/onboarding");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;
  if (!user) return null;
  if (!user.onboarding_completed) return null;

  return <>{children}</>;
}
