"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  Separator,
} from "@windback/ui";
import { Megaphone } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Changelog data                                                     */
/* ------------------------------------------------------------------ */

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  type: "feature" | "fix" | "improvement";
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.5.0",
    date: "2026-03-12",
    title: "Market Pulse Dashboard",
    description:
      "Real-time product health scoring with stock-market-style OHLC charts, predictions, and demand heatmaps.",
    type: "feature" as const,
  },
  {
    version: "1.4.0",
    date: "2026-03-10",
    title: "Automated Playbooks",
    description:
      "Create automated retention workflows triggered by churn risk scores, events, or payment failures.",
    type: "feature" as const,
  },
  {
    version: "1.3.0",
    date: "2026-03-08",
    title: "A/B Testing",
    description:
      "Split-test recovery email subject lines, tones, and offers. Auto-promote winning variants.",
    type: "feature" as const,
  },
  {
    version: "1.2.0",
    date: "2026-03-05",
    title: "Cohort Analysis",
    description:
      "Visualize customer retention curves by signup cohort. Identify which cohorts churn fastest.",
    type: "feature" as const,
  },
  {
    version: "1.1.0",
    date: "2026-03-01",
    title: "Smart Segments",
    description:
      "Create rule-based customer segments for targeted retention strategies.",
    type: "feature" as const,
  },
  {
    version: "1.0.0",
    date: "2026-02-15",
    title: "Windback Launch",
    description:
      "Churn event tracking, AI-powered recovery emails, dunning automation, and the cancel flow widget.",
    type: "feature" as const,
  },
];

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "windback_changelog_last_seen";
const LATEST_VERSION = CHANGELOG[0]!.version;

function useChangelogNotification() {
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== LATEST_VERSION) {
      setHasNew(true);
    }
  }, []);

  const markSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, LATEST_VERSION);
    setHasNew(false);
  }, []);

  return { hasNew, markSeen };
}

/* ------------------------------------------------------------------ */
/*  Badge color by type                                                */
/* ------------------------------------------------------------------ */

function typeBadgeVariant(type: ChangelogEntry["type"]) {
  switch (type) {
    case "feature":
      return "default";
    case "fix":
      return "destructive";
    case "improvement":
      return "secondary";
  }
}

function typeLabel(type: ChangelogEntry["type"]) {
  switch (type) {
    case "feature":
      return "Feature";
    case "fix":
      return "Bug Fix";
    case "improvement":
      return "Improvement";
  }
}

/* ------------------------------------------------------------------ */
/*  ChangelogButton                                                    */
/* ------------------------------------------------------------------ */

export function ChangelogButton() {
  const { hasNew, markSeen } = useChangelogNotification();
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) markSeen();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Megaphone className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">What&apos;s New</span>
          {hasNew && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-2 ring-background" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
          <DialogDescription>Recent updates and new features in Windback.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {CHANGELOG.map((entry, i) => (
            <div key={entry.version}>
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={typeBadgeVariant(entry.type)}>
                      {typeLabel(entry.type)}
                    </Badge>
                    <span className="text-xs font-medium text-foreground">
                      v{entry.version}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.date}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground">{entry.title}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
              </div>
              {i < CHANGELOG.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
