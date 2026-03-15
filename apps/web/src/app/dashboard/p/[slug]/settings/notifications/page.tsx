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
  Badge,
  toast,
} from "@windback/ui";
import {
  Bell,
  Slack,
  Webhook,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Clock,
  Mail,
  History,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Code2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@windback/ui";
import Link from "next/link";

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

function StatusDot({ status }: { status: "success" | "error" | "idle" }) {
  if (status === "idle") return null;
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          status === "success" ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span
        className={cn(
          "text-xs",
          status === "success" ? "text-green-600" : "text-red-600"
        )}
      >
        {status === "success" ? "Connected" : "Test failed"}
      </span>
    </span>
  );
}

function ComingSoonBadge() {
  return (
    <Badge variant="secondary" className="ml-2 text-[10px] uppercase tracking-wider">
      Coming Soon
    </Badge>
  );
}

const WEBHOOK_PAYLOADS: Record<string, { event: string; description: string; payload: string }> = {
  churn_created: {
    event: "churn.created",
    description: "Fired when a new churn event is detected for a customer.",
    payload: JSON.stringify(
      {
        event: "churn.created",
        timestamp: "2026-03-12T14:30:00Z",
        project_id: "proj_abc123",
        data: {
          customer_id: "cus_xyz789",
          email: "jane@example.com",
          subscription_id: "sub_456",
          mrr_lost: 4900,
          currency: "usd",
          reason: "cancelled",
          churn_risk_score: 0.87,
        },
      },
      null,
      2
    ),
  },
  churn_recovered: {
    event: "churn.recovered",
    description: "Fired when a previously churned customer resubscribes.",
    payload: JSON.stringify(
      {
        event: "churn.recovered",
        timestamp: "2026-03-12T16:45:00Z",
        project_id: "proj_abc123",
        data: {
          customer_id: "cus_xyz789",
          email: "jane@example.com",
          subscription_id: "sub_789",
          mrr_recovered: 4900,
          currency: "usd",
          recovery_method: "cancel_flow_offer",
        },
      },
      null,
      2
    ),
  },
  payment_failed: {
    event: "payment.failed",
    description: "Fired when a payment attempt fails.",
    payload: JSON.stringify(
      {
        event: "payment.failed",
        timestamp: "2026-03-12T09:15:00Z",
        project_id: "proj_abc123",
        data: {
          customer_id: "cus_xyz789",
          email: "jane@example.com",
          invoice_id: "inv_321",
          amount: 4900,
          currency: "usd",
          failure_code: "card_declined",
          attempt_count: 1,
          next_retry_at: "2026-03-15T09:15:00Z",
        },
      },
      null,
      2
    ),
  },
  payment_recovered: {
    event: "payment.recovered",
    description: "Fired when a previously failed payment is successfully charged.",
    payload: JSON.stringify(
      {
        event: "payment.recovered",
        timestamp: "2026-03-12T11:00:00Z",
        project_id: "proj_abc123",
        data: {
          customer_id: "cus_xyz789",
          email: "jane@example.com",
          invoice_id: "inv_321",
          amount: 4900,
          currency: "usd",
          recovery_method: "dunning_email",
          attempts_before_recovery: 2,
        },
      },
      null,
      2
    ),
  },
};

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

  // Connection status state
  const [slackTestStatus, setSlackTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [webhookTestStatus, setWebhookTestStatus] = useState<"idle" | "success" | "error">("idle");

  // Webhook payload examples collapsible
  const [payloadExamplesOpen, setPayloadExamplesOpen] = useState(false);
  const [activePayloadTab, setActivePayloadTab] = useState<string>("churn_created");

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
      onSuccess: () => {
        setSlackTestStatus("success");
        toast({ title: "Test message sent", description: "Check your Slack channel." });
      },
      onError: (err) => {
        setSlackTestStatus("error");
        toast({ title: "Test failed", description: err.message, variant: "destructive" });
      },
    });
  }

  function handleTestWebhook() {
    testWebhook.mutate(undefined, {
      onSuccess: () => {
        setWebhookTestStatus("success");
        toast({ title: "Test webhook sent", description: "Check your endpoint for the test.ping event." });
      },
      onError: (err) => {
        setWebhookTestStatus("error");
        toast({ title: "Test failed", description: err.message, variant: "destructive" });
      },
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Slack className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Slack</CardTitle>
            </div>
            <StatusDot status={slackTestStatus} />
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
                className="inline-flex items-center gap-0.5 text-accent-readable hover:underline"
              >
                api.slack.com/messaging/webhooks
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestSlack}
              disabled={!slackUrl || testSlack.isPending}
            >
              {testSlack.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Send Test Message
            </Button>
            {slackTestStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Last test succeeded
              </span>
            )}
            {slackTestStatus === "error" && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3.5 w-3.5" />
                Last test failed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Webhook Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Custom Webhook</CardTitle>
            </div>
            <StatusDot status={webhookTestStatus} />
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
              placeholder="https://yoursite.com/webhooks/windback"
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
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">X-Windback-Signature</code>
                {" "}header — HMAC-SHA256 of the raw body.
              </p>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs text-accent-readable hover:underline">
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

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestWebhook}
              disabled={!webhookUrl || testWebhook.isPending}
            >
              {testWebhook.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Send Test Event
            </Button>
            {webhookTestStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Last test succeeded
              </span>
            )}
            {webhookTestStatus === "error" && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3.5 w-3.5" />
                Last test failed
              </span>
            )}
          </div>
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

      {/* Webhook Payload Examples Card */}
      <Card>
        <CardHeader>
          <button
            type="button"
            onClick={() => setPayloadExamplesOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Webhook Payload Examples</CardTitle>
            </div>
            {payloadExamplesOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <CardDescription>
            Example JSON payloads sent to your custom webhook for each event type.
          </CardDescription>
        </CardHeader>
        {payloadExamplesOpen && (
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(WEBHOOK_PAYLOADS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivePayloadTab(key)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    activePayloadTab === key
                      ? "bg-[var(--accent)] text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {val.event}
                </button>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                {WEBHOOK_PAYLOADS[activePayloadTab]?.description}
              </p>
              <pre className="overflow-x-auto rounded border border-border bg-muted p-3 text-[11px] leading-relaxed text-foreground">
                {WEBHOOK_PAYLOADS[activePayloadTab]?.payload}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              All payloads include an{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[11px]">X-Windback-Signature</code>{" "}
              header for verification. Timestamps are in ISO 8601 / UTC format. Monetary amounts are
              in cents.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Notification Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Control when and how notifications are delivered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Quiet Hours</h3>
              <ComingSoonBadge />
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Notifications are currently sent in real-time as events occur. Quiet hours support
              (suppressing notifications during specified time windows) is not yet available but is
              on our roadmap.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Digest Mode</h3>
              <ComingSoonBadge />
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Daily digest emails will bundle all notification events from the past 24 hours into
              a single summary email, delivered at a time you choose. This feature is coming soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notification Activity Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Recent Notification Activity</CardTitle>
          </div>
          <CardDescription>
            A log of recently delivered notifications for this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <History className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Notification delivery history is recorded in the audit log.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              View the full log of notification events, including delivery status and timestamps,
              in the audit logs section.
            </p>
            <Link
              href={`/dashboard/p/${slug}/settings/audit-logs`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-readable hover:underline"
            >
              View Audit Logs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
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
