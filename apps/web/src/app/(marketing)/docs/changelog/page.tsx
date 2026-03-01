import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Windback Docs",
  description: "Latest updates and improvements to the Windback platform.",
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">Docs</Link>
      <span>/</span>
      <span className="text-foreground">Changelog</span>
    </nav>
  );
}

const entries = [
  {
    version: "1.5.0",
    date: "March 1, 2026",
    title: "Email Review, Approval Flow & Custom Templates",
    changes: [
      "Edit variant — modify the AI-generated subject or body before sending directly from the event detail page",
      "Approval UX — when auto-send is off, an amber banner highlights which email is waiting for your review and the recommended variant is visually marked",
      "Custom email templates — write your own winback email per cancel reason (too_expensive, missing_features, etc.); active templates bypass AI generation entirely",
      "Template variable substitution — use {{customer_name}}, {{customer_email}}, {{plan_name}}, {{cancel_reason}} in subject and body",
      "SDK v0.3.0 — Node.js, Python, Go SDKs and the MCP server now expose updateVariant, listTemplates, createTemplate, updateTemplate, and deleteTemplate",
    ],
  },
  {
    version: "1.4.0",
    date: "February 10, 2026",
    title: "Paddle Integration & Email Analytics",
    changes: [
      "Added Paddle webhook integration — connect your Paddle account in one click",
      "Email analytics dashboard with open rates, click rates, and conversion tracking",
      "New email template editor with live preview",
      "Bug fix: resolved webhook retry duplication on timeout events",
    ],
  },
  {
    version: "1.3.0",
    date: "January 22, 2026",
    title: "Custom Webhook Support",
    changes: [
      "Custom webhook endpoint for any payment provider not natively supported",
      "Configurable payload mapping to normalize event data",
      "Added webhook signature verification for enhanced security",
      "Improved AI prompt tuning for higher-quality recovery emails",
    ],
  },
  {
    version: "1.2.0",
    date: "January 8, 2026",
    title: "SDKs & Cancellation Widget",
    changes: [
      "Official SDKs released for Node.js, Python, and Go",
      "Embeddable cancellation widget to capture reasons before customers leave",
      "SSO support for team management on the Scale plan",
      "Performance improvements: 40% faster email generation",
    ],
  },
  {
    version: "1.1.0",
    date: "December 15, 2025",
    title: "Razorpay Integration & Dashboard Overhaul",
    changes: [
      "Added Razorpay webhook integration",
      "Redesigned dashboard with real-time MRR at risk, recovery rate, and event timeline",
      "Bulk email actions — select and send multiple recovery emails at once",
      "API rate limit increase to 1000 requests/minute for paid plans",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb />

        <h1 className="mt-6 font-display text-4xl font-semibold text-foreground">
          Changelog
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Latest updates, improvements, and fixes to the Windback platform.
        </p>

        <div className="mt-12 space-y-10">
          {entries.map((entry) => (
            <article key={entry.version} className="relative border-l-2 border-border pl-6">
              <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                  v{entry.version}
                </span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                {entry.title}
              </h2>
              <ul className="mt-3 space-y-1.5">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    {change}
                  </li>
                ))}
              </ul>
            </article>
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
              <span className="text-sm text-muted-foreground"> — Get started with Windback</span>
            </li>
            <li>
              <Link href="/docs" className="text-sm text-[var(--accent)] hover:underline">
                Documentation Home
              </Link>
              <span className="text-sm text-muted-foreground"> — Browse all docs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
