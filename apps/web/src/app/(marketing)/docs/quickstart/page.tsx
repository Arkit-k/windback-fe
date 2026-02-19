import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quickstart — Windback Docs",
  description: "Get started with Windback in under 5 minutes.",
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">Docs</Link>
      <span>/</span>
      <span className="text-foreground">Quickstart</span>
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

export default function QuickstartPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb />

        <h1 className="mt-6 font-display text-4xl font-semibold text-foreground">
          Quickstart
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Get Windback integrated with your app in 3 simple steps.
        </p>

        <div className="mt-12 space-y-12">
          {/* Step 1 */}
          <section>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                1
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Install the SDK
              </h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Choose your preferred language and install the Windback SDK.
            </p>
            <div className="mt-4 space-y-3">
              <CodeBlock lang="bash">{`# Node.js
npm install @windback/node

# Python
pip install windback-sdk

# Go
go get github.com/windback-dev/windback-go`}</CodeBlock>
            </div>
          </section>

          {/* Step 2 */}
          <section>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                2
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Configure Your Webhook
              </h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Add your Windback webhook URL to your payment provider&apos;s dashboard.
              You&apos;ll find this URL in your{" "}
              <Link href="/dashboard/settings/integrations" className="text-[var(--accent)] hover:underline">
                dashboard settings
              </Link>.
            </p>
            <div className="mt-4">
              <CodeBlock lang="text">{`Webhook URL: https://api.windback.dev/webhooks/<your-project-id>

Events to listen for:
  - customer.subscription.deleted
  - customer.subscription.updated (status = canceled)
  - invoice.payment_failed`}</CodeBlock>
            </div>
          </section>

          {/* Step 3 */}
          <section>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                3
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Send Your First Event
              </h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              Trigger a test cancellation event to verify everything is working.
            </p>
            <div className="mt-4">
              <CodeBlock lang="typescript">{`import Windback from "@windback/node";

const windback = new Windback({ apiKey: "pb_test_..." });

// Send a test churn event
await windback.events.create({
  provider: "stripe",
  customerId: "cus_test_123",
  customerEmail: "test@example.com",
  planName: "Pro Monthly",
  mrr: 4900, // in cents
  reason: "too_expensive",
});

console.log("Event created! Check your dashboard.");`}</CodeBlock>
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
                Explore SDKs
              </Link>
              <span className="text-sm text-muted-foreground"> — Dive deeper into the client libraries</span>
            </li>
            <li>
              <Link href="/docs/integrations/stripe" className="text-sm text-[var(--accent)] hover:underline">
                Stripe Integration Guide
              </Link>
              <span className="text-sm text-muted-foreground"> — Full walkthrough for Stripe webhooks</span>
            </li>
            <li>
              <Link href="/docs/changelog" className="text-sm text-[var(--accent)] hover:underline">
                Changelog
              </Link>
              <span className="text-sm text-muted-foreground"> — See what&apos;s new in Windback</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
