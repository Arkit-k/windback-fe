"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Skeleton,
} from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useWebhookDeliveries } from "@/hooks/use-churn-risk";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";

export default function WebhookDeliveriesPage() {
  const { slug } = useCurrentProject();
  const [page, setPage] = useState(0);
  const { data, isLoading } = useWebhookDeliveries(slug, page);

  const deliveries = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/p/${slug}/settings/churn-risk`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Webhook Deliveries
          </h1>
          <p className="text-sm text-muted-foreground">
            View delivery history for churn risk email webhooks.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Log</CardTitle>
          <CardDescription>
            {total} total deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No webhook deliveries yet. Configure a webhook URL and trigger a
              recalculation to see deliveries here.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Customer</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Attempt</th>
                      <th className="pb-3 pr-4 font-medium">Status Code</th>
                      <th className="pb-3 pr-4 font-medium">Error</th>
                      <th className="pb-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => {
                      const isDelivered = !!d.delivered_at;
                      const isFailed =
                        !isDelivered && d.attempt >= d.max_attempts;
                      const isPending =
                        !isDelivered && !isFailed && !!d.next_retry_at;

                      return (
                        <tr key={d.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">
                            {d.customer_email}
                          </td>
                          <td className="py-3 pr-4">
                            {isDelivered ? (
                              <Badge className="border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                                Delivered
                              </Badge>
                            ) : isPending ? (
                              <Badge className="border-yellow-500/30 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                                Retrying
                              </Badge>
                            ) : isFailed ? (
                              <Badge className="border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                                Failed
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-xs">
                            {d.attempt}/{d.max_attempts}
                          </td>
                          <td className="py-3 pr-4 text-xs font-mono">
                            {d.status_code ?? "—"}
                          </td>
                          <td className="py-3 pr-4 text-xs text-muted-foreground max-w-[200px] truncate">
                            {d.error_message || "—"}
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            {formatRelativeDate(d.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
