"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { Copy, Check } from "lucide-react";

export default function ProjectIntegrationsPage() {
  const { project } = useCurrentProject();
  const [copied, setCopied] = useState<string | null>(null);

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const publicKey = "cg_pub_your_key_here";
  const webhookBase = `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.windback.dev"}/api/v1/webhooks`;

  const widgetSnippet = `<script
  src="${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.windback.dev"}/widget.js"
  data-api-key="${publicKey}"
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

      {/* Widget */}
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

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook URLs</CardTitle>
          <CardDescription>
            Configure these URLs in your payment provider&apos;s webhook settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stripe">
            <TabsList>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="stripe" className="mt-4 space-y-3">
              <WebhookUrl
                label="Stripe Webhook URL"
                url={`${webhookBase}/stripe/${publicKey}`}
                onCopy={(v) => copyToClipboard(v, "stripe")}
                copied={copied === "stripe"}
              />
              <p className="text-xs text-muted-foreground">
                Listen for <code className="rounded bg-secondary px-1 py-0.5 font-mono">customer.subscription.deleted</code> events.
              </p>
            </TabsContent>

            <TabsContent value="razorpay" className="mt-4 space-y-3">
              <WebhookUrl
                label="Razorpay Webhook URL"
                url={`${webhookBase}/razorpay/${publicKey}`}
                onCopy={(v) => copyToClipboard(v, "razorpay")}
                copied={copied === "razorpay"}
              />
              <p className="text-xs text-muted-foreground">
                Listen for <code className="rounded bg-secondary px-1 py-0.5 font-mono">subscription.cancelled</code> events.
              </p>
            </TabsContent>

            <TabsContent value="custom" className="mt-4 space-y-3">
              <WebhookUrl
                label="Custom Webhook URL"
                url={`${webhookBase}/custom/${publicKey}`}
                onCopy={(v) => copyToClipboard(v, "custom")}
                copied={copied === "custom"}
              />
              <p className="text-xs text-muted-foreground">
                Send a POST with the churn event data. See docs for the payload format.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
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
