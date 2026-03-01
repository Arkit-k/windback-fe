"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  toast,
} from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useAPIKeys } from "@/hooks/use-projects";
import { Copy, Check, ExternalLink, Loader2, Unplug, Zap } from "lucide-react";
import { useStripeConnectStatus, useStripeConnectAuthURL, useStripeConnectDisconnect } from "@/hooks/use-stripe-connect";
import { useSearchParams } from "next/navigation";

// Set NEXT_PUBLIC_STRIPE_CONNECT_ENABLED=true to show the one-click Connect button.
// Stripe Connect platform accounts are not available in India — leave unset to hide it.
const STRIPE_CONNECT_ENABLED =
  process.env.NEXT_PUBLIC_STRIPE_CONNECT_ENABLED === "true";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function ProjectIntegrationsPage() {
  const { project } = useCurrentProject();
  const [copied, setCopied] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const { data: apiKeys } = useAPIKeys(project.slug);
  const publicKeyMasked = apiKeys?.find((k) => k.key_type === "public")?.key_masked;

  const { data: stripeStatus, isLoading: stripeStatusLoading } =
    useStripeConnectStatus(project.slug);
  const { refetch: fetchAuthURL, isFetching: fetchingAuthURL } =
    useStripeConnectAuthURL(project.slug);
  const disconnectMutation = useStripeConnectDisconnect(project.slug);

  useEffect(() => {
    if (searchParams.get("stripe") === "connected") {
      toast({ title: "Stripe connected", description: "Webhook endpoint auto-registered." });
    }
  }, [searchParams]);

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleConnectStripe() {
    const result = await fetchAuthURL();
    if (result.data) {
      window.location.href = result.data;
    }
  }

  function handleDisconnect() {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => toast({ title: "Stripe disconnected" }),
      onError: (err) =>
        toast({ title: "Failed to disconnect", description: err.message, variant: "destructive" }),
    });
  }

  const webhookBase = `${BACKEND_URL}/api/v1/webhooks`;
  // Webhook URLs use YOUR_PUBLIC_KEY as placeholder since the full key is only
  // shown at creation / rotation time. The masked key is shown as a hint below.
  const stripeWebhookUrl = `${webhookBase}/stripe/YOUR_PUBLIC_KEY`;
  const razorpayWebhookUrl = `${webhookBase}/razorpay/YOUR_PUBLIC_KEY`;
  const customWebhookUrl = `${webhookBase}/custom/YOUR_PUBLIC_KEY`;

  const widgetSnippet = `<script
  src="${BACKEND_URL}/widget.js"
  data-api-key="YOUR_PUBLIC_KEY"
  async
></script>`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect {project.name} to your payment provider and embed the cancellation widget.
        </p>
      </div>

      {/* Active public key hint */}
      {publicKeyMasked && (
        <div className="rounded-sm border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          Your active public key:{" "}
          <code className="rounded bg-secondary px-1 font-mono">{publicKeyMasked}</code>
          {" "}— replace <code className="rounded bg-secondary px-1 font-mono">YOUR_PUBLIC_KEY</code> in
          the URLs below with your full key (shown at project creation, or rotate from{" "}
          <a href={`/dashboard/p/${project.slug}/settings/api-keys`} className="text-primary underline underline-offset-2">
            API Keys
          </a>
          ).
        </div>
      )}

      {/* Cancellation Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Cancellation Widget</CardTitle>
          <CardDescription>
            Add this script to your app to capture cancellation reasons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="overflow-x-auto rounded-sm border border-border bg-secondary p-4 text-xs font-mono">
              {widgetSnippet}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-3 top-3"
              onClick={() => copyToClipboard(widgetSnippet, "widget")}
            >
              {copied === "widget" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Providers</CardTitle>
          <CardDescription>
            Add your webhook URL to your payment provider to automatically receive churn and payment events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stripe">
            <TabsList>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            {/* ── Stripe ── */}
            <TabsContent value="stripe" className="mt-4 space-y-4">
              {/* Manual webhook URL — always shown */}
              <WebhookUrl
                label="Stripe Webhook URL"
                url={stripeWebhookUrl}
                onCopy={(v) => copyToClipboard(v, "stripe")}
                copied={copied === "stripe"}
              />
              <p className="text-xs text-muted-foreground">
                In Stripe Dashboard → Developers → Webhooks → Add endpoint. Listen for{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono">customer.subscription.deleted</code>,{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono">invoice.payment_failed</code>, and{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono">invoice.payment_succeeded</code>.
              </p>

              {/* One-click Connect — only shown when STRIPE_CONNECT_ENABLED */}
              {STRIPE_CONNECT_ENABLED && (
                <div className="border-t border-border pt-4">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">
                    Or use one-click setup (skips manual webhook configuration):
                  </p>
                  {stripeStatusLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </div>
                  ) : stripeStatus?.connected ? (
                    <StripeConnectedCard
                      accountID={stripeStatus.account_id}
                      onDisconnect={handleDisconnect}
                      isDisconnecting={disconnectMutation.isPending}
                    />
                  ) : (
                    <StripeConnectCard
                      onConnect={handleConnectStripe}
                      isConnecting={fetchingAuthURL}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── Razorpay ── */}
            <TabsContent value="razorpay" className="mt-4 space-y-3">
              <WebhookUrl
                label="Razorpay Webhook URL"
                url={razorpayWebhookUrl}
                onCopy={(v) => copyToClipboard(v, "razorpay")}
                copied={copied === "razorpay"}
              />
              <p className="text-xs text-muted-foreground">
                In Razorpay Dashboard → Settings → Webhooks → Add new webhook. Listen for{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono">subscription.cancelled</code> and{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono">payment.failed</code> events.
              </p>
            </TabsContent>

            {/* ── Custom ── */}
            <TabsContent value="custom" className="mt-4 space-y-3">
              <WebhookUrl
                label="Custom Webhook URL"
                url={customWebhookUrl}
                onCopy={(v) => copyToClipboard(v, "custom")}
                copied={copied === "custom"}
              />
              <p className="text-xs text-muted-foreground">
                Send a <code className="rounded bg-secondary px-1 py-0.5 font-mono">POST</code> with
                the churn event data. See docs for the payload format.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StripeConnectCard({ onConnect, isConnecting }: { onConnect: () => void; isConnecting: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[var(--accent-light)] p-2">
          <Zap className="h-4 w-4 text-[var(--accent)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">One-click Stripe setup</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Authorize once — Payback auto-registers the webhook endpoint and configures event
            forwarding. No copy-pasting required.
          </p>
          <Button onClick={onConnect} disabled={isConnecting} size="sm" className="mt-3">
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Connect Stripe
          </Button>
        </div>
      </div>
    </div>
  );
}

function StripeConnectedCard({
  accountID,
  onDisconnect,
  isDisconnecting,
}: {
  accountID: string | null;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
          <Check className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Stripe Connected</p>
          {accountID && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{accountID}</p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            Webhook auto-registered. Events forwarded automatically.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            disabled={isDisconnecting}
            className="mt-3 text-destructive hover:text-destructive"
          >
            {isDisconnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Unplug className="mr-2 h-4 w-4" />
            )}
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  );
}

function WebhookUrl({
  label,
  url,
  onCopy,
  copied,
}: {
  label: string;
  url: string;
  onCopy: (url: string) => void;
  copied: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-sm border border-border bg-secondary px-3 py-2 text-xs font-mono break-all">
          {url}
        </code>
        <Button variant="outline" size="icon" onClick={() => onCopy(url)}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
