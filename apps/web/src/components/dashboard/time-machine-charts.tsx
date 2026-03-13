"use client";

import { useMemo } from "react";
import type {
  TimeMachineResult,
  TimeMachineDataPoint,
} from "@/hooks/use-time-machine";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

const COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
];

function formatCentsShort(cents: number): string {
  const abs = Math.abs(cents);
  if (abs >= 100_000_00) return `$${(cents / 100_00).toFixed(0)}k`;
  if (abs >= 10_000_00) return `$${(cents / 100_00).toFixed(1)}k`;
  if (abs >= 1_000_00) return `$${(cents / 100_00).toFixed(1)}k`;
  return `$${(cents / 100).toFixed(0)}`;
}

function formatMonth(m: string): string {
  const [year, month] = m.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

/* ------------------------------------------------------------------ */
/*  TimelineComparisonChart                                            */
/*  Dual-line area chart: solid = actual, dashed = projected           */
/* ------------------------------------------------------------------ */

interface TimelineComparisonChartProps {
  result: TimeMachineResult;
  color?: string;
  height?: number;
}

export function TimelineComparisonChart({
  result,
  color = COLORS[0],
  height = 240,
}: TimelineComparisonChartProps) {
  const timeline = result.timeline ?? [];
  const padding = { top: 24, right: 16, bottom: 40, left: 64 };
  const width = 600;

  const { maxVal, xScale, yScale, actualPath, projectedPath, areaPath } =
    useMemo(() => {
      if (timeline.length === 0) {
        return {
          maxVal: 0,
          xScale: () => 0,
          yScale: () => 0,
          actualPath: "",
          projectedPath: "",
          areaPath: "",
        };
      }

      const allVals = timeline.flatMap((d) => [
        d.actual_cents,
        d.projected_cents,
      ]);
      const max = Math.max(...allVals, 1);
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      const xs = (i: number) =>
        padding.left + (i / Math.max(timeline.length - 1, 1)) * chartW;
      const ys = (v: number) =>
        padding.top + chartH - (v / max) * chartH;

      const actualPts = timeline.map((d, i) => `${xs(i)},${ys(d.actual_cents)}`);
      const projPts = timeline.map((d, i) => `${xs(i)},${ys(d.projected_cents)}`);

      const aP = `M${actualPts.join("L")}`;
      const pP = `M${projPts.join("L")}`;

      // Area between the two lines (projected on top, actual on bottom).
      const areaBottom = [...actualPts].reverse().join("L");
      const area = `M${projPts.join("L")}L${areaBottom}Z`;

      return {
        maxVal: max,
        xScale: xs,
        yScale: ys,
        actualPath: aP,
        projectedPath: pP,
        areaPath: area,
      };
    }, [timeline, height]);

  if (timeline.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const chartH = height - padding.top - padding.bottom;
  const ticks = 5;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {Array.from({ length: ticks }).map((_, i) => {
        const val = (maxVal / (ticks - 1)) * i;
        const y = yScale(val);
        return (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {formatCentsShort(val)}
            </text>
          </g>
        );
      })}

      {/* Delta area fill */}
      <path d={areaPath} fill={color} fillOpacity={0.1} />

      {/* Actual line (solid) */}
      <path
        d={actualPath}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.4}
        strokeWidth={2}
      />

      {/* Projected line (dashed) */}
      <path
        d={projectedPath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 3"
      />

      {/* Dots */}
      {timeline.map((d, i) => (
        <g key={i}>
          <circle
            cx={xScale(i)}
            cy={yScale(d.actual_cents)}
            r={3}
            fill="currentColor"
            fillOpacity={0.4}
          />
          <circle cx={xScale(i)} cy={yScale(d.projected_cents)} r={3} fill={color} />
        </g>
      ))}

      {/* X-axis labels */}
      {timeline.map((d, i) => {
        // Show every other label if more than 6 months
        if (timeline.length > 6 && i % 2 !== 0 && i !== timeline.length - 1) return null;
        return (
          <text
            key={d.month}
            x={xScale(i)}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {formatMonth(d.month)}
          </text>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${padding.left}, 12)`}>
        <line x1={0} x2={20} y1={0} y2={0} stroke="currentColor" strokeOpacity={0.4} strokeWidth={2} />
        <text x={24} y={4} fontSize={10} className="fill-muted-foreground">
          Actual
        </text>
        <line x1={80} x2={100} y1={0} y2={0} stroke={color} strokeWidth={2} strokeDasharray="6 3" />
        <text x={104} y={4} fontSize={10} className="fill-muted-foreground">
          Projected
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  DeltaWaterfall                                                     */
/*  Waterfall chart showing each scenario's contribution               */
/* ------------------------------------------------------------------ */

interface DeltaWaterfallProps {
  results: TimeMachineResult[];
  height?: number;
}

export function DeltaWaterfall({ results, height = 200 }: DeltaWaterfallProps) {
  const padding = { top: 16, right: 16, bottom: 40, left: 72 };
  const width = 600;

  const { bars, maxVal } = useMemo(() => {
    if (results.length === 0) return { bars: [], maxVal: 0 };

    let cumulative = 0;
    const barsData = results.map((r, i) => {
      const start = cumulative;
      cumulative += r.total_delta_cents;
      return {
        label: r.scenario.name,
        start,
        end: cumulative,
        delta: r.total_delta_cents,
        color: COLORS[i % COLORS.length],
      };
    });

    const allVals = barsData.flatMap((b) => [b.start, b.end]);
    const max = Math.max(...allVals, 1);

    return { bars: barsData, maxVal: max };
  }, [results]);

  if (bars.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No scenarios to display
      </div>
    );
  }

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = Math.min(60, chartW / bars.length - 16);

  const yScale = (v: number) =>
    padding.top + chartH - (v / maxVal) * chartH;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Baseline */}
      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={yScale(0)}
        y2={yScale(0)}
        stroke="currentColor"
        strokeOpacity={0.15}
      />

      {bars.map((bar, i) => {
        const x =
          padding.left + (i + 0.5) * (chartW / bars.length) - barWidth / 2;
        const yTop = yScale(Math.max(bar.start, bar.end));
        const yBot = yScale(Math.min(bar.start, bar.end));
        const barH = Math.max(yBot - yTop, 2);

        return (
          <g key={i}>
            <rect
              x={x}
              y={yTop}
              width={barWidth}
              height={barH}
              rx={4}
              fill={bar.color}
              fillOpacity={0.8}
            />
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={yTop - 6}
              textAnchor="middle"
              fontSize={10}
              className="fill-foreground"
              fontWeight={600}
            >
              +{formatCentsShort(bar.delta)}
            </text>
            {/* Name label */}
            <text
              x={x + barWidth / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {bar.label}
            </text>
            {/* Connector to next bar */}
            {i < bars.length - 1 && (
              <line
                x1={x + barWidth}
                x2={
                  padding.left +
                  (i + 1.5) * (chartW / bars.length) -
                  barWidth / 2
                }
                y1={yScale(bar.end)}
                y2={yScale(bar.end)}
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeDasharray="3 2"
              />
            )}
          </g>
        );
      })}

      {/* Y-axis label */}
      <text
        x={padding.left - 8}
        y={yScale(maxVal) + 4}
        textAnchor="end"
        fontSize={10}
        className="fill-muted-foreground"
      >
        {formatCentsShort(maxVal)}
      </text>
      <text
        x={padding.left - 8}
        y={yScale(0) + 4}
        textAnchor="end"
        fontSize={10}
        className="fill-muted-foreground"
      >
        $0
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  ScenarioImpactBars                                                 */
/*  Horizontal bars for each scenario with percentage labels           */
/* ------------------------------------------------------------------ */

interface ScenarioImpactBarsProps {
  results: TimeMachineResult[];
  height?: number;
}

export function ScenarioImpactBars({
  results,
  height: _height,
}: ScenarioImpactBarsProps) {
  const maxDelta = useMemo(() => {
    if (results.length === 0) return 1;
    return Math.max(...results.map((r) => Math.abs(r.total_delta_cents)), 1);
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No scenarios to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r, i) => {
        const pct = (Math.abs(r.total_delta_cents) / maxDelta) * 100;
        const color = COLORS[i % COLORS.length];

        return (
          <div key={r.scenario.parameter} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {r.scenario.name}
              </span>
              <span className="tabular-nums text-muted-foreground">
                +{formatCentsShort(r.total_delta_cents)}{" "}
                <span className="text-xs">
                  ({r.delta_percent >= 0 ? "+" : ""}
                  {r.delta_percent.toFixed(1)}%)
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MonthlyBreakdownTable                                              */
/* ------------------------------------------------------------------ */

interface MonthlyBreakdownTableProps {
  timeline: TimeMachineDataPoint[];
}

export function MonthlyBreakdownTable({
  timeline,
}: MonthlyBreakdownTableProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No monthly data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Month</th>
            <th className="pb-2 pr-4 text-right font-medium">Actual</th>
            <th className="pb-2 pr-4 text-right font-medium">Projected</th>
            <th className="pb-2 text-right font-medium">Delta</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((d) => (
            <tr key={d.month} className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">
                {formatMonth(d.month)}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                {formatCentsShort(d.actual_cents)}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums text-foreground">
                {formatCentsShort(d.projected_cents)}
              </td>
              <td className="py-2 text-right tabular-nums font-medium text-emerald-600">
                +{formatCentsShort(d.delta_cents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
