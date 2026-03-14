"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useHealthScores,
  useHealthScoreStats,
  useComputeHealthScores,
} from "@/hooks/use-health-scores";
import type { CustomerHealthScore, HealthScoreStats } from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  cn,
} from "@windback/ui";
import {
  HeartPulse,
  RefreshCw,
  Users,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 40) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function riskBadgeVariant(risk: string): string {
  switch (risk) {
    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

export default function HealthScoresPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: scoresData, isLoading: scoresLoading } = useHealthScores(slug);
  const { data: stats, isLoading: statsLoading } = useHealthScoreStats(slug);
  const computeScores = useComputeHealthScores(slug);

  const scores = scoresData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Health Scores
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor customer health and identify at-risk accounts.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => computeScores.mutate()}
          disabled={computeScores.isPending}
        >
          {computeScores.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Compute Scores
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total_customers}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Score
                </CardTitle>
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    scoreColor(stats.avg_score)
                  )}
                >
                  {stats.avg_score.toFixed(1)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.low_risk}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Medium Risk
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.medium_risk}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.high_risk}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Health Score List */}
      {scoresLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : scores.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <HeartPulse className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No health scores computed yet. Click &quot;Compute Scores&quot; to
            get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scores.map((hs) => (
            <Card key={hs.id} className="transition-colors hover:shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium truncate">
                    {hs.customer_email}
                  </CardTitle>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      riskBadgeVariant(hs.risk_level)
                    )}
                  >
                    {hs.risk_level}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                      scoreBg(hs.score),
                      scoreColor(hs.score)
                    )}
                  >
                    {hs.score}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          hs.score >= 70
                            ? "bg-green-500"
                            : hs.score >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        )}
                        style={{ width: `${hs.score}%` }}
                      />
                    </div>
                  </div>
                </div>
                {hs.risk_factors && hs.risk_factors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Risk Factors
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {hs.risk_factors.map((rf, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                          title={rf.description}
                        >
                          {rf.factor} ({rf.impact > 0 ? "+" : ""}
                          {rf.impact})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Computed{" "}
                  {new Date(hs.last_computed_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
