"use client";

import type { RevenueForecast, ForecastPoint } from "@/types/api";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const PADDING = { top: 24, right: 24, bottom: 40, left: 64 };
const WIDTH = 720;
const HEIGHT = 340;

const ACCENT = "#6366f1";
const GREEN = "#10b981";
const RED = "#ef4444";

function formatDollars(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}k`;
  return `$${dollars.toFixed(0)}`;
}

function cubicPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cpx1 = p0.x + (p1.x - p0.x) / 3;
    const cpx2 = p0.x + ((p1.x - p0.x) * 2) / 3;
    d += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function NoData({ height, message }: { height: number; message?: string }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={{ height }}
    >
      {message ?? "No forecast data available"}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ForecastChart                                                              */
/* -------------------------------------------------------------------------- */

interface ForecastChartProps {
  forecast: RevenueForecast;
  height?: number;
}

export function ForecastChart({ forecast, height = HEIGHT }: ForecastChartProps) {
  const { projections, current_mrr_cents } = forecast;

  if (!projections || projections.length === 0) {
    return <NoData height={height} />;
  }

  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  // Build points: day 0 = current MRR, then each projection
  const allPoints: { day: number; proj: number; opt: number; pess: number }[] = [
    { day: 0, proj: current_mrr_cents, opt: current_mrr_cents, pess: current_mrr_cents },
    ...projections.map((p) => ({
      day: p.days_out,
      proj: p.projected_cents,
      opt: p.optimistic_cents,
      pess: p.pessimistic_cents,
    })),
  ];

  const maxDay = allPoints[allPoints.length - 1].day || 90;
  const allValues = allPoints.flatMap((p) => [p.opt, p.pess, p.proj]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const valRange = maxVal - minVal || 1;

  const xScale = (day: number) => PADDING.left + (day / maxDay) * chartW;
  const yScale = (val: number) =>
    PADDING.top + chartH - ((val - minVal) / valRange) * chartH;

  const projPoints = allPoints.map((p) => ({ x: xScale(p.day), y: yScale(p.proj) }));
  const optPoints = allPoints.map((p) => ({ x: xScale(p.day), y: yScale(p.opt) }));
  const pessPoints = allPoints.map((p) => ({ x: xScale(p.day), y: yScale(p.pess) }));

  // Confidence band (area between optimistic and pessimistic)
  const bandPath =
    optPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " " +
    pessPoints
      .slice()
      .reverse()
      .map((p, i) => `${i === 0 ? "L" : "L"} ${p.x} ${p.y}`)
      .join(" ") +
    " Z";

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minVal + (valRange * i) / 4;
    return { val, y: yScale(val) };
  });

  // X-axis labels
  const dayLabels = allPoints.map((p) => ({
    day: p.day,
    x: xScale(p.day),
    label: p.day === 0 ? "Now" : `${p.day}d`,
  }));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        style={{ minWidth: 480 }}
      >
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={t.y}
              y2={t.y}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <text
              x={PADDING.left - 8}
              y={t.y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={11}
            >
              {formatDollars(t.val)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {dayLabels.map((d, i) => (
          <text
            key={i}
            x={d.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={11}
          >
            {d.label}
          </text>
        ))}

        {/* Confidence band */}
        <path d={bandPath} fill={ACCENT} fillOpacity={0.08} />

        {/* Optimistic line (dashed green) */}
        <path
          d={cubicPath(optPoints)}
          fill="none"
          stroke={GREEN}
          strokeWidth={1.5}
          strokeDasharray="6 3"
          strokeOpacity={0.7}
        />

        {/* Pessimistic line (dashed red) */}
        <path
          d={cubicPath(pessPoints)}
          fill="none"
          stroke={RED}
          strokeWidth={1.5}
          strokeDasharray="6 3"
          strokeOpacity={0.7}
        />

        {/* Projected line (solid accent) */}
        <path
          d={cubicPath(projPoints)}
          fill="none"
          stroke={ACCENT}
          strokeWidth={2.5}
        />

        {/* Current MRR marker */}
        <circle
          cx={xScale(0)}
          cy={yScale(current_mrr_cents)}
          r={5}
          fill={ACCENT}
          stroke="white"
          strokeWidth={2}
        />

        {/* Data point dots on projected line */}
        {projPoints.slice(1).map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill={ACCENT}
            stroke="white"
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: ACCENT }} />
          Projected
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{ backgroundColor: GREEN, borderTop: "1px dashed" }}
          />
          Optimistic
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{ backgroundColor: RED, borderTop: "1px dashed" }}
          />
          Pessimistic
        </span>
      </div>
    </div>
  );
}
