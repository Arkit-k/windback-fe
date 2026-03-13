"use client";

// ── Shared helpers ──────────────────────────────────────────────────────────

const PADDING = { top: 24, right: 16, bottom: 32, left: 44 };

function formatLabel(label: string): string {
  const d = new Date(label);
  if (isNaN(d.getTime())) return label;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Build a smooth quadratic-bezier path through a series of points. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` Q ${cpx} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2} Q ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function NoData({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={{ height }}
    >
      No data
    </div>
  );
}

// ── BarChart ────────────────────────────────────────────────────────────────

export interface BarChartDatum {
  label: string;
  values: { value: number; color: string; name: string }[];
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  if (!data || data.length === 0) return <NoData height={height} />;

  const viewW = 600;
  const viewH = height;
  const plotW = viewW - PADDING.left - PADDING.right;
  const plotH = viewH - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(1, ...data.flatMap((d) => d.values.map((v) => v.value)));
  const seriesCount = data[0]?.values.length ?? 0;
  const groupW = plotW / data.length;
  const barW = Math.max(2, (groupW * 0.7) / seriesCount);
  const gap = (groupW - barW * seriesCount) / 2;

  // Y-axis ticks
  const yTicks = 4;
  const step = maxVal / yTicks;

  // Unique legend entries
  const legend = data[0]?.values.map((v) => ({ name: v.name, color: v.color })) ?? [];

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-2 flex flex-wrap gap-4 px-1 text-xs text-muted-foreground">
        {legend.map((l) => (
          <span key={l.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: l.color }}
            />
            {l.name}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        {/* Y gridlines + labels */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const val = Math.round(step * i);
          const y = PADDING.top + plotH - (plotH * val) / maxVal;
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
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, di) => {
          const groupX = PADDING.left + di * groupW + gap;
          return (
            <g key={d.label}>
              {d.values.map((v, vi) => {
                const barH = (plotH * v.value) / maxVal;
                const x = groupX + vi * barW;
                const y = PADDING.top + plotH - barH;
                return (
                  <rect
                    key={vi}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(0, barH)}
                    rx={1.5}
                    fill={v.color}
                    opacity={0.85}
                  >
                    <title>{`${d.label} — ${v.name}: ${v.value}`}</title>
                  </rect>
                );
              })}
              {/* X label */}
              <text
                x={groupX + (barW * seriesCount) / 2}
                y={PADDING.top + plotH + 16}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {formatLabel(d.label)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── LineChart ───────────────────────────────────────────────────────────────

export interface LineChartDatum {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDatum[];
  height?: number;
  color?: string;
  fillColor?: string;
}

export function LineChart({
  data,
  height = 200,
  color = "#6366f1",
  fillColor = "rgba(99,102,241,0.15)",
}: LineChartProps) {
  if (!data || data.length === 0) return <NoData height={height} />;

  const viewW = 600;
  const viewH = height;
  const plotW = viewW - PADDING.left - PADDING.right;
  const plotH = viewH - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: PADDING.left + (plotW * i) / Math.max(1, data.length - 1),
    y: PADDING.top + plotH - (plotH * (d.value - minVal)) / range,
  }));

  const linePath = smoothPath(points);
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${PADDING.top + plotH}` +
    ` L ${points[0].x} ${PADDING.top + plotH} Z`;

  const gradientId = `line-fill-${Math.random().toString(36).slice(2, 8)}`;

  // Y ticks
  const yTicks = 4;
  const step = range / yTicks;

  // X labels — show up to 7 evenly spaced
  const labelInterval = Math.max(1, Math.ceil(data.length / 7));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.7} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Y gridlines + labels */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const val = minVal + step * i;
          const y = PADDING.top + plotH - (plotH * (val - minVal)) / range;
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
                {val < 1 ? `${(val * 100).toFixed(0)}%` : val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} />

        {/* Dots + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3} fill={color}>
              <title>{`${data[i].label}: ${data[i].value < 1 ? `${(data[i].value * 100).toFixed(1)}%` : data[i].value}`}</title>
            </circle>
            {i % labelInterval === 0 && (
              <text
                x={p.x}
                y={PADDING.top + plotH + 16}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {formatLabel(data[i].label)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── AreaChart ───────────────────────────────────────────────────────────────

export interface AreaChartDatum {
  label: string;
  series: { value: number; color: string; fillColor: string; name: string }[];
}

interface AreaChartProps {
  data: AreaChartDatum[];
  height?: number;
}

export function AreaChart({ data, height = 200 }: AreaChartProps) {
  if (!data || data.length === 0) return <NoData height={height} />;

  const viewW = 600;
  const viewH = height;
  const plotW = viewW - PADDING.left - PADDING.right;
  const plotH = viewH - PADDING.top - PADDING.bottom;

  const seriesCount = data[0]?.series.length ?? 0;
  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => d.series.map((s) => s.value)),
  );

  const gradientIds = Array.from({ length: seriesCount }, () =>
    `area-fill-${Math.random().toString(36).slice(2, 8)}`,
  );

  // Y ticks
  const yTicks = 4;
  const step = maxVal / yTicks;

  // X labels
  const labelInterval = Math.max(1, Math.ceil(data.length / 7));

  // Build a legend from first datum
  const legend = data[0]?.series.map((s) => ({ name: s.name, color: s.color })) ?? [];

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-2 flex flex-wrap gap-4 px-1 text-xs text-muted-foreground">
        {legend.map((l) => (
          <span key={l.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: l.color }}
            />
            {l.name}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <defs>
          {data[0]?.series.map((s, si) => (
            <linearGradient key={si} id={gradientIds[si]} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.fillColor} stopOpacity={0.6} />
              <stop offset="100%" stopColor={s.fillColor} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>

        {/* Y gridlines + labels */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const val = Math.round(step * i);
          const y = PADDING.top + plotH - (plotH * val) / maxVal;
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
                {val}
              </text>
            </g>
          );
        })}

        {/* Render each series */}
        {Array.from({ length: seriesCount }).map((_, si) => {
          const points = data.map((d, di) => ({
            x: PADDING.left + (plotW * di) / Math.max(1, data.length - 1),
            y: PADDING.top + plotH - (plotH * d.series[si].value) / maxVal,
          }));

          const linePath = smoothPath(points);
          const areaPath =
            linePath +
            ` L ${points[points.length - 1].x} ${PADDING.top + plotH}` +
            ` L ${points[0].x} ${PADDING.top + plotH} Z`;

          const seriesColor = data[0].series[si].color;

          return (
            <g key={si}>
              <path d={areaPath} fill={`url(#${gradientIds[si]})`} />
              <path d={linePath} fill="none" stroke={seriesColor} strokeWidth={2} />
              {points.map((p, pi) => (
                <circle key={pi} cx={p.x} cy={p.y} r={2.5} fill={seriesColor}>
                  <title>{`${data[pi].label} — ${data[pi].series[si].name}: ${data[pi].series[si].value}`}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => {
          if (i % labelInterval !== 0) return null;
          const x = PADDING.left + (plotW * i) / Math.max(1, data.length - 1);
          return (
            <text
              key={i}
              x={x}
              y={PADDING.top + plotH + 16}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {formatLabel(d.label)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
