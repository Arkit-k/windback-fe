export const COOKIE_NAME = "windback_token";
export const BACKEND_URL = process.env.BACKEND_URL ?? "";

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
  emailConfig: (slug: string) => ["email-config", slug] as const,
  notificationConfig: (slug: string) => ["notification-config", slug] as const,
  stripeConnectStatus: (slug: string) => ["stripe-connect-status", slug] as const,
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
  emailConfig: 60 * 1000,
  notificationConfig: 60 * 1000,
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

export const CANCEL_REASON_LABELS: Record<string, string> = {
  too_expensive: "Too Expensive",
  missing_features: "Missing Features",
  not_using_enough: "Not Using Enough",
  switching_competitor: "Switching to Competitor",
  technical_issues: "Technical Issues",
  poor_support: "Poor Support",
  dont_need_anymore: "Don't Need Anymore",
  other: "Other",
};

export const PROVIDER_LABELS: Record<string, string> = {
  stripe: "Stripe",
  razorpay: "Razorpay",
  paypal: "PayPal",
  wise: "Wise",
  paddle: "Paddle",
  polar: "Polar",
  dodo: "Dodo",
  chargebee: "Chargebee",
  lemonsqueezy: "LemonSqueezy",
  custom: "Custom",
};
