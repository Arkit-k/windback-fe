"use client";

import { useEffect, useState } from "react";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <OnboardingGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <div
          className="transition-all duration-400 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            marginLeft: mounted ? 0 : -20,
          }}
        >
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className="transition-all duration-350 ease-out delay-100"
            style={{
              opacity: mounted ? 1 : 0,
              marginTop: mounted ? 0 : -10,
            }}
          >
            <Topbar />
          </div>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </OnboardingGuard>
  );
}
