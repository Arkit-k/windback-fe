"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  Skeleton,
} from "@windback/ui";
import { FailedPaymentsTable } from "@/components/failed-payments/failed-payments-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { useCurrentProject } from "@/providers/project-provider";
import {
  usePaymentFailures,
  usePaymentFailureStats,
} from "@/hooks/use-payment-failures";
import {
  PAYMENT_FAILURE_STATUS_LABELS,
  ITEMS_PER_PAGE,
} from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  ...Object.entries(PAYMENT_FAILURE_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

function FailedPaymentsContent() {
  const { slug } = useCurrentProject();
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data, isLoading } = usePaymentFailures(slug, { status, page });
  const { data: stats, isLoading: statsLoading } =
    usePaymentFailureStats(slug);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || value === "1") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(
      `/dashboard/p/${slug}/failed-payments?${params.toString()}`,
    );
  }

  const totalPages = Math.ceil((data?.total ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Failed Payments
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and recover failed payments with automated dunning emails.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Failing",
            value: stats?.total_failing.toString() ?? "0",
            subtitle: stats
              ? `${formatCurrency(stats.mrr_at_risk_cents, "usd")} at risk`
              : undefined,
            icon: AlertTriangle,
          },
          {
            title: "Recovered",
            value: stats?.total_recovered.toString() ?? "0",
            subtitle: stats
              ? `${formatCurrency(stats.mrr_recovered_cents, "usd")} saved`
              : undefined,
            icon: CheckCircle2,
          },
          {
            title: "MRR at Risk",
            value: stats
              ? formatCurrency(stats.mrr_at_risk_cents, "usd")
              : "$0",
            icon: DollarSign,
          },
          {
            title: "Recovery Rate",
            value: stats ? formatPercent(stats.recovery_rate) : "0%",
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

      {/* Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Payment Failures</CardTitle>
          <Select
            value={status}
            onValueChange={(v) =>
              updateParams({ status: v, page: "1" })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <FailedPaymentsTable
            failures={data?.data ?? []}
            isLoading={isLoading}
            projectSlug={slug}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() =>
                    updateParams({ page: (page - 1).toString() })
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() =>
                    updateParams({ page: (page + 1).toString() })
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FailedPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <FailedPaymentsContent />
    </Suspense>
  );
}
