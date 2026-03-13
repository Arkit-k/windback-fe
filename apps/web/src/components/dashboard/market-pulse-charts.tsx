"use client";

import type { MarketSnapshot, MarketDemandCell } from "@/types/api";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const PADDING = { top: 24, right: 16, bottom: 32, left: 44 };

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Cubic bezier smooth path through points. */
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
      {message ?? "No data"}
    </div>
  );
}

const GREEN = "#10b981";
const RED = "#ef4444";
const YELLOW = "#eab308";

/* -------------------------------------------------------------------------- */
/*  1. CandlestickChart                                                        */
/* -------------------------------------------------------------------------- */

interface CandlestickChartProps {
  snapshots: MarketSnapshot[];
  height?: number;
}

export function CandlestickChart({
  snapshots,
  height = 320,
}: CandlestickChartProps) {
  if (!snapshots || snapshots.length === 0) {
    return <NoData height={height} message="No market data yet" />;
  }

  const viewW = 900;
  const viewH = height;
  const plotW = viewW - PADDING.left - PADDING.right;
  const plotH = viewH - PADDING.top - PADDING.bottom;

  const minScore = 0;
  const maxScore = 100;
  const range = maxScore - minScore;

  const toY = (v: number) =>
    PADDING.top + plotH - ((v - minScore) / range) * plotH;

  const candleW = Math.max(2, (plotW / snapshots.length) * 0.6);
  const gap = plotW / snapshots.length;

  // X-axis label interval (~every 24 candles)
  const labelInterval = Math.max(1, Math.round(snapshots.length / Math.ceil(snapshots.length / 24)));

  // Prediction points
  const predPoints = snapshots.map((s, i) => ({
    x: PADDING.left + gap * i + gap / 2,
    y: toY(s.predicted_score),
  }));

  // Confidence band
  const upperBand = snapshots.map((s, i) => ({
    x: predPoints[i].x,
    y: toY(Math.min(100, s.predicted_score + (1 - s.confidence) * 10)),
  }));
  const lowerBand = snapshots.map((s, i) => ({
    x: predPoints[i].x,
    y: toY(Math.max(0, s.predicted_score - (1 - s.confidence) * 10)),
  }));

  const bandPath =
    upperBand.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " " +
    [...lowerBand].reverse().map((p, i) => `${i === 0 ? "L" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  const predPathD = predPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Candlestick chart"
    >
      {/* Y gridlines + labels */}
      {[0, 20, 40, 60, 80, 100].map((val) => {
        const y = toY(val);
        return (
          <g key={val}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={viewW - PADDING.right}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeDasharray={val === 0 ? undefined : "4 4"}
              strokeWidth={0.5}
            />
            <text
              x={PADDING.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Confidence band */}
      <path d={bandPath} fill="var(--accent, #6366f1)" opacity={0.1} />

      {/* Prediction dashed line */}
      <path
        d={predPathD}
        fill="none"
        stroke="var(--accent, #6366f1)"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        opacity={0.7}
      />

      {/* Candles */}
      {snapshots.map((s, i) => {
        const cx = PADDING.left + gap * i + gap / 2;
        const bullish = s.close_score >= s.open_score;
        const color = bullish ? GREEN : RED;
        const bodyTop = toY(Math.max(s.open_score, s.close_score));
        const bodyBottom = toY(Math.min(s.open_score, s.close_score));
        const bodyH = Math.max(1, bodyBottom - bodyTop);

        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={cx}
              y1={toY(s.high_score)}
              x2={cx}
              y2={toY(s.low_score)}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={cx - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={color}
              rx={1}
            >
              <title>
                {`O: ${s.open_score.toFixed(1)} H: ${s.high_score.toFixed(1)} L: ${s.low_score.toFixed(1)} C: ${s.close_score.toFixed(1)}\nPredicted: ${s.predicted_score.toFixed(1)} (${(s.confidence * 100).toFixed(0)}%)\nVolume: ${s.volume}`}
              </title>
            </rect>

            {/* X label */}
            {i % labelInterval === 0 && (
              <text
                x={cx}
                y={PADDING.top + plotH + 16}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {formatDate(s.period_start)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  2. VolumeBarChart                                                          */
/* -------------------------------------------------------------------------- */

interface VolumeBarChartProps {
  snapshots: MarketSnapshot[];
  height?: number;
}

export function VolumeBarChart({
  snapshots,
  height = 80,
}: VolumeBarChartProps) {
  if (!snapshots || snapshots.length === 0) return <NoData height={height} />;

  const viewW = 900;
  const viewH = height;
  const plotW = viewW - PADDING.left - PADDING.right;
  const plotH = viewH - PADDING.top - 8; // slim bottom margin

  const maxVol = Math.max(1, ...snapshots.map((s) => s.volume));
  const gap = plotW / snapshots.length;
  const barW = Math.max(2, gap * 0.6);

  // Y-axis: 2 ticks
  const midVol = Math.round(maxVol / 2);

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Volume bar chart"
    >
      {/* Y labels */}
      {[0, midVol, maxVol].map((val) => {
        const y = PADDING.top + plotH - (plotH * val) / maxVol;
        return (
          <text
            key={val}
            x={PADDING.left - 6}
            y={y + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
          </text>
        );
      })}

      {/* Bars */}
      {snapshots.map((s, i) => {
        const cx = PADDING.left + gap * i + gap / 2;
        const bullish = s.close_score >= s.open_score;
        const barH = (plotH * s.volume) / maxVol;
        return (
          <rect
            key={i}
            x={cx - barW / 2}
            y={PADDING.top + plotH - barH}
            width={barW}
            height={Math.max(0, barH)}
            fill={bullish ? GREEN : RED}
            opacity={0.6}
            rx={1}
          >
            <title>{`Volume: ${s.volume}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. ChurnPredictionLineChart                                                */
/* -------------------------------------------------------------------------- */

interface ChurnPredictionLineChartProps {
  snapshots: MarketSnapshot[];
}

export function ChurnPredictionLineChart({
  snapshots,
}: ChurnPredictionLineChartProps) {
  if (!snapshots || snapshots.length === 0) return <NoData height={200} />;

  const viewW = 600;
  const viewH = 200;
  const plotW = viewW - PADDING.left - PADDING.right;
  const plotH = viewH - PADDING.top - PADDING.bottom;

  const allVals = snapshots.flatMap((s) => [s.close_score, s.predicted_score]);
  const maxVal = Math.max(100, ...allVals);
  const minVal = Math.min(0, ...allVals);
  const range = maxVal - minVal || 1;

  const toX = (i: number) =>
    PADDING.left + (plotW * i) / Math.max(1, snapshots.length - 1);
  const toY = (v: number) =>
    PADDING.top + plotH - ((v - minVal) / range) * plotH;

  const actualPts = snapshots.map((s, i) => ({ x: toX(i), y: toY(s.close_score) }));
  const predPts = snapshots.map((s, i) => ({ x: toX(i), y: toY(s.predicted_score) }));

  const actualPath = cubicPath(actualPts);
  const predPath = cubicPath(predPts);

  // Build fill segments between the two lines
  // Use polygon strips for simplicity
  const fillSegments: React.ReactElement[] = [];
  for (let i = 0; i < snapshots.length - 1; i++) {
    const predicted = (snapshots[i].predicted_score + snapshots[i + 1].predicted_score) / 2;
    const actual = (snapshots[i].close_score + snapshots[i + 1].close_score) / 2;
    const color = predicted > actual ? GREEN : RED;
    const pts = `${actualPts[i].x},${actualPts[i].y} ${actualPts[i + 1].x},${actualPts[i + 1].y} ${predPts[i + 1].x},${predPts[i + 1].y} ${predPts[i].x},${predPts[i].y}`;
    fillSegments.push(
      <polygon key={i} points={pts} fill={color} opacity={0.12} />
    );
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-2 flex flex-wrap gap-4 px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: "var(--accent, #6366f1)" }} />
          Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{
              backgroundColor: "var(--accent, #6366f1)",
              opacity: 0.6,
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, var(--accent, #6366f1) 2px, var(--accent, #6366f1) 4px)",
            }}
          />
          Predicted
        </span>
      </div>

      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Churn prediction line chart"
      >
        {/* Y gridlines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const val = minVal + (range * i) / 4;
          const y = toY(val);
          return (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={viewW - PADDING.right}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeDasharray={i === 0 ? undefined : "4 4"}
                strokeWidth={0.5}
              />
              <text
                x={PADDING.left - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize={10}
              >
                {val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Fill between lines */}
        {fillSegments}

        {/* Actual line */}
        <path
          d={actualPath}
          fill="none"
          stroke="var(--accent, #6366f1)"
          strokeWidth={2}
        />

        {/* Predicted line (dashed) */}
        <path
          d={predPath}
          fill="none"
          stroke="var(--accent, #6366f1)"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.6}
        />

        {/* Dots */}
        {actualPts.map((p, i) => (
          <circle key={`a${i}`} cx={p.x} cy={p.y} r={2.5} fill="var(--accent, #6366f1)">
            <title>{`Actual: ${snapshots[i].close_score.toFixed(1)}`}</title>
          </circle>
        ))}
        {predPts.map((p, i) => (
          <circle key={`p${i}`} cx={p.x} cy={p.y} r={2} fill="var(--accent, #6366f1)" opacity={0.5}>
            <title>{`Predicted: ${snapshots[i].predicted_score.toFixed(1)}`}</title>
          </circle>
        ))}

        {/* X labels */}
        {snapshots.map((s, i) => {
          const interval = Math.max(1, Math.ceil(snapshots.length / 7));
          if (i % interval !== 0) return null;
          return (
            <text
              key={i}
              x={toX(i)}
              y={PADDING.top + plotH + 16}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {formatDate(s.period_start)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  4. DemandHeatmap                                                           */
/* -------------------------------------------------------------------------- */

interface DemandHeatmapProps {
  cells: MarketDemandCell[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DemandHeatmap({ cells }: DemandHeatmapProps) {
  if (!cells || cells.length === 0) {
    return <NoData height={240} message="No demand data" />;
  }

  const viewW = 720;
  const viewH = 240;
  const labelLeft = 36;
  const labelTop = 20;
  const gridW = viewW - labelLeft - 8;
  const gridH = viewH - labelTop - 8;
  const cellW = gridW / 24;
  const cellH = gridH / 7;

  // Build lookup
  const lookup = new Map<string, MarketDemandCell>();
  for (const c of cells) {
    lookup.set(`${c.day_of_week}-${c.hour}`, c);
  }

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Demand heatmap"
    >
      {/* Column labels (hours) */}
      {Array.from({ length: 24 }).map((_, h) => (
        <text
          key={h}
          x={labelLeft + h * cellW + cellW / 2}
          y={labelTop - 6}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={8}
        >
          {h}
        </text>
      ))}

      {/* Row labels (days) */}
      {DAY_LABELS.map((day, d) => (
        <text
          key={d}
          x={labelLeft - 4}
          y={labelTop + d * cellH + cellH / 2 + 3}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize={9}
        >
          {day}
        </text>
      ))}

      {/* Cells */}
      {Array.from({ length: 7 }).map((_, d) =>
        Array.from({ length: 24 }).map((_, h) => {
          const cell = lookup.get(`${d}-${h}`);
          const intensity = cell?.intensity ?? 0;
          return (
            <rect
              key={`${d}-${h}`}
              x={labelLeft + h * cellW + 1}
              y={labelTop + d * cellH + 1}
              width={cellW - 2}
              height={cellH - 2}
              rx={2}
              fill="var(--accent, #6366f1)"
              opacity={Math.max(0.04, intensity)}
            >
              {cell && (
                <title>{`${cell.event_type}: ${cell.count} events`}</title>
              )}
            </rect>
          );
        })
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  5. HealthScoreSparkline                                                    */
/* -------------------------------------------------------------------------- */

interface HealthScoreSparklineProps {
  snapshots: MarketSnapshot[];
  width?: number;
  height?: number;
}

export function HealthScoreSparkline({
  snapshots,
  width = 100,
  height = 32,
}: HealthScoreSparklineProps) {
  const data = (snapshots ?? []).slice(-24);
  if (data.length < 2) return null;

  const values = data.map((s) => s.close_score);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pad = 2;

  const first = values[0];
  const last = values[values.length - 1];
  const color = last > first ? GREEN : last < first ? RED : "var(--muted-foreground, #888)";

  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      aria-label="Health score sparkline"
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

/* -------------------------------------------------------------------------- */
/*  6. ConfidenceGauge                                                         */
/* -------------------------------------------------------------------------- */

interface ConfidenceGaugeProps {
  confidence: number;
  size?: number;
}

export function ConfidenceGauge({
  confidence,
  size = 120,
}: ConfidenceGaugeProps) {
  const w = size;
  const h = size * (70 / 120); // maintain 120:70 ratio
  const cx = w / 2;
  const cy = h - 6;
  const r = Math.min(cx, cy) - 4;

  const clampedConf = Math.max(0, Math.min(1, confidence));
  const pct = Math.round(clampedConf * 100);

  // Color based on confidence
  const color = clampedConf < 0.3 ? RED : clampedConf <= 0.6 ? YELLOW : GREEN;

  // Arc helper: angle 0 = right (3 o'clock).
  // We draw from 180deg to 0deg (left to right across the top).
  const arcPoint = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // Background track: 180 -> 0 (full semicircle)
  const bgStart = arcPoint(180);
  const bgEnd = arcPoint(0);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Filled arc: 180 -> 180 - (confidence * 180)
  const fillAngle = 180 - clampedConf * 180;
  const fillEnd = arcPoint(fillAngle);
  const largeArc = clampedConf > 0.5 ? 1 : 0;
  const fillPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`;

  return (
    <svg
      width={w}
      height={h + 14}
      viewBox={`0 0 ${w} ${h + 14}`}
      className="inline-block"
      aria-label={`Confidence gauge: ${pct}%`}
    >
      {/* Background track */}
      <path
        d={bgPath}
        fill="none"
        stroke="currentColor"
        className="text-border"
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* Filled arc */}
      <path
        d={fillPath}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* Percentage text */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground"
        fontSize={Math.round(size / 5)}
        fontWeight={600}
      >
        {pct}%
      </text>

      {/* Label */}
      <text
        x={cx}
        y={h + 10}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={Math.round(size / 12)}
      >
        Confidence
      </text>
    </svg>
  );
}
