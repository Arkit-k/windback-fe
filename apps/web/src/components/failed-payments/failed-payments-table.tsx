"use client";

import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Skeleton,
} from "@windback/ui";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { PAYMENT_FAILURE_STATUS_LABELS } from "@/lib/constants";
import type { PaymentFailure, PaymentFailureStatus } from "@/types/api";

const statusVariantMap: Record<
  PaymentFailureStatus,
  "processing" | "recovered" | "lost"
> = {
  failing: "processing",
  recovered: "recovered",
  abandoned: "lost",
};

interface FailedPaymentsTableProps {
  failures: PaymentFailure[];
  isLoading?: boolean;
  projectSlug?: string;
}

export function FailedPaymentsTable({
  failures,
  isLoading,
  projectSlug,
}: FailedPaymentsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (failures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border py-16">
        <p className="text-sm text-muted-foreground">
          No failed payments yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Failed payment webhooks will appear here when detected.
        </p>
      </div>
    );
  }

  const basePath = projectSlug
    ? `/dashboard/p/${projectSlug}/failed-payments`
    : "/dashboard/failed-payments";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Retries</TableHead>
          <TableHead>Next Retry</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {failures.map((failure) => (
          <TableRow key={failure.id} className="cursor-pointer">
            <TableCell>
              <Link href={`${basePath}/${failure.id}`} className="block">
                <p className="font-medium text-foreground">
                  {failure.customer_name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {failure.customer_email}
                </p>
              </Link>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {formatCurrency(failure.amount_cents, failure.currency)}
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {failure.failure_reason ?? "Unknown"}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariantMap[failure.status]}>
                {PAYMENT_FAILURE_STATUS_LABELS[failure.status] ||
                  failure.status}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-sm">
                {failure.retry_count}/{failure.max_retries}
              </span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {failure.next_retry_at
                ? formatRelativeDate(failure.next_retry_at)
                : "-"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeDate(failure.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
