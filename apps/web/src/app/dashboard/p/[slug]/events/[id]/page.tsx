"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Skeleton,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Textarea, Label,
} from "@windback/ui";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useCurrentProject } from "@/providers/project-provider";
import { useChurnEvent, useGenerateVariants, useSendVariant, useMarkRecovered, useUpdateVariant } from "@/hooks/use-churn-events";
import { useAutoSend } from "@/hooks/use-projects";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STRATEGY_LABELS } from "@/lib/constants";
import { REASON_TO_STRATEGY, extractBaseReason } from "@/lib/recovery";
import { ArrowLeft, Sparkles, Send, CheckCircle2, Mail, Pencil, AlertTriangle } from "lucide-react";
import type { RecoveryVariant } from "@/types/api";
import { toast } from "@windback/ui";

export default function EventDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = use(params);
  const { slug } = useCurrentProject();
  const router = useRouter();
  const { data: event, isLoading } = useChurnEvent(slug, id);
  const { data: autoSend } = useAutoSend(slug);
  const generateVariants = useGenerateVariants(slug, id);
  const sendVariant = useSendVariant(slug, id);
  const markRecovered = useMarkRecovered(slug, id);
  const updateVariant = useUpdateVariant(slug, id);
  const [previewVariant, setPreviewVariant] = useState<RecoveryVariant | null>(null);
  const [editVariant, setEditVariant] = useState<RecoveryVariant | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

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
  const awaitingApproval = event.status === "variants_generated" && autoSend === false;

  // Determine the recommended variant based on cancel reason
  const baseReason = extractBaseReason(event.cancel_reason);
  const recommendedStrategy = baseReason ? REASON_TO_STRATEGY[baseReason] : null;

  function openEdit(variant: RecoveryVariant) {
    setEditVariant(variant);
    setEditSubject(variant.subject);
    setEditBody(variant.body);
  }

  function handleSaveEdit() {
    if (!editVariant) return;
    updateVariant.mutate(
      { variantId: editVariant.id, subject: editSubject, body: editBody },
      {
        onSuccess: () => {
          toast({ title: "Variant updated" });
          setEditVariant(null);
        },
        onError: (err) =>
          toast({ title: "Failed to update variant", description: err.message, variant: "destructive" }),
      }
    );
  }

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

      {/* Approval Banner */}
      {awaitingApproval && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Awaiting your approval</p>
            <p className="text-xs mt-0.5 opacity-80">
              Auto-send is disabled. Choose a variant below and click &ldquo;Approve &amp; Send&rdquo; to send the winback email.
            </p>
          </div>
        </div>
      )}

      {/* Event Info Card */}
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Provider" value={event.provider} />
          <InfoItem label="Plan" value={event.plan_name || "—"} />
          <InfoItem label="MRR" value={formatCurrency(event.mrr_cents, event.currency)} />
          <InfoItem label="Tenure" value={event.tenure_days ? `${event.tenure_days} days` : "—"} />
          <InfoItem label="Cancel Reason" value={event.cancel_reason || "Not provided"} />
          <InfoItem label="Currency" value={event.currency.toUpperCase()} />
          <InfoItem label="Created" value={formatDate(event.created_at)} />
          <InfoItem label="Last Active" value={event.last_active_at ? formatDate(event.last_active_at) : "—"} />
          {event.provider_customer_id && (
            <InfoItem label="Provider Customer ID" value={event.provider_customer_id} mono />
          )}
          {event.provider_subscription_id && (
            <InfoItem label="Provider Subscription ID" value={event.provider_subscription_id} mono />
          )}
          <InfoItem label="Last Updated" value={formatDate(event.updated_at)} />
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
            {event.variants.map((variant) => {
              const isRecommended = recommendedStrategy && variant.strategy === recommendedStrategy && !variant.sent_at;
              return (
                <Card
                  key={variant.id}
                  className={`flex flex-col transition-all ${isRecommended && awaitingApproval ? "ring-2 ring-[var(--accent)] ring-offset-2" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {STRATEGY_LABELS[variant.strategy] || variant.strategy}
                        </Badge>
                        {isRecommended && awaitingApproval && (
                          <Badge className="text-xs bg-[var(--accent)] text-white">Recommended</Badge>
                        )}
                      </div>
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
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(variant)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
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
                          <Send className="h-3 w-3" />
                          {awaitingApproval ? "Approve & Send" : "Send"}
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
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

      {/* Edit Dialog */}
      <Dialog open={!!editVariant} onOpenChange={(open) => { if (!open) setEditVariant(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
            <DialogDescription>
              Modify the subject or body before sending. Changes are saved when you click Save.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-subject">Subject</Label>
              <Textarea
                id="edit-subject"
                rows={2}
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-body">Body</Label>
              <Textarea
                id="edit-body"
                rows={10}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Email body"
                className="font-mono text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditVariant(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={updateVariant.isPending}>
                {updateVariant.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${mono ? "font-mono break-all" : "capitalize"}`}>
        {value}
      </p>
    </div>
  );
}
