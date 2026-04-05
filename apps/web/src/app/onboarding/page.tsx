"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { friendlyError } from "@/lib/error-messages";

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
          <h1 className="font-display text-2xl font-semibold text-accent-readable">
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
                <StepLocationInput
                  value={formData.business_location}
                  onChange={(v) =>
                    setFormData((d) => ({ ...d, business_location: v }))
                  }
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
            {friendlyError(onboarding.error, "Failed to complete onboarding. Please try again.")}
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

interface LocationSuggestion {
  id: string;
  name: string;
}

function formatPhotonResult(props: Record<string, string>): string {
  const parts: string[] = [];
  if (props.city || props.name) parts.push(props.city || props.name);
  if (props.state) parts.push(props.state);
  if (props.country) parts.push(props.country);
  return parts.join(", ") || props.name || "";
}

function StepLocationInput({
  value,
  onChange,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`
      );
      if (res.ok) {
        const data = await res.json();
        const results: LocationSuggestion[] = (data.features || []).map(
          (f: { properties: Record<string, string> }, i: number) => ({
            id: `${i}-${f.properties.osm_id || i}`,
            name: formatPhotonResult(f.properties),
          })
        );
        // Deduplicate by name
        const seen = new Set<string>();
        const unique = results.filter((r) => {
          if (seen.has(r.name)) return false;
          seen.add(r.name);
          return true;
        });
        setSuggestions(unique);
        setShowSuggestions(unique.length > 0);
        setActiveIndex(-1);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 300);
  };

  const selectSuggestion = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex].display_name);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }
    onKeyDown(e);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Where is your business located?
        </h2>
        <p className="text-sm text-muted-foreground">Start typing to search for your city or country.</p>
      </div>
      <div className="relative" ref={containerRef}>
        <Label htmlFor="location-input" className="sr-only">
          Business location
        </Label>
        <div className="relative">
          <Input
            id="location-input"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="e.g. San Francisco, USA"
            onKeyDown={handleInputKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            autoFocus
            autoComplete="off"
            className="h-11"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  onClick={() => selectSuggestion(s.name)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                    i === activeIndex
                      ? "bg-[var(--accent)]/5 text-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                  <span className="truncate">{s.name}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
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
