"use client";

import { use } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from "@windback/ui";
import { DunningTimeline } from "@/components/failed-payments/dunning-timeline";
import { useCurrentProject } from "@/providers/project-provider";
import { usePaymentFailure } from "@/hooks/use-payment-failures";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_FAILURE_STATUS_LABELS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import type { PaymentFailureStatus } from "@/types/api";

const statusVariantMap: Record<
  PaymentFailureStatus,
  "processing" | "recovered" | "lost"
> = {
  failing: "processing",
  recovered: "recovered",
  abandoned: "lost",
};

export default function PaymentFailureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { slug } = useCurrentProject();
  const { data: failure, isLoading } = usePaymentFailure(slug, id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!failure) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Payment failure not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href={`/dashboard/p/${slug}/failed-payments`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Failed Payments
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {failure.customer_name || failure.customer_email}
          </h1>
          <Badge variant={statusVariantMap[failure.status]}>
            {PAYMENT_FAILURE_STATUS_LABELS[failure.status] || failure.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {failure.customer_email}
        </p>
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Amount</dt>
                <dd className="font-mono text-sm font-medium">
                  {formatCurrency(failure.amount_cents, failure.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Provider</dt>
                <dd className="text-sm capitalize">{failure.provider}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Invoice ID</dt>
                <dd className="font-mono text-xs">
                  {failure.provider_invoice_id}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">
                  Failure Reason
                </dt>
                <dd className="text-sm">{failure.failure_reason ?? "Unknown"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Retries</dt>
                <dd className="text-sm">
                  {failure.retry_count} / {failure.max_retries}
                </dd>
              </div>
              {failure.next_retry_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">
                    Next Retry
                  </dt>
                  <dd className="text-sm">
                    {formatDate(failure.next_retry_at)}
                  </dd>
                </div>
              )}
              {failure.recovered_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">
                    Recovered At
                  </dt>
                  <dd className="text-sm text-green-600">
                    {formatDate(failure.recovered_at)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Created</dt>
                <dd className="text-sm">{formatDate(failure.created_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dunning Email Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <DunningTimeline emails={failure.dunning_emails ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
