"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.onboarding_completed) {
      router.push("/onboarding");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  if (user && !user.onboarding_completed) return null;

  return <>{children}</>;
}
