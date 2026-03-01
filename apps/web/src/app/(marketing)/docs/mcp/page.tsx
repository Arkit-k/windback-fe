import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Server — Payback Docs",
  description:
    "Connect Payback to Claude Desktop, Cursor, and any MCP-compatible AI client. Query your churn data and trigger recovery actions with natural language.",
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">Docs</Link>
      <span>/</span>
      <span className="text-foreground">MCP Server</span>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      {children}
    </div>
  );
}

const tools = [
  {
    category: "Analytics & Stats",
    items: [
      { name: "get_churn_stats", desc: "Overview: total events, recovered count, MRR at risk, recovery rate" },
      { name: "get_email_analytics", desc: "Email performance: open rate, click rate, daily breakdown (last 30 days)" },
      { name: "get_recovery_trends", desc: "Day-by-day recovery trends for the last N days" },
      { name: "get_cancel_insights", desc: "Cancel reason distribution and recent written customer feedback" },
    ],
  },
  {
    category: "Churn Events",
    items: [
      { name: "list_churn_events", desc: "List events with status filter and pagination" },
      { name: "get_churn_event", desc: "Full event details including AI-generated email variants" },
      { name: "mark_event_recovered", desc: "Manually mark an event as recovered" },
    ],
  },
  {
    category: "Recovery Emails",
    items: [
      { name: "generate_variants", desc: "Trigger AI to generate 9 recovery email variants for an event" },
      { name: "send_variant", desc: "Send a specific recovery email variant to the churned customer" },
      { name: "submit_cancel_flow", desc: "All-in-one: create event + generate variants + send best email automatically" },
    ],
  },
  {
    category: "Payment Failures",
    items: [
      { name: "list_payment_failures", desc: "List failed payment records with status filter and pagination" },
      { name: "get_payment_failure_stats", desc: "Dunning overview: failing, recovered, MRR at risk, recovery rate" },
    ],
  },
];

const examplePrompts = [
  "Why are my Pro plan customers churning this month?",
  "Show me all churn events that haven't received a winback email yet",
  "What's my recovery rate and how does it compare to last week?",
  "What's the most common cancel reason across all my customers?",
  "Generate recovery emails for event abc-123, then send the discount variant",
  "How many customers churned today and what was their total MRR?",
  "Show me customers who cited price — how much MRR is at risk?",
  "What's my email open rate on winback campaigns this month?",
];

export default function MCPDocsPage() {
  const claudeDesktopConfig = `{
  "mcpServers": {
    "payback": {
      "command": "npx",
      "args": ["-y", "@payback-ai/mcp"],
      "env": {
        "PAYBACK_API_KEY": "pb_sk_your_secret_key",
        "PAYBACK_PROJECT_SLUG": "your-project-slug"
      }
    }
  }
}`;

  const cursorConfig = `{
  "mcpServers": {
    "payback": {
      "command": "npx",
      "args": ["-y", "@payback-ai/mcp"],
      "env": {
        "PAYBACK_API_KEY": "pb_sk_your_secret_key",
        "PAYBACK_PROJECT_SLUG": "your-project-slug"
      }
    }
  }
}`;

  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumb />

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold text-foreground">MCP Server</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Connect Payback to Claude Desktop, Cursor, and any MCP-compatible AI client.
              Ask natural language questions about your churn data and trigger recovery actions — no dashboard required.
            </p>
          </div>
        </div>

        {/* What is MCP */}
        <div className="mt-12 space-y-12">
          <Section title="What is MCP?">
            <p className="text-muted-foreground">
              The <strong className="text-foreground">Model Context Protocol (MCP)</strong> is an open standard
              that lets AI models like Claude connect to external tools and data sources. Once you set up
              the Payback MCP server, Claude can read your churn data and take actions — like sending
              recovery emails — directly from a conversation.
            </p>
            <Callout>
              <strong>No code required.</strong> Once configured, just talk to Claude:
              {" "}<em>"Why are my customers churning?"</em> and Claude will query your live data to answer.
            </Callout>
          </Section>

          {/* Installation */}
          <Section title="Installation">
            <p className="text-sm text-muted-foreground">
              The MCP server runs via{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">npx</code> — no global install needed.
              You can also install globally:
            </p>
            <CodeBlock lang="bash">npm install -g @payback-ai/mcp</CodeBlock>
          </Section>

          {/* Claude Desktop */}
          <Section title="Claude Desktop Setup">
            <p className="text-sm text-muted-foreground">
              Open your Claude Desktop config file and add the{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">payback</code> server:
            </p>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Config file location:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">macOS:</strong>{" "}
                  <code className="font-mono text-xs">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                </li>
                <li>
                  <strong className="text-foreground">Windows:</strong>{" "}
                  <code className="font-mono text-xs">%APPDATA%\Claude\claude_desktop_config.json</code>
                </li>
              </ul>
            </div>
            <CodeBlock lang="json">{claudeDesktopConfig}</CodeBlock>
            <p className="text-sm text-muted-foreground">
              Restart Claude Desktop. You'll see a{" "}
              <strong className="text-foreground">🔨 hammer icon</strong> in the chat input — Payback tools are ready.
            </p>
          </Section>

          {/* Cursor */}
          <Section title="Cursor / Windsurf Setup">
            <p className="text-sm text-muted-foreground">
              Add a{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">.cursor/mcp.json</code> file
              in your project root (or use the global MCP settings):
            </p>
            <CodeBlock lang="json">{cursorConfig}</CodeBlock>
          </Section>

          {/* Env vars */}
          <Section title="Environment Variables">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card text-left">
                    <th className="px-4 py-3 font-medium text-foreground">Variable</th>
                    <th className="px-4 py-3 font-medium text-foreground">Required</th>
                    <th className="px-4 py-3 font-medium text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "PAYBACK_API_KEY",
                      req: "Yes",
                      desc: "Your Payback secret key (pb_sk_...) — find it in Settings → API Keys",
                    },
                    {
                      name: "PAYBACK_PROJECT_SLUG",
                      req: "Yes (most tools)",
                      desc: "Your project slug from the dashboard URL (e.g. my-saas)",
                    },
                    {
                      name: "PAYBACK_BASE_URL",
                      req: "No",
                      desc: "Override the API base URL (default: https://api.windbackai.com)",
                    },
                  ].map((row) => (
                    <tr key={row.name} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs">{row.name}</code>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.req}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Tools reference */}
          <Section title="Available Tools">
            <p className="text-sm text-muted-foreground">
              The MCP server exposes{" "}
              <strong className="text-foreground">12 tools</strong> across four categories.
              Claude will pick the right tool automatically based on your question.
            </p>
            <div className="space-y-6">
              {tools.map((group) => (
                <div key={group.category}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.category}
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <tbody>
                        {group.items.map((tool, i) => (
                          <tr
                            key={tool.name}
                            className={i < group.items.length - 1 ? "border-b border-border" : ""}
                          >
                            <td className="px-4 py-3 align-top">
                              <code className="font-mono text-xs text-foreground">{tool.name}</code>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{tool.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Example prompts */}
          <Section title="Example Prompts">
            <p className="text-sm text-muted-foreground">
              Copy any of these into Claude after connecting the MCP server:
            </p>
            <div className="space-y-2">
              {examplePrompts.map((prompt) => (
                <div
                  key={prompt}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <span className="mt-0.5 text-muted-foreground">💬</span>
                  <p className="text-sm text-foreground">"{prompt}"</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Next steps */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Next Steps</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/docs/quickstart" className="text-sm text-[var(--accent)] hover:underline">
                  Quickstart Guide
                </Link>
                <span className="text-sm text-muted-foreground"> — End-to-end setup walkthrough</span>
              </li>
              <li>
                <Link href="/docs/sdks" className="text-sm text-[var(--accent)] hover:underline">
                  SDKs
                </Link>
                <span className="text-sm text-muted-foreground"> — Node.js, Python, and Go client libraries</span>
              </li>
              <li>
                <Link href="/docs/integrations/stripe" className="text-sm text-[var(--accent)] hover:underline">
                  Stripe Integration
                </Link>
                <span className="text-sm text-muted-foreground"> — Connect webhooks to start tracking churn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
