"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Zap,
  Lock,
  Code2,
  Link2,
  Monitor,
  Package,
  ArrowRight,
  BookOpen,
  Terminal,
  Sparkles,
  Shield,
  BarChart3,
  Mail,
  Globe,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/* ── Data ── */

const quickLinks = [
  {
    title: "Quickstart",
    description: "Get up and running with Windback in under 5 minutes.",
    href: "/docs/quickstart",
    icon: Zap,
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Authentication",
    description: "Learn how API keys work and how to authenticate requests.",
    href: "/docs/authentication",
    icon: Lock,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "API Reference",
    description: "Complete reference for every endpoint, parameter, and response.",
    href: "/docs/api-reference",
    icon: Code2,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Integrations",
    description: "Connect Stripe, Razorpay, or your own payment provider.",
    href: "/docs/integrations/stripe",
    icon: Link2,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Cancel Widget",
    description: "Embed the exit-intent widget to intercept cancellations in real time.",
    href: "/docs/widget/installation",
    icon: Monitor,
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10",
  },
  {
    title: "SDKs",
    description: "Official client libraries for Node.js, Python, and Go.",
    href: "/docs/sdks/node",
    icon: Package,
    color: "from-indigo-400 to-blue-600",
    bgColor: "bg-indigo-500/10",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Recovery",
    description:
      "Generate 9 unique email variants using strategies like discounts, feature highlights, social proof, and founder emails.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Shield,
    title: "Multi-Provider Support",
    description:
      "Native webhooks for Stripe and Razorpay. Custom webhook endpoint for any billing system you use.",
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track MRR at risk, recovery rates, and churn trends. Know exactly which strategies work best.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: Mail,
    title: "One-Click Send",
    description:
      "Preview AI-generated emails, pick the best variant, and send it directly — all from the dashboard.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: Globe,
    title: "Multi-Project",
    description:
      "Manage churn recovery for multiple products from one account. Each project gets isolated keys and data.",
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    icon: Layers,
    title: "Drop-In Widget",
    description:
      "A single script tag adds a cancellation flow to your app. Captures reasons before the customer leaves.",
    gradient: "from-indigo-400 to-blue-600",
  },
];

const stats = [
  { value: "9", label: "AI Strategies", suffix: "" },
  { value: "3", label: "SDK Languages", suffix: "" },
  { value: "<5", label: "Min Setup", suffix: "min" },
  { value: "100", label: "Uptime", suffix: "%" },
];

const codeExamples = [
  {
    lang: "Node.js",
    code: `import Windback from "@windback/node";

const pb = new Windback({ apiKey: "cg_sk_..." });

const events = await pb.churnEvents.list();
const recovery = await pb.churnEvents.generate(
  events[0].id
);`,
  },
  {
    lang: "Python",
    code: `from windback import Windback

pb = Windback(api_key="cg_sk_...")

events = pb.churn_events.list()
recovery = pb.churn_events.generate(
    events[0].id
)`,
  },
  {
    lang: "Go",
    code: `import "github.com/windback/windback-go"

client := windback.New("cg_sk_...")

events, _ := client.ChurnEvents.List(ctx)
recovery, _ := client.ChurnEvents.Generate(
    ctx, events[0].ID,
)`,
  },
  {
    lang: "cURL",
    code: `curl -X POST \\
  https://api.windbackai.com/api/v1/projects/my-app/\\
churn-events/evt_123/generate \\
  -H "X-API-Key: cg_sk_..." \\
  -H "Content-Type: application/json"`,
  },
];

const packageManagers = [
  { name: "npm", command: "npm install @windback/node" },
  { name: "pnpm", command: "pnpm add @windback/node" },
  { name: "yarn", command: "yarn add @windback/node" },
  { name: "bun", command: "bun add @windback/node" },
];

/* ── Animated Counter ── */
function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const numericPart = value.replace(/[^0-9]/g, "");
  const prefix = value.replace(/[0-9]/g, "");
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || !numericPart) return;
    const target = parseInt(numericPart);
    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [isInView, numericPart]);

  return (
    <span ref={ref}>
      {prefix}
      {numericPart ? display : value}
      {suffix}
    </span>
  );
}

/* ── Main Page ── */
export default function DocsHome() {
  const [activePm, setActivePm] = useState(0);
  const [activeCode, setActiveCode] = useState(0);

  return (
    <main className="min-h-screen bg-fd-background">
      {/* ── Nav ── */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-fd-border/50 glass"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-semibold tracking-tight text-fd-primary" style={{ fontFamily: "var(--font-serif), serif" }}>
              Windback<span>.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/docs"
              className="flex items-center gap-1.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Docs
            </Link>
            <Link
              href="/docs/api-reference"
              className="flex items-center gap-1.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <Code2 className="h-3.5 w-3.5" />
              API
            </Link>
            <Link
              href="/docs/sdks/node"
              className="flex items-center gap-1.5 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <Package className="h-3.5 w-3.5" />
              SDKs
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="http://localhost:3001"
              className="hidden text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground sm:block"
            >
              Dashboard
            </Link>
            <Link
              href="/docs/quickstart"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-fd-primary/20"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero + Bento Grid ── */}
      <section className="relative overflow-hidden border-b border-fd-border/50">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,hsla(218,93%,42%,0.08),transparent_70%)]" />
        <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-20">
          {/* Compact top area */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {/* Badge */}
            <motion.div
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-fd-border bg-fd-card/80 px-4 py-2 text-sm backdrop-blur-sm"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <span className="text-fd-muted-foreground">
                v1.0 is live
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl lg:text-5xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Build churn recovery{" "}
              <span className="gradient-text">into your product</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mx-auto mt-4 max-w-xl text-base text-fd-muted-foreground sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              Detect cancellations, generate AI winback emails, and recover revenue — all from one API.
            </motion.p>
          </div>

          {/* Bento Grid */}
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {/* Card 1: Code Snippet — 4 cols, 2 rows */}
            <motion.div
              className="md:col-span-4 lg:col-span-4 lg:row-span-2 overflow-hidden rounded-2xl border border-fd-border bg-fd-card transition-all hover:border-fd-primary/30 card-lift glow"
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-fd-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-300/80" />
                  <div className="h-3 w-3 rounded-full bg-blue-400/80" />
                  <div className="h-3 w-3 rounded-full bg-blue-500/80" />
                </div>
                <div className="flex gap-1">
                  {codeExamples.map((ex, i) => (
                    <button
                      key={ex.lang}
                      onClick={() => setActiveCode(i)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        activeCode === i
                          ? "bg-fd-primary text-fd-primary-foreground shadow-sm"
                          : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
                      }`}
                    >
                      {ex.lang}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative min-h-[220px] px-6 py-5">
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={activeCode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm leading-relaxed text-fd-foreground"
                  >
                    <code>{codeExamples[activeCode].code}</code>
                  </motion.pre>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Card 2: Stats — 2 cols, 2 rows */}
            <motion.div
              className="md:col-span-2 lg:col-span-2 lg:row-span-2 overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 card-lift"
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground">
                At a glance
              </div>
              <div className="flex h-[calc(100%-2rem)] flex-col justify-between gap-4">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-baseline justify-between border-b border-fd-border/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-fd-muted-foreground">{stat.label}</span>
                    <span className="text-2xl font-bold tracking-tight text-fd-foreground">
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 3: Quickstart CTA — 2 cols */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:col-span-2 lg:col-span-2"
            >
              <Link
                href="/docs/quickstart"
                className="group flex h-full items-center gap-4 overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 hover:shadow-lg hover:shadow-fd-primary/5 card-lift"
              >
                <div className="inline-flex shrink-0 rounded-xl bg-blue-500/10 p-3">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-fd-foreground">Get started in 5 minutes</div>
                  <div className="mt-0.5 text-xs text-fd-muted-foreground">Quickstart guide</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-fd-primary" />
              </Link>
            </motion.div>

            {/* Card 4: AI Strategies — 2 cols */}
            <motion.div
              className="md:col-span-2 lg:col-span-2 overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 card-lift"
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-fd-foreground">AI Strategies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Discount", "Social Proof", "Feature Highlight", "Founder Email", "Urgency", "Downgrade", "Survey", "Loyalty", "Comparison"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-fd-border bg-fd-accent/50 px-2.5 py-1 text-xs font-medium text-fd-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Card 5: Install Command — 2 cols */}
            <motion.div
              className="md:col-span-2 lg:col-span-2 overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 card-lift"
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-fd-foreground">Install</span>
              </div>
              <div className="mb-3 flex gap-1">
                {packageManagers.map((pm, i) => (
                  <button
                    key={pm.name}
                    onClick={() => setActivePm(i)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      activePm === i
                        ? "bg-fd-primary text-fd-primary-foreground"
                        : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
                    }`}
                  >
                    {pm.name}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePm}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg bg-fd-accent/50 px-3 py-2"
                >
                  <code className="text-xs text-fd-foreground">{packageManagers[activePm].command}</code>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Card 6: Integrations — 3 cols */}
            <motion.div
              className="md:col-span-2 lg:col-span-3 overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 card-lift"
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-fd-foreground">Integrations</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Stripe", href: "/docs/integrations/stripe", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
                  { name: "Razorpay", href: "/docs/integrations/razorpay", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
                  { name: "Custom Webhook", href: "/docs/integrations/custom-webhook", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
                ].map((integration) => (
                  <Link
                    key={integration.name}
                    href={integration.href}
                    className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all hover:shadow-sm ${integration.color}`}
                  >
                    {integration.name}
                    <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Card 7: SDKs — 3 cols */}
            <motion.div
              className="md:col-span-2 lg:col-span-3 overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 card-lift"
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-fd-foreground">SDKs</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Node.js", pkg: "@windback/node", href: "/docs/sdks/node" },
                  { name: "Python", pkg: "windback", href: "/docs/sdks/python" },
                  { name: "Go", pkg: "windback-go", href: "/docs/sdks/go" },
                ].map((sdk) => (
                  <Link
                    key={sdk.name}
                    href={sdk.href}
                    className="group flex items-center gap-3 rounded-xl border border-fd-border bg-fd-accent/30 px-4 py-2.5 transition-all hover:border-fd-primary/30 hover:bg-fd-accent/60"
                  >
                    <div>
                      <div className="text-sm font-semibold text-fd-foreground">{sdk.name}</div>
                      <code className="text-[11px] text-fd-muted-foreground">{sdk.pkg}</code>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fd-primary" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Explore the Docs ── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-fd-primary">
              Documentation
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
              Explore the docs
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-fd-muted-foreground">
              Everything you need to integrate Windback into your product.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link
                    href={link.href}
                    className="group relative block overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 hover:shadow-lg hover:shadow-fd-primary/5 card-lift"
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.04] transition-opacity group-hover:opacity-[0.08]" />
                    <div
                      className={`mb-4 inline-flex rounded-xl ${link.bgColor} p-2.5`}
                    >
                      <Icon className={`h-5 w-5 bg-gradient-to-br ${link.color} bg-clip-text text-fd-primary`} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-fd-foreground">
                      {link.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                      {link.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-fd-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Read more
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative border-t border-fd-border/50">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-fd-primary">
              Platform
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
              Everything you need to fight churn
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-fd-muted-foreground">
              From detection to recovery, Windback handles the entire lifecycle.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/20 card-lift"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-[0.03] transition-opacity group-hover:opacity-[0.06]" />
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-fd-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t border-fd-border/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsla(218,93%,42%,0.04),transparent_70%)]" />
        <motion.div
          className="relative mx-auto max-w-7xl px-6 py-24 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
            Ready to reduce churn?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-fd-muted-foreground">
            Start recovering customers in minutes. Follow the quickstart guide and
            integrate Windback into your product today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/docs/quickstart"
              className="group inline-flex items-center gap-2 rounded-xl bg-fd-primary px-8 py-3.5 text-sm font-semibold text-fd-primary-foreground shadow-lg shadow-fd-primary/25 transition-all hover:shadow-xl hover:shadow-fd-primary/30"
            >
              Start Building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 rounded-xl border border-fd-border px-8 py-3.5 text-sm font-semibold text-fd-foreground transition-all hover:border-fd-primary/30 hover:bg-fd-accent"
            >
              View API Docs
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-fd-border/50 bg-fd-card/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center">
                <span className="text-lg font-semibold tracking-tight text-fd-primary" style={{ fontFamily: "var(--font-serif), serif" }}>
                  Windback<span>.</span>
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-fd-muted-foreground">
                AI-powered churn recovery for SaaS businesses. Detect cancellations,
                generate winback emails, recover revenue.
              </p>
            </div>

            {/* Docs */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-fd-foreground">Documentation</h4>
              <ul className="space-y-3">
                {["Quickstart", "Authentication", "Multi-Project", "API Reference"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href={`/docs/${item.toLowerCase().replace(" ", "-")}`}
                        className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Integrations */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-fd-foreground">Integrations</h4>
              <ul className="space-y-3">
                {[
                  { name: "Stripe", href: "/docs/integrations/stripe" },
                  { name: "Razorpay", href: "/docs/integrations/razorpay" },
                  { name: "Custom Webhook", href: "/docs/integrations/custom-webhook" },
                  { name: "Cancel Widget", href: "/docs/widget/installation" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SDKs */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-fd-foreground">SDKs</h4>
              <ul className="space-y-3">
                {[
                  { name: "Node.js", href: "/docs/sdks/node" },
                  { name: "Python", href: "/docs/sdks/python" },
                  { name: "Go", href: "/docs/sdks/go" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-fd-border/50 pt-8 sm:flex-row">
            <span className="text-sm text-fd-muted-foreground">
              &copy; {new Date().getFullYear()} Windback. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <Link
                href="/docs"
                className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              >
                Docs
              </Link>
              <Link
                href="/docs/api-reference"
                className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              >
                API
              </Link>
              <Link
                href="http://localhost:3001"
                className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
