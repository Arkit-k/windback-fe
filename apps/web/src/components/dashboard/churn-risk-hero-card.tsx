"use client";

import { Card, CardContent, Skeleton, Badge } from "@windback/ui";
import { AlertTriangle } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { ChurnRiskStats } from "@/types/api";

interface ChurnRiskHeroCardProps {
  stats?: ChurnRiskStats;
  isLoading: boolean;
}

function AnimatedCount({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function ChurnRiskHeroCard({
  stats,
  isLoading,
}: ChurnRiskHeroCardProps) {
  if (isLoading) {
    return (
      <Card className="border-red-500/20 bg-gradient-to-br from-red-50/50 to-card dark:from-red-950/20">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highRisk = stats?.high_risk_count ?? 0;
  const mediumRisk = stats?.medium_risk_count ?? 0;
  const lowRisk = stats?.low_risk_count ?? 0;
  const totalAtRisk = highRisk + mediumRisk;
  const emailsSent = stats?.emails_sent ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border-red-500/20 bg-gradient-to-br from-red-50/50 to-orange-50/30 dark:from-red-950/20 dark:to-orange-950/10">
        <CardContent className="p-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Customers at Risk
              </p>
            </div>

            <p className="font-display text-4xl font-bold text-foreground">
              <AnimatedCount value={totalAtRisk} />
            </p>

            <div className="flex flex-wrap gap-2">
              {highRisk > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {highRisk} High
                </Badge>
              )}
              {mediumRisk > 0 && (
                <Badge className="border-yellow-500/30 bg-yellow-50 text-xs text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                  {mediumRisk} Medium
                </Badge>
              )}
              {lowRisk > 0 && (
                <Badge className="border-green-500/30 bg-green-50 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  {lowRisk} Low
                </Badge>
              )}
            </div>

            {emailsSent > 0 && (
              <p className="text-sm text-muted-foreground">
                {emailsSent} retention email{emailsSent !== 1 ? "s" : ""} sent
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
