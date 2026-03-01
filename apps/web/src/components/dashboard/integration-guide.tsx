"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@windback/ui";
import { Check, Copy, ArrowRight, Zap, Globe, Code2 } from "lucide-react";
import Link from "next/link";
import { useAPIKeys } from "@/hooks/use-projects";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

interface IntegrationGuideProps {
  projectSlug: string;
}

export function IntegrationGuide({ projectSlug }: IntegrationGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const { data: apiKeys } = useAPIKeys(projectSlug);
  const publicKeyMasked = apiKeys?.find((k) => k.key_type === "public")?.key_masked;

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const webhookUrl = `${BACKEND_URL}/api/v1/webhooks/stripe/${publicKeyMasked ?? "YOUR_PUBLIC_KEY"}`;
  const sdkSnippet = `npm install @payback-ai/node

// In your cancel flow handler:
import { Payback } from "@payback-ai/node";
const pb = new Payback("YOUR_SECRET_KEY"); // cg_sk_...

pb.submitCancelFlow({
  email: customer.email,
  provider: "stripe",
  mrr: subscription.amount,
  currency: "USD",
  cancelReason: "too_expensive",  // from your cancel survey
});`;

  const widgetSnippet = `<!-- Add before </body> in your app -->
<script src="${BACKEND_URL}/widget.js" async></script>
<script>
  Payback.init({ apiKey: "YOUR_PUBLIC_KEY" });
</script>

<!-- On your cancel button click: -->
<script>
  Payback.showCancelForm({
    customerEmail: currentUser.email,
    provider: "stripe",
    mrr: subscription.amount,
    currency: "USD",
  });
</script>`;

  const steps = [
    {
      number: 1,
      icon: Globe,
      title: "Add your webhook URL",
      description:
        "Go to your Stripe dashboard → Webhooks → Add endpoint. Paste your webhook URL and listen for subscription.deleted events.",
      action: (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Stripe webhook URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded border border-border bg-muted px-3 py-2 text-xs font-mono break-all">
              {webhookUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => copy(webhookUrl, "webhook")}
            >
              {copied === "webhook" ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {publicKeyMasked
              ? <>Your active public key ends in <code className="rounded bg-muted px-1 font-mono">{publicKeyMasked.slice(-8)}</code>. Use the full key (from project creation or after rotation).</>
              : <>Your public key is shown in <Link href={`/dashboard/p/${projectSlug}/settings/api-keys`} className="text-primary underline underline-offset-2">Settings → API Keys</Link>.</>
            }
          </p>
        </div>
      ),
    },
    {
      number: 2,
      icon: Zap,
      title: "Capture cancel reasons (recommended)",
      description:
        "Use the SDK or widget so Payback knows why customers leave. This lets the AI pick the best winback strategy.",
      action: (
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Option A — SDK (server-side)</p>
            <div className="relative">
              <pre className="overflow-x-auto rounded border border-border bg-muted p-3 text-xs font-mono leading-relaxed">
                {sdkSnippet}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => copy(sdkSnippet, "sdk")}
              >
                {copied === "sdk" ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Option B — Widget (client-side modal)</p>
            <div className="relative">
              <pre className="overflow-x-auto rounded border border-border bg-muted p-3 text-xs font-mono leading-relaxed">
                {widgetSnippet}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => copy(widgetSnippet, "widget")}
              >
                {copied === "widget" ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      icon: Code2,
      title: "Trigger a test cancellation",
      description:
        "Cancel a test subscription in Stripe. Within seconds it should appear here as a churn event, and Payback will send the winback email automatically.",
      action: (
        <div className="mt-3">
          <Link href={`/dashboard/p/${projectSlug}/events`}>
            <Button variant="outline" size="sm" className="gap-2">
              Watch for events <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Get your first churn event</CardTitle>
        <CardDescription>
          Follow these steps to start recovering churned customers automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="font-medium text-sm text-foreground">
                  {step.number}. {step.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                {step.action}
              </div>
            </div>
          );
        })}

        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <Link
              href={`/dashboard/p/${projectSlug}/settings/integrations`}
              className="font-medium text-primary underline underline-offset-2"
            >
              View all integration options
            </Link>{" "}
            or check the{" "}
            <a
              href="/docs/quickstart"
              className="font-medium text-primary underline underline-offset-2"
            >
              quickstart docs
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
