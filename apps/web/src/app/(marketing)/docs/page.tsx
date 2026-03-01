import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Zap, Puzzle, Code2, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Windback docs — quickstart guide, Stripe/Razorpay/Paddle/Dodo Payments integration, SDK reference, and webhook setup.",
  alternates: { canonical: "https://windback.io/docs" },
  openGraph: {
    title: "Windback Documentation",
    description: "Quickstart guide, payment provider integrations, SDK reference, and webhook setup.",
    url: "https://windback.io/docs",
  },
};

const sections = [
  {
    icon: Zap,
    title: "Quickstart",
    description: "Get up and running in under 5 minutes with our step-by-step setup guide.",
    href: "/docs/quickstart",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: BookOpen,
    title: "API Reference",
    description: "Complete REST API documentation with request/response examples.",
    href: "/docs/quickstart",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Puzzle,
    title: "Integrations",
    description: "Connect Stripe, Razorpay, Paddle, or your custom webhook provider.",
    href: "/docs/integrations/stripe",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Code2,
    title: "SDKs",
    description: "Official client libraries for Node.js, Python, and Go.",
    href: "/docs/sdks",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Sparkles,
    title: "MCP Server",
    description: "Query your churn data and trigger recovery actions from Claude Desktop, Cursor, and any AI client.",
    href: "/docs/mcp",
    color: "bg-violet-50 text-violet-600",
  },
];

const quickLinks = [
  { label: "Stripe Integration", href: "/docs/integrations/stripe" },
  { label: "Razorpay Integration", href: "/docs/integrations/razorpay" },
  { label: "Paddle Integration", href: "/docs/integrations/paddle" },
  { label: "Custom Webhook", href: "/docs/integrations/custom-webhook" },
  { label: "MCP Server", href: "/docs/mcp" },
  { label: "Changelog", href: "/docs/changelog" },
];

export default function DocsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold text-foreground">
            Documentation
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Everything you need to integrate Windback and start recovering churned revenue.
          </p>

          {/* Decorative search input (non-functional) */}
          <div className="mx-auto mt-8 max-w-md">
            <div className="flex h-11 items-center gap-3 rounded-lg border border-border bg-card px-4">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-muted-foreground/60">Search documentation...</span>
            </div>
          </div>
        </div>

        {/* Card grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-[var(--accent)]/40 hover:shadow-sm"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${section.color}`}>
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground group-hover:text-[var(--accent)]">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-14">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Quick Links
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
