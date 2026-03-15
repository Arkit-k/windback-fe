"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { usePathname } from "next/navigation";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

type MobileSidebarContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

type ThemeContextType = {
  isDark: boolean;
  toggle: () => void;
};

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  open: false,
  setOpen: () => {},
});

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
});

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

export function useDashboardTheme() {
  return useContext(ThemeContext);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("windback-theme");
    if (saved === "dark") setIsDark(true);
  }, []);

  // Apply dark class to <html> so portals (dialogs, dropdowns, selects) also get dark styles
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDark]);

  const toggle = useCallback(() => {
    const next = !isDark;

    // "Windback" effect — a rewind sweep from right to left
    // Like rewinding time: blue accent line sweeps across, theme changes behind it
    const container = document.createElement("div");
    container.style.cssText = `position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;`;
    document.body.appendChild(container);

    // The sweep — a vertical band that moves right to left (rewinding)
    const sweep = document.createElement("div");
    sweep.style.cssText = `
      position:absolute; top:0; bottom:0; width:100%;
      background: linear-gradient(
        to left,
        transparent 0%,
        ${next ? "#171717" : "#F6F8FF"} 8%,
        ${next ? "#171717" : "#F6F8FF"} 100%
      );
      transform: translateX(100%);
      transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
    `;
    container.appendChild(sweep);

    // Blue accent line — the "rewind head"
    const accentLine = document.createElement("div");
    accentLine.style.cssText = `
      position:absolute; top:0; bottom:0; right:0; width:3px;
      background: linear-gradient(to bottom, #FBAA8A, #0004E0, #FBAA8A);
      box-shadow: 0 0 20px #0004E0, 0 0 40px rgba(37,99,235,0.4);
      opacity: 0;
      transition: opacity 0.15s;
    `;
    sweep.appendChild(accentLine);

    // Particles that trail behind the sweep line
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      const yPos = 10 + Math.random() * 80;
      const size = 2 + Math.random() * 3;
      particle.style.cssText = `
        position:absolute; top:${yPos}%; right:${-10 - Math.random() * 30}px;
        width:${size}px; height:${size}px; border-radius:50%;
        background: ${i % 2 === 0 ? "#0004E0" : "#FBAA8A"};
        box-shadow: 0 0 6px ${i % 2 === 0 ? "#0004E0" : "#FBAA8A"};
        opacity:0.8;
        animation: windback-particle ${0.4 + Math.random() * 0.3}s ease-out ${Math.random() * 0.2}s forwards;
      `;
      sweep.appendChild(particle);
    }

    // Inject particle keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes windback-particle {
        to { transform: translateX(40px) scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Start the sweep
    requestAnimationFrame(() => {
      accentLine.style.opacity = "1";
      sweep.style.transform = "translateX(0%)";
    });

    // Switch theme when sweep covers the screen
    setTimeout(() => {
      setIsDark(next);
      localStorage.setItem("windback-theme", next ? "dark" : "light");
    }, 400);

    // Sweep continues off-screen to the left
    setTimeout(() => {
      sweep.style.transition = "transform 0.4s cubic-bezier(0.65, 0, 0.35, 1)";
      sweep.style.transform = "translateX(-100%)";
    }, 500);

    // Cleanup
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 950);
  }, [isDark]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <OnboardingGuard>
      <ThemeContext.Provider value={{ isDark, toggle }}>
        <MobileSidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
          <div className={`fixed inset-0 flex bg-background ${isDark ? "dark" : ""}`}>
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
      </ThemeContext.Provider>
    </OnboardingGuard>
  );
}
