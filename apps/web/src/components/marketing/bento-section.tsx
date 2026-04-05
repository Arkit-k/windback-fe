"use client";

import {
  ArrowRight,
  Zap,
  Brain,
  Mail,
  Shield,
  Webhook,
  Link2,
  ScanSearch,
  BarChart3,
} from "lucide-react";
import { ScrollReveal, motion } from "@/components/animations/motion";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

/** Dot grid pattern — decorative background element */
function DotGrid({ rows = 6, cols = 8, color = "currentColor", className = "" }: { rows?: number; cols?: number; color?: string; className?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width={cols * 12}
      height={rows * 12}
      viewBox={`0 0 ${cols * 12} ${rows * 12}`}
      fill="none"
    >
      {Array.from({ length: rows * cols }).map((_, i) => {
        const x = (i % cols) * 12 + 6;
        const y = Math.floor(i / cols) * 12 + 6;
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}

const features = [
  { icon: Brain, title: "AI Recovery Engine", description: "AI analyzes each churned customer and generates personalized winback email variants with proven psychological strategies." },
  { icon: Webhook, title: "Universal Webhooks", description: "Connect Stripe, Razorpay, Paddle, or any payment provider via webhooks. Detect cancellations and failed payments the moment they happen." },
  { icon: Mail, title: "Smart Dunning & Recovery", description: "Automatically retry failed payments with customizable dunning sequences. AI-crafted emails recover both voluntary and involuntary churn." },
];


export function CapabilitiesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden border border-border bg-white">
            {/* Dot grid decoration — top right */}
            <div className="absolute right-8 top-8 opacity-30">
              <DotGrid rows={5} cols={6} color="var(--accent)" />
            </div>
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
                    <motion.div className="relative flex h-36 w-36 flex-col justify-end overflow-hidden bg-[var(--accent)] p-5 sm:h-40 sm:w-40 cursor-default" whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 20 } }} whileTap={{ scale: 0.98 }}>
                      <div className="absolute right-2 top-2 opacity-40">
                        <DotGrid rows={4} cols={4} color="white" />
                      </div>
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
    <section className="border-t border-border bg-white py-20">
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

const howSteps = [
  { icon: Link2, stat: "01", label: "Connect", description: "Add a webhook URL in your payment provider", highlighted: false },
  { icon: ScanSearch, stat: "02", label: "Detect", description: "Windback catches cancellations & failed payments instantly", highlighted: true },
  { icon: Brain, stat: "03", label: "Recover", description: "AI generates personalized winback emails & dunning sequences", highlighted: false },
  { icon: BarChart3, stat: "04", label: "Track", description: "Monitor recovery analytics, MRR saved & email performance", highlighted: false },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">How it works ?</h2>
            <p className="mt-3 text-muted-foreground">Your new favorite workflow shortcut.</p>
          </div>
        </ScrollReveal>
        <div className="relative mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {howSteps.map((item, i) => (
            <motion.div
              key={item.label}
              className={`group relative flex flex-col items-center overflow-hidden p-8 sm:p-10 text-center cursor-default ${
                item.highlighted
                  ? "bg-[var(--accent)] text-white"
                  : "border border-border bg-white text-foreground"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              {/* Dot grid decoration */}
              <div className="absolute right-3 top-3">
                <DotGrid rows={2} cols={3} color={item.highlighted ? "rgba(255,255,255,0.2)" : "rgba(0,4,224,0.1)"} />
              </div>

              {/* Icon */}
              <motion.div
                className={`flex h-12 w-12 items-center justify-center ${
                  item.highlighted ? "text-white" : "text-[var(--accent)]"
                }`}
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <item.icon className="h-7 w-7" strokeWidth={1.5} />
              </motion.div>

              {/* Stat number */}
              <motion.p
                className={`mt-5 font-serif text-4xl font-semibold italic sm:text-5xl ${
                  item.highlighted ? "text-white" : "text-foreground"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              >
                {item.stat}
              </motion.p>

              {/* Label */}
              <p className={`mt-2 text-sm font-semibold ${
                item.highlighted ? "text-white" : "text-foreground"
              }`}>
                {item.label}
              </p>

              {/* Description */}
              <p className={`mt-2 text-xs leading-relaxed ${
                item.highlighted ? "text-white/60" : "text-muted-foreground"
              }`}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BentoGridSection() {
  return (
    <section className="border-t border-border bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-foreground italic sm:text-4xl">Everything else you need</h2>
            <p className="mt-3 text-muted-foreground">Organize, prioritize and control your recovery pipeline efficiently in our trusted platform.</p>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-6">
          {/* Webhook Integration — tall left */}
          <ScrollReveal delay={0} className="sm:col-span-2 sm:row-span-2">
            <div className="relative h-full overflow-hidden border border-border bg-white p-8 cursor-default">
              <div className="absolute right-6 top-6 opacity-20">
                <DotGrid rows={5} cols={4} color="var(--accent)" />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <motion.div className="flex h-11 w-11 items-center justify-center bg-[var(--accent)]" whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Webhook className="h-5 w-5 text-white" />
                </motion.div>
                <h3 className="mt-6 text-base font-semibold text-foreground">Webhook Integration</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">Unlock effortless automation. Connect your payment providers, streamline workflows, and supercharge recovery with ease.</p>
                <motion.div className="mt-8 flex items-center justify-between border border-border bg-[#F5F5F5] px-4 py-3" whileHover={{ borderColor: "var(--accent)", transition: { duration: 0.2 } }}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">Configure</span>
                  </div>
                  <motion.div className="h-5 w-9 rounded-full bg-[var(--accent)] p-0.5 flex justify-end" whileTap={{ scale: 0.9 }}>
                    <motion.div className="h-4 w-4 rounded-full bg-white shadow-sm" layout transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </ScrollReveal>

          {/* Failed Payment Recovery */}
          <ScrollReveal delay={0.05} className="sm:col-span-2">
            <div className="relative h-full overflow-hidden border border-border bg-white p-7 cursor-default">
              <div className="absolute right-5 bottom-5 opacity-15">
                <DotGrid rows={3} cols={4} color="var(--accent)" />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Failed Payment Recovery</h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">Smart dunning sequences</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[{ letter: "S", bg: "bg-[var(--accent)]" }, { letter: "R", bg: "bg-[var(--accent)]" }, { letter: "P", bg: "bg-[var(--accent)]" }].map((p) => (
                      <motion.div key={p.letter} className={`flex h-8 w-8 items-center justify-center ${p.bg} text-[10px] font-bold text-white`} whileHover={{ scale: 1.15, y: -3 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                        {p.letter}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Recovery Rate — dark block */}
          <ScrollReveal delay={0.1} className="sm:col-span-2 sm:row-span-2">
            <div className="relative h-full overflow-hidden bg-[var(--accent)] p-8 cursor-default">
              <div className="absolute right-6 top-6 opacity-20">
                <DotGrid rows={6} cols={5} color="white" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <motion.p className="font-serif text-6xl tracking-tight text-white italic sm:text-7xl" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 300 } }}>26.6<span className="text-white/60">%</span></motion.p>
                <div className="mt-6">
                  <h3 className="text-base font-semibold text-white">Recovery Rate</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">Boost your team&apos;s efficiency with our AI-powered recovery engine and proven email strategies.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Email Analytics */}
          <ScrollReveal delay={0.15} className="sm:col-span-2">
            <div className="relative h-full overflow-hidden border border-border bg-white p-7 cursor-default">
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Email Analytics</h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">Recovery Performance</p>
                  </div>
                  <span className="bg-[var(--accent)] px-2.5 py-1 text-[10px] font-semibold text-white">Open Rate</span>
                </div>
                <div className="mt-5 flex items-baseline gap-3">
                  <motion.span className="font-serif text-4xl tracking-tight text-foreground italic" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>42%</motion.span>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Avg. email open rate</p>
                    <p className="mt-0.5 text-[11px] font-medium text-foreground">Track opens, clicks & recoveries</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Built for Teams — wide */}
          <ScrollReveal delay={0.2} className="sm:col-span-4">
            <div className="relative h-full overflow-hidden border border-border bg-white cursor-default">
              <div className="px-7 py-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div className="flex h-10 w-10 items-center justify-center bg-[var(--accent)]" whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <Zap className="h-4 w-4 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Built for Teams</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Team management, 2FA, and API key rotation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {["Webhooks", "Team Roles", "2FA", "Dunning"].map((badge) => (
                    <motion.span key={badge} className="inline-flex items-center border border-border bg-[#F5F5F5] px-3 py-1.5 font-mono text-[11px] font-medium text-foreground transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]" whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>{badge}</motion.span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* MRR Recovered */}
          <ScrollReveal delay={0.25} className="sm:col-span-2">
            <div className="relative h-full overflow-hidden border border-border bg-white p-7 cursor-default">
              <div className="absolute left-6 bottom-5 opacity-15">
                <DotGrid rows={3} cols={3} color="var(--accent)" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <motion.p className="font-serif text-3xl text-foreground italic" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>$2.4k</motion.p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Avg MRR Recovered</p>
                </div>
                <motion.div className="flex h-10 w-10 items-center justify-center border border-border text-[var(--accent)]" whileHover={{ scale: 1.15, backgroundColor: "var(--accent)", color: "white", borderColor: "var(--accent)" }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  <ArrowRight className="h-5 w-5 -rotate-45" />
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
