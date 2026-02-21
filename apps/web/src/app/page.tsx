"use client";

import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@windback/ui";
import {
  ArrowRight,
  Zap,
  Brain,
  Mail,
  BarChart3,
  Shield,
  Webhook,
  CreditCard,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  FadeUp,
  ScrollReveal,
  MagneticHover,
  motion,
} from "@/components/animations/motion";
import { RotatingWords } from "@/components/animations/rotating-words";
import { AnimatedBadge } from "@/components/animations/animated-badge";
import { SpotlightCard } from "@/components/animations/spotlight-card";
import { FloatingParticles } from "@/components/animations/floating-particles";
import { AbstractVisual } from "@/components/marketing/abstract-visual";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { MetricsStrip } from "@/components/marketing/metrics-strip";

const features = [
  {
    icon: Brain,
    title: "AI Recovery Engine",
    description:
      "GPT-4o analyzes each churned customer and generates 9 personalized winback email variants with proven psychological strategies.",
    link: "#",
  },
  {
    icon: Webhook,
    title: "Universal Webhooks",
    description:
      "Connect Stripe, Razorpay, Paddle, or any payment provider via webhooks. Detect cancellations and failed payments the moment they happen.",
    link: "#",
  },
  {
    icon: Mail,
    title: "Smart Dunning & Recovery",
    description:
      "Automatically retry failed payments with customizable dunning sequences. AI-crafted emails recover both voluntary and involuntary churn.",
    link: "#",
  },
];

const capabilities = [
  {
    icon: BarChart3,
    title: "Email Analytics & Reporting",
    description: "Track open rates, click rates, recovery trends, and MRR saved. Export CSV reports for any date range.",
  },
  {
    icon: Shield,
    title: "Cancellation Widget",
    description: "Embed a lightweight widget to capture cancellation reasons before customers leave your product.",
  },
  {
    icon: Zap,
    title: "Developer-First APIs",
    description: "RESTful API, SDK support for Node.js, Python, and Go. Comprehensive docs and type-safe clients.",
  },
];

const steps = [
  { step: "01", title: "Connect", description: "Add a webhook URL in your payment provider — Stripe, Razorpay, or Paddle" },
  { step: "02", title: "Detect", description: "Windback catches cancellations and failed payments instantly with full context" },
  { step: "03", title: "Recover", description: "AI generates personalized winback emails and smart dunning sequences automatically" },
  { step: "04", title: "Grow", description: "Track recovery analytics, MRR saved, and email performance in real time" },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Very light blue gradient across the entire page */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#C7D9F7] via-[#DBEAFE] to-background" />
      <Navbar />

      {/* ─── Hero (split layout) ─── */}
      <section className="relative overflow-hidden">
        {/* Floating particles background */}
        <FloatingParticles count={24} />

        {/* Radial glow behind heading area */}
        <div className="pointer-events-none absolute left-1/4 top-16 -z-[1] h-[480px] w-[640px] -translate-x-1/2 opacity-[0.07] blur-[80px]" style={{ background: "radial-gradient(ellipse, var(--accent), transparent 70%)" }} />

        {/* Animated shadow orbs */}
        <motion.div
          className="pointer-events-none absolute -left-20 top-0 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(from var(--accent) h s l / 0.35), transparent 70%)" }}
          animate={{
            x: [0, 100, 40, 0],
            y: [0, 60, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -right-20 top-12 h-[420px] w-[420px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(129, 140, 248, 0.3), transparent 70%)" }}
          animate={{
            x: [0, -80, -20, 0],
            y: [0, 80, 10, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute left-1/3 -top-10 h-[350px] w-[350px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(96, 165, 250, 0.25), transparent 70%)" }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.25, 0.8, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 sm:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: text */}
            <div>
              <FadeUp delay={0.1}>
                <AnimatedBadge className="mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                  </span>
                  <span className="bg-gradient-to-r from-[var(--accent)] via-blue-500 to-violet-500 bg-clip-text text-transparent">
                    AI-Powered Churn Recovery
                  </span>
                </AnimatedBadge>
              </FadeUp>

              <FadeUp delay={0.2}>
                <h1 className="font-serif text-[2.75rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
                  Turn Cancellations{" "}
                  <br className="hidden sm:block" />
                  into{" "}
                  <span className="relative inline-block italic">
                      <RotatingWords
                        words={["Revenue", "Growth", "Customers"]}
                        interval={3000}
                        className="bg-gradient-to-r from-[var(--accent)] to-blue-400 bg-clip-text text-transparent"
                      />
                    <motion.span
                      className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-[var(--accent)] to-blue-400"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
                    />
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.35}>
                <p className="mt-6 max-w-lg text-[1.075rem] leading-relaxed text-muted-foreground">
                  Whatever your payment stack, Windback detects cancellations and failed payments,
                  then generates personalized AI recovery emails and smart dunning sequences to bring customers back.
                </p>
              </FadeUp>

              <FadeUp delay={0.5}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <MagneticHover strength={0.12}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button size="lg" asChild className="relative overflow-hidden shadow-[0_0_20px_hsl(from_var(--accent)_h_s_l_/_0.25)] hover:shadow-[0_0_32px_hsl(from_var(--accent)_h_s_l_/_0.4)] transition-shadow duration-300">
                        <Link href="/register">
                          <motion.span
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            animate={{ x: ["-200%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
                          />
                          Start Free
                          <motion.span
                            className="inline-block ml-1"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
                        </Link>
                      </Button>
                    </motion.div>
                  </MagneticHover>
                  <MagneticHover strength={0.12}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button variant="outline" size="lg" asChild>
                        <Link href="/docs">Read the Docs</Link>
                      </Button>
                    </motion.div>
                  </MagneticHover>
                </div>
              </FadeUp>

            </div>

            {/* Right: abstract visual */}
            <div className="hidden lg:flex lg:justify-end">
              <AbstractVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logo Cloud ─── */}
      <LogoCloud />

      {/* ─── Metrics Strip (blue bg like reference) ─── */}
      <MetricsStrip />

      {/* ─── Capabilities (editorial pitch-deck style) ─── */}
      <section id="features" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-500 hover:shadow-xl hover:shadow-black/[0.03]">
              <div className="grid lg:grid-cols-2">

                {/* ── Left: editorial text ── */}
                <div className="p-8 sm:p-10 lg:p-12">
                  {/* Label */}
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Our Capabilities
                  </p>

                  {/* Heading */}
                  <h2 className="mt-4 font-serif text-3xl leading-[1.15] text-foreground italic sm:text-[2.5rem]">
                    AI-Driven Recovery<br />
                    for Modern SaaS Teams
                  </h2>

                  {/* Divider */}
                  <motion.div
                    className="mt-8 h-px w-full bg-border"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  />

                  {/* Subtitle + bullet points */}
                  <h3 className="mt-8 text-base font-semibold text-foreground">
                    Revenue Leaks Are Preventable
                  </h3>

                  <ul className="mt-5 space-y-3.5">
                    {features.map((feature, i) => (
                      <motion.li
                        key={feature.title}
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                      >
                        <motion.span
                          className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.4 + i * 0.1, type: "spring", stiffness: 500 }}
                        />
                        <div>
                          <span className="text-sm font-medium text-foreground">{feature.title}:</span>{" "}
                          <span className="text-sm text-muted-foreground">{feature.description}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* ── Right: stat blocks ── */}
                <div className="flex flex-col justify-end p-8 sm:p-10 lg:p-12">
                  {/* Top description */}
                  <ScrollReveal delay={0.1}>
                    <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground lg:ml-auto">
                      SaaS companies using AI-powered recovery see up to 3x higher
                      win-back rates compared to manual outreach.
                    </p>
                  </ScrollReveal>

                  {/* Stat blocks row */}
                  <div className="mt-8 flex items-end gap-4">
                    {/* Accent gradient stat */}
                    <ScrollReveal delay={0.15}>
                      <motion.div
                        className="flex h-36 w-36 flex-col justify-end rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-400 p-5 sm:h-40 sm:w-40 cursor-default"
                        whileHover={{ scale: 1.04, rotate: -1, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-[10px] leading-snug text-white/70">
                          Average recovery rate with AI-generated email variants
                        </p>
                        <p className="mt-2 font-serif text-4xl text-white italic sm:text-5xl">
                          26.6%
                        </p>
                      </motion.div>
                    </ScrollReveal>

                    {/* Large outline stat */}
                    <ScrollReveal delay={0.2}>
                      <motion.div
                        className="flex flex-col justify-end pb-1 cursor-default"
                        whileHover={{ x: 6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                      >
                        <p className="font-serif text-6xl tracking-tight text-foreground italic sm:text-7xl">
                          &gt;9x
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          more variants per event
                        </p>
                      </motion.div>
                    </ScrollReveal>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Dashboard Preview ─── */}
      <section className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">
                See it in action
              </h2>
              <p className="mt-3 text-muted-foreground">
                A clean, powerful dashboard that gives you full control over your recovery pipeline.
              </p>
            </div>
          </ScrollReveal>
          <DashboardPreview />
        </div>
      </section>

      {/* ─── How it works (horizontal steps) ─── */}
      <section id="how-it-works" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">
                How it works
              </h2>
              <p className="mt-3 text-muted-foreground">
                Get set up in minutes, not days.
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                className="group relative rounded-sm border border-border bg-card p-6 transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/5 cursor-default"
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              >
                <motion.span
                  className="font-serif text-4xl text-blue-500 italic block"
                  whileHover={{ scale: 1.1, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {item.step}
                </motion.span>
                <h3 className="mt-2 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                {i < steps.length - 1 && (
                  <motion.div
                    className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 text-border lg:block"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Bento grid capabilities ─── */}
      <section className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">
                Everything else you need
              </h2>
              <p className="mt-3 text-muted-foreground">
                Organize, prioritize and control your recovery pipeline
                efficiently in our trusted platform.
              </p>
            </div>
          </ScrollReveal>

          {/* Bento Grid */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-6">

            {/* ── Card 1: Webhook Integration (tall left) ── */}
            <ScrollReveal delay={0} className="sm:col-span-2 sm:row-span-2">
              <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
              <div className="p-6 flex flex-col h-full">
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50"
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Webhook className="h-5 w-5 text-amber-600" />
                </motion.div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  Webhook Integration
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  Unlock effortless automation. Connect your payment providers,
                  streamline workflows, and supercharge recovery with ease.
                </p>
                {/* Toggle row */}
                <motion.div
                  className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                  whileHover={{ borderColor: "var(--accent)", transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">Configure</span>
                  </div>
                  <motion.div
                    className="h-5 w-9 rounded-full bg-green-500 p-0.5 flex justify-end"
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      className="h-4 w-4 rounded-full bg-white shadow-sm"
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.div>
                </motion.div>
              </div>
              </SpotlightCard>
            </ScrollReveal>

            {/* ── Card 2: Payment Recovery (top middle) ── */}
            <ScrollReveal delay={0.05} className="sm:col-span-2">
              <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Failed Payment Recovery</h3>
                      <p className="text-[11px] text-muted-foreground">Smart dunning sequences</p>
                    </div>
                    {/* Provider avatars */}
                    <div className="flex -space-x-2">
                      {[
                        { letter: "S", bg: "bg-violet-100", text: "text-violet-600" },
                        { letter: "R", bg: "bg-blue-100", text: "text-blue-600" },
                        { letter: "P", bg: "bg-amber-100", text: "text-amber-600" },
                      ].map((p, i) => (
                        <motion.div
                          key={p.letter}
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${p.bg} border-2 border-background text-[10px] font-bold ${p.text}`}
                          whileHover={{ scale: 1.2, zIndex: 10, y: -4 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                        >
                          {p.letter}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

            {/* ── Card 3: Big stat "26.6%" (top right, tall) ── */}
            <ScrollReveal delay={0.1} className="sm:col-span-2 sm:row-span-2">
              <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
              <div className="p-6 flex flex-col justify-between h-full">
                <motion.p
                  className="font-serif text-6xl tracking-tight text-foreground italic sm:text-7xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 300 } }}
                >
                  26.6<span className="text-[var(--accent)]">%</span>
                </motion.p>
                <div className="mt-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Recovery Rate
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Boost your team&apos;s efficiency with our AI-powered
                    recovery engine and proven email strategies.
                  </p>
                </div>
              </div>
              </SpotlightCard>
            </ScrollReveal>

            {/* ── Card 4: Email Analytics (middle center) ── */}
            <ScrollReveal delay={0.15} className="sm:col-span-2">
              <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Email Analytics</h3>
                      <p className="text-[11px] text-muted-foreground">Recovery Performance</p>
                    </div>
                    <motion.span
                      className="rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]"
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Open Rate
                    </motion.span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <motion.span
                      className="font-serif text-4xl tracking-tight text-foreground italic"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      42%
                    </motion.span>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Avg. email open rate</p>
                      <p className="text-[11px] font-medium text-foreground">Track opens, clicks & recoveries</p>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

            {/* ── Card 5: Platform features (bottom wide) ── */}
            <ScrollReveal delay={0.2} className="sm:col-span-4">
              <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Zap className="h-4 w-4 text-slate-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Built for Teams</h3>
                      <p className="text-[11px] text-muted-foreground">SDKs, team management, 2FA, and API key rotation</p>
                    </div>
                  </div>
                  {/* Feature badges */}
                  <div className="flex items-center gap-2">
                    {["Node.js SDK", "Team Roles", "2FA", "Dunning"].map((badge) => (
                      <motion.span
                        key={badge}
                        className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-[11px] font-medium text-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
                        whileHover={{ y: -2, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        {badge}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

            {/* ── Card 6: Recovery stat (bottom right) ── */}
            <ScrollReveal delay={0.25} className="sm:col-span-2">
              <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <motion.p
                      className="font-serif text-3xl text-foreground italic"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      $2.4k
                    </motion.p>
                    <p className="text-[11px] text-muted-foreground">Avg MRR Recovered</p>
                  </div>
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50"
                    whileHover={{ scale: 1.2, rotate: 20, backgroundColor: "rgb(220 252 231)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <ArrowRight className="h-5 w-5 text-green-600 -rotate-45" />
                  </motion.div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-[var(--accent)] py-24 sm:py-28">
        {/* Background texture layers */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.18),transparent_50%)]" />
        {/* Dot grid overlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]">
          <pattern id="ctaDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#ctaDots)" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <h2 className="font-serif text-4xl leading-[1.1] text-white italic sm:text-5xl lg:text-6xl">
                No Missed Leads.<br />
                No Lost Revenue.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Recover Smarter, Automatically
                </h3>
                <p className="mt-3 text-white/70">
                  Join SaaS teams using Windback to recover voluntary cancellations and failed payments —
                  with AI-powered emails, smart dunning, and real-time analytics.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <MagneticHover strength={0.12}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button size="lg" variant="secondary" asChild className="relative bg-white text-[var(--accent)] hover:bg-white/90 shadow-lg shadow-black/10 overflow-hidden">
                        <Link href="/register">
                          <motion.span
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                            animate={{ x: ["-200%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                          />
                          Get Started Free
                          <motion.span
                            className="inline-block"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
                        </Link>
                      </Button>
                    </motion.div>
                  </MagneticHover>
                  <MagneticHover strength={0.12}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                        <Link href="/docs">Documentation</Link>
                      </Button>
                    </motion.div>
                  </MagneticHover>
                </div>

                {/* Social proof strip */}
                <div className="mt-10 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {["bg-blue-300", "bg-emerald-300", "bg-amber-300", "bg-rose-300", "bg-violet-300"].map((color, i) => (
                      <motion.div
                        key={i}
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${color} border-2 border-[var(--accent)] text-[9px] font-bold text-white`}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 400, damping: 15 }}
                        whileHover={{ y: -4, scale: 1.15, zIndex: 10 }}
                      >
                        {["S", "M", "A", "J", "E"][i]}
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-sm text-white/60">
                    <span>Trusted by <span className="font-semibold text-white">500+</span> SaaS teams</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg
                          key={i}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3 w-3 text-amber-400"
                          initial={{ opacity: 0, scale: 0, rotate: -30 }}
                          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 400, damping: 12 }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                      <span className="ml-1 text-[12px]">4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
