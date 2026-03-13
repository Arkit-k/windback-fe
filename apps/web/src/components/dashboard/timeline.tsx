"use client";

import { Badge, Skeleton } from "@windback/ui";
import {
  AlertTriangle,
  Mail,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Activity,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import type { TimelineEvent } from "@/types/api";

// ---------------------------------------------------------------------------
// Icon per event type
// ---------------------------------------------------------------------------
function EventIcon({ type, severity }: { type: string; severity: string }) {
  const colorClass =
    severity === "critical"
      ? "text-red-500"
      : severity === "warning"
        ? "text-yellow-500"
        : severity === "success"
          ? "text-green-500"
          : "text-muted-foreground";

  const iconClass = `h-4 w-4 ${colorClass}`;

  switch (type) {
    case "churn_event":
      return <AlertTriangle className={iconClass} />;
    case "recovery_email":
    case "dunning_email":
      return <Mail className={iconClass} />;
    case "score_change":
      return severity === "success" || severity === "info" ? (
        <TrendingDown className={iconClass} />
      ) : (
        <TrendingUp className={iconClass} />
      );
    case "payment_failure":
    case "payment_recovered":
      return <CreditCard className={iconClass} />;
    case "user_event":
    default:
      return <Activity className={iconClass} />;
  }
}

// ---------------------------------------------------------------------------
// Dot color
// ---------------------------------------------------------------------------
function dotColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    case "success":
      return "bg-green-500";
    default:
      return "bg-muted-foreground/40";
  }
}

// ---------------------------------------------------------------------------
// Timeline component
// ---------------------------------------------------------------------------
export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity recorded for this customer.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id} className="relative flex gap-4 pb-6">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background ${
                  event.severity === "critical"
                    ? "border-red-300"
                    : event.severity === "warning"
                      ? "border-yellow-300"
                      : event.severity === "success"
                        ? "border-green-300"
                        : "border-border"
                }`}
              >
                <EventIcon type={event.type} severity={event.severity} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {event.title}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${
                    event.severity === "critical"
                      ? "border-red-300 text-red-600"
                      : event.severity === "warning"
                        ? "border-yellow-300 text-yellow-600"
                        : event.severity === "success"
                          ? "border-green-300 text-green-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {event.type.replace(/_/g, " ")}
                </Badge>
              </div>
              {event.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {event.description}
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground/70">
                {formatRelativeDate(event.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------
export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
