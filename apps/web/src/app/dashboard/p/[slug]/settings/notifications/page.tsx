"use client";

import { use, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  toast,
} from "@windback/ui";
import { Bell, Slack, Webhook, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@windback/ui";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-[var(--accent)]" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function CheckboxItem({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border border-border accent-[var(--accent)]"
      />
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
import {
  useNotificationConfig,
  useUpdateNotificationConfig,
  useTestSlackNotification,
  useTestWebhookNotification,
} from "@/hooks/use-notification-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function NotificationsSettingsPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: config, isLoading } = useNotificationConfig(slug);
  const updateMutation = useUpdateNotificationConfig(slug);
  const testSlack = useTestSlackNotification(slug);
  const testWebhook = useTestWebhookNotification(slug);

  const [slackUrl, setSlackUrl] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [notifyChurnCreated, setNotifyChurnCreated] = useState(true);
  const [notifyChurnRecovered, setNotifyChurnRecovered] = useState(true);
  const [notifyPaymentFailed, setNotifyPaymentFailed] = useState(true);
  const [notifyPaymentRecovered, setNotifyPaymentRecovered] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (config) {
      setSlackUrl(config.slack_webhook_url ?? "");
      setSlackEnabled(config.slack_enabled);
      setWebhookUrl(config.custom_webhook_url ?? "");
      setWebhookEnabled(config.custom_webhook_enabled);
      setNotifyChurnCreated(config.notify_churn_created);
      setNotifyChurnRecovered(config.notify_churn_recovered);
      setNotifyPaymentFailed(config.notify_payment_failed);
      setNotifyPaymentRecovered(config.notify_payment_recovered);
    }
  }, [config]);

  function handleSave() {
    updateMutation.mutate(
      {
        slack_webhook_url: slackUrl || null,
        slack_enabled: slackEnabled,
        custom_webhook_url: webhookUrl || null,
        custom_webhook_enabled: webhookEnabled,
        notify_churn_created: notifyChurnCreated,
        notify_churn_recovered: notifyChurnRecovered,
        notify_payment_failed: notifyPaymentFailed,
        notify_payment_recovered: notifyPaymentRecovered,
      },
      {
        onSuccess: () => toast({ title: "Notifications saved" }),
        onError: (err) =>
          toast({ title: "Failed to save", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleTestSlack() {
    testSlack.mutate(undefined, {
      onSuccess: () => toast({ title: "Test message sent", description: "Check your Slack channel." }),
      onError: (err) =>
        toast({ title: "Test failed", description: err.message, variant: "destructive" }),
    });
  }

  function handleTestWebhook() {
    testWebhook.mutate(undefined, {
      onSuccess: () =>
        toast({ title: "Test webhook sent", description: "Check your endpoint for the test.ping event." }),
      onError: (err) =>
        toast({ title: "Test failed", description: err.message, variant: "destructive" }),
    });
  }

  const secretDisplay = config?.custom_webhook_secret_preview
    ? showSecret
      ? `(full secret hidden — copy from first setup)`
      : `••••••••••••${config.custom_webhook_secret_preview}`
    : "—";

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get notified in Slack or your own systems when customers churn or payments fail.
        </p>
      </div>

      {/* Slack Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Slack className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Slack</CardTitle>
          </div>
          <CardDescription>
            Post a message to your Slack workspace when key events occur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="slack-enabled" className="text-sm font-medium">
              Enable Slack notifications
            </Label>
            <Toggle checked={slackEnabled} onChange={setSlackEnabled} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slack-url" className="text-sm">
              Incoming Webhook URL
            </Label>
            <Input
              id="slack-url"
              type="url"
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Create one at{" "}
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[var(--accent)] hover:underline"
              >
                api.slack.com/messaging/webhooks
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestSlack}
            disabled={!slackUrl || testSlack.isPending}
          >
            {testSlack.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Send Test Message
          </Button>
        </CardContent>
      </Card>

      {/* Custom Webhook Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Custom Webhook</CardTitle>
          </div>
          <CardDescription>
            POST a signed JSON payload to your own endpoint. Works with Zapier, Make, n8n, or
            your own code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="webhook-enabled" className="text-sm font-medium">
              Enable webhook notifications
            </Label>
            <Toggle checked={webhookEnabled} onChange={setWebhookEnabled} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="webhook-url" className="text-sm">
              Endpoint URL
            </Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://yoursite.com/webhooks/payback"
            />
          </div>

          {config?.custom_webhook_secret_preview && (
            <div className="space-y-1.5">
              <Label className="text-sm">Signing Secret</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded border border-border bg-muted px-3 py-2 text-xs font-mono text-muted-foreground">
                  {secretDisplay}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setShowSecret((v) => !v)}
                >
                  {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Verify requests using{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">X-Payback-Signature</code>
                {" "}header — HMAC-SHA256 of the raw body.
              </p>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs text-[var(--accent)] hover:underline">
                  Show verification example (Node.js)
                </summary>
                <pre className="mt-2 overflow-x-auto rounded border border-border bg-muted p-3 text-[11px] leading-relaxed text-foreground">
{`const crypto = require("crypto");

function verifySignature(rawBody, secret, sigHeader) {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(sigHeader),
    Buffer.from(expected)
  );
}`}
                </pre>
              </details>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleTestWebhook}
            disabled={!webhookUrl || testWebhook.isPending}
          >
            {testWebhook.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Send Test Event
          </Button>
        </CardContent>
      </Card>

      {/* Event Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Event Filters</CardTitle>
          </div>
          <CardDescription>Choose which events trigger notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CheckboxItem
            id="notify-churn-created"
            label="Customer Churned"
            description="A new churn event is detected"
            checked={notifyChurnCreated}
            onChange={setNotifyChurnCreated}
          />
          <CheckboxItem
            id="notify-churn-recovered"
            label="Customer Recovered"
            description="A churned customer resubscribes"
            checked={notifyChurnRecovered}
            onChange={setNotifyChurnRecovered}
          />
          <CheckboxItem
            id="notify-payment-failed"
            label="Payment Failed"
            description="A payment failure is detected"
            checked={notifyPaymentFailed}
            onChange={setNotifyPaymentFailed}
          />
          <CheckboxItem
            id="notify-payment-recovered"
            label="Payment Recovered"
            description="A failed payment is successfully charged"
            checked={notifyPaymentRecovered}
            onChange={setNotifyPaymentRecovered}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Notifications
        </Button>
      </div>
    </div>
  );
}
