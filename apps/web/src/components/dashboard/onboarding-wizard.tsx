"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Card, CardContent } from "@windback/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Code2,
  Key,
  Link2,
  PartyPopper,
  Rocket,
  ShieldCheck,
  SkipForward,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  localStorage hook                                                  */
/* ------------------------------------------------------------------ */

function storageKey(slug: string) {
  return `windback_onboarding_${slug}_complete`;
}

export function useOnboardingComplete(slug: string) {
  const [complete, setComplete] = useState(true); // default true to avoid flash

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(slug));
    setComplete(raw === "true");
  }, [slug]);

  const markComplete = useCallback(() => {
    localStorage.setItem(storageKey(slug), "true");
    setComplete(true);
  }, [slug]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey(slug));
    setComplete(false);
  }, [slug]);

  return { complete, markComplete, reset };
}

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  actionLabel: string;
  href?: string;
}

function getSteps(slug: string): Step[] {
  return [
    {
      title: "Welcome to Windback",
      description:
        "Windback helps you recover churned subscribers with AI-powered emails, dunning automation, and a cancel-flow widget. Let's get you set up in a few quick steps.",
      icon: Rocket,
      actionLabel: "Get Started",
    },
    {
      title: "Connect Payment Provider",
      description:
        "Link your Stripe, Razorpay, Paddle, or Dodo Payments account so Windback can detect cancellations and failed payments automatically.",
      icon: Link2,
      actionLabel: "Go to Integrations",
      href: `/dashboard/p/${slug}/settings/integrations`,
    },
    {
      title: "Add Your First API Key",
      description:
        "Generate a public / secret key pair. You'll use the public key in the cancel-flow widget and the secret key for server-side API calls.",
      icon: Key,
      actionLabel: "Go to API Keys",
      href: `/dashboard/p/${slug}/settings`,
    },
    {
      title: "Install the Widget",
      description:
        "Drop a small JavaScript snippet into your app to power the cancel-flow survey and retention offers.",
      icon: Code2,
      actionLabel: "View Snippet",
    },
    {
      title: "Enable Churn Risk Scoring",
      description:
        "Turn on predictive churn scoring so Windback can proactively flag at-risk customers before they cancel.",
      icon: ShieldCheck,
      actionLabel: "Go to Churn Risk Settings",
      href: `/dashboard/p/${slug}/settings/churn-risk`,
    },
    {
      title: "You're all set!",
      description:
        "Your project is configured and ready to recover revenue. Head to the dashboard to watch recoveries roll in.",
      icon: PartyPopper,
      actionLabel: "Go to Dashboard",
      href: `/dashboard/p/${slug}`,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Widget snippet preview                                             */
/* ------------------------------------------------------------------ */

const WIDGET_SNIPPET = `<script
  src="https://cdn.windback.io/widget.js"
  data-project="YOUR_PUBLIC_KEY"
  async
></script>`;

/* ------------------------------------------------------------------ */
/*  Confetti dots                                                      */
/* ------------------------------------------------------------------ */

function ConfettiDots() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        size: 4 + Math.random() * 6,
        color: ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6"][
          Math.floor(Math.random() * 5)
        ],
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: -120 }}
          transition={{
            duration: 1.6,
            delay: d.delay,
            ease: "easeOut",
          }}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            bottom: 0,
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface OnboardingWizardProps {
  slug: string;
}

export function OnboardingWizard({ slug }: OnboardingWizardProps) {
  const { complete, markComplete } = useOnboardingComplete(slug);
  const [step, setStep] = useState(0);
  const steps = useMemo(() => getSteps(slug), [slug]);

  if (complete) return null;

  const current = steps[step]!;
  const isLast = step === steps.length - 1;
  const Icon = current.icon;

  function next() {
    if (isLast) {
      markComplete();
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  return (
    <Card className="relative overflow-hidden border-[var(--accent)]/30 bg-gradient-to-br from-background to-[var(--accent-light)]">
      {/* Dismiss */}
      <button
        type="button"
        onClick={markComplete}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss onboarding"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="px-6 pt-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            initial={false}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      <CardContent className="relative p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent)]/15">
                <Icon className="h-5 w-5 text-accent-readable" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {current.title}
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {current.description}
            </p>

            {/* Widget snippet for step 3 */}
            {step === 3 && (
              <pre className="overflow-x-auto rounded-md bg-muted/60 p-3 text-xs text-foreground">
                <code>{WIDGET_SNIPPET}</code>
              </pre>
            )}

            {/* Confetti on last step */}
            {isLast && <ConfettiDots />}

            <div className="flex items-center gap-3 pt-1">
              {current.href ? (
                <Button asChild size="sm">
                  <a href={current.href}>
                    {current.actionLabel}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="sm" onClick={next}>
                  {isLast ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      Finish Setup
                    </>
                  ) : (
                    <>
                      {current.actionLabel}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}

              {!isLast && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={next}
                  className="text-muted-foreground"
                >
                  <SkipForward className="mr-1 h-3.5 w-3.5" />
                  Skip
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
