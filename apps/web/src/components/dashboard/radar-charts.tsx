"use client";

import type { CompetitorRadarSummary } from "@/hooks/use-competitor-radar";

// ── Color palette ──────────────────────────────────────────────────────────

const SIGNAL_COLORS: Record<string, string> = {
  usage_drop: "#ef4444",
  export_spike: "#f97316",
  pricing_page: "#eab308",
  support_complaint: "#8b5cf6",
  feature_gap: "#3b82f6",
};

const SIGNAL_LABELS: Record<string, string> = {
  usage_drop: "Usage Drop",
  export_spike: "Export Spike",
  pricing_page: "Pricing Page",
  support_complaint: "Support",
  feature_gap: "Feature Gap",
};

const LEVEL_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const LEVEL_BG: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

// ── ThreatRadarChart (spider/radar) ────────────────────────────────────────

const AXES = ["usage_drop", "export_spike", "pricing_page", "support_complaint", "feature_gap"];
const AXIS_COUNT = AXES.length;
const CENTER = 120;
const RADIUS = 90;

interface ThreatRadarChartProps {
  summary: CompetitorRadarSummary;
}

function polarToCartesian(angle: number, r: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

export function ThreatRadarChart({ summary }: ThreatRadarChartProps) {
  const maxCount = Math.max(1, ...Object.values(summary.top_signal_types));

  // Build data points for each axis (normalised 0-1).
  const values = AXES.map((axis) => {
    const count = summary.top_signal_types[axis] ?? 0;
    return count / maxCount;
  });

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Build the filled polygon path.
  const points = values.map((v, i) => {
    const angle = (360 / AXIS_COUNT) * i;
    return polarToCartesian(angle, v * RADIUS);
  });
  const pathD = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ") + " Z";

  return (
    <div className="flex items-center gap-6">
      <svg width="240" height="240" viewBox="0 0 240 240" className="shrink-0">
        {/* Grid rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: AXIS_COUNT })
              .map((_, i) => {
                const angle = (360 / AXIS_COUNT) * i;
                const [x, y] = polarToCartesian(angle, r * RADIUS);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const angle = (360 / AXIS_COUNT) * i;
          const [x, y] = polarToCartesian(angle, RADIUS);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}

        {/* Filled area */}
        <path d={pathD} fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={2} />

        {/* Data points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill={SIGNAL_COLORS[AXES[i]] ?? "#3b82f6"} />
        ))}

        {/* Axis labels */}
        {AXES.map((axis, i) => {
          const angle = (360 / AXIS_COUNT) * i;
          const [x, y] = polarToCartesian(angle, RADIUS + 18);
          return (
            <text
              key={axis}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {SIGNAL_LABELS[axis] ?? axis}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="space-y-2">
        {AXES.map((axis) => (
          <div key={axis} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: SIGNAL_COLORS[axis] }}
            />
            <span className="text-muted-foreground">{SIGNAL_LABELS[axis] ?? axis}</span>
            <span className="font-medium text-foreground">{summary.top_signal_types[axis] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ThreatLevelDistribution (horizontal stacked bar) ───────────────────────

interface ThreatLevelDistributionProps {
  summary: CompetitorRadarSummary;
}

export function ThreatLevelDistribution({ summary }: ThreatLevelDistributionProps) {
  const total = summary.total_monitored || 1;
  const segments = [
    { label: "Critical", count: summary.critical_threats, color: LEVEL_COLORS.critical },
    { label: "High", count: summary.high_threats, color: LEVEL_COLORS.high },
    { label: "Medium", count: summary.medium_threats, color: LEVEL_COLORS.medium },
    { label: "Low", count: summary.low_threats, color: LEVEL_COLORS.low },
  ];

  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="flex h-6 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((seg) => {
          const pct = (seg.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={seg.label}
              className="transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${seg.count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-semibold text-foreground">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SignalTypeBreakdown (donut chart) ──────────────────────────────────────

interface SignalTypeBreakdownProps {
  signalTypes: Record<string, number>;
}

export function SignalTypeBreakdown({ signalTypes }: SignalTypeBreakdownProps) {
  const entries = AXES.map((key) => ({
    key,
    label: SIGNAL_LABELS[key] ?? key,
    count: signalTypes[key] ?? 0,
    color: SIGNAL_COLORS[key] ?? "#6b7280",
  })).filter((e) => e.count > 0);

  const total = entries.reduce((s, e) => s + e.count, 0) || 1;

  const radius = 70;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="180" height="180" viewBox="0 0 180 180" className="shrink-0">
        {entries.map((seg) => {
          const pct = seg.count / total;
          const dashLength = pct * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += dashLength;

          return (
            <circle
              key={seg.key}
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
        <text x="90" y="85" textAnchor="middle" className="fill-foreground text-2xl font-bold">
          {total}
        </text>
        <text x="90" y="105" textAnchor="middle" className="fill-muted-foreground text-xs">
          signals
        </text>
      </svg>

      <div className="space-y-2">
        {entries.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2 text-sm">
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

// ── ThreatScoreBar ─────────────────────────────────────────────────────────

interface ThreatScoreBarProps {
  score: number;
  level: string;
}

export function ThreatScoreBar({ score, level }: ThreatScoreBarProps) {
  const color = LEVEL_BG[level] ?? LEVEL_BG.low;

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
