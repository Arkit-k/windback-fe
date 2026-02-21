"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@windback/ui/components/button";
import { Input } from "@windback/ui/components/input";
import { Card } from "@windback/ui/components/card";
import { Label } from "@windback/ui/components/label";
import {
  Building2,
  MapPin,
  Briefcase,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const TOTAL_STEPS = 4;

const BUSINESS_TYPES = ["SaaS", "E-commerce", "Marketplace", "Agency", "Other"];
const REFERRAL_SOURCES = [
  "Google",
  "Twitter/X",
  "LinkedIn",
  "Friend/Colleague",
  "Blog/Article",
  "Other",
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const { user, isLoading, onboarding } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    business_name: "",
    business_location: "",
    business_type: "",
    referral_source: "",
  });

  // Redirect if already onboarded
  useEffect(() => {
    if (!isLoading && user?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [isLoading, user?.onboarding_completed, router]);

  if (isLoading || user?.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const next = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.business_name.trim().length > 0;
      case 1:
        return formData.business_location.trim().length > 0;
      case 2:
        return formData.business_type.length > 0;
      case 3:
        return formData.referral_source.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    onboarding.mutate(formData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      if (step < TOTAL_STEPS - 1) {
        next();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="font-display text-2xl font-semibold text-[var(--accent)]">
            Windback<span>.</span>
          </h1>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-secondary">
            <motion.div
              className="h-1 rounded-full bg-[var(--accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </motion.div>

        {/* Step content */}
        <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {step === 0 && (
                <StepTextInput
                  icon={Building2}
                  title="What's your business name?"
                  subtitle="This helps us personalize your experience."
                  value={formData.business_name}
                  onChange={(v) =>
                    setFormData((d) => ({ ...d, business_name: v }))
                  }
                  placeholder="e.g. Acme Inc."
                  onKeyDown={handleKeyDown}
                />
              )}
              {step === 1 && (
                <StepTextInput
                  icon={MapPin}
                  title="Where is your business located?"
                  subtitle="Country or city — whatever works."
                  value={formData.business_location}
                  onChange={(v) =>
                    setFormData((d) => ({ ...d, business_location: v }))
                  }
                  placeholder="e.g. San Francisco, USA"
                  onKeyDown={handleKeyDown}
                />
              )}
              {step === 2 && (
                <StepCardSelect
                  icon={Briefcase}
                  title="What type of business do you run?"
                  subtitle="Pick the closest match."
                  options={BUSINESS_TYPES}
                  value={formData.business_type}
                  onChange={(v) =>
                    setFormData((d) => ({ ...d, business_type: v }))
                  }
                />
              )}
              {step === 3 && (
                <StepCardSelect
                  icon={Megaphone}
                  title="How did you hear about Windback?"
                  subtitle="We'd love to know what brought you here."
                  options={REFERRAL_SOURCES}
                  value={formData.referral_source}
                  onChange={(v) =>
                    setFormData((d) => ({ ...d, referral_source: v }))
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className={step === 0 ? "invisible" : ""}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={next} disabled={!canProceed()}>
              Next
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || onboarding.isPending}
            >
              {onboarding.isPending ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Finishing up...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {onboarding.isError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-destructive"
          >
            {onboarding.error.message}
          </motion.p>
        )}
      </div>
    </div>
  );
}

function StepTextInput({
  icon: Icon,
  title,
  subtitle,
  value,
  onChange,
  placeholder,
  onKeyDown,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="step-input" className="sr-only">
          {title}
        </Label>
        <Input
          id="step-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          autoFocus
          className="h-11"
        />
      </div>
    </div>
  );
}

function StepCardSelect({
  icon: Icon,
  title,
  subtitle,
  options,
  value,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <Card
            key={option}
            onClick={() => onChange(option)}
            className={`cursor-pointer p-4 text-center text-sm transition-all hover:border-[var(--accent)]/50 ${
              value === option
                ? "border-[var(--accent)] bg-[var(--accent)]/5 text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {option}
          </Card>
        ))}
      </div>
    </div>
  );
}
