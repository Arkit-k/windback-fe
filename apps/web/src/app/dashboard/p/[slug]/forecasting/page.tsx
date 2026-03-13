"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useForecast } from "@/hooks/use-forecast";
import { ForecastChart } from "@/components/dashboard/forecast-chart";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { DollarSign, TrendingUp, ShieldAlert, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: color ? `${color}18` : "var(--accent-light)" }}
        >
          <Icon className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfidenceBadge({ level }: { level: number }) {
  const pct = Math.round(level * 100);
  let color = "#10b981"; // green
  let label = "High";
  if (pct < 70) {
    color = "#eab308"; // yellow
    label = "Medium";
  }
  if (pct < 50) {
    color = "#ef4444"; // red
    label = "Low";
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-muted-foreground">
        Confidence: <span className="font-medium text-foreground">{label} ({pct}%)</span>
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-xl bg-secondary" />
        ))}
      </div>
      <div className="h-[400px] rounded-xl bg-secondary" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">No forecast data yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Revenue forecasts are generated from your payment failure and churn risk data.
          Once you have some activity, projections will appear here.
        </p>
      </div>
    </div>
  );
}

export default function ForecastingPage() {
  const { slug } = useCurrentProject();
  const { data: forecast, isLoading } = useForecast(slug);

  if (isLoading) return <LoadingSkeleton />;
  if (!forecast || (forecast.current_mrr_cents === 0 && forecast.projections.length === 0)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projected MRR with confidence intervals
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  // Find the 30-day projection for the summary card.
  const proj30 = forecast.projections.find((p) => p.days_out === 30);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projected MRR with confidence intervals (30 / 60 / 90 days)
          </p>
        </div>
        <ConfidenceBadge level={forecast.confidence_level} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current MRR"
          value={formatCurrency(forecast.current_mrr_cents)}
          icon={DollarSign}
        />
        <StatCard
          label="Projected 30d"
          value={proj30 ? formatCurrency(proj30.projected_cents) : "--"}
          icon={TrendingUp}
          color="#6366f1"
        />
        <StatCard
          label="At Risk"
          value={formatCurrency(forecast.at_risk_mrr_cents)}
          icon={ShieldAlert}
          color="#ef4444"
        />
        <StatCard
          label="Expected Growth"
          value={formatCurrency(forecast.expected_growth_cents)}
          icon={ArrowUpRight}
          color="#10b981"
        />
      </div>

      {/* Main chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">MRR Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <ForecastChart forecast={forecast} />
        </CardContent>
      </Card>

      {/* Projection details table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projection Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Horizon</th>
                  <th className="pb-2 pr-4 font-medium">Projected</th>
                  <th className="pb-2 pr-4 font-medium">Optimistic</th>
                  <th className="pb-2 pr-4 font-medium">Pessimistic</th>
                  <th className="pb-2 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {forecast.projections.map((p) => (
                  <tr key={p.days_out} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium">{p.days_out} days</td>
                    <td className="py-2.5 pr-4">{formatCurrency(p.projected_cents)}</td>
                    <td className="py-2.5 pr-4 text-emerald-500">
                      {formatCurrency(p.optimistic_cents)}
                    </td>
                    <td className="py-2.5 pr-4 text-red-500">
                      {formatCurrency(p.pessimistic_cents)}
                    </td>
                    <td className="py-2.5">{Math.round(p.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
