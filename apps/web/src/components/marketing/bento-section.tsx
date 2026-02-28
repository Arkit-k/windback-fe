"use client";

import {
  ArrowRight,
  Zap,
  Brain,
  Mail,
  Shield,
  Webhook,
} from "lucide-react";
import { ScrollReveal, motion } from "@/components/animations/motion";
import { SpotlightCard } from "@/components/animations/spotlight-card";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

const features = [
  { icon: Brain, title: "AI Recovery Engine", description: "GPT-4o analyzes each churned customer and generates 9 personalized winback email variants with proven psychological strategies." },
  { icon: Webhook, title: "Universal Webhooks", description: "Connect Stripe, Razorpay, Paddle, or any payment provider via webhooks. Detect cancellations and failed payments the moment they happen." },
  { icon: Mail, title: "Smart Dunning & Recovery", description: "Automatically retry failed payments with customizable dunning sequences. AI-crafted emails recover both voluntary and involuntary churn." },
];

const steps = [
  { step: "01", title: "Connect your stack", description: "Add a webhook URL in your payment provider — Stripe, Razorpay, or Paddle. That's it. No long forms or hours of setup required." },
  { step: "02", title: "Detect & recover automatically", description: "Windback catches cancellations and failed payments instantly, then generates personalized AI winback emails and smart dunning sequences." },
  { step: "03", title: "Track. Optimize. Grow.", description: "Monitor recovery analytics, MRR saved, and email performance in real time. No guesswork — just professional, data-driven recovery." },
];

export function CapabilitiesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-500 hover:shadow-xl hover:shadow-black/[0.03]">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Our Capabilities</p>
                <h2 className="mt-4 font-serif text-3xl leading-[1.15] text-foreground italic sm:text-[2.5rem]">AI-Driven Recovery<br />for Modern SaaS Teams</h2>
                <motion.div className="mt-8 h-px w-full bg-border" initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} />
                <h3 className="mt-8 text-base font-semibold text-foreground">Revenue Leaks Are Preventable</h3>
                <ul className="mt-5 space-y-3.5">
                  {features.map((feature, i) => (
                    <motion.li key={feature.title} className="flex gap-3" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}>
                      <motion.span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.4 + i * 0.1, type: "spring", stiffness: 500 }} />
                      <div>
                        <span className="text-sm font-medium text-foreground">{feature.title}:</span>{" "}
                        <span className="text-sm text-muted-foreground">{feature.description}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-end p-8 sm:p-10 lg:p-12">
                <ScrollReveal delay={0.1}>
                  <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground lg:ml-auto">SaaS companies using AI-powered recovery see up to 3x higher win-back rates compared to manual outreach.</p>
                </ScrollReveal>
                <div className="mt-8 flex items-end gap-4">
                  <ScrollReveal delay={0.15}>
                    <motion.div className="flex h-36 w-36 flex-col justify-end rounded-xl bg-gradient-to-br from-[var(--gradient-to)] to-[var(--gradient-from)] p-5 sm:h-40 sm:w-40 cursor-default" whileHover={{ scale: 1.15, rotate: -1, transition: { type: "spring", stiffness: 300, damping: 20 } }} whileTap={{ scale: 0.98 }}>
                      <p className="text-[10px] leading-snug text-white/70">Average recovery rate with AI-generated email variants</p>
                      <p className="mt-2 font-serif text-4xl text-white italic sm:text-5xl">26.6%</p>
                    </motion.div>
                  </ScrollReveal>
                  <ScrollReveal delay={0.2}>
                    <motion.div className="flex flex-col justify-end pb-1 cursor-default" whileHover={{ x: 6, transition: { type: "spring", stiffness: 300, damping: 20 } }}>
                      <p className="font-serif text-6xl tracking-tight text-foreground italic sm:text-7xl">&gt;9x</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">more variants per event</p>
                    </motion.div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function DashboardSection() {
  return (
    <section className="border-t border-border bg-card py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">See it in action</h2>
            <p className="mt-3 text-muted-foreground">A clean, powerful dashboard that gives you full control over your recovery pipeline.</p>
          </div>
        </ScrollReveal>
        <DashboardPreview />
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="max-w-md">
            <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">How it works ?</h2>
            <p className="mt-3 text-muted-foreground">Your new favorite workflow shortcut.</p>
          </div>
        </ScrollReveal>
        <div className="relative mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {steps.map((item, i) => (
            <motion.div key={item.title} className={`group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F1733] via-[#2563EB] to-[#FBAA8A] p-7 cursor-default ${i === 1 ? "sm:mt-16" : ""}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }} whileHover={{ y: i === 1 ? 59 : -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}>
              <div>
                <span className="text-sm text-white/50">{item.step}</span>
                <h3 className="mt-3 font-serif text-lg leading-snug text-white italic sm:text-xl">{item.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-white/50">{item.description}</p>
              </div>
              <div className="mt-5 flex items-center justify-end">
                <motion.div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 group-hover:bg-white/20" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BentoGridSection() {
  return (
    <section className="border-t border-border bg-[#EEF2FF] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">Everything else you need</h2>
            <p className="mt-3 text-muted-foreground">Organize, prioritize and control your recovery pipeline efficiently in our trusted platform.</p>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-6">
          <ScrollReveal delay={0} className="sm:col-span-2 sm:row-span-2">
            <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
              <div className="p-6 flex flex-col h-full">
                <motion.div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)]" whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Webhook className="h-5 w-5 text-[var(--accent)]" />
                </motion.div>
                <h3 className="mt-5 text-base font-semibold text-foreground">Webhook Integration</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">Unlock effortless automation. Connect your payment providers, streamline workflows, and supercharge recovery with ease.</p>
                <motion.div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3" whileHover={{ borderColor: "var(--accent)", transition: { duration: 0.2 } }}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">Configure</span>
                  </div>
                  <motion.div className="h-5 w-9 rounded-full bg-[var(--accent)] p-0.5 flex justify-end" whileTap={{ scale: 0.9 }}>
                    <motion.div className="h-4 w-4 rounded-full bg-white shadow-sm" layout transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </motion.div>
                </motion.div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.05} className="sm:col-span-2">
            <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Failed Payment Recovery</h3>
                    <p className="text-[11px] text-muted-foreground">Smart dunning sequences</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[{ letter: "S", bg: "bg-blue-100", text: "text-blue-700" }, { letter: "R", bg: "bg-indigo-100", text: "text-indigo-700" }, { letter: "P", bg: "bg-violet-100", text: "text-violet-700" }].map((p) => (
                      <motion.div key={p.letter} className={`flex h-8 w-8 items-center justify-center rounded-full ${p.bg} border-2 border-background text-[10px] font-bold ${p.text}`} whileHover={{ scale: 1.2, zIndex: 10, y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        {p.letter}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="sm:col-span-2 sm:row-span-2">
            <SpotlightCard className="h-full rounded-2xl border border-transparent bg-gradient-to-br from-[var(--gradient-to)] to-[var(--gradient-from)] cursor-default">
              <div className="p-6 flex flex-col justify-between h-full">
                <motion.p className="font-serif text-6xl tracking-tight text-white italic sm:text-7xl" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 300 } }}>26.6<span className="text-white/80">%</span></motion.p>
                <div className="mt-4">
                  <h3 className="text-base font-semibold text-white">Recovery Rate</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">Boost your team&apos;s efficiency with our AI-powered recovery engine and proven email strategies.</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.15} className="sm:col-span-2">
            <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Email Analytics</h3>
                    <p className="text-[11px] text-muted-foreground">Recovery Performance</p>
                  </div>
                  <motion.span className="rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]" whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 400 }}>Open Rate</motion.span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <motion.span className="font-serif text-4xl tracking-tight text-foreground italic" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>42%</motion.span>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Avg. email open rate</p>
                    <p className="text-[11px] font-medium text-foreground">Track opens, clicks & recoveries</p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.2} className="sm:col-span-4">
            <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)]" whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <Zap className="h-4 w-4 text-[var(--accent)]" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Built for Teams</h3>
                    <p className="text-[11px] text-muted-foreground">SDKs, team management, 2FA, and API key rotation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {["Node.js SDK", "Team Roles", "2FA", "Dunning"].map((badge) => (
                    <motion.span key={badge} className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-[11px] font-medium text-foreground transition-colors duration-200 hover:border-primary hover:text-primary" whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>{badge}</motion.span>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.25} className="sm:col-span-2">
            <SpotlightCard className="h-full rounded-2xl border border-border bg-background cursor-default">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <motion.p className="font-serif text-3xl text-foreground italic" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>$2.4k</motion.p>
                  <p className="text-[11px] text-muted-foreground">Avg MRR Recovered</p>
                </div>
                <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-light)]" whileHover={{ scale: 1.2, rotate: 20 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  <ArrowRight className="h-5 w-5 text-[var(--accent)] -rotate-45" />
                </motion.div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
