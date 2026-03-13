"use client";

import { useState, useMemo } from "react";
import { useCurrentProject } from "@/providers/project-provider";
import { useCompetitorRadar } from "@/hooks/use-competitor-radar";
import type { CompetitorThreat } from "@/hooks/use-competitor-radar";
import {
  ThreatRadarChart,
  ThreatLevelDistribution,
  SignalTypeBreakdown,
  ThreatScoreBar,
} from "@/components/dashboard/radar-charts";
import { formatCurrency } from "@/lib/utils";
import {
  Shield,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  Search,
  Radar,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Helpers ─────────────────────────────────────────────────────────────────

type SortField = "threat_score" | "risk_score" | "estimated_mrr_cents" | "days_since_last_event";

const LEVEL_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};

const SIGNAL_TAG_COLORS: Record<string, string> = {
  usage_drop: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  export_spike: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  pricing_page: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  support_complaint: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  feature_gap: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

const SIGNAL_LABELS: Record<string, string> = {
  usage_drop: "Usage Drop",
  export_spike: "Export Spike",
  pricing_page: "Pricing Page",
  support_complaint: "Support",
  feature_gap: "Feature Gap",
};

function TrendIcon({ trend }: { trend: string }) {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case "decreasing":
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function CompetitorRadarPage() {
  const project = useCurrentProject();
  const slug = project?.slug ?? "";

  const { data: radar, isLoading } = useCompetitorRadar(slug);

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("threat_score");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    if (!radar?.threats) return [];
    let list = [...radar.threats];

    if (levelFilter !== "all") {
      list = list.filter((t) => t.threat_level === levelFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.customer_email.toLowerCase().includes(q) ||
          t.customer_name.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      const av = a[sortField] as number;
      const bv = b[sortField] as number;
      return sortAsc ? av - bv : bv - av;
    });

    return list;
  }, [radar, levelFilter, search, sortField, sortAsc]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-1">
          <div className="h-8 w-72 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border bg-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg border bg-card" />
          <div className="h-64 animate-pulse rounded-lg border bg-card" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────
  if (!radar || radar.threats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Radar className="h-12 w-12 text-muted-foreground/50" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">No competitor threats detected</h2>
          <p className="text-sm text-muted-foreground">
            Competitor radar requires user event data to detect behavioral signals. Start tracking
            events to identify customers evaluating alternatives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-foreground">Competitor Radar</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Detect customers evaluating alternatives based on behavioral signals like usage drops,
          data exports, pricing page visits, and support complaints.
        </p>
      </div>

      {/* Stat cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        <StatCard
          label="Total Monitored"
          value={radar.total_monitored.toLocaleString()}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          subtitle="customers with signals"
        />
        <StatCard
          label="Critical Threats"
          value={radar.critical_threats.toLocaleString()}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          subtitle={radar.high_threats > 0 ? `+${radar.high_threats} high` : undefined}
        />
        <StatCard
          label="At-Risk MRR"
          value={formatCurrency(radar.at_risk_mrr_cents)}
          icon={<DollarSign className="h-5 w-5 text-amber-500" />}
          subtitle="critical + high threats"
        />
        <StatCard
          label="Threat Trend"
          value={radar.threat_trend.charAt(0).toUpperCase() + radar.threat_trend.slice(1)}
          icon={<TrendIcon trend={radar.threat_trend} />}
          subtitle="vs previous 7 days"
        />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          className="rounded-lg border border-border bg-card p-5"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Signal Radar</h2>
          <ThreatRadarChart summary={radar} />
        </motion.div>

        <div className="space-y-4">
          <motion.div
            className="rounded-lg border border-border bg-card p-5"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">Threat Distribution</h2>
            <ThreatLevelDistribution summary={radar} />
          </motion.div>

          <motion.div
            className="rounded-lg border border-border bg-card p-5"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">Signal Breakdown</h2>
            <SignalTypeBreakdown signalTypes={radar.top_signal_types} />
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Threat Level:</label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)] sm:w-72"
          />
        </div>
      </div>

      {/* Threats table */}
      <motion.div
        className="overflow-x-auto rounded-lg border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Customer</th>
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("threat_score")}>
                <span className="inline-flex items-center gap-1">
                  Threat Score <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Signals</th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => toggleSort("estimated_mrr_cents")}
              >
                <span className="inline-flex items-center gap-1">
                  MRR <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => toggleSort("days_since_last_event")}
              >
                <span className="inline-flex items-center gap-1">
                  Days Inactive <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3">Recommended Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <Radar className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                  No threats match your filters.
                </td>
              </tr>
            )}
            {filtered.map((t, i) => (
              <motion.tr
                key={t.customer_email}
                className="bg-card transition-colors hover:bg-muted/30"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-foreground">
                      {t.customer_name || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">{t.customer_email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ThreatScoreBar score={t.threat_score} level={t.threat_level} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${LEVEL_BADGE[t.threat_level] ?? ""}`}
                  >
                    {t.threat_level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {t.signals.map((s) => (
                      <span
                        key={s.signal_type}
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${SIGNAL_TAG_COLORS[s.signal_type] ?? "bg-gray-100 text-gray-600"}`}
                        title={s.description}
                      >
                        {SIGNAL_LABELS[s.signal_type] ?? s.signal_type}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums font-medium text-foreground">
                  {t.estimated_mrr_cents > 0
                    ? formatCurrency(t.estimated_mrr_cents)
                    : "\u2014"}
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {t.days_since_last_event}d
                </td>
                <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                  {t.recommended_action}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}

// ── StatCard ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <motion.div
      className="rounded-lg border border-border bg-card p-5"
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      {subtitle && (
        <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
      )}
    </motion.div>
  );
}
