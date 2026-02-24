import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paddle Integration — Windback Docs",
  description: "Set up Paddle webhooks with Windback to detect subscription cancellations.",
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">Docs</Link>
      <span>/</span>
      <Link href="/docs/integrations/stripe" className="hover:text-foreground">Integrations</Link>
      <span>/</span>
      <span className="text-foreground">Paddle</span>
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

export default function PaddleIntegrationPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb />

        <h1 className="mt-6 font-display text-4xl font-semibold text-foreground">
          Paddle Integration
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Connect your Paddle account to detect subscription cancellations and
          failed payments automatically.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Prerequisites
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>A Paddle account (Classic or Billing)</li>
              <li>A Windback account (free tier works)</li>
              <li>Access to Paddle Developer Settings &rarr; Notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 1: Get Your Webhook URL
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Go to your Windback dashboard &rarr; Settings &rarr; Integrations and copy
              the Paddle webhook URL.
            </p>
            <div className="mt-3">
              <CodeBlock lang="text">{`https://api.windbackai.com/webhooks/paddle/<your-project-id>`}</CodeBlock>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 2: Create a Notification Destination
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Go to <strong>Paddle Dashboard</strong> &rarr; Developer Tools &rarr; Notifications</li>
              <li>Click <strong>&quot;New destination&quot;</strong></li>
              <li>Set type to <strong>Webhook</strong></li>
              <li>Paste your Windback webhook URL</li>
              <li>Subscribe to the following events:
                <ul className="ml-4 mt-1 list-disc space-y-1">
                  <li><code className="rounded bg-card px-1 py-0.5 text-xs font-mono">subscription.canceled</code></li>
                  <li><code className="rounded bg-card px-1 py-0.5 text-xs font-mono">subscription.past_due</code></li>
                  <li><code className="rounded bg-card px-1 py-0.5 text-xs font-mono">transaction.payment_failed</code></li>
                </ul>
              </li>
              <li>Click <strong>&quot;Save destination&quot;</strong></li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 3: Add Verification Key
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Copy the webhook secret key from Paddle&apos;s notification settings and paste it into
              your Windback dashboard to enable signature verification.
            </p>
            <div className="mt-3">
              <CodeBlock lang="text">{`Windback Dashboard → Settings → Integrations → Paddle → Webhook Secret`}</CodeBlock>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 4: Test the Integration
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use Paddle&apos;s &quot;Simulate&quot; feature to send a test notification.
              Navigate to the notification destination and click &quot;Simulate&quot; to send
              a test <code className="rounded bg-card px-1 py-0.5 text-xs font-mono">subscription.canceled</code> event.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check your Windback dashboard — the test event should appear within seconds.
            </p>
          </section>
        </div>

        {/* Next Steps */}
        <div className="mt-16 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Next Steps
          </h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/docs/integrations/custom-webhook" className="text-sm text-[var(--accent)] hover:underline">
                Custom Webhook
              </Link>
              <span className="text-sm text-muted-foreground"> — Connect any payment provider</span>
            </li>
            <li>
              <Link href="/docs/sdks" className="text-sm text-[var(--accent)] hover:underline">
                SDKs
              </Link>
              <span className="text-sm text-muted-foreground"> — Use our client libraries</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
