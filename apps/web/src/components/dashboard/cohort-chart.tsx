"use client";

import type { CohortBucket } from "@/types/api";

/* ------------------------------------------------------------------ */
/*  Colour helpers                                                     */
/* ------------------------------------------------------------------ */

function retentionColor(rate: number): string {
  if (rate >= 80) return "var(--color-emerald, #10b981)";
  if (rate >= 60) return "var(--color-lime, #84cc16)";
  if (rate >= 40) return "var(--color-amber, #f59e0b)";
  if (rate >= 20) return "var(--color-orange, #f97316)";
  return "var(--color-red, #ef4444)";
}

function retentionBg(rate: number): string {
  if (rate >= 80) return "rgba(16,185,129,0.18)";
  if (rate >= 60) return "rgba(132,204,22,0.18)";
  if (rate >= 40) return "rgba(245,158,11,0.18)";
  if (rate >= 20) return "rgba(249,115,22,0.18)";
  return "rgba(239,68,68,0.18)";
}

function retentionCellBg(rate: number): string {
  if (rate >= 80) return "#059669";
  if (rate >= 60) return "#65a30d";
  if (rate >= 40) return "#d97706";
  if (rate >= 20) return "#ea580c";
  return "#dc2626";
}

/* ------------------------------------------------------------------ */
/*  Retention Heatmap Grid                                             */
/* ------------------------------------------------------------------ */

interface CohortHeatmapProps {
  cohorts: CohortBucket[];
}

export function CohortHeatmap({ cohorts }: CohortHeatmapProps) {
  if (!cohorts.length) return null;

  // Determine max offset across all cohorts.
  const maxOffset = Math.max(
    ...cohorts.map((c) =>
      c.retention.length > 0 ? c.retention[c.retention.length - 1].month_offset : 0,
    ),
  );

  const colHeaders = Array.from({ length: maxOffset + 1 }, (_, i) => `M${i}`);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-medium text-muted-foreground">
              Cohort
            </th>
            <th className="px-3 py-2 text-center font-medium text-muted-foreground">
              Customers
            </th>
            {colHeaders.map((h) => (
              <th
                key={h}
                className="px-2 py-2 text-center font-medium text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => {
            // Build a lookup for fast offset access.
            const retMap = new Map(
              cohort.retention.map((r) => [r.month_offset, r]),
            );

            return (
              <tr key={cohort.cohort_month} className="border-t border-border/40">
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 font-medium whitespace-nowrap">
                  {cohort.cohort_month}
                </td>
                <td className="px-3 py-1.5 text-center text-muted-foreground">
                  {cohort.total_customers}
                </td>
                {colHeaders.map((_, offset) => {
                  const point = retMap.get(offset);
                  if (!point) {
                    return (
                      <td key={offset} className="px-2 py-1.5 text-center text-muted-foreground/40">
                        --
                      </td>
                    );
                  }
                  return (
                    <td
                      key={offset}
                      className="px-2 py-1.5 text-center font-medium text-white rounded-sm"
                      style={{
                        backgroundColor: retentionCellBg(point.retention_rate),
                      }}
                    >
                      {point.retention_rate.toFixed(0)}%
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Retention Curve SVG Line Chart                                     */
/* ------------------------------------------------------------------ */

const LINE_COLORS = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
  "#ef4444", "#3b82f6", "#84cc16", "#a855f7",
];

interface RetentionCurveChartProps {
  cohorts: CohortBucket[];
}

export function RetentionCurveChart({ cohorts }: RetentionCurveChartProps) {
  if (!cohorts.length) return null;

  const W = 700;
  const H = 340;
  const PAD = { top: 20, right: 140, bottom: 40, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxOffset = Math.max(
    ...cohorts.map((c) =>
      c.retention.length > 0 ? c.retention[c.retention.length - 1].month_offset : 0,
    ),
  );

  const xScale = (offset: number) =>
    PAD.left + (maxOffset > 0 ? (offset / maxOffset) * plotW : 0);
  const yScale = (rate: number) =>
    PAD.top + plotH - (rate / 100) * plotH;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            y1={yScale(tick)}
            x2={PAD.left + plotW}
            y2={yScale(tick)}
            stroke="currentColor"
            strokeOpacity={0.08}
          />
          <text
            x={PAD.left - 8}
            y={yScale(tick) + 4}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {tick}%
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {Array.from({ length: maxOffset + 1 }, (_, i) => i).map((offset) => (
        <text
          key={offset}
          x={xScale(offset)}
          y={H - 8}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={10}
        >
          M{offset}
        </text>
      ))}

      {/* Lines */}
      {cohorts.map((cohort, idx) => {
        if (cohort.retention.length < 2) return null;
        const color = LINE_COLORS[idx % LINE_COLORS.length];
        const points = cohort.retention
          .map((r) => `${xScale(r.month_offset)},${yScale(r.retention_rate)}`)
          .join(" ");

        return (
          <g key={cohort.cohort_month}>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />
            {/* Dots */}
            {cohort.retention.map((r) => (
              <circle
                key={r.month_offset}
                cx={xScale(r.month_offset)}
                cy={yScale(r.retention_rate)}
                r={3}
                fill={color}
              />
            ))}
            {/* Legend label at end of line */}
            {cohort.retention.length > 0 && (
              <text
                x={
                  xScale(
                    cohort.retention[cohort.retention.length - 1].month_offset,
                  ) + 8
                }
                y={
                  yScale(
                    cohort.retention[cohort.retention.length - 1].retention_rate,
                  ) + 4
                }
                fontSize={10}
                fill={color}
                fontWeight={600}
              >
                {cohort.cohort_month}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
