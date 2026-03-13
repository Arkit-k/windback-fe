"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useMarketPulseLatest,
  useMarketPulseSnapshots,
  useMarketPulseHeatmap,
} from "@/hooks/use-market-pulse";
import {
  CandlestickChart,
  VolumeBarChart,
  ChurnPredictionLineChart,
  DemandHeatmap,
  HealthScoreSparkline,
  ConfidenceGauge,
} from "@/components/dashboard/market-pulse-charts";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart3,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const TIME_RANGES = [
  { label: "7D", hours: 168 },
  { label: "30D", hours: 720 },
  { label: "90D", hours: 2160 },
] as const;

function DeltaIndicator({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-500">
        <TrendingUp className="h-3 w-3" />
        +{delta.toFixed(1)}%
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500">
        <TrendingDown className="h-3 w-3" />
        {delta.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
      <Minus className="h-3 w-3" />
      0.0%
    </span>
  );
}

function TickerCard({
  label,
  value,
  delta,
  icon: Icon,
  sparkline,
  isLoading,
}: {
  label: string;
  value: string;
  delta: number;
  icon: React.ComponentType<{ className?: string }>;
  sparkline?: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <>
          <span className="font-mono text-lg font-bold text-foreground">{value}</span>
          <DeltaIndicator delta={delta} />
          {sparkline}
        </>
      )}
    </div>
  );
}

export default function MarketPulsePage() {
  const { slug } = useCurrentProject();
  const [timeRange, setTimeRange] = useState<number>(168);

  const { data: latest, isLoading: latestLoading } = useMarketPulseLatest(slug);
  const { data: snapshots, isLoading: snapshotsLoading } = useMarketPulseSnapshots(
    slug,
    timeRange,
  );
  const { data: heatmap, isLoading: heatmapLoading } = useMarketPulseHeatmap(
    slug,
    timeRange / 24,
  );

  const isLoading = latestLoading || snapshotsLoading;
  const hasData = snapshots && snapshots.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Market Pulse</h1>
          <p className="text-sm text-muted-foreground">
            Real-time product health and churn risk signals.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.label}
              variant={timeRange === range.hours ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range.hours)}
              className="px-3 text-xs"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Empty state */}
      {!isLoading && !hasData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">No market data yet</p>
              <p className="max-w-md text-xs text-muted-foreground">
                Snapshots are computed every 5 minutes once your project starts receiving events.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Ticker Bar */}
      {(isLoading || hasData) && (
        <motion.div
          className="flex gap-4 overflow-x-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <TickerCard
            label="PHS"
            value={latest?.health_score?.toFixed(1) ?? "—"}
            delta={latest?.delta ?? 0}
            icon={Activity}
            sparkline={
              snapshots && snapshots.length > 0 ? (
                <div className="mt-1 h-6">
                  <HealthScoreSparkline snapshots={snapshots} />
                </div>
              ) : undefined
            }
            isLoading={isLoading}
          />
          <TickerCard
            label="Churn Rate"
            value={latest ? formatPercent(latest.churn_rate ?? 0) : "—"}
            delta={0}
            icon={TrendingDown}
            isLoading={isLoading}
          />
          <TickerCard
            label="Recovery"
            value={latest ? formatPercent(latest.recovery_rate ?? 0) : "—"}
            delta={0}
            icon={TrendingUp}
            isLoading={isLoading}
          />
          <TickerCard
            label="MRR Delta"
            value={latest ? formatCurrency(latest.mrr_delta_cents ?? 0, "usd") : "—"}
            delta={latest?.delta_percent ?? 0}
            icon={BarChart3}
            isLoading={isLoading}
          />
          <TickerCard
            label="Events"
            value={latest?.event_volume?.toString() ?? "—"}
            delta={0}
            icon={Zap}
            isLoading={isLoading}
          />
        </motion.div>
      )}

      {/* Main Chart Area */}
      {(isLoading || hasData) && (
        <motion.div
          className="grid gap-4 lg:grid-cols-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
        >
          {/* Candlestick + Volume */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Product Health Score — OHLC
                </CardTitle>
              </CardHeader>
              <CardContent>
                {snapshotsLoading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : (
                  <CandlestickChart snapshots={snapshots ?? []} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Event Volume</CardTitle>
              </CardHeader>
              <CardContent>
                {snapshotsLoading ? (
                  <Skeleton className="h-[120px] w-full" />
                ) : (
                  <VolumeBarChart snapshots={snapshots ?? []} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Prediction Confidence */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Prediction Confidence</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {latestLoading ? (
                <>
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </>
              ) : (
                <>
                  <ConfidenceGauge confidence={latest?.confidence ?? 0} />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Predicted PHS</p>
                    <p className="font-mono text-2xl font-bold text-foreground">
                      {latest?.predicted_score?.toFixed(1) ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Trend:</span>
                    {(latest?.delta ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                        <TrendingUp className="h-3 w-3" /> Up
                      </span>
                    ) : (latest?.delta ?? 0) < 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500">
                        <TrendingDown className="h-3 w-3" /> Down
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                        <Minus className="h-3 w-3" /> Flat
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bottom Section: Churn Prediction + Heatmap */}
      {(isLoading || hasData) && (
        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Churn Prediction Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshotsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <ChurnPredictionLineChart snapshots={snapshots ?? []} />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Market Demand Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              {heatmapLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <DemandHeatmap cells={heatmap ?? []} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sparkline Cards */}
      {(isLoading || hasData) && (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.32 }}
        >
          {[
            { title: "Churn Rate", key: "churn_rate" as const },
            { title: "Recovery", key: "recovery_rate" as const },
            { title: "Event Volume", key: "event_volume" as const },
            { title: "Payment Health", key: "payment_health" as const },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.32 + i * 0.08 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {snapshotsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <HealthScoreSparkline snapshots={snapshots ?? []} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
