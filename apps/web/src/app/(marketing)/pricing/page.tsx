"use client";

import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@windback/ui";
import { ChevronDown, Sparkles, Circle, Square, Triangle, Diamond, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/animations/motion";
import { FloatingParticles } from "@/components/animations/floating-particles";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "Free",
    annualPrice: "Free",
    description: "For indie hackers getting started",
    features: [
      "Up to 50 churn events/month",
      "1 project",
      "AI recovery email generation",
      "Failed payment detection",
      "1 payment provider",
      "Email analytics dashboard",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    monthlyPrice: "$29",
    annualPrice: "$24",
    monthlyPeriod: "/month",
    annualPeriod: "/month",
    annualNote: "billed annually",
    description: "For growing SaaS businesses",
    features: [
      "Up to 500 churn events/month",
      "Up to 5 projects",
      "AI recovery email generation",
      "Smart dunning sequences",
      "Dunning tone customization",
      "Unlimited payment providers",
      "Cancellation flow widget",
      "Email analytics & CSV export",
      "Team management (5 members)",
      "Two-factor authentication",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Scale",
    monthlyPrice: "$99",
    annualPrice: "$79",
    monthlyPeriod: "/month",
    annualPeriod: "/month",
    annualNote: "billed annually",
    description: "For established SaaS companies",
    features: [
      "Unlimited churn events",
      "Unlimited projects",
      "AI recovery email generation",
      "Advanced dunning sequences",
      "Dunning tone customization",
      "Unlimited payment providers",
      "Cancellation flow widget",
      "Recovery analytics & trends",
      "CSV export & reporting",
      "Unlimited team members",
      "Two-factor authentication",
      "API key rotation",
      "Audit logs",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "Start with a 14-day free trial on any paid plan. No credit card required. You get full access to all features during the trial period.",
  },
  {
    question: "What's the difference between churn recovery and dunning?",
    answer:
      "Churn recovery handles voluntary cancellations — when a customer actively cancels their subscription. Dunning handles involuntary churn — failed payments due to expired cards, insufficient funds, etc. Windback handles both automatically with AI-powered emails and smart retry sequences.",
  },
  {
    question: "Which payment providers do you support?",
    answer:
      "We support Stripe, Razorpay, and Paddle out of the box. You can also use our custom webhook endpoint to connect any payment provider. All providers detect both cancellations and failed payments.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate the difference.",
  },
  {
    question: "What happens when I exceed my event limit?",
    answer:
      "We'll notify you when you're approaching your limit. Events beyond the cap are queued and processed when you upgrade or the next billing cycle begins. We never drop events.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. If you're not satisfied within the first 30 days, contact support for a full refund — no questions asked.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer:
      "Yes! Annual billing saves you 2 months compared to paying monthly. Toggle to annual billing above to see the discounted prices.",
  },
];

const featureIcons = [Circle, Square, Triangle, Diamond, Star, Sparkles];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground transition-colors hover:text-[var(--accent)]"
        onClick={() => setOpen(!open)}
      >
        {question}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const { isAuthenticated } = useAuth();

  function getPlanHref(planName: string) {
    if (!isAuthenticated) return "/register";
    if (planName === "Starter") return "/dashboard/projects";
    return "/dashboard/billing";
  }

  return (
    <div className="relative py-20">
      {/* Light blue gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#BFCFF8] via-[#DBEAFE] to-background" />

      {/* Hero effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingParticles count={18} />

        {/* Animated shadow orbs */}
        <motion.div
          className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(from var(--accent) h s l / 0.3), transparent 70%)" }}
          animate={{
            x: [0, 80, 30, 0],
            y: [0, 50, -20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 top-10 h-[350px] w-[350px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(251, 170, 138, 0.28), transparent 70%)" }}
          animate={{
            x: [0, -60, -15, 0],
            y: [0, 60, 10, 0],
            scale: [1, 0.85, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/3 -top-10 h-[300px] w-[300px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(129, 140, 248, 0.22), transparent 70%)" }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.2, 0.85, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-semibold text-foreground">
              Simple, transparent pricing
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Start free. Scale as you grow. No hidden fees.
            </p>

            {/* Billing toggle */}
            <div className="mt-8 inline-flex items-center gap-3">
              <span
                className={`text-sm ${!annual ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-[var(--accent)]" : "bg-border"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span
                className={`text-sm ${annual ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                Annual
              </span>
              {annual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]"
                >
                  Save 2 months
                </motion.span>
              )}
            </div>
          </div>
        </ScrollReveal>

        <motion.div
          className="mt-16 grid gap-8 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
          }}
        >
          {plans.map((plan, planIndex) => (
            <motion.div
              key={plan.name}
              variants={{
                hidden: { opacity: 0, y: 32, scale: 0.96 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={plan.popular ? "lg:scale-105" : ""}
            >
              <Card
                className={`transition-all duration-300 hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/10 ${
                  plan.popular
                    ? "relative border-[var(--accent)] bg-gradient-to-br from-[var(--gradient-to)] to-[var(--gradient-from)] text-white shadow-[0_0_24px_hsl(from_var(--accent)_h_s_l_/_0.22)]"
                    : ""
                }`}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-3 py-0.5 text-xs font-medium text-white"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    Most Popular
                  </motion.div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="font-display">{plan.name}</CardTitle>
                  <CardDescription className={plan.popular ? "text-white/80" : ""}>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className={`font-display text-4xl font-semibold ${plan.popular ? "text-white" : "text-foreground"}`}>
                      {annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    {(annual ? plan.annualPeriod : plan.monthlyPeriod) && (
                      <span className={plan.popular ? "text-white/80" : "text-muted-foreground"}>
                        {annual ? plan.annualPeriod : plan.monthlyPeriod}
                      </span>
                    )}
                    {annual && plan.annualNote && (
                      <p className={`mt-1 text-xs ${plan.popular ? "text-white/80" : "text-muted-foreground"}`}>
                        {plan.annualNote}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => {
                      const FeatureIcon = featureIcons[(planIndex + i) % featureIcons.length];
                      return (
                        <motion.li
                          key={feature}
                          className={`flex items-start gap-2 text-sm ${plan.popular ? "text-white/90" : "text-muted-foreground"}`}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
                        >
                          <span className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm ${plan.popular ? "bg-white/20 text-white" : "bg-[var(--accent-light)] text-[var(--accent)]"}`}>
                            <FeatureIcon className="h-2.5 w-2.5" />
                          </span>
                          {feature}
                        </motion.li>
                      );
                    })}
                  </ul>
                  <Button
                    className={plan.popular
                      ? "w-full bg-white text-[var(--accent)] hover:bg-white/90"
                      : "w-full bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"}
                    variant={plan.popular ? "secondary" : "default"}
                    asChild
                  >
                    <Link href={getPlanHref(plan.name)}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <ScrollReveal>
          <div className="mx-auto mt-24 max-w-2xl">
            <h2 className="text-center font-display text-2xl font-semibold text-foreground">
              Frequently asked questions
            </h2>
            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              {faqs.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Strip */}
        <ScrollReveal>
          <div className="mt-16 rounded-2xl bg-[var(--accent)] p-8 text-center sm:p-12">
            <h3 className="font-display text-2xl font-semibold text-white">
              Need a custom plan?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
              Enterprise-grade features, custom event limits, SLAs, and dedicated
              support tailored to your needs.
            </p>
            <Button
              variant="secondary"
              className="mt-6 bg-white text-[var(--accent)] hover:bg-white/90"
              asChild
            >
              <a href="mailto:support@windbackai.com">Talk to Sales</a>
            </Button>
          </div>
        </ScrollReveal>
        </div>
    </div>
  );
}
