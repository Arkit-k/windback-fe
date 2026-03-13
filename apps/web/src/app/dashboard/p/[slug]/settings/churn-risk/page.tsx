"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Separator,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useChurnRiskConfig,
  useUpdateChurnRiskConfig,
  useRecalculateChurnRisk,
  useTestChurnRiskWebhook,
} from "@/hooks/use-churn-risk";
import { useAPIKeys } from "@/hooks/use-projects";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Zap,
  ZapOff,
  RefreshCw,
  Copy,
  Check,
  Webhook,
  ExternalLink,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function ChurnRiskSettingsPage() {
  const { project, slug } = useCurrentProject();
  const { data: config, isLoading } = useChurnRiskConfig(slug);
  const updateConfig = useUpdateChurnRiskConfig(slug);
  const recalculate = useRecalculateChurnRisk(slug);
  const testWebhook = useTestChurnRiskWebhook(slug);
  const { data: apiKeys } = useAPIKeys(slug);

  const [highThreshold, setHighThreshold] = useState(70);
  const [mediumThreshold, setMediumThreshold] = useState(40);
  const [autoEmailThreshold, setAutoEmailThreshold] = useState(70);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (config) {
      setHighThreshold(config.high_risk_threshold);
      setMediumThreshold(config.medium_risk_threshold);
      setAutoEmailThreshold(config.auto_email_threshold);
      setWebhookUrl(config.webhook_url ?? "");
    }
  }, [config]);

  const publicKey = apiKeys?.find((k) => k.key_type === "public")?.key_masked ?? "cg_pub_YOUR_KEY";

  function handleToggleEnabled() {
    updateConfig.mutate(
      { enabled: !(config?.enabled ?? true) },
      {
        onSuccess: () =>
          toast({
            title: config?.enabled ? "Churn scoring disabled" : "Churn scoring enabled",
          }),
        onError: (err) =>
          toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleToggleAutoEmail() {
    updateConfig.mutate(
      { auto_email_enabled: !(config?.auto_email_enabled ?? false) },
      {
        onSuccess: () =>
          toast({
            title: config?.auto_email_enabled
              ? "Auto-email disabled"
              : "Auto-email enabled",
          }),
        onError: (err) =>
          toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleSaveThresholds() {
    updateConfig.mutate(
      {
        high_risk_threshold: highThreshold,
        medium_risk_threshold: mediumThreshold,
        auto_email_threshold: autoEmailThreshold,
      },
      {
        onSuccess: () => toast({ title: "Thresholds saved" }),
        onError: (err) =>
          toast({ title: "Failed to save", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleRecalculate() {
    recalculate.mutate(undefined, {
      onSuccess: () => toast({ title: "Scores recalculated" }),
      onError: (err) =>
        toast({ title: "Recalculation failed", description: err.message, variant: "destructive" }),
    });
  }

  const snippetCurl = `curl -X POST https://api.windbackai.com/api/v1/track \\
  -H "X-API-Key: ${publicKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"customer_email":"user@example.com","event":"login"}'`;

  const snippetJS = `<script src="https://api.windbackai.com/widget.js"></script>
<script>
  Windback.init({ publicKey: "${publicKey}" });
  Windback.track("login", { customer_email: "user@example.com" });
  Windback.track("feature_used", { customer_email: "user@example.com", feature: "export" });
</script>`;

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Churn Risk
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure predictive churn scoring and automated retention emails for{" "}
          {project.name}.
        </p>
      </div>

      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Scoring</CardTitle>
          <CardDescription>
            Enable predictive churn scoring to identify at-risk customers before
            they cancel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Enable Churn Scoring</p>
                <p className="text-xs text-muted-foreground">
                  {config?.enabled !== false
                    ? "Enabled — scores are recalculated every 24 hours."
                    : "Disabled — no scores will be calculated."}
                </p>
              </div>
            </div>
            <Button
              variant={config?.enabled !== false ? "outline" : "default"}
              size="sm"
              onClick={handleToggleEnabled}
              disabled={isLoading || updateConfig.isPending}
            >
              {updateConfig.isPending
                ? "Saving..."
                : config?.enabled !== false
                  ? "Disable"
                  : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Thresholds</CardTitle>
          <CardDescription>
            Set the score boundaries for high and medium risk levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="high-threshold">High Risk Threshold</Label>
              <Input
                id="high-threshold"
                type="number"
                min={0}
                max={100}
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Customers scoring at or above this are &quot;high risk&quot;.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium-threshold">Medium Risk Threshold</Label>
              <Input
                id="medium-threshold"
                type="number"
                min={0}
                max={100}
                value={mediumThreshold}
                onChange={(e) => setMediumThreshold(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Customers scoring between this and high threshold are &quot;medium
                risk&quot;.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSaveThresholds}
            disabled={updateConfig.isPending}
            size="sm"
          >
            {updateConfig.isPending ? "Saving..." : "Save Thresholds"}
          </Button>
        </CardContent>
      </Card>

      {/* Auto Email */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Retention Email</CardTitle>
          <CardDescription>
            Automatically send AI-written retention emails when a customer's
            churn score crosses a threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              {config?.auto_email_enabled ? (
                <Zap className="h-5 w-5 text-primary" />
              ) : (
                <ZapOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Enable auto-email</p>
                <p className="text-xs text-muted-foreground">
                  {config?.auto_email_enabled
                    ? "Enabled — AI-written emails are sent automatically."
                    : "Disabled — scores are calculated but no emails are sent."}
                </p>
              </div>
            </div>
            <Button
              variant={config?.auto_email_enabled ? "outline" : "default"}
              size="sm"
              onClick={handleToggleAutoEmail}
              disabled={isLoading || updateConfig.isPending}
            >
              {updateConfig.isPending
                ? "Saving..."
                : config?.auto_email_enabled
                  ? "Disable"
                  : "Enable"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto-email-threshold">Send when score &ge;</Label>
            <Input
              id="auto-email-threshold"
              type="number"
              min={0}
              max={100}
              value={autoEmailThreshold}
              onChange={(e) => setAutoEmailThreshold(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <Button
            onClick={handleSaveThresholds}
            disabled={updateConfig.isPending}
            size="sm"
          >
            {updateConfig.isPending ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Delivery
          </CardTitle>
          <CardDescription>
            Instead of Windback sending emails directly, we POST the AI-generated
            email content to your webhook. Your system maps customer_id to their
            email and sends it — Windback never needs real customer emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-app.com/api/windback-webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  updateConfig.mutate(
                    { webhook_url: webhookUrl || "" },
                    {
                      onSuccess: () =>
                        toast({
                          title: webhookUrl
                            ? "Webhook URL saved"
                            : "Webhook URL cleared — falling back to direct email",
                        }),
                      onError: (err) =>
                        toast({
                          title: "Failed to save",
                          description: err.message,
                          variant: "destructive",
                        }),
                    },
                  );
                }}
                disabled={updateConfig.isPending}
              >
                {updateConfig.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              When set, auto-emails are POSTed here instead of being sent
              directly. Clear to fall back to direct email.
            </p>
          </div>

          {config?.webhook_secret && (
            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono truncate">
                  {config.webhook_secret}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(config.webhook_secret!);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                >
                  {copiedSecret ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Used to sign payloads with HMAC-SHA256. Sent in the{" "}
                <code className="text-xs">X-Windback-Signature</code> header.
              </p>
            </div>
          )}

          {config?.webhook_url && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  testWebhook.mutate(undefined, {
                    onSuccess: () =>
                      toast({ title: "Test webhook delivered successfully" }),
                    onError: (err) =>
                      toast({
                        title: "Test webhook failed",
                        description: err.message,
                        variant: "destructive",
                      }),
                  })
                }
                disabled={testWebhook.isPending}
              >
                <Send className={`mr-2 h-4 w-4 ${testWebhook.isPending ? "animate-pulse" : ""}`} />
                {testWebhook.isPending ? "Sending..." : "Send Test Webhook"}
              </Button>
              <Link
                href={`/dashboard/p/${slug}/settings/churn-risk/webhook-deliveries`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View delivery log
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">
              Webhook Verification Examples
            </p>

            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Node.js
                </p>
                <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs">{`const crypto = require('crypto');

app.post('/api/windback-webhook', (req, res) => {
  const signature = req.headers['x-windback-signature'];
  const expected = crypto
    .createHmac('sha256', process.env.WINDBACK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expected) return res.status(401).send('Invalid signature');

  const { customer_id, subject, body_html } = req.body;
  // Look up customer email from customer_id and send the email
  sendEmail(customer_id, subject, body_html);
  res.json({ ok: true });
});`}</pre>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Python
                </p>
                <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs">{`import hmac, hashlib, json
from flask import Flask, request, abort

@app.route('/api/windback-webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Windback-Signature', '')
    expected = hmac.new(
        WEBHOOK_SECRET.encode(), request.data, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        abort(401)

    data = request.json
    # Look up customer email from data['customer_id'] and send
    send_email(data['customer_id'], data['subject'], data['body_html'])
    return {'ok': True}`}</pre>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Go
                </p>
                <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs">{`func webhookHandler(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    mac := hmac.New(sha256.New, []byte(os.Getenv("WINDBACK_WEBHOOK_SECRET")))
    mac.Write(body)
    expected := hex.EncodeToString(mac.Sum(nil))

    if r.Header.Get("X-Windback-Signature") != expected {
        http.Error(w, "invalid signature", 401)
        return
    }

    var payload struct {
        CustomerID string \`json:"customer_id"\`
        Subject    string \`json:"subject"\`
        BodyHTML   string \`json:"body_html"\`
    }
    json.Unmarshal(body, &payload)
    // Look up customer email and send
    json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Snippet */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Snippet</CardTitle>
          <CardDescription>
            Send behavioral events from your app to power churn scoring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">
              Backend (cURL / server-side)
            </p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs">
                {snippetCurl}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => handleCopy(snippetCurl)}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium">Frontend (JavaScript)</p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs">
                {snippetJS}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => handleCopy(snippetJS)}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium">Supported Event Types</p>
            <div className="flex flex-wrap gap-2">
              {[
                "login",
                "feature_used",
                "billing_portal_visit",
                "team_member_removed",
                "plan_downgrade",
                "plan_upgrade",
                "support_ticket",
                "data_export",
                "cancel_button_clicked",
                "api_call",
                "invite_sent",
                "payment_failed",
                "session_end",
              ].map((event) => (
                <code
                  key={event}
                  className="rounded bg-muted px-2 py-1 text-xs"
                >
                  {event}
                </code>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recalculate */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Recalculation</CardTitle>
          <CardDescription>
            Trigger an immediate recalculation of all churn scores for this
            project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRecalculate}
            disabled={recalculate.isPending}
            variant="outline"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${recalculate.isPending ? "animate-spin" : ""}`}
            />
            {recalculate.isPending ? "Recalculating..." : "Recalculate Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
