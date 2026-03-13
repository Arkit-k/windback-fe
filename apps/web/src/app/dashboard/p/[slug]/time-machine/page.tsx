"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useTimeMachine,
  type TimeMachineParams,
} from "@/hooks/use-time-machine";
import {
  TimelineComparisonChart,
  DeltaWaterfall,
  ScenarioImpactBars,
  MonthlyBreakdownTable,
} from "@/components/dashboard/time-machine-charts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Rewind,
  DollarSign,
  TrendingUp,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Slider component (self-contained)                                  */
/* ------------------------------------------------------------------ */

function PercentSlider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="min-w-[3.5rem] text-right text-sm font-semibold tabular-nums text-foreground">
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={50}
        step={1}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-indigo-500"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary card                                                       */
/* ------------------------------------------------------------------ */

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtitle,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCents(cents: number): string {
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  return `$${dollars.toFixed(0)}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TimeMachinePage() {
  const { slug } = useCurrentProject();

  const [params, setParams] = useState<TimeMachineParams>({
    recovery_rate: 0.1,
    churn_reduction: 0.1,
    price_increase: 0.1,
    dunning_improvement: 0.1,
  });

  const [activeParams, setActiveParams] = useState<TimeMachineParams>(params);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);

  const { data: report, isLoading, error } = useTimeMachine(slug, activeParams);

  const handleSimulate = useCallback(() => {
    setActiveParams({ ...params });
    setSelectedScenarioIdx(0);
  }, [params]);

  const updateParam = useCallback(
    (key: keyof TimeMachineParams) => (value: number) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Find best scenario
  const bestScenario = report?.scenarios?.reduce(
    (best, s) =>
      s.total_delta_cents > (best?.total_delta_cents ?? 0) ? s : best,
    report.scenarios[0],
  );

  const totalDelta = report?.scenarios?.reduce(
    (sum, s) => sum + s.total_delta_cents,
    0,
  );

  const totalCustomersImpacted = report?.scenarios?.reduce(
    (max, s) => Math.max(max, s.customers_impacted),
    0,
  );

  const selectedResult = report?.scenarios?.[selectedScenarioIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/10 p-2.5">
            <div className="relative">
              <Clock className="h-5 w-5 text-indigo-500" />
              <Rewind className="absolute -bottom-1 -right-1 h-3 w-3 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Revenue Time Machine
            </h1>
            <p className="text-sm text-muted-foreground">
              See how different decisions would have changed your revenue.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sliders + Simulate */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-500" />
              What-If Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <PercentSlider
                label="Recovery Rate"
                description="Recover more failed payments"
                value={params.recovery_rate ?? 0.1}
                onChange={updateParam("recovery_rate")}
              />
              <PercentSlider
                label="Churn Reduction"
                description="Prevent voluntary cancellations"
                value={params.churn_reduction ?? 0.1}
                onChange={updateParam("churn_reduction")}
              />
              <PercentSlider
                label="Price Increase"
                description="Scale up all revenue"
                value={params.price_increase ?? 0.1}
                onChange={updateParam("price_increase")}
              />
              <PercentSlider
                label="Dunning Improvement"
                description="Better dunning email conversion"
                value={params.dunning_improvement ?? 0.1}
                onChange={updateParam("dunning_improvement")}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSimulate}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rewind className="h-4 w-4" />
                )}
                Simulate
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">
            Running simulation...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="text-sm text-destructive">
              Failed to load simulation data.
            </p>
            <p className="text-xs text-muted-foreground">
              {(error as Error).message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {report && !isLoading && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                icon={DollarSign}
                label="Base MRR"
                value={formatCents(report.base_mrr_cents)}
                subtitle={`${report.period_months} months of data`}
                delay={0}
              />
              <SummaryCard
                icon={TrendingUp}
                label="Total Potential Delta"
                value={`+${formatCents(totalDelta ?? 0)}`}
                subtitle="across all scenarios"
                delay={0.08}
              />
              <SummaryCard
                icon={Sparkles}
                label="Best Scenario"
                value={bestScenario?.scenario.name ?? "-"}
                subtitle={
                  bestScenario
                    ? `+${formatCents(bestScenario.total_delta_cents)} (${bestScenario.delta_percent.toFixed(1)}%)`
                    : undefined
                }
                delay={0.16}
              />
              <SummaryCard
                icon={Users}
                label="Customers Impacted"
                value={(totalCustomersImpacted ?? 0).toLocaleString()}
                subtitle={`${report.total_churns} churns, ${report.total_failures} failures`}
                delay={0.24}
              />
            </div>

            {/* Scenario tabs + Timeline chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.16 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base">
                      Revenue Timeline
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {report.scenarios.map((s, i) => (
                        <button
                          key={s.scenario.parameter}
                          onClick={() => setSelectedScenarioIdx(i)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            i === selectedScenarioIdx
                              ? "bg-indigo-600 text-white"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s.scenario.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedResult && (
                    <div>
                      <p className="mb-3 text-xs text-muted-foreground">
                        {selectedResult.scenario.description}
                      </p>
                      <TimelineComparisonChart
                        result={selectedResult}
                        height={280}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Scenario Impact + Waterfall */}
            <div className="grid gap-4 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.24 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Scenario Impact Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScenarioImpactBars results={report.scenarios} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.32 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Cumulative Delta Waterfall
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DeltaWaterfall results={report.scenarios} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Monthly breakdown table */}
            {selectedResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Monthly Breakdown:{" "}
                      {selectedResult.scenario.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlyBreakdownTable
                      timeline={selectedResult.timeline}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Empty state for no data */}
            {report.period_months === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                  <Clock className="h-10 w-10 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      No historical data yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The time machine needs payment failure and churn event
                      data to run simulations. Start tracking events to see
                      what-if scenarios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
