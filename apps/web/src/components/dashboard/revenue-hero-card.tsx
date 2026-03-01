"use client";

import { Card, CardContent, Skeleton } from "@windback/ui";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { ChurnStats, PaymentFailureStats } from "@/types/api";

interface RevenueHeroCardProps {
  stats?: ChurnStats;
  dunningStats?: PaymentFailureStats;
  isLoading: boolean;
}

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => formatCurrency(Math.round(v), "usd"));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function RevenueHeroCard({
  stats,
  dunningStats,
  isLoading,
}: RevenueHeroCardProps) {
  if (isLoading) {
    return (
      <Card className="border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-light)] to-card">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-64" />
            <div className="flex gap-8">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const churnRecovered = stats?.recovered_mrr ?? 0;
  const dunningRecovered = dunningStats?.mrr_recovered_cents ?? 0;
  const totalSaved = churnRecovered + dunningRecovered;

  const churnRecoveredCount = stats?.recovered_events ?? 0;
  const dunningRecoveredCount = dunningStats?.total_recovered ?? 0;

  // ROI multiplier: total saved / $50/mo plan cost (5000 cents)
  const roiMultiplier = totalSaved > 0 ? Math.round(totalSaved / 5000) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-light)] to-card">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[var(--accent)]" />
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue Saved
                </p>
              </div>

              <p className="font-display text-4xl font-bold text-foreground">
                <AnimatedCounter value={totalSaved} />
              </p>

              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  Churn Recovery: {formatCurrency(churnRecovered, "usd")}
                  <span className="text-xs">({churnRecoveredCount} customers)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                  Dunning Recovery: {formatCurrency(dunningRecovered, "usd")}
                  <span className="text-xs">({dunningRecoveredCount} payments)</span>
                </span>
              </div>

              {roiMultiplier > 0 && (
                <p className="text-sm font-medium text-[var(--accent)]">
                  Your ROI: {roiMultiplier}x
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (Windback costs $50/mo)
                  </span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
