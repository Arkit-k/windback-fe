"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

type MobileSidebarContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  open: false,
  setOpen: () => {},
});

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <OnboardingGuard>
      <MobileSidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
        <div className="fixed inset-0 flex bg-background">
          {/* Desktop sidebar */}
          <div
            className="hidden shrink-0 md:block transition-all duration-400 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              marginLeft: mounted ? 0 : -20,
            }}
          >
            <Sidebar />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div
                className="relative z-50 h-full w-72"
                onClick={(e) => e.stopPropagation()}
              >
                <Sidebar />
              </div>
            </div>
          )}

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
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">{children}</main>
          </div>
        </div>
      </MobileSidebarContext.Provider>
    </OnboardingGuard>
  );
}
