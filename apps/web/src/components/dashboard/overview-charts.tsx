"use client";

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@windback/ui";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { RecoveryTrend, DailyEmailStat } from "@/types/api";

/* -------------------------------------------------------------------------- */
/*  RecoveryTrendChart                                                        */
/* -------------------------------------------------------------------------- */

interface RecoveryTrendChartProps {
  trends: RecoveryTrend[];
  isLoading: boolean;
}

/**
 * Pure-SVG area chart showing recovery rate over the last 14 data points.
 * Below the chart: Avg Recovery Rate, Total Recovered, Total Lost.
 */
export function RecoveryTrendChart({ trends, isLoading }: RecoveryTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[160px] w-full rounded-md" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = trends.slice(-14);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recovery Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recovery data yet. Trends will appear once events are processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ---- Metrics ---- */
  const avgRate =
    data.reduce((sum, d) => sum + d.recovery_rate, 0) / data.length;
  const totalRecovered = data.reduce((sum, d) => sum + d.mrr_recovered_cents, 0);
  const totalLost = data.reduce(
    (sum, d) => sum + (d.mrr_at_risk_cents - d.mrr_recovered_cents),
    0
  );

  /* ---- SVG dimensions ---- */
  const width = 600;
  const height = 160;
  const paddingX = 0;
  const paddingY = 8;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const maxRate = Math.max(...data.map((d) => d.recovery_rate), 1);

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartW;
    const y = paddingY + chartH - (d.recovery_rate / maxRate) * chartH;
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Area path: move to first point, line through all points, then close along bottom
  const areaPath = [
    `M ${points[0].x},${height - paddingY}`,
    `L ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`,
    `L ${points[points.length - 1].x},${height - paddingY}`,
    "Z",
  ].join(" ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recovery Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          preserveAspectRatio="none"
          aria-label="Recovery rate area chart"
        >
          <defs>
            <linearGradient id="recoveryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent, #10b981)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent, #10b981)" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#recoveryFill)" />

          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="var(--accent, #10b981)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="var(--accent, #10b981)"
              className="opacity-0 transition-opacity hover:opacity-100"
              vectorEffect="non-scaling-stroke"
            >
              <title>
                {data[i].date}: {formatPercent(data[i].recovery_rate)}
              </title>
            </circle>
          ))}
        </svg>

        {/* Bottom metrics */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Avg Recovery Rate</span>{" "}
            <span className="font-medium text-foreground">
              {formatPercent(avgRate)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Recovered</span>{" "}
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalRecovered, "usd")}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Lost</span>{" "}
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(totalLost, "usd")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  EmailPerformanceSparkline                                                 */
/* -------------------------------------------------------------------------- */

interface EmailPerformanceSparklineProps {
  daily: DailyEmailStat[];
  metric: "sent" | "opened" | "clicked";
  color: string;
}

/**
 * Tiny SVG polyline sparkline for email metrics.
 * Intended to sit inside stat cards or inline with other content.
 */
export function EmailPerformanceSparkline({
  daily,
  metric,
  color,
}: EmailPerformanceSparklineProps) {
  const data = daily.slice(-14);

  if (data.length < 2) return null;

  const values = data.map((d) => d[metric]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const width = 80;
  const height = 24;
  const padding = 1;

  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      aria-label={`${metric} sparkline`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
