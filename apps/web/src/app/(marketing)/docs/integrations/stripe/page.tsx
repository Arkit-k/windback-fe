import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stripe Integration",
  description: "Connect Stripe to Windback in minutes. Detect subscription cancellations and failed payments, then automatically trigger AI recovery emails and dunning sequences.",
  alternates: { canonical: "https://windback.io/docs/integrations/stripe" },
  openGraph: { title: "Stripe + Windback Integration", url: "https://windback.io/docs/integrations/stripe" },
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">Docs</Link>
      <span>/</span>
      <Link href="/docs/integrations/stripe" className="hover:text-foreground">Integrations</Link>
      <span>/</span>
      <span className="text-foreground">Stripe</span>
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

export default function StripeIntegrationPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb />

        <h1 className="mt-6 font-display text-4xl font-semibold text-foreground">
          Stripe Integration
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Connect your Stripe account to automatically detect subscription
          cancellations and trigger AI-powered recovery emails.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Prerequisites
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>A Stripe account with active subscriptions</li>
              <li>A Windback account (free tier works)</li>
              <li>Access to your Stripe Dashboard &rarr; Developers &rarr; Webhooks</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 1: Get Your Webhook URL
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Navigate to your Windback dashboard &rarr; Settings &rarr; Integrations.
              Copy the webhook URL displayed for Stripe.
            </p>
            <div className="mt-3">
              <CodeBlock lang="text">{`https://api.windbackai.com/webhooks/stripe/<your-project-id>`}</CodeBlock>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 2: Add Webhook in Stripe
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Go to <strong>Stripe Dashboard</strong> &rarr; Developers &rarr; Webhooks</li>
              <li>Click <strong>&quot;Add endpoint&quot;</strong></li>
              <li>Paste your Windback webhook URL</li>
              <li>Select the following events:
                <ul className="ml-4 mt-1 list-disc space-y-1">
                  <li><code className="rounded bg-card px-1 py-0.5 text-xs font-mono">customer.subscription.deleted</code></li>
                  <li><code className="rounded bg-card px-1 py-0.5 text-xs font-mono">customer.subscription.updated</code></li>
                  <li><code className="rounded bg-card px-1 py-0.5 text-xs font-mono">invoice.payment_failed</code></li>
                </ul>
              </li>
              <li>Click <strong>&quot;Add endpoint&quot;</strong> to save</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 3: Add Webhook Secret
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              After creating the endpoint, Stripe provides a signing secret (starts with <code className="rounded bg-card px-1 py-0.5 text-xs font-mono">whsec_</code>).
              Paste this into your Windback dashboard settings to enable signature verification.
            </p>
            <div className="mt-3">
              <CodeBlock lang="text">{`Webhook Signing Secret: whsec_xxxxxxxxxxxxxxxxxxxxxxxx

Paste this in:
  Windback Dashboard → Settings → Integrations → Stripe → Webhook Secret`}</CodeBlock>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Step 4: Test the Integration
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use Stripe&apos;s built-in webhook testing to send a test event.
            </p>
            <div className="mt-3">
              <CodeBlock lang="bash">{`# Using Stripe CLI
stripe trigger customer.subscription.deleted

# Or from the Stripe Dashboard:
# Developers → Webhooks → Select your endpoint → "Send test webhook"`}</CodeBlock>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Check your Windback dashboard — you should see the test event appear within seconds.
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
              <Link href="/docs/integrations/razorpay" className="text-sm text-[var(--accent)] hover:underline">
                Razorpay Integration
              </Link>
              <span className="text-sm text-muted-foreground"> — Connect Razorpay webhooks</span>
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
