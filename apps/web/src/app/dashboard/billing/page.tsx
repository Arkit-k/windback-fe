"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@windback/ui";
import { StatCard } from "@/components/dashboard/stat-card";
import { useUsage, useCheckout, usePortal } from "@/hooks/use-billing";
import { CreditCard, Package, FolderOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";

const PLAN_CONFIG: Record<
  string,
  { label: string; price: string; eventsLimit: number; projectsLimit: number }
> = {
  starter: { label: "Starter", price: "Free", eventsLimit: 100, projectsLimit: 1 },
  growth: { label: "Growth", price: "$29/mo", eventsLimit: 5000, projectsLimit: 5 },
  scale: { label: "Scale", price: "$99/mo", eventsLimit: 50000, projectsLimit: 20 },
};

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percent >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isNearLimit ? "bg-red-500" : "bg-[var(--accent)]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { data: usage, isLoading } = useUsage();
  const checkout = useCheckout();
  const portal = usePortal();

  const successParam = searchParams.get("success");
  const cancelParam = searchParams.get("cancel");

  const currentPlan = usage?.plan_tier ?? "starter";
  const planConfig = PLAN_CONFIG[currentPlan] ?? PLAN_CONFIG.starter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Billing
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and usage.
        </p>
      </div>

      {/* Success / Cancel Messages */}
      {successParam === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
        >
          Your subscription has been updated successfully.
        </motion.div>
      )}
      {cancelParam === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
        >
          Checkout was cancelled. No changes were made.
        </motion.div>
      )}

      {/* Current Plan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Current Plan",
            value: planConfig.label,
            subtitle: planConfig.price,
            icon: Package,
          },
          {
            title: "Events Used",
            value: usage
              ? `${(usage.events_used ?? 0).toLocaleString()} / ${(usage.events_limit ?? 0).toLocaleString()}`
              : "0 / 0",
            icon: Zap,
          },
          {
            title: "Projects Used",
            value: usage
              ? `${usage.projects_used ?? 0} / ${usage.projects_limit ?? 0}`
              : "0 / 0",
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
              <UsageMeter
                label="Events"
                used={usage.events_used ?? 0}
                limit={usage.events_limit ?? 0}
              />
              <UsageMeter
                label="Projects"
                used={usage.projects_used ?? 0}
                limit={usage.projects_limit ?? 0}
              />
              {usage.billing_period_start && (
                <p className="text-xs text-muted-foreground">
                  Billing period started{" "}
                  {new Date(usage.billing_period_start).toLocaleDateString()}
                </p>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Plan Selection */}
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
                    isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-border"
                  }`}
                >
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {config.label}
                  </h3>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    {config.price}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>{config.eventsLimit.toLocaleString()} events/mo</li>
                    <li>{config.projectsLimit} projects</li>
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
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Update payment method, view invoices, or cancel your subscription
              via the Stripe customer portal.
            </p>
            <button
              onClick={() => portal.mutate()}
              disabled={portal.isPending}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {portal.isPending ? "Redirecting..." : "Manage Subscription"}
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
