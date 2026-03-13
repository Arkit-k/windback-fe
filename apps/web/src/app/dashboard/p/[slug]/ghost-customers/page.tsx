"use client";

import { useState, useMemo } from "react";
import { useCurrentProject } from "@/providers/project-provider";
import { useGhostCustomers, useGhostStats } from "@/hooks/use-ghosts";
import {
  GhostDistributionChart,
  GhostScoreBar,
} from "@/components/dashboard/ghost-chart";
import { formatCurrency } from "@/lib/utils";
import {
  Loader2,
  Users,
  Ghost,
  Skull,
  EyeOff,
  DollarSign,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import type { GhostCustomer } from "@/types/api";

// ── Helpers ─────────────────────────────────────────────────────────────────

type SortField = "ghost_score" | "days_since_last_event" | "event_frequency_decline" | "estimated_mrr_cents";

const LEVEL_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  fading: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  ghost: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  zombie: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

function formatDate(d: string | null | undefined): string {
  if (!d) return "Never";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function GhostCustomersPage() {
  const project = useCurrentProject();
  const slug = project?.slug ?? "";

  const { data: ghosts, isLoading: ghostsLoading } = useGhostCustomers(slug);
  const { data: stats, isLoading: statsLoading } = useGhostStats(slug);

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("ghost_score");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    if (!ghosts) return [];
    let list = [...ghosts];

    // Level filter
    if (levelFilter !== "all") {
      list = list.filter((g) => g.ghost_level === levelFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.customer_email.toLowerCase().includes(q) ||
          g.customer_name.toLowerCase().includes(q),
      );
    }

    // Sort
    list.sort((a, b) => {
      const av = a[sortField] as number;
      const bv = b[sortField] as number;
      return sortAsc ? av - bv : bv - av;
    });

    return list;
  }, [ghosts, levelFilter, search, sortField, sortAsc]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  const isLoading = ghostsLoading || statsLoading;

  // ── Loading state ───────────────────────────────────────────────────────
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
        <div className="h-64 animate-pulse rounded-lg border bg-card" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!ghosts || ghosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Ghost className="h-12 w-12 text-muted-foreground/50" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">No ghost customers detected</h2>
          <p className="text-sm text-muted-foreground">
            Ghost detection requires user event data. Start tracking events to identify paying but
            inactive accounts.
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
        <h1 className="text-2xl font-bold text-foreground">Ghost Customer Detection</h1>
        <p className="text-sm text-muted-foreground">
          Identify &quot;zombie&quot; accounts &mdash; customers still paying but no longer using your product.
          They are invisible churn bombs that will cancel once they notice they are still being charged.
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          <StatCard
            label="Total Customers"
            value={stats.total_customers.toLocaleString()}
            icon={<Users className="h-5 w-5 text-blue-500" />}
          />
          <StatCard
            label="Ghosts"
            value={stats.ghost_count.toLocaleString()}
            icon={<Ghost className="h-5 w-5 text-orange-500" />}
            subtitle={`${stats.ghost_percentage}% of total`}
          />
          <StatCard
            label="Zombies"
            value={stats.zombie_count.toLocaleString()}
            icon={<Skull className="h-5 w-5 text-red-500" />}
          />
          <StatCard
            label="At-Risk MRR"
            value={formatCurrency(stats.at_risk_mrr_cents)}
            icon={<DollarSign className="h-5 w-5 text-amber-500" />}
            subtitle="from ghosts + zombies"
          />
        </motion.div>
      )}

      {/* Distribution chart */}
      {stats && (
        <motion.div
          className="rounded-lg border border-border bg-card p-5"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Ghost Distribution</h2>
          <GhostDistributionChart stats={stats} />
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Level:</label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="all">All</option>
            <option value="fading">Fading</option>
            <option value="ghost">Ghost</option>
            <option value="zombie">Zombie</option>
            <option value="active">Active</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)] sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
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
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("ghost_score")}>
                <span className="inline-flex items-center gap-1">
                  Ghost Score <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3">Level</th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => toggleSort("days_since_last_event")}
              >
                <span className="inline-flex items-center gap-1">
                  Days Inactive <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => toggleSort("event_frequency_decline")}
              >
                <span className="inline-flex items-center gap-1">
                  Event Decline <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3">Last Event</th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => toggleSort("estimated_mrr_cents")}
              >
                <span className="inline-flex items-center gap-1">
                  Est. MRR <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <EyeOff className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                  No customers match your filters.
                </td>
              </tr>
            )}
            {filtered.map((g, i) => (
              <motion.tr
                key={g.customer_email}
                className="bg-card transition-colors hover:bg-muted/30"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-foreground">
                      {g.customer_name || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">{g.customer_email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <GhostScoreBar score={g.ghost_score} level={g.ghost_level} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${LEVEL_BADGE[g.ghost_level] ?? ""}`}
                  >
                    {g.ghost_level}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {g.days_since_last_event}d
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {g.event_frequency_decline > 0 ? `-${g.event_frequency_decline}%` : "0%"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(g.last_event_at)}
                </td>
                <td className="px-4 py-3 tabular-nums font-medium text-foreground">
                  {g.estimated_mrr_cents > 0
                    ? formatCurrency(g.estimated_mrr_cents)
                    : "\u2014"}
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
