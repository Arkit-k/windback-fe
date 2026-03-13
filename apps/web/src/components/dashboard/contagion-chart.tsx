"use client";

import { useMemo } from "react";
import type {
  ContagionNode,
  ContagionEdge,
  ContagionCluster,
} from "@/hooks/use-contagion";

// ── Color helpers ────────────────────────────────────────────────────

function nodeColor(node: ContagionNode): string {
  if (node.is_churned) return "#ef4444"; // red-500
  if (node.risk_score >= 70) return "#f97316"; // orange-500
  if (node.risk_score >= 40) return "#eab308"; // yellow-500
  return "#22c55e"; // green-500
}

function riskBadgeColor(risk: string): string {
  switch (risk) {
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    default:
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  }
}

function gaugeColor(score: number): string {
  if (score >= 70) return "#ef4444";
  if (score >= 40) return "#f97316";
  if (score >= 20) return "#eab308";
  return "#22c55e";
}

// ── ContagionGraph ───────────────────────────────────────────────────

interface ContagionGraphProps {
  nodes: ContagionNode[];
  edges: ContagionEdge[];
  clusters: ContagionCluster[];
}

interface PositionedNode extends ContagionNode {
  x: number;
  y: number;
}

export function ContagionGraph({ nodes, edges, clusters }: ContagionGraphProps) {
  const width = 700;
  const height = 700;
  const cx = width / 2;
  const cy = height / 2;

  const positioned = useMemo(() => {
    if (nodes.length === 0) return [] as PositionedNode[];

    // Group nodes by segment for circular cluster layout
    const segmentOrder = ["starter", "growth", "scale"];
    const groups: Record<string, ContagionNode[]> = {};
    for (const n of nodes) {
      (groups[n.segment] ??= []).push(n);
    }

    const result: PositionedNode[] = [];
    const segmentKeys = segmentOrder.filter((s) => groups[s]?.length);
    // Include any segments not in our predefined list
    for (const seg of Object.keys(groups)) {
      if (!segmentKeys.includes(seg)) segmentKeys.push(seg);
    }

    const segCount = segmentKeys.length;
    const baseRadius = Math.min(cx, cy) * 0.6;

    segmentKeys.forEach((seg, si) => {
      const segAngle = (2 * Math.PI * si) / segCount - Math.PI / 2;
      const segNodes = groups[seg] ?? [];
      const clusterCx = cx + baseRadius * Math.cos(segAngle);
      const clusterCy = cy + baseRadius * Math.sin(segAngle);

      segNodes.forEach((n, ni) => {
        // Spread nodes in a small circle around the cluster center
        const subRadius = Math.min(30 + segNodes.length * 5, baseRadius * 0.45);
        const subAngle = (2 * Math.PI * ni) / segNodes.length;
        result.push({
          ...n,
          x: clusterCx + subRadius * Math.cos(subAngle),
          y: clusterCy + subRadius * Math.sin(subAngle),
        });
      });
    });

    return result;
  }, [nodes, cx, cy]);

  const posMap = useMemo(() => {
    const m = new Map<string, PositionedNode>();
    for (const p of positioned) m.set(p.customer_email, p);
    return m;
  }, [positioned]);

  // Cluster label positions
  const clusterLabels = useMemo(() => {
    const segmentOrder = ["starter", "growth", "scale"];
    const segmentKeys = segmentOrder.filter((s) =>
      nodes.some((n) => n.segment === s),
    );
    for (const n of nodes) {
      if (!segmentKeys.includes(n.segment)) segmentKeys.push(n.segment);
    }
    const baseRadius = Math.min(cx, cy) * 0.6;
    return segmentKeys.map((seg, i) => {
      const angle = (2 * Math.PI * i) / segmentKeys.length - Math.PI / 2;
      const labelRadius = baseRadius + 60;
      return {
        segment: seg,
        x: cx + labelRadius * Math.cos(angle),
        y: cy + labelRadius * Math.sin(angle),
      };
    });
  }, [nodes, cx, cy]);

  if (nodes.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: 600 }}
    >
      {/* Edges */}
      {edges.map((e, i) => {
        const src = posMap.get(e.source);
        const tgt = posMap.get(e.target);
        if (!src || !tgt) return null;
        return (
          <line
            key={`edge-${i}`}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke="currentColor"
            className="text-muted-foreground/30"
            strokeWidth={1 + e.weight * 2}
            opacity={0.15 + e.weight * 0.6}
          />
        );
      })}

      {/* Nodes */}
      {positioned.map((n) => {
        const radius = 4 + (n.risk_score / 100) * 10;
        return (
          <g key={n.customer_email}>
            <circle
              cx={n.x}
              cy={n.y}
              r={radius}
              fill={nodeColor(n)}
              opacity={0.85}
              stroke={n.is_churned ? "#991b1b" : "transparent"}
              strokeWidth={n.is_churned ? 2 : 0}
            />
            <title>
              {n.customer_name || n.customer_email} — Risk: {n.risk_score},{" "}
              {n.is_churned ? "Churned" : "Active"}, Segment: {n.segment}
            </title>
          </g>
        );
      })}

      {/* Cluster labels */}
      {clusterLabels.map((cl) => (
        <text
          key={cl.segment}
          x={cl.x}
          y={cl.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-xs font-semibold"
          fontSize={13}
        >
          {cl.segment.charAt(0).toUpperCase() + cl.segment.slice(1)}
        </text>
      ))}
    </svg>
  );
}

// ── ClusterRiskBars ──────────────────────────────────────────────────

interface ClusterRiskBarsProps {
  clusters: ContagionCluster[];
}

export function ClusterRiskBars({ clusters }: ClusterRiskBarsProps) {
  if (clusters.length === 0) return null;

  const maxRate = Math.max(...clusters.map((c) => c.churn_rate), 0.01);

  return (
    <div className="space-y-3">
      {clusters.map((cluster) => (
        <div key={cluster.id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground capitalize">
              {cluster.segment}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {cluster.churned_count}/{cluster.node_count} churned
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${riskBadgeColor(cluster.contagion_risk)}`}
              >
                {cluster.contagion_risk}
              </span>
            </div>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(cluster.churn_rate / maxRate) * 100}%`,
                backgroundColor: gaugeColor(cluster.churn_rate * 100),
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Churn rate: {(cluster.churn_rate * 100).toFixed(1)}%</span>
            <span>Avg risk: {cluster.avg_risk_score.toFixed(0)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ContagionScoreGauge ──────────────────────────────────────────────

interface ContagionScoreGaugeProps {
  score: number;
}

export function ContagionScoreGauge({ score }: ContagionScoreGaugeProps) {
  // Semicircle gauge (speedometer style)
  const radius = 80;
  const strokeWidth = 14;
  const cx = 100;
  const cy = 95;

  // Arc from 180deg to 0deg (left to right semicircle)
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweep = startAngle - endAngle;
  const filledAngle = startAngle - (score / 100) * sweep;

  const arcX1 = cx + radius * Math.cos(startAngle);
  const arcY1 = cy - radius * Math.sin(startAngle);
  const arcX2 = cx + radius * Math.cos(filledAngle);
  const arcY2 = cy - radius * Math.sin(filledAngle);

  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy - radius * Math.sin(endAngle);

  const largeArcBg = 1;
  const largeArcFill = score > 50 ? 1 : 0;

  const color = gaugeColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48">
        {/* Background arc */}
        <path
          d={`M ${arcX1} ${arcY1} A ${radius} ${radius} 0 ${largeArcBg} 1 ${bgX2} ${bgY2}`}
          fill="none"
          stroke="currentColor"
          className="text-secondary"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {score > 0 && (
          <path
            d={`M ${arcX1} ${arcY1} A ${radius} ${radius} 0 ${largeArcFill} 1 ${arcX2} ${arcY2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {/* Score text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-foreground text-3xl font-bold"
          fontSize={32}
          fontWeight={700}
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={11}
        >
          / 100
        </text>
      </svg>
      <span className="mt-1 text-sm font-medium text-muted-foreground">
        Contagion Score
      </span>
    </div>
  );
}
