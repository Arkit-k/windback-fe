"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  toast,
} from "@windback/ui";
import { StatCard } from "@/components/dashboard/stat-card";
import { useUsage, useCheckout, usePortal, useCancelSubscription, useCancelSurveyStats } from "@/hooks/use-billing";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, Package, FolderOpen, Zap, TrendingDown } from "lucide-react";
import type { CancelSurveyStats } from "@/types/api";
import { motion } from "framer-motion";

const PLAN_CONFIG: Record<
  string,
  { label: string; price: string; priceCents: number; eventsLimit: number; projectsLimit: number }
> = {
  starter: { label: "Starter", price: "Free",   priceCents: 0,    eventsLimit: 50,  projectsLimit: 1  },
  growth:  { label: "Growth",  price: "$29/mo", priceCents: 2900, eventsLimit: 500, projectsLimit: 5  },
  scale:   { label: "Scale",   price: "$99/mo", priceCents: 9900, eventsLimit: -1,  projectsLimit: -1 },
};

const CANCEL_REASONS = [
  "It's too expensive",
  "I'm not using it enough",
  "Missing features I need",
  "Switching to another tool",
  "Too difficult to set up or use",
] as const;

type CancelReason = (typeof CANCEL_REASONS)[number] | "other";

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit <= 0;
  const percent = unlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !unlimited && percent >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used.toLocaleString()} / {unlimited ? "Unlimited" : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            unlimited
              ? "bg-[var(--accent)] opacity-30"
              : isNearLimit
                ? "bg-red-500"
                : "bg-[var(--accent)]"
          }`}
          style={{ width: unlimited ? "100%" : `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cancel Insights — why users are leaving Windback
// ---------------------------------------------------------------------------
function CancelInsights({ stats, isLoading }: { stats?: CancelSurveyStats; isLoading: boolean }) {
  const maxCount = stats?.reasons?.length > 0 ? stats.reasons[0].count : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Why Users Leave</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-secondary" />
            ))}
          </div>
        ) : !stats || stats.total === 0 ? (
          <p className="text-sm text-muted-foreground">No cancellation data yet.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Based on <span className="font-medium text-foreground">{stats.total}</span> cancellation{stats.total !== 1 ? "s" : ""}.
            </p>

            {/* Reason breakdown */}
            <div className="space-y-3">
              {(stats?.reasons ?? []).map((r) => (
                <div key={r.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{r.reason}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {r.count} &mdash; {r.percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                      style={{ width: `${(r.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent free-text responses */}
            {stats?.recent?.some((e) => e.custom_reason) && (
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent written feedback
                </p>
                <div className="space-y-2">
                  {(stats?.recent ?? [])
                    .filter((e) => e.custom_reason)
                    .slice(0, 8)
                    .map((e, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm"
                      >
                        <p className="text-foreground">&ldquo;{e.custom_reason}&rdquo;</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {e.reason} &middot;{" "}
                          {new Date(e.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Cancel Survey Dialog
// ---------------------------------------------------------------------------
function CancelSurveyDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string, customReason: string) => void;
  isPending: boolean;
}) {
  const [selected, setSelected] = useState<CancelReason | "">("");
  const [customReason, setCustomReason] = useState("");

  const canSubmit = selected !== "" && (selected !== "other" || customReason.trim() !== "");

  function handleSubmit() {
    if (!canSubmit) return;
    const reason = selected === "other" ? "Other" : (selected as string);
    onConfirm(reason, customReason.trim());
  }

  function handleClose(v: boolean) {
    if (!v) {
      setSelected("");
      setCustomReason("");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Before you go — what&apos;s the reason?</DialogTitle>
          <DialogDescription>
            Help us improve by telling us why you&apos;re cancelling. Your subscription stays
            active until the end of the billing period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {CANCEL_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
                selected === reason
                  ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-border text-foreground hover:bg-secondary"
              }`}
            >
              <input
                type="radio"
                name="cancel-reason"
                value={reason}
                checked={selected === reason}
                onChange={() => setSelected(reason)}
                className="accent-[var(--accent)]"
              />
              {reason}
            </label>
          ))}

          {/* Other */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
              selected === "other"
                ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                : "border-border text-foreground hover:bg-secondary"
            }`}
          >
            <input
              type="radio"
              name="cancel-reason"
              value="other"
              checked={selected === "other"}
              onChange={() => setSelected("other")}
              className="accent-[var(--accent)]"
            />
            Other — write your own reason
          </label>

          {/* Free-text — always visible for extra context, required only for "Other" */}
          <Textarea
            placeholder={
              selected === "other"
                ? "Tell us what's missing or what went wrong…"
                : "Anything else you'd like us to know? (optional)"
            }
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            rows={3}
            className="mt-1 resize-none text-sm"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Keep my subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
          >
            {isPending ? "Cancelling…" : "Cancel subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function BillingPage() {
  const searchParams = useSearchParams();
  const { data: usage, isLoading } = useUsage();
  const { data: cancelStats, isLoading: cancelStatsLoading } = useCancelSurveyStats();
  const checkout = useCheckout();
  const portal = usePortal();
  const cancelSubscription = useCancelSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const successParam = searchParams.get("success");
  const cancelParam = searchParams.get("cancel");

  const currentPlan = usage?.plan_tier ?? "starter";
  const planConfig = PLAN_CONFIG[currentPlan] ?? PLAN_CONFIG.starter;

  function handleConfirmCancel(reason: string, customReason: string) {
    cancelSubscription.mutate(
      { reason, custom_reason: customReason },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          toast({
            title: "Subscription cancelled",
            description: "You'll keep access until the end of your billing period.",
          });
        },
        onError: (e) => {
          toast({ title: "Failed to cancel", description: e.message, variant: "destructive" });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
      </div>

      {/* Success / checkout-cancel banners */}
      {successParam === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-[var(--accent-light)] bg-[var(--accent-light)] px-4 py-3 text-sm text-[var(--accent)]"
        >
          Your subscription has been updated successfully.
        </motion.div>
      )}
      {cancelParam === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-[#DED9F0] bg-[#F4F3FB] px-4 py-3 text-sm text-[#4C4869]"
        >
          Checkout was cancelled. No changes were made.
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Current Plan", value: planConfig.label, subtitle: planConfig.price, icon: Package },
          {
            title: "Events Used",
            value: usage
              ? `${(usage.events_used ?? 0).toLocaleString()} / ${(usage.events_limit ?? 0) <= 0 ? "Unlimited" : (usage.events_limit ?? 0).toLocaleString()}`
              : "— / —",
            icon: Zap,
          },
          {
            title: "Projects Used",
            value: usage
              ? `${usage.projects_used ?? 0} / ${(usage.projects_limit ?? 0) <= 0 ? "Unlimited" : (usage.projects_limit ?? 0)}`
              : "— / —",
            icon: FolderOpen,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <StatCard {...stat} isLoading={isLoading} />
          </motion.div>
        ))}
      </div>

      {/* Usage Meters */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 animate-pulse rounded bg-secondary" />
              <div className="h-8 animate-pulse rounded bg-secondary" />
            </div>
          ) : usage ? (
            <>
              <UsageMeter label="Events" used={usage.events_used ?? 0} limit={usage.events_limit ?? 0} />
              <UsageMeter label="Projects" used={usage.projects_used ?? 0} limit={usage.projects_limit ?? 0} />
              {usage.billing_period_start && (
                <p className="text-xs text-muted-foreground">
                  Billing period started {new Date(usage.billing_period_start).toLocaleDateString()}
                </p>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["starter", "growth", "scale"] as const).map((tier) => {
              const config = PLAN_CONFIG[tier];
              const isCurrent = currentPlan === tier;

              return (
                <div
                  key={tier}
                  className={`rounded-lg border p-4 transition-colors ${
                    isCurrent ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-border"
                  }`}
                >
                  <h3 className="font-display text-lg font-semibold text-foreground">{config.label}</h3>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">{config.price}</p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>{config.eventsLimit <= 0 ? "Unlimited" : config.eventsLimit.toLocaleString()} events/mo</li>
                    <li>{config.projectsLimit <= 0 ? "Unlimited" : config.projectsLimit} projects</li>
                  </ul>
                  <div className="mt-4">
                    {isCurrent ? (
                      <span className="inline-block rounded-sm bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white">
                        Current Plan
                      </span>
                    ) : tier === "starter" ? null : (
                      <button
                        onClick={() => checkout.mutate(tier)}
                        disabled={checkout.isPending}
                        className="inline-flex items-center rounded-sm bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {checkout.isPending ? "Redirecting..." : `Upgrade to ${config.label}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manage Subscription */}
      {currentPlan !== "starter" && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Update your payment method or view past invoices.
              </p>
              <Button variant="outline" onClick={() => portal.mutate()} disabled={portal.isPending}>
                <CreditCard className="mr-2 h-4 w-4" />
                {portal.isPending ? "Redirecting…" : "Billing Portal"}
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-1 text-sm font-medium text-foreground">Cancel subscription</p>
              <p className="mb-3 text-xs text-muted-foreground">
                You&apos;ll keep access until the end of your current billing period.
              </p>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Churn Insights — reason breakdown */}
      <CancelInsights stats={cancelStats} isLoading={cancelStatsLoading} />

      {/* Cancel Survey Dialog */}
      <CancelSurveyDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleConfirmCancel}
        isPending={cancelSubscription.isPending}
      />
    </div>
  );
}
