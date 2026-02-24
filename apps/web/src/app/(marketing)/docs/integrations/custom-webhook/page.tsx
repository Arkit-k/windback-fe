import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Webhook — Windback Docs",
  description: "Send churn events from any payment provider using Windback's generic webhook endpoint.",
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">Docs</Link>
      <span>/</span>
      <Link href="/docs/integrations/stripe" className="hover:text-foreground">Integrations</Link>
      <span>/</span>
      <span className="text-foreground">Custom Webhook</span>
    </nav>
  );
}

function CodeBlock({ children, lang }: { children: string; lang: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
        <span className="text-xs text-muted-foreground">{lang}</span>
      </div>
      <pre className="overflow-x-auto bg-background p-4 text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function CustomWebhookPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb />

        <h1 className="mt-6 font-display text-4xl font-semibold text-foreground">
          Custom Webhook
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Use the generic webhook endpoint to send churn events from any payment
          provider or internal system.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Overview
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If your payment provider isn&apos;t natively supported (Stripe, Razorpay, Paddle),
              you can send standardized churn events directly to Windback&apos;s generic endpoint.
              This works with any system that can make HTTP POST requests.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Endpoint
            </h2>
            <div className="mt-3">
              <CodeBlock lang="text">{`POST https://api.windbackai.com/webhooks/custom/<your-project-id>

Headers:
  Content-Type: application/json
  X-Windback-Signature: <HMAC-SHA256 signature>`}</CodeBlock>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Payload Schema
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Send a JSON body with the following fields:
            </p>
            <div className="mt-3">
              <CodeBlock lang="json">{`{
  "event_type": "subscription.canceled",
  "customer_id": "cus_abc123",
  "customer_email": "jane@example.com",
  "customer_name": "Jane Doe",
  "plan_name": "Pro Monthly",
  "mrr": 4900,
  "currency": "usd",
  "reason": "too_expensive",
  "canceled_at": "2026-02-15T10:30:00Z",
  "metadata": {
    "subscription_id": "sub_xyz",
    "provider": "chargebee"
  }
}`}</CodeBlock>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-card">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Field</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Type</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Required</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-xs">event_type</td><td className="px-4 py-2">string</td><td className="px-4 py-2">Yes</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-xs">customer_email</td><td className="px-4 py-2">string</td><td className="px-4 py-2">Yes</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-xs">customer_id</td><td className="px-4 py-2">string</td><td className="px-4 py-2">Yes</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-xs">plan_name</td><td className="px-4 py-2">string</td><td className="px-4 py-2">No</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-xs">mrr</td><td className="px-4 py-2">number (cents)</td><td className="px-4 py-2">No</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2 font-mono text-xs">reason</td><td className="px-4 py-2">string</td><td className="px-4 py-2">No</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">metadata</td><td className="px-4 py-2">object</td><td className="px-4 py-2">No</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Signature Verification
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign your payload using HMAC-SHA256 with your webhook secret and include it
              in the <code className="rounded bg-card px-1 py-0.5 text-xs font-mono">X-Windback-Signature</code> header.
            </p>
            <div className="mt-3">
              <CodeBlock lang="typescript">{`import crypto from "crypto";

const secret = process.env.WINDBACK_WEBHOOK_SECRET;
const payload = JSON.stringify(body);

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

// Include in request headers:
// X-Windback-Signature: sha256=<signature>`}</CodeBlock>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Example: cURL
            </h2>
            <div className="mt-3">
              <CodeBlock lang="bash">{`curl -X POST https://api.windbackai.com/webhooks/custom/<project-id> \\
  -H "Content-Type: application/json" \\
  -H "X-Windback-Signature: sha256=abc123..." \\
  -d '{
    "event_type": "subscription.canceled",
    "customer_id": "cus_001",
    "customer_email": "user@example.com",
    "plan_name": "Starter",
    "mrr": 2900,
    "reason": "switched_to_competitor"
  }'`}</CodeBlock>
            </div>
          </section>
        </div>

        {/* Next Steps */}
        <div className="mt-16 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Next Steps
          </h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/docs/sdks" className="text-sm text-[var(--accent)] hover:underline">
                SDKs
              </Link>
              <span className="text-sm text-muted-foreground"> — Use our client libraries instead of raw HTTP</span>
            </li>
            <li>
              <Link href="/docs/quickstart" className="text-sm text-[var(--accent)] hover:underline">
                Quickstart Guide
              </Link>
              <span className="text-sm text-muted-foreground"> — End-to-end setup walkthrough</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
