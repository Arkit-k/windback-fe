"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@windback/ui";
import {
  MoodRing,
  MoodTimeline,
  MoodBreakdown,
  MoodBackground,
  MoodRingSkeleton,
  MoodRingStyles,
} from "@/components/dashboard/mood-ring";
import { useCurrentProject } from "@/providers/project-provider";
import { useMoodSnapshot } from "@/hooks/use-mood";
import { motion } from "framer-motion";
import { Users, AlertTriangle, HeartPulse } from "lucide-react";

export default function MoodPage() {
  const { slug } = useCurrentProject();
  const { data: snapshot, isLoading, error } = useMoodSnapshot(slug);

  // Empty state
  if (!isLoading && !error && !snapshot) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <HeartPulse className="h-12 w-12 text-muted-foreground/40" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">No mood data yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Mood data appears after your project starts receiving events. Send some
            churn events or user activity to see your mood ring come alive.
          </p>
        </div>
      </div>
    );
  }

  const moodColor = snapshot?.mood_color ?? "#6b7280";

  return (
    <MoodBackground moodColor={moodColor}>
      <MoodRingStyles />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Mood Ring
          </h1>
          <p className="text-sm text-muted-foreground">
            Collective customer sentiment at a glance.
          </p>
        </div>

        {/* Hero — Mood Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center py-10">
              {isLoading || !snapshot ? (
                <MoodRingSkeleton />
              ) : (
                <MoodRing snapshot={snapshot} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Timeline */}
        {snapshot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="py-4">
                <MoodTimeline history={snapshot.history ?? []} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bottom row: Component breakdown + Context cards */}
        {snapshot && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="py-5">
                  <MoodBreakdown snapshot={snapshot} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Context Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <ContextCard
                icon={<Users className="h-5 w-5" />}
                label="Active Customers"
                value={snapshot.active_customers}
                color={moodColor}
                delay={0.35}
              />
              <ContextCard
                icon={<AlertTriangle className="h-5 w-5" />}
                label="Churn Today"
                value={snapshot.churn_events_today}
                color={snapshot.churn_events_today > 0 ? "#f97316" : moodColor}
                delay={0.4}
              />
              <ContextCard
                icon={<HeartPulse className="h-5 w-5" />}
                label="Recoveries (7d)"
                value={snapshot.recoveries_this_week}
                color={snapshot.recoveries_this_week > 0 ? "#10b981" : moodColor}
                delay={0.45}
              />
            </motion.div>
          </div>
        )}
      </div>
    </MoodBackground>
  );
}

/* ─── Context Card ───────────────────────────────────────────────── */

function ContextCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {icon}
          </div>
          <motion.span
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1 }}
          >
            {value.toLocaleString()}
          </motion.span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
