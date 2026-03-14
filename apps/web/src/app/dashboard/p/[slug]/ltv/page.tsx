"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useLTVList,
  useLTVStats,
  useComputeLTV,
} from "@/hooks/use-ltv";
import type { CustomerLTV, LTVStats } from "@/types/api";
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
  DollarSign,
  RefreshCw,
  Users,
  TrendingUp,
  Loader2,
  Coins,
  BarChart3,
} from "lucide-react";

const SEGMENT_COLORS: Record<string, string> = {
  high_value:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medium_value:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  low_value:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  at_risk: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatSegmentLabel(segment: string): string {
  return segment
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function LTVPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: ltvData, isLoading: listLoading } = useLTVList(slug);
  const { data: stats, isLoading: statsLoading } = useLTVStats(slug);
  const computeLTV = useComputeLTV(slug);

  const customers = ltvData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Lifetime Value
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyze customer lifetime value and segment your customer base.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => computeLTV.mutate()}
          disabled={computeLTV.isPending}
        >
          {computeLTV.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Compute LTV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
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
                  Average LTV
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.avg_ltv_cents)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.total_revenue_cents)}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Segment Breakdown */}
      {stats && stats.segments && stats.segments.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Segment Breakdown
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.segments.map((seg) => (
              <Card key={seg.segment}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {formatSegmentLabel(seg.segment)}
                    </CardTitle>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        SEGMENT_COLORS[seg.segment] ??
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      )}
                    >
                      {seg.count}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Avg LTV: {formatCurrency(seg.avg_ltv_cents)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Customer LTV Table */}
      {listLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <Coins className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No LTV data yet. Click &quot;Compute LTV&quot; to calculate
            customer lifetime values.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                      Total Revenue
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                      Avg Monthly
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                      Tenure
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                      Predicted LTV
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Segment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {c.customer_email}
                      </td>
                      <td className="py-3 pr-4 text-right text-foreground">
                        {formatCurrency(c.total_revenue_cents)}
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">
                        {formatCurrency(c.avg_monthly_cents)}
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">
                        {c.tenure_months}mo
                      </td>
                      <td className="py-3 pr-4 text-right font-medium text-foreground">
                        {formatCurrency(c.predicted_ltv_cents)}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            SEGMENT_COLORS[c.segment] ??
                              "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          )}
                        >
                          {formatSegmentLabel(c.segment)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
