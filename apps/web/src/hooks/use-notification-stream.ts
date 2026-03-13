"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@windback/ui";
import { QUERY_KEYS } from "@/lib/constants";

type SSEEventType =
  | "churn_event_created"
  | "score_recalculated"
  | "dunning_email_sent"
  | "payment_recovered"
  | "market_pulse_update"
  | "connected";

interface SSEEvent {
  type: SSEEventType;
  project_id: string;
  payload?: Record<string, string>;
}

// Toast messages for each event type.
const EVENT_MESSAGES: Record<SSEEventType, (p?: Record<string, string>) => { title: string; description?: string } | null> = {
  connected: () => null,
  churn_event_created: (p) => ({
    title: "New cancellation detected",
    description: p?.customer_email ? `From ${p.customer_email}` : undefined,
  }),
  score_recalculated: () => ({
    title: "Churn scores updated",
    description: "Risk scores have been recalculated.",
  }),
  dunning_email_sent: (p) => ({
    title: "Dunning email sent",
    description: p?.customer_email ? `Sent to ${p.customer_email}` : undefined,
  }),
  payment_recovered: (p) => ({
    title: "Payment recovered",
    description: p?.customer_email ? `${p.customer_email} is back` : undefined,
  }),
  market_pulse_update: () => null,
};

// Queries to invalidate on each event type so the UI refreshes automatically.
function getInvalidationKeys(slug: string, eventType: SSEEventType) {
  switch (eventType) {
    case "churn_event_created":
      return [QUERY_KEYS.churnEvents(slug), QUERY_KEYS.stats(slug)];
    case "score_recalculated":
      return [QUERY_KEYS.churnRiskScores(slug), QUERY_KEYS.churnRiskStats(slug)];
    case "dunning_email_sent":
      return [QUERY_KEYS.paymentFailures(slug)];
    case "payment_recovered":
      return [QUERY_KEYS.paymentFailures(slug), QUERY_KEYS.stats(slug)];
    case "market_pulse_update":
      return [QUERY_KEYS.marketPulseLatest(slug), QUERY_KEYS.marketPulseSnapshots(slug)];
    default:
      return [];
  }
}

/**
 * useNotificationStream opens a Server-Sent Events connection for the given
 * project. It shows a toast for each incoming event and invalidates the
 * relevant TanStack Query caches so the UI updates without a manual refresh.
 *
 * The connection automatically reconnects on network errors (EventSource
 * handles this natively with exponential back-off).
 */
export function useNotificationStream(slug: string) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!slug) return;

    const url = `/api/proxy/v1/projects/${slug}/stream`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    const handleEvent = (rawType: string, data: string) => {
      let parsed: SSEEvent | null = null;
      try {
        parsed = JSON.parse(data) as SSEEvent;
      } catch {
        return;
      }

      const eventType = rawType as SSEEventType;
      const messageFn = EVENT_MESSAGES[eventType];
      if (messageFn) {
        const msg = messageFn(parsed.payload);
        if (msg) {
          toast({ title: msg.title, description: msg.description });
        }
      }

      const keys = getInvalidationKeys(slug, eventType);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    };

    const eventTypes: SSEEventType[] = [
      "churn_event_created",
      "score_recalculated",
      "dunning_email_sent",
      "payment_recovered",
      "market_pulse_update",
    ];

    const listeners: Array<{ type: string; fn: EventListener }> = [];
    for (const eventType of eventTypes) {
      const fn: EventListener = (e: Event) => {
        handleEvent(eventType, (e as MessageEvent).data);
      };
      es.addEventListener(eventType, fn);
      listeners.push({ type: eventType, fn });
    }

    return () => {
      listeners.forEach(({ type, fn }) => es.removeEventListener(type, fn));
      es.close();
      esRef.current = null;
    };
  }, [slug, queryClient]);
}
