"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Skeleton,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@windback/ui";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useCurrentProject } from "@/providers/project-provider";
import { useChurnEvent, useGenerateVariants, useSendVariant, useMarkRecovered } from "@/hooks/use-churn-events";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STRATEGY_LABELS } from "@/lib/constants";
import { ArrowLeft, Sparkles, Send, CheckCircle2, Mail } from "lucide-react";
import type { RecoveryVariant } from "@/types/api";
import { toast } from "@windback/ui";

export default function EventDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = use(params);
  const { slug } = useCurrentProject();
  const router = useRouter();
  const { data: event, isLoading } = useChurnEvent(slug, id);
  const generateVariants = useGenerateVariants(slug, id);
  const sendVariant = useSendVariant(slug, id);
  const markRecovered = useMarkRecovered(slug, id);
  const [previewVariant, setPreviewVariant] = useState<RecoveryVariant | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="ghost" onClick={() => router.push(`/dashboard/p/${slug}/events`)} className="mt-2">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Button>
      </div>
    );
  }

  const canGenerate = event.status === "new" || event.status === "processing";
  const canMarkRecovered = event.status !== "recovered" && event.status !== "lost";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/p/${slug}/events`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold">{event.customer_name}</h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-sm text-muted-foreground">{event.customer_email}</p>
        </div>
        {canMarkRecovered && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                markRecovered.mutate(undefined, {
                  onSuccess: () => toast({ title: "Marked as recovered" }),
                });
              }}
              disabled={markRecovered.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Recovered
            </Button>
          </div>
        )}
      </div>

      {/* Event Info Card */}
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Provider" value={event.provider} />
          <InfoItem label="Plan" value={event.plan_name} />
          <InfoItem label="MRR" value={formatCurrency(event.mrr_cents, event.currency)} />
          <InfoItem label="Tenure" value={`${event.tenure_days} days`} />
          <InfoItem label="Cancel Reason" value={event.cancel_reason || "Not provided"} />
          <InfoItem label="Currency" value={event.currency.toUpperCase()} />
          <InfoItem label="Created" value={formatDate(event.created_at)} />
          <InfoItem label="Last Active" value={event.last_active_at ? formatDate(event.last_active_at) : "N/A"} />
        </CardContent>
      </Card>

      {/* Generate Variants */}
      {canGenerate && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-8 w-8 text-[var(--accent)] mb-3" />
            <h3 className="font-display text-lg font-semibold">Generate Recovery Emails</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
              AI will create 9 personalized email variants using different recovery strategies.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                generateVariants.mutate(undefined, {
                  onSuccess: () => toast({ title: "Variants generated", variant: "success" as "default" }),
                });
              }}
              disabled={generateVariants.isPending}
            >
              {generateVariants.isPending ? "Generating..." : "Generate AI Recovery Emails"}
              <Sparkles className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Variants */}
      {event.variants && event.variants.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Recovery Variants</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.variants.map((variant) => (
              <Card key={variant.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {STRATEGY_LABELS[variant.strategy] || variant.strategy}
                    </Badge>
                    {variant.sent_at && (
                      <Badge variant="email_sent" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" /> Sent
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm mt-2">{variant.subject}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {variant.body}
                  </p>
                </CardContent>
                <div className="flex gap-2 border-t border-border p-4 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setPreviewVariant(variant)}
                  >
                    Preview
                  </Button>
                  {!variant.sent_at && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        sendVariant.mutate(variant.id, {
                          onSuccess: () => toast({ title: "Email sent!", variant: "success" as "default" }),
                        });
                      }}
                      disabled={sendVariant.isPending}
                    >
                      <Send className="h-3 w-3" /> Send
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewVariant} onOpenChange={() => setPreviewVariant(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewVariant?.subject}</DialogTitle>
            <DialogDescription>
              Strategy: {previewVariant && (STRATEGY_LABELS[previewVariant.strategy] || previewVariant.strategy)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap rounded-sm border border-border bg-secondary p-4 text-sm">
            {previewVariant?.body}
          </div>
          {previewVariant?.coupon_code && (
            <div className="mt-2 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm">
              <strong>Coupon:</strong> {previewVariant.coupon_code}
              {previewVariant.coupon_percent && ` (${previewVariant.coupon_percent}% off)`}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium capitalize">{value}</p>
    </div>
  );
}
