"use client";

import { useCurrentProject } from "@/providers/project-provider";
import { useBenchmark } from "@/hooks/use-benchmark";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

function fmt(value: number, type: "percent" | "score" | "hours"): string {
  if (type === "percent") return `${(value * 100).toFixed(1)}%`;
  if (type === "hours") return `${value.toFixed(1)}h`;
  return value.toFixed(1);
}

interface MetricCardProps {
  label: string;
  yours: number;
  avg: number;
  percentile: number;
  type: "percent" | "score" | "hours";
  invertColor?: boolean; // true when LOWER is better (e.g. churn rate, response time)
}

function MetricCard({ label, yours, avg, percentile, type, invertColor }: MetricCardProps) {
  const diff = yours - avg;
  const isBetter = invertColor ? diff < 0 : diff > 0;
  const isWorse = invertColor ? diff > 0 : diff < 0;

  const colorClass = isBetter
    ? "text-green-600 dark:text-green-400"
    : isWorse
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  const barColor = isBetter
    ? "bg-green-500"
    : isWorse
      ? "bg-red-500"
      : "bg-zinc-400";

  const percentileBg = percentile >= 70
    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    : percentile >= 40
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${percentileBg}`}>
          P{percentile}
        </span>
      </div>

      {/* Your value */}
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-semibold text-foreground">{fmt(yours, type)}</span>
        <span className={`flex items-center gap-0.5 text-sm font-medium ${colorClass}`}>
          {isBetter ? <TrendingUp className="h-3.5 w-3.5" /> : isWorse ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          {Math.abs(diff) < 0.001 ? "on par" : `${diff > 0 ? "+" : ""}${fmt(diff, type)} vs avg`}
        </span>
      </div>

      {/* Comparison bar */}
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>You</span>
          <span>Industry avg: {fmt(avg, type)}</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          {/* Average marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/30"
            style={{ left: `${Math.min((avg / Math.max(yours, avg, 0.001)) * 50 + 25, 95)}%` }}
          />
          {/* Your bar */}
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(percentile, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function BenchmarkingPage() {
  const { slug } = useCurrentProject();
  const { data, isLoading } = useBenchmark(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">
          No benchmark data available yet. Once there is enough activity, benchmarks will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Industry Benchmarks
        </h1>
        <p className="text-sm text-muted-foreground">
          See how your project compares to {data.total_projects_benchmarked} anonymized projects on the platform.
        </p>
      </div>

      {/* Metric Cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <MetricCard
          label="Churn Rate"
          yours={data.your_churn_rate}
          avg={data.avg_churn_rate}
          percentile={data.churn_rate_percentile}
          type="percent"
          invertColor
        />
        <MetricCard
          label="Recovery Rate"
          yours={data.your_recovery_rate}
          avg={data.avg_recovery_rate}
          percentile={data.recovery_rate_percentile}
          type="percent"
        />
        <MetricCard
          label="Health Score"
          yours={data.your_health_score}
          avg={data.avg_health_score}
          percentile={data.health_score_percentile}
          type="score"
        />
        <MetricCard
          label="Avg Response Time"
          yours={data.your_avg_response_time_hours}
          avg={data.avg_response_time_hours}
          percentile={100 - Math.max(data.churn_rate_percentile, 1)}
          type="hours"
          invertColor
        />
      </motion.div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        Based on {data.total_projects_benchmarked} anonymized projects.
        All data is aggregated and no individual project information is shared.
      </p>
    </div>
  );
}
