"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@windback/ui";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventsTable } from "@/components/dashboard/events-table";
import { IntegrationGuide } from "@/components/dashboard/integration-guide";
import { RevenueHeroCard } from "@/components/dashboard/revenue-hero-card";
import { ChurnRiskHeroCard } from "@/components/dashboard/churn-risk-hero-card";
import { RiskScoresTable } from "@/components/dashboard/risk-scores-table";
import { RecoveryTrendChart } from "@/components/dashboard/overview-charts";
import { useCurrentProject } from "@/providers/project-provider";
import { useStats } from "@/hooks/use-stats";
import { useChurnEvents } from "@/hooks/use-churn-events";
import { usePaymentFailureStats } from "@/hooks/use-payment-failures";
import { useChurnRiskStats, useChurnRiskScores } from "@/hooks/use-churn-risk";
import { useRecoveryTrends, useEmailAnalytics } from "@/hooks/use-analytics";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  Activity,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { PDFExportButton } from "@/components/dashboard/pdf-export";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { ChangelogButton } from "@/components/dashboard/changelog";
import { motion } from "framer-motion";

export default function ProjectOverviewPage() {
  const { slug } = useCurrentProject();
  const { data: stats, isLoading: statsLoading } = useStats(slug);
  const { data: events, isLoading: eventsLoading } = useChurnEvents(slug, { page: 1 });
  const { data: dunningStats, isLoading: dunningLoading } = usePaymentFailureStats(slug);
  const { data: churnRiskStats, isLoading: churnRiskStatsLoading } = useChurnRiskStats(slug);
  const { data: churnRiskScores, isLoading: churnRiskScoresLoading } = useChurnRiskScores(slug);
  const { data: trendsData, isLoading: trendsLoading } = useRecoveryTrends(slug, 30);
  const { data: _emailAnalytics, isLoading: _emailLoading } = useEmailAnalytics(slug);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Your churn recovery dashboard at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChangelogButton />
          <PDFExportButton title="Project Overview" />
        </div>
      </div>

      {/* Onboarding wizard — shown until dismissed */}
      <OnboardingWizard slug={slug} />

      {/* Hero Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueHeroCard
          stats={stats}
          dunningStats={dunningStats}
          isLoading={statsLoading || dunningLoading}
        />
        <ChurnRiskHeroCard
          stats={churnRiskStats}
          isLoading={churnRiskStatsLoading}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Events",
            value: (stats?.total_events ?? 0).toString(),
            icon: Activity,
          },
          {
            title: "Recovered",
            value: (stats?.recovered_events ?? 0).toString(),
            subtitle: stats ? `of ${stats.total_events ?? 0} events` : undefined,
            icon: CheckCircle2,
          },
          {
            title: "MRR at Risk",
            value: stats ? formatCurrency(stats.total_mrr_at_risk ?? 0, "usd") : "$0",
            icon: DollarSign,
          },
          {
            title: "Recovery Rate",
            value: stats ? formatPercent(stats.recovery_rate ?? 0) : "0%",
            icon: TrendingUp,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <StatCard {...stat} isLoading={statsLoading} />
          </motion.div>
        ))}
      </div>

      {/* Recovery Trends */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
      >
        <RecoveryTrendChart
          trends={trendsData?.data ?? []}
          isLoading={trendsLoading}
        />
      </motion.div>

      {/* Dunning Stats */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Failed Payment Recovery
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Failing",
              value: dunningStats?.total_failing.toString() ?? "0",
              subtitle: dunningStats
                ? `${formatCurrency(dunningStats.mrr_at_risk_cents, "usd")} at risk`
                : undefined,
              icon: ShieldAlert,
            },
            {
              title: "Recovered",
              value: dunningStats?.total_recovered.toString() ?? "0",
              subtitle: dunningStats
                ? `${formatCurrency(dunningStats.mrr_recovered_cents, "usd")} saved`
                : undefined,
              icon: CreditCard,
            },
            {
              title: "Recovery Rate",
              value: dunningStats
                ? formatPercent(dunningStats.recovery_rate)
                : "0%",
              icon: TrendingUp,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.32 + i * 0.08 }}
            >
              <StatCard {...stat} isLoading={dunningLoading} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* At-Risk Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.56 }}
      >
        <RiskScoresTable
          scores={churnRiskScores ?? []}
          isLoading={churnRiskScoresLoading}
          limit={10}
        />
      </motion.div>

      {/* Integration guide — shown until first event arrives */}
      {!statsLoading && (stats?.total_events ?? 0) === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
        >
          <IntegrationGuide projectSlug={slug} />
        </motion.div>
      )}

      {/* Recent Events — shown once at least one event exists */}
      {(stats?.total_events ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <EventsTable
              events={events?.data?.slice(0, 10) ?? []}
              isLoading={eventsLoading}
              projectSlug={slug}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
