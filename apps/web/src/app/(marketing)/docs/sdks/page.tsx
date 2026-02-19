import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SDKs — Windback Docs",
  description: "Official Windback client libraries for Node.js, Python, and Go.",
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">Docs</Link>
      <span>/</span>
      <span className="text-foreground">SDKs</span>
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

const sdks = [
  {
    name: "Node.js",
    pkg: "@windback/node",
    install: "npm install @windback/node",
    example: `import Windback from "@windback/node";

const windback = new Windback({ apiKey: process.env.WINDBACK_API_KEY });

// List recent churn events
const events = await windback.events.list({ limit: 10 });

// Generate recovery emails for an event
const emails = await windback.emails.generate({
  eventId: events.data[0].id,
});

console.log(emails.variants); // 9 AI-generated variants`,
    lang: "typescript",
  },
  {
    name: "Python",
    pkg: "windback-sdk",
    install: "pip install windback-sdk",
    example: `import windback

client = windback.Client(api_key="pb_live_...")

# List recent churn events
events = client.events.list(limit=10)

# Generate recovery emails for an event
emails = client.emails.generate(event_id=events.data[0].id)

for variant in emails.variants:
    print(variant.subject, variant.body[:100])`,
    lang: "python",
  },
  {
    name: "Go",
    pkg: "github.com/windback-dev/windback-go",
    install: "go get github.com/windback-dev/windback-go",
    example: `package main

import (
    "fmt"
    windback "github.com/windback-dev/windback-go"
)

func main() {
    client := windback.NewClient("pb_live_...")

    // List recent churn events
    events, _ := client.Events.List(&windback.ListParams{Limit: 10})

    // Generate recovery emails
    emails, _ := client.Emails.Generate(events.Data[0].ID)

    for _, v := range emails.Variants {
        fmt.Println(v.Subject)
    }
}`,
    lang: "go",
  },
];

export default function SDKsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb />

        <h1 className="mt-6 font-display text-4xl font-semibold text-foreground">
          SDKs
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Official client libraries to integrate Windback into your application.
          All SDKs are fully typed and follow idiomatic patterns for each language.
        </p>

        <div className="mt-12 space-y-12">
          {sdks.map((sdk) => (
            <section key={sdk.name}>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {sdk.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Package: <code className="rounded bg-card px-1.5 py-0.5 text-xs font-mono">{sdk.pkg}</code>
              </p>
              <div className="mt-4 space-y-4">
                <CodeBlock lang="bash">{sdk.install}</CodeBlock>
                <CodeBlock lang={sdk.lang}>{sdk.example}</CodeBlock>
              </div>
            </section>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-16 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Next Steps
          </h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/docs/quickstart" className="text-sm text-[var(--accent)] hover:underline">
                Quickstart Guide
              </Link>
              <span className="text-sm text-muted-foreground"> — End-to-end setup walkthrough</span>
            </li>
            <li>
              <Link href="/docs/integrations/stripe" className="text-sm text-[var(--accent)] hover:underline">
                Stripe Integration
              </Link>
              <span className="text-sm text-muted-foreground"> — Connect your Stripe webhooks</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
