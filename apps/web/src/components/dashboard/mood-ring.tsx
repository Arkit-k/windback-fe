"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MoodSnapshot, MoodHistoryPoint } from "@/types/api";

/* ─── Color & level helpers ──────────────────────────────────────── */

const MOOD_COLORS: Record<string, string> = {
  thriving: "#10b981",
  content: "#3b82f6",
  uneasy: "#eab308",
  stressed: "#f97316",
  crisis: "#ef4444",
};

const MOOD_EMOJIS: Record<string, string> = {
  thriving: "\u{1F525}", // fire
  content: "\u{1F60A}",  // smiling
  uneasy: "\u{1F914}",   // thinking
  stressed: "\u{1F630}", // anxious
  crisis: "\u{1F6A8}",   // siren
};

const MOOD_LABELS: Record<string, string> = {
  thriving: "Thriving",
  content: "Content",
  uneasy: "Uneasy",
  stressed: "Stressed",
  crisis: "Crisis",
};

function colorForLevel(level: string): string {
  return MOOD_COLORS[level] ?? "#6b7280";
}

/* ─── MoodRing ───────────────────────────────────────────────────── */

interface MoodRingProps {
  snapshot: MoodSnapshot;
}

export function MoodRing({ snapshot }: MoodRingProps) {
  const color = colorForLevel(snapshot.mood_level);
  const emoji = MOOD_EMOJIS[snapshot.mood_level] ?? "";
  const label = MOOD_LABELS[snapshot.mood_level] ?? snapshot.mood_level;

  // Component arcs: 5 segments filling a full ring (360 degrees)
  const components = useMemo(() => {
    const items = [
      { label: "Engagement", score: snapshot.engagement_score, weight: 0.30 },
      { label: "Churn Vel.", score: snapshot.churn_velocity_score, weight: 0.25 },
      { label: "Recovery", score: snapshot.recovery_score, weight: 0.20 },
      { label: "Support", score: snapshot.support_score, weight: 0.15 },
      { label: "Growth", score: snapshot.growth_score, weight: 0.10 },
    ];
    let startAngle = -90; // start from top
    return items.map((item) => {
      const sweep = item.weight * 360;
      const arc = { ...item, startAngle, sweep };
      startAngle += sweep;
      return arc;
    });
  }, [snapshot]);

  // SVG arc path helper
  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngleDeg: number,
    sweepDeg: number,
  ) {
    const start = (startAngleDeg * Math.PI) / 180;
    const end = ((startAngleDeg + sweepDeg) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  // Pulse speed: faster when mood is changing
  const pulseSpeed = Math.abs(snapshot.delta) > 5 ? 1.5 : 3;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="relative flex flex-col items-center"
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
          animation: `moodPulse ${pulseSpeed}s ease-in-out infinite`,
        }}
      />

      <svg
        viewBox="0 0 200 200"
        className="relative h-56 w-56 md:h-72 md:w-72"
      >
        {/* Outer glow ring */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.2"
          style={{
            animation: `moodPulse ${pulseSpeed}s ease-in-out infinite`,
          }}
        />

        {/* Background track */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />

        {/* Component arc segments */}
        {components.map((comp, i) => {
          const filledSweep = (comp.score / 100) * comp.sweep;
          return (
            <motion.path
              key={comp.label}
              d={describeArc(100, 100, 85, comp.startAngle, filledSweep)}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 + (comp.score / 100) * 0.6 }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
                delay: i * 0.1,
              }}
            />
          );
        })}

        {/* Full mood arc overlay */}
        <motion.circle
          cx="100"
          cy="100"
          r="76"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${(snapshot.mood_score / 100) * 2 * Math.PI * 76} ${2 * Math.PI * 76}`}
          strokeDashoffset={2 * Math.PI * 76 * 0.25}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${2 * Math.PI * 76}` }}
          animate={{
            strokeDasharray: `${(snapshot.mood_score / 100) * 2 * Math.PI * 76} ${2 * Math.PI * 76}`,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 20, delay: 0.3 }}
        />

        {/* Center content */}
        <text
          x="100"
          y="85"
          textAnchor="middle"
          className="fill-foreground text-[2.5rem] font-bold"
          style={{ fontSize: "2.5rem", fontWeight: 700 }}
        >
          {snapshot.mood_score}
        </text>
        <text
          x="100"
          y="108"
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: "0.75rem" }}
        >
          {label}
        </text>
        <text
          x="100"
          y="128"
          textAnchor="middle"
          style={{ fontSize: "1.5rem" }}
        >
          {emoji}
        </text>
      </svg>

      {/* Delta indicator */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 flex items-center gap-1.5 text-sm"
      >
        {snapshot.trend === "improving" && (
          <span className="text-emerald-500">&#9650; +{snapshot.delta}</span>
        )}
        {snapshot.trend === "declining" && (
          <span className="text-red-500">&#9660; {snapshot.delta}</span>
        )}
        {snapshot.trend === "stable" && (
          <span className="text-muted-foreground">&#9644; Stable</span>
        )}
        <span className="text-muted-foreground">from previous</span>
      </motion.div>
    </motion.div>
  );
}

/* ─── MoodTimeline ───────────────────────────────────────────────── */

interface MoodTimelineProps {
  history: MoodHistoryPoint[];
}

export function MoodTimeline({ history }: MoodTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex h-12 items-center justify-center rounded-lg border border-border bg-card/50">
        <span className="text-xs text-muted-foreground">
          Timeline data will appear after snapshots are collected
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">24h Mood Timeline</h3>
      <div className="flex h-10 items-end gap-[2px] rounded-lg border border-border bg-card/50 p-2">
        {history.map((point, i) => {
          const color = colorForLevel(point.level);
          const height = Math.max(8, (point.score / 100) * 100);
          return (
            <motion.div
              key={`${point.timestamp}-${i}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${height}%`, opacity: 1 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 100, damping: 15 }}
              className="group relative flex-1 cursor-pointer rounded-sm"
              style={{ backgroundColor: color }}
              title={`Score: ${point.score} (${MOOD_LABELS[point.level] ?? point.level})`}
            >
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-14 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                <div className="font-medium" style={{ color }}>{point.score}</div>
                <div className="text-muted-foreground">
                  {new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── MoodBreakdown ──────────────────────────────────────────────── */

interface MoodBreakdownProps {
  snapshot: MoodSnapshot;
}

const COMPONENT_INFO = [
  { key: "engagement_score", label: "Engagement", desc: "Event activity trend" },
  { key: "churn_velocity_score", label: "Churn Velocity", desc: "New churn rate (inverse)" },
  { key: "recovery_score", label: "Recovery", desc: "Win-back success" },
  { key: "support_score", label: "Support", desc: "Payment failure frequency (inverse)" },
  { key: "growth_score", label: "Growth", desc: "New customer acquisition" },
] as const;

export function MoodBreakdown({ snapshot }: MoodBreakdownProps) {
  const moodColor = colorForLevel(snapshot.mood_level);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Component Scores</h3>
      <div className="space-y-3">
        {COMPONENT_INFO.map((comp, i) => {
          const score = snapshot[comp.key] as number;
          const barColor = score >= 60 ? moodColor : "#6b7280";
          return (
            <motion.div
              key={comp.key}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{comp.label}</span>
                <span className="font-medium text-foreground">{score}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 50,
                    damping: 15,
                    delay: 0.2 + i * 0.08,
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60">{comp.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── MoodBackground ─────────────────────────────────────────────── */

interface MoodBackgroundProps {
  moodColor: string;
  children: React.ReactNode;
}

export function MoodBackground({ moodColor, children }: MoodBackgroundProps) {
  return (
    <div className="relative min-h-full">
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${moodColor}08 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ─── MoodRingSkeleton (loading state) ───────────────────────────── */

export function MoodRingSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-56 w-56 md:h-72 md:w-72">
        <div
          className="absolute inset-0 rounded-full border-8 border-muted/20"
          style={{ animation: "moodPulse 2s ease-in-out infinite" }}
        />
        <div className="absolute inset-4 rounded-full border-4 border-muted/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="h-10 w-16 animate-pulse rounded bg-muted/20" />
          <div className="mt-2 h-4 w-12 animate-pulse rounded bg-muted/10" />
        </div>
      </div>
      <div className="mt-4 h-4 w-32 animate-pulse rounded bg-muted/10" />
    </div>
  );
}

/* ─── Global CSS keyframes (injected once) ───────────────────────── */

export function MoodRingStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes moodPulse {
        0%, 100% {
          opacity: 0.4;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }
    ` }} />
  );
}
