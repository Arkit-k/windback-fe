"use client";

import type { GhostStats } from "@/types/api";

// ── Color map for ghost levels ──────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
  active: "#22c55e",  // green-500
  fading: "#eab308",  // yellow-500
  ghost: "#f97316",   // orange-500
  zombie: "#ef4444",  // red-500
};

const LEVEL_BG: Record<string, string> = {
  active: "bg-green-500",
  fading: "bg-yellow-500",
  ghost: "bg-orange-500",
  zombie: "bg-red-500",
};

// ── GhostDistributionChart ──────────────────────────────────────────────────
// A donut / ring chart showing the active / fading / ghost / zombie breakdown.

interface DistributionChartProps {
  stats: GhostStats;
}

export function GhostDistributionChart({ stats }: DistributionChartProps) {
  const total = stats.total_customers || 1;
  const segments = [
    { label: "Active", count: stats.active_count, color: LEVEL_COLORS.active },
    { label: "Fading", count: stats.fading_count, color: LEVEL_COLORS.fading },
    { label: "Ghost", count: stats.ghost_count, color: LEVEL_COLORS.ghost },
    { label: "Zombie", count: stats.zombie_count, color: LEVEL_COLORS.zombie },
  ];

  const radius = 70;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="180" height="180" viewBox="0 0 180 180" className="shrink-0">
        {segments.map((seg) => {
          const pct = seg.count / total;
          const dashLength = pct * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += dashLength;

          if (seg.count === 0) return null;

          return (
            <circle
              key={seg.label}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
              className="transition-all duration-700"
            />
          );
        })}
        {/* Center label */}
        <text x="90" y="85" textAnchor="middle" className="fill-foreground text-2xl font-bold">
          {stats.total_customers}
        </text>
        <text x="90" y="105" textAnchor="middle" className="fill-muted-foreground text-xs">
          customers
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-medium text-foreground">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GhostScoreBar ───────────────────────────────────────────────────────────
// Horizontal bar showing a single customer's ghost score, colored by level.

interface ScoreBarProps {
  score: number;
  level: string;
}

export function GhostScoreBar({ score, level }: ScoreBarProps) {
  const color = LEVEL_BG[level] ?? LEVEL_BG.active;

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-foreground">{score}</span>
    </div>
  );
}

// ── GhostTrendSparkline ─────────────────────────────────────────────────────
// A mini SVG sparkline for ghost count over time.

interface SparklineProps {
  data: number[]; // sequential ghost counts
  color?: string;
  width?: number;
  height?: number;
}

export function GhostTrendSparkline({
  data,
  color = "#f97316",
  width = 120,
  height = 32,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dot on last point */}
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) * step}
          cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
}
