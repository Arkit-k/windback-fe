"use client";

import { OnboardingGuard } from "@/components/onboarding-guard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Sidebar />
        </motion.div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <Topbar />
          </motion.div>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </OnboardingGuard>
  );
}
