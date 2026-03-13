"use client";

import { useMemo } from "react";
import type { WinBackOffer, AuctionSummary } from "@/types/api";

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

function formatCents(cents: number): string {
  if (cents >= 100_00) return `$${(cents / 100).toFixed(0)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

const OFFER_COLORS: Record<string, string> = {
  discount: "#6366f1",
  pause: "#f59e0b",
  personal_outreach: "#10b981",
  feature_unlock: "#8b5cf6",
  downgrade: "#ef4444",
};

function offerColor(type: string): string {
  return OFFER_COLORS[type] ?? "#94a3b8";
}

/* -------------------------------------------------------------------------- */
/*  ROI Bubble Chart                                                           */
/*  X = offer cost, Y = expected save, bubble size = win probability           */
/*  Green bubbles = high ROI, red = low ROI                                    */
/* -------------------------------------------------------------------------- */

interface ROIBubbleChartProps {
  offers: WinBackOffer[];
  width?: number;
  height?: number;
}

export function ROIBubbleChart({
  offers,
  width = 600,
  height = 360,
}: ROIBubbleChartProps) {
  const padding = { top: 30, right: 30, bottom: 50, left: 70 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const { maxCost, maxSave, bubbles } = useMemo(() => {
    if (offers.length === 0)
      return { maxCost: 1, maxSave: 1, bubbles: [] };

    let mc = 0;
    let ms = 0;
    for (const o of offers) {
      if (o.offer_cost_cents > mc) mc = o.offer_cost_cents;
      if (o.expected_save_cents > ms) ms = o.expected_save_cents;
    }
    mc = mc || 1;
    ms = ms || 1;

    const b = offers.map((o) => {
      const x = padding.left + (o.offer_cost_cents / mc) * plotW;
      const y = padding.top + plotH - (o.expected_save_cents / ms) * plotH;
      const r = 6 + o.win_probability * 18;
      const fill =
        o.roi >= 5
          ? "#22c55e"
          : o.roi >= 2
            ? "#84cc16"
            : o.roi >= 1
              ? "#facc15"
              : "#ef4444";
      return { ...o, cx: x, cy: y, r, fill };
    });
    return { maxCost: mc, maxSave: ms, bubbles: b };
  }, [offers, plotW, plotH, padding.left, padding.top]);

  if (offers.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
        No offers to visualise
      </div>
    );
  }

  const xTicks = 5;
  const yTicks = 5;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: height }}
    >
      {/* Grid lines */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const y = padding.top + (plotH / yTicks) * i;
        return (
          <line
            key={`yg-${i}`}
            x1={padding.left}
            x2={width - padding.right}
            y1={y}
            y2={y}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
          />
        );
      })}

      {/* X axis labels */}
      {Array.from({ length: xTicks + 1 }, (_, i) => {
        const x = padding.left + (plotW / xTicks) * i;
        const val = (maxCost / xTicks) * i;
        return (
          <text
            key={`xl-${i}`}
            x={x}
            y={height - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {formatCents(val)}
          </text>
        );
      })}

      {/* Y axis labels */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const y = padding.top + (plotH / yTicks) * i;
        const val = (maxSave / yTicks) * (yTicks - i);
        return (
          <text
            key={`yl-${i}`}
            x={padding.left - 8}
            y={y + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[10px]"
          >
            {formatCents(val)}
          </text>
        );
      })}

      {/* Axis titles */}
      <text
        x={width / 2}
        y={height - 0}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
      >
        Offer Cost
      </text>
      <text
        x={14}
        y={height / 2}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
        transform={`rotate(-90, 14, ${height / 2})`}
      >
        Expected Save
      </text>

      {/* Bubbles */}
      {bubbles.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill={b.fill}
          fillOpacity={0.7}
          stroke={b.fill}
          strokeWidth={1}
        >
          <title>
            {b.customer_email}: cost {formatCents(b.offer_cost_cents)}, save{" "}
            {formatCents(b.expected_save_cents)}, ROI {b.roi}x, win{" "}
            {Math.round(b.win_probability * 100)}%
          </title>
        </circle>
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Offer Type Distribution — horizontal stacked bar                           */
/* -------------------------------------------------------------------------- */

interface OfferTypeDistributionProps {
  summary: AuctionSummary;
  width?: number;
  height?: number;
}

export function OfferTypeDistribution({
  summary,
  width = 600,
  height = 60,
}: OfferTypeDistributionProps) {
  const total = summary.total_recommendations || 1;
  const entries = Object.entries(summary.by_offer_type).sort(
    (a, b) => b[1] - a[1],
  );

  if (entries.length === 0) {
    return (
      <div className="flex h-[60px] items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }

  let offset = 0;
  const bars = entries.map(([type, count]) => {
    const w = (count / total) * width;
    const bar = { type, count, x: offset, w };
    offset += w;
    return bar;
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: height }}
      >
        {bars.map((b) => (
          <g key={b.type}>
            <rect
              x={b.x}
              y={8}
              width={Math.max(b.w - 1, 1)}
              height={30}
              rx={4}
              fill={offerColor(b.type)}
              fillOpacity={0.85}
            >
              <title>
                {b.type}: {b.count} ({Math.round((b.count / total) * 100)}%)
              </title>
            </rect>
            {b.w > 50 && (
              <text
                x={b.x + b.w / 2}
                y={28}
                textAnchor="middle"
                className="fill-white text-[10px] font-medium"
              >
                {b.type.replace(/_/g, " ")}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3">
        {entries.map(([type, count]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: offerColor(type) }}
            />
            {type.replace(/_/g, " ")} ({count})
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Savings Waterfall                                                          */
/*  At-Risk MRR -> minus Expected Churn -> plus Expected Saves -> Net MRR      */
/* -------------------------------------------------------------------------- */

interface SavingsWaterfallProps {
  offers: WinBackOffer[];
  width?: number;
  height?: number;
}

export function SavingsWaterfall({
  offers,
  width = 600,
  height = 300,
}: SavingsWaterfallProps) {
  const padding = { top: 30, right: 20, bottom: 40, left: 70 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const { bars } = useMemo(() => {
    const totalMRR = offers.reduce((s, o) => s + o.current_mrr_cents, 0);
    const expectedChurn = offers.reduce(
      (s, o) => s + Math.round(o.current_mrr_cents * (1 - o.win_probability)),
      0,
    );
    const expectedSave = offers.reduce((s, o) => s + o.expected_save_cents, 0);
    const netMRR = totalMRR - expectedChurn + expectedSave;

    const steps = [
      { label: "At-Risk MRR", value: totalMRR, cumStart: 0, cumEnd: totalMRR, color: "#6366f1" },
      { label: "Expected Churn", value: -expectedChurn, cumStart: totalMRR, cumEnd: totalMRR - expectedChurn, color: "#ef4444" },
      { label: "Expected Saves", value: expectedSave, cumStart: totalMRR - expectedChurn, cumEnd: totalMRR - expectedChurn + expectedSave, color: "#22c55e" },
      { label: "Net Projected", value: netMRR, cumStart: 0, cumEnd: netMRR, color: "#8b5cf6" },
    ];

    const maxVal = Math.max(...steps.map((s) => Math.max(s.cumStart, s.cumEnd, s.value)));
    const scale = maxVal > 0 ? plotH / maxVal : 1;

    const barW = plotW / steps.length;
    const innerW = barW * 0.5;

    return {
      bars: steps.map((s, i) => {
        const top = Math.min(s.cumStart, s.cumEnd);
        const barH = Math.abs(s.cumEnd - s.cumStart);
        return {
          ...s,
          x: padding.left + i * barW + (barW - innerW) / 2,
          y: padding.top + plotH - (top + barH) * scale,
          w: innerW,
          h: Math.max(barH * scale, 2),
          labelX: padding.left + i * barW + barW / 2,
        };
      }),
    };
  }, [offers, plotW, plotH, padding.left, padding.top]);

  if (offers.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No offers to visualise
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: height }}
    >
      {/* Bars */}
      {bars.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={4}
            fill={b.color}
            fillOpacity={0.85}
          />
          {/* Value label */}
          <text
            x={b.labelX}
            y={b.y - 6}
            textAnchor="middle"
            className="fill-foreground text-[11px] font-medium"
          >
            {formatCents(Math.abs(b.value))}
          </text>
          {/* Category label */}
          <text
            x={b.labelX}
            y={height - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {b.label}
          </text>
        </g>
      ))}

      {/* Connector lines between bars */}
      {bars.slice(0, -1).map((b, i) => {
        const next = bars[i + 1];
        if (!next) return null;
        const y = b.y + (b.value < 0 ? b.h : 0);
        return (
          <line
            key={`c-${i}`}
            x1={b.x + b.w}
            y1={y}
            x2={next.x}
            y2={y}
            stroke="currentColor"
            className="text-border"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        );
      })}
    </svg>
  );
}
