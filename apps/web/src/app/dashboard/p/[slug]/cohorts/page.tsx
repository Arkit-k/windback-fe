"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useCohorts } from "@/hooks/use-cohorts";
import { CohortHeatmap, RetentionCurveChart } from "@/components/dashboard/cohort-chart";
import { Users, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const MONTH_OPTIONS = [
  { label: "6 months", value: 6 },
  { label: "12 months", value: 12 },
  { label: "18 months", value: 18 },
] as const;

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)]">
          <Icon className="h-5 w-5 text-accent-readable" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-20" />
          ) : (
            <>
              <p className="text-xl font-semibold tracking-tight">{value}</p>
              {sub && (
                <p className="text-xs text-muted-foreground truncate">{sub}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CohortsPage() {
  const { slug } = useCurrentProject();
  const [months, setMonths] = useState(12);

  const { data, isLoading } = useCohorts(slug, months);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cohort Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Track retention curves by customer signup month
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border bg-card p-1">
          {MONTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMonths(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                months === opt.value
                  ? "bg-[var(--accent)] text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SummaryCard
          label="Overall Retention (M1)"
          value={data ? `${data.overall_retention.toFixed(1)}%` : "--"}
          icon={Users}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Best Cohort"
          value={data?.best_cohort || "--"}
          sub="Highest M1 retention"
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <SummaryCard
          label="Worst Cohort"
          value={data?.worst_cohort || "--"}
          sub="Lowest M1 retention"
          icon={TrendingDown}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Retention Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retention Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data && data.cohorts.length > 0 ? (
              <CohortHeatmap cohorts={data.cohorts} />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Retention Curves */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retention Curves</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[340px] w-full" />
            ) : data && data.cohorts.length > 0 ? (
              <RetentionCurveChart cohorts={data.cohorts} />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Users className="h-10 w-10 text-muted-foreground/40" />
      <div>
        <p className="font-medium text-foreground">No cohort data yet</p>
        <p className="text-sm text-muted-foreground">
          Cohort data will appear once churn events are tracked for your project.
        </p>
      </div>
    </div>
  );
}
