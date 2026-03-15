"use client";

import { useState, useMemo } from "react";
import { Button } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useWinBackOffers, useAuctionSummary } from "@/hooks/use-auction";
import {
  ROIBubbleChart,
  OfferTypeDistribution,
  SavingsWaterfall,
} from "@/components/dashboard/auction-charts";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, ArrowUpDown, Search, Loader2 } from "lucide-react";
import type { AuctionConfig, WinBackOffer } from "@/types/api";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCents(cents: number): string {
  if (Math.abs(cents) >= 100_00) return `$${(cents / 100).toFixed(0)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

const STRATEGY_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" },
] as const;

const OFFER_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  discount: { label: "Discount", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  pause: { label: "Pause", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  personal_outreach: { label: "Outreach", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  feature_unlock: { label: "Feature Unlock", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  downgrade: { label: "Downgrade", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

type SortField = "roi" | "risk_score" | "offer_cost_cents" | "expected_save_cents" | "win_probability";

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function WinBackPage() {
  const { slug } = useCurrentProject();

  // Config state
  const [strategy, setStrategy] = useState<AuctionConfig["preferred_strategy"]>("balanced");
  const [maxDiscount, setMaxDiscount] = useState(50);

  const config: Partial<AuctionConfig> = useMemo(
    () => ({
      preferred_strategy: strategy,
      max_discount_percent: maxDiscount,
    }),
    [strategy, maxDiscount],
  );

  const { data: offers, isLoading: offersLoading } = useWinBackOffers(slug, config);
  const { data: summary, isLoading: summaryLoading } = useAuctionSummary(slug, config);

  // Table state
  const [sortField, setSortField] = useState<SortField>("roi");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    let list = [...offers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.customer_email.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      const av = a[sortField] as number;
      const bv = b[sortField] as number;
      return sortAsc ? av - bv : bv - av;
    });

    return list;
  }, [offers, searchQuery, sortField, sortAsc]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  const isLoading = offersLoading || summaryLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-light)]">
            <Gavel className="h-5 w-5 text-accent-readable" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Win-Back Auction Engine
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered minimum viable offers to retain at-risk customers. Optimise retention spend, not blanket discounts.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Config Bar */}
      <motion.div
        className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Strategy</label>
          <div className="flex rounded-md border border-border">
            {STRATEGY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStrategy(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                  strategy === opt.value
                    ? "bg-[var(--accent)] text-white"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Max Discount: {maxDiscount}%
          </label>
          <input
            type="range"
            min={5}
            max={75}
            step={5}
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(Number(e.target.value))}
            className="h-2 w-40 cursor-pointer accent-[var(--accent)]"
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent-readable" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!offers || offers.length === 0) && (
        <motion.div
          className="flex flex-col items-center justify-center gap-3 py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Gavel className="h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground">No at-risk customers found</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            The auction engine analyses customers with churn risk scores of 40+. Once your churn risk scoring is active and
            identifies at-risk customers, personalised win-back offers will appear here.
          </p>
        </motion.div>
      )}

      {/* Main Content */}
      {!isLoading && offers && offers.length > 0 && summary && (
        <AnimatePresence mode="wait">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <SummaryCard
                label="At-Risk Customers"
                value={String(summary.total_at_risk)}
                delay={0}
              />
              <SummaryCard
                label="Total Offer Cost"
                value={formatCents(summary.total_offer_cost_cents)}
                delay={0.05}
              />
              <SummaryCard
                label="Expected Saves"
                value={formatCents(summary.total_expected_save_cents)}
                delay={0.1}
              />
              <SummaryCard
                label="Avg ROI"
                value={`${summary.avg_roi}x`}
                delay={0.15}
              />
              <SummaryCard
                label="Avg Win Probability"
                value={pct(summary.avg_win_probability)}
                delay={0.2}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div
                className="rounded-lg border border-border bg-card p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="mb-3 text-sm font-medium text-foreground">ROI Bubble Chart</h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  Bubble size = win probability. Green = high ROI, red = low ROI.
                </p>
                <ROIBubbleChart offers={offers} />
              </motion.div>

              <div className="space-y-6">
                <motion.div
                  className="rounded-lg border border-border bg-card p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="mb-3 text-sm font-medium text-foreground">Offer Type Distribution</h3>
                  <OfferTypeDistribution summary={summary} />
                </motion.div>

                <motion.div
                  className="rounded-lg border border-border bg-card p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <h3 className="mb-3 text-sm font-medium text-foreground">Savings Waterfall</h3>
                  <p className="mb-2 text-xs text-muted-foreground">
                    At-Risk MRR &rarr; Expected Churn &rarr; Expected Saves &rarr; Net Projected MRR
                  </p>
                  <SavingsWaterfall offers={offers} />
                </motion.div>
              </div>
            </div>

            {/* Table */}
            <motion.div
              className="rounded-lg border border-border bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-medium text-foreground">
                  Offers ({filteredOffers.length})
                </h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Customer</th>
                      <th
                        className="cursor-pointer px-4 py-2.5 font-medium"
                        onClick={() => toggleSort("risk_score")}
                      >
                        <span className="inline-flex items-center gap-1">
                          Risk
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th className="px-4 py-2.5 font-medium">Offer</th>
                      <th className="px-4 py-2.5 font-medium">Discount</th>
                      <th
                        className="cursor-pointer px-4 py-2.5 font-medium"
                        onClick={() => toggleSort("offer_cost_cents")}
                      >
                        <span className="inline-flex items-center gap-1">
                          Cost
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-2.5 font-medium"
                        onClick={() => toggleSort("expected_save_cents")}
                      >
                        <span className="inline-flex items-center gap-1">
                          Expected Save
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-2.5 font-medium"
                        onClick={() => toggleSort("roi")}
                      >
                        <span className="inline-flex items-center gap-1">
                          ROI
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-2.5 font-medium"
                        onClick={() => toggleSort("win_probability")}
                      >
                        <span className="inline-flex items-center gap-1">
                          Win Prob
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th className="px-4 py-2.5 font-medium">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer, i) => (
                      <OfferRow key={offer.customer_email} offer={offer} index={i} />
                    ))}
                    {filteredOffers.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No offers match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      className="rounded-lg border border-border bg-card p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </motion.div>
  );
}

function OfferRow({ offer, index }: { offer: WinBackOffer; index: number }) {
  const badge = OFFER_TYPE_BADGES[offer.offer_type] ?? {
    label: offer.offer_type,
    className: "bg-secondary text-muted-foreground border-border",
  };

  const winPct = Math.round(offer.win_probability * 100);

  return (
    <motion.tr
      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.02 * Math.min(index, 20) }}
    >
      <td className="px-4 py-2.5">
        <div className="font-medium text-foreground">{offer.customer_email}</div>
        {offer.customer_name && (
          <div className="text-muted-foreground">{offer.customer_name}</div>
        )}
      </td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
            offer.risk_score >= 80
              ? "bg-red-500/10 text-red-400"
              : offer.risk_score >= 60
                ? "bg-amber-500/10 text-amber-400"
                : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {offer.risk_score}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-2.5 text-foreground">
        {offer.discount_percent ? `${offer.discount_percent}% / ${offer.discount_duration_months}mo` : "\u2014"}
      </td>
      <td className="px-4 py-2.5 text-foreground">{formatCents(offer.offer_cost_cents)}</td>
      <td className="px-4 py-2.5 text-emerald-400">{formatCents(offer.expected_save_cents)}</td>
      <td className="px-4 py-2.5">
        <span
          className={`font-medium ${
            offer.roi >= 5
              ? "text-emerald-400"
              : offer.roi >= 2
                ? "text-lime-400"
                : offer.roi >= 1
                  ? "text-amber-400"
                  : "text-red-400"
          }`}
        >
          {offer.roi}x
        </span>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${winPct}%` }}
            />
          </div>
          <span className="text-muted-foreground">{winPct}%</span>
        </div>
      </td>
      <td className="max-w-[200px] truncate px-4 py-2.5 text-muted-foreground" title={offer.rationale}>
        {offer.rationale}
      </td>
    </motion.tr>
  );
}
