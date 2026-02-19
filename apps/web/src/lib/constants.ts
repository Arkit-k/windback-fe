export const COOKIE_NAME = "windback_token";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const QUERY_KEYS = {
  auth: ["auth", "me"] as const,
  projects: ["projects"] as const,
  project: (slug: string) => ["projects", slug] as const,
  stats: (slug: string) => ["stats", slug] as const,
  churnEvents: (slug: string, params?: { status?: string; page?: number }) =>
    ["churn-events", slug, params] as const,
  churnEvent: (slug: string, id: string) => ["churn-events", slug, id] as const,
  paymentFailures: (slug: string, params?: { status?: string; page?: number }) =>
    ["payment-failures", slug, params] as const,
  paymentFailure: (slug: string, id: string) => ["payment-failures", slug, id] as const,
  paymentFailureStats: (slug: string) => ["payment-failure-stats", slug] as const,
  billing: ["billing"] as const,
  usage: ["billing", "usage"] as const,
  emailAnalytics: (slug: string, from?: string, to?: string) =>
    ["email-analytics", slug, { from, to }] as const,
  team: (slug: string) => ["team", slug] as const,
  dunningConfig: (slug: string) => ["dunning-config", slug] as const,
  recoveryTrends: (slug: string, days?: number) =>
    ["recovery-trends", slug, { days }] as const,
} as const;

export const STALE_TIMES = {
  auth: 5 * 60 * 1000,
  projects: 60 * 1000,
  stats: 30 * 1000,
  churnEvents: 30 * 1000,
  churnEvent: 60 * 1000,
  paymentFailures: 30 * 1000,
  paymentFailure: 60 * 1000,
  paymentFailureStats: 30 * 1000,
  usage: 60 * 1000,
  emailAnalytics: 60 * 1000,
  team: 30 * 1000,
  dunningConfig: 60 * 1000,
  recoveryTrends: 60 * 1000,
} as const;

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  processing: "Processing",
  variants_generated: "Variants Generated",
  email_sent: "Email Sent",
  recovered: "Recovered",
  lost: "Lost",
};

export const STRATEGY_LABELS: Record<string, string> = {
  value_recap: "Value Recap",
  unused_feature: "Unused Feature",
  downgrade_offer: "Downgrade Offer",
  pause_option: "Pause Option",
  founder_email: "Founder Email",
  pain_point_fix: "Pain Point Fix",
  social_proof: "Social Proof",
  feedback_request: "Feedback Request",
  discount: "Discount",
};

export const PAYMENT_FAILURE_STATUS_LABELS: Record<string, string> = {
  failing: "Failing",
  recovered: "Recovered",
  abandoned: "Abandoned",
};

export const DUNNING_TONE_LABELS: Record<string, string> = {
  gentle_reminder: "Gentle Reminder",
  urgency: "Urgency",
  help_offer: "Help Offer",
  final_warning: "Final Warning",
};

export const ITEMS_PER_PAGE = 20;
