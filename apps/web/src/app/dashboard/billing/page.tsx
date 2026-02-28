"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@windback/ui";
import { StatCard } from "@/components/dashboard/stat-card";
import { useUsage, useCheckout, usePortal } from "@/hooks/use-billing";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, Package, FolderOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";

const PLAN_CONFIG: Record<
  string,
  { label: string; price: string; priceCents: number; eventsLimit: number; projectsLimit: number }
> = {
  starter: { label: "Starter", price: "Free",    priceCents: 0,    eventsLimit: 50,  projectsLimit: 1  },
  growth:  { label: "Growth",  price: "$29/mo",  priceCents: 2900, eventsLimit: 500, projectsLimit: 5  },
  scale:   { label: "Scale",   price: "$99/mo",  priceCents: 9900, eventsLimit: -1,  projectsLimit: -1 },
};

type PaybackWidgetConfig = {
  customerEmail?: string;
  customerName?: string;
  provider?: string;
  planName?: string;
  mrr?: number;
  currency?: string;
  tenureDays?: number;
};

type PaybackWidgetCallbacks = {
  onSuccess?: (response: unknown) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
};

type PaybackWidget = {
  init: (opts: { publicKey: string; baseURL?: string }) => void;
  showCancelForm: (customerData: PaybackWidgetConfig, callbacks?: PaybackWidgetCallbacks) => void;
};

declare global {
  interface Window {
    Payback?: PaybackWidget;
  }
}

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
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
            unlimited ? "bg-[var(--accent)] opacity-30" : isNearLimit ? "bg-red-500" : "bg-[var(--accent)]"
          }`}
          style={{ width: unlimited ? "100%" : `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { data: usage, isLoading } = useUsage();
  const { user } = useAuth();
  const checkout = useCheckout();
  const portal = usePortal();
  const [widgetReady, setWidgetReady] = useState(false);

  const successParam = searchParams.get("success");
  const cancelParam = searchParams.get("cancel");

  const currentPlan = usage?.plan_tier ?? "starter";
  const planConfig = PLAN_CONFIG[currentPlan] ?? PLAN_CONFIG.starter;
  const paybackBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.windbackai.com";
  const paybackPublicKey = process.env.NEXT_PUBLIC_PAYBACK_PUBLIC_KEY || "";

  useEffect(() => {
    if (!paybackPublicKey) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-payback-widget="true"]');
    if (existing && window.Payback) {
      window.Payback.init({ publicKey: paybackPublicKey, baseURL: paybackBaseURL });
      setWidgetReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `${paybackBaseURL}/widget.js`;
    script.async = true;
    script.dataset.paybackWidget = "true";
    script.onload = () => {
      if (!window.Payback) return;
      window.Payback.init({ publicKey: paybackPublicKey, baseURL: paybackBaseURL });
      setWidgetReady(true);
    };
    document.body.appendChild(script);
  }, [paybackBaseURL, paybackPublicKey]);

  const cancelFlowPayload = useMemo(
    () => ({
      customerEmail: user?.email || "",
      customerName: user?.name || "",
      provider: "custom",
      planName: planConfig.label,
      mrr: planConfig.priceCents,
      currency: "USD",
      tenureDays: 0,
    }),
    [planConfig.label, planConfig.priceCents, user?.email, user?.name],
  );

  function handleManageSubscription() {
    if (!paybackPublicKey || !widgetReady || !window.Payback) {
      portal.mutate();
      return;
    }

    window.Payback.showCancelForm(cancelFlowPayload, {
      onSuccess: () => portal.mutate(),
      // Never block subscription management if cancel-flow API has transient issues.
      onError: () => portal.mutate(),
    });
  }

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
              ? `${(usage.events_used ?? 0).toLocaleString()} / ${(usage.events_limit ?? 0) <= 0 ? "Unlimited" : (usage.events_limit ?? 0).toLocaleString()}`
              : "— / —",
            icon: Zap,
          },
          {
            title: "Projects Used",
            value: usage
              ? `${usage.projects_used ?? 0} / ${(usage.projects_limit ?? 0) <= 0 ? "Unlimited" : usage.projects_limit ?? 0}`
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
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Update payment method, view invoices, or cancel your subscription
              via the Stripe customer portal.
            </p>
            <button
              onClick={handleManageSubscription}
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
