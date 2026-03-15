export const COOKIE_NAME = "windback_token";
export const BACKEND_URL = process.env.BACKEND_URL ?? "";
export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "/docs";

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
  retentionOffers: (slug: string) => ["retention-offers", slug] as const,
  churnRiskScores: (slug: string) => ["churn-risk-scores", slug] as const,
  churnRiskStats: (slug: string) => ["churn-risk-stats", slug] as const,
  churnRiskConfig: (slug: string) => ["churn-risk-config", slug] as const,
  auditLogs: (slug: string, offset?: number, action?: string) => ["audit-logs", slug, offset, action] as const,
  marketPulseLatest: (slug: string) => ["market-pulse-latest", slug] as const,
  marketPulseSnapshots: (slug: string, hours?: number) => ["market-pulse-snapshots", slug, { hours }] as const,
  marketPulseHeatmap: (slug: string, days?: number) => ["market-pulse-heatmap", slug, { days }] as const,
  cohorts: (slug: string, months?: number) => ["cohorts", slug, { months }] as const,
  forecast: (slug: string) => ["forecast", slug] as const,
  segments: (slug: string) => ["segments", slug] as const,
  segment: (slug: string, id: string) => ["segments", slug, id] as const,
  abTests: (slug: string) => ["ab-tests", slug] as const,
  abTest: (slug: string, testId: string) => ["ab-tests", slug, testId] as const,
  benchmark: (slug: string) => ["benchmark", slug] as const,
  moodSnapshot: (slug: string) => ["mood-snapshot", slug] as const,
  ghostCustomers: (slug: string) => ["ghost-customers", slug] as const,
  ghostStats: (slug: string) => ["ghost-stats", slug] as const,
  playbooks: (slug: string) => ["playbooks", slug] as const,
  playbook: (slug: string, id: string) => ["playbooks", slug, id] as const,
  playbookRuns: (slug: string, id: string) => ["playbook-runs", slug, id] as const,
  auctionOffers: (slug: string, config?: unknown) => ["auction-offers", slug, config] as const,
  auctionSummary: (slug: string, config?: unknown) => ["auction-summary", slug, config] as const,
  campaigns: (slug: string, params?: unknown) => ["campaigns", slug, params] as const,
  campaign: (slug: string, id: string) => ["campaigns", slug, id] as const,
  healthScores: (slug: string, params?: unknown) => ["health-scores", slug, params] as const,
  healthScoreStats: (slug: string) => ["health-score-stats", slug] as const,
  surveys: (slug: string) => ["surveys", slug] as const,
  survey: (slug: string, id: string) => ["surveys", slug, id] as const,
  surveyStats: (slug: string, id: string) => ["survey-stats", slug, id] as const,
  csmAssignments: (slug: string) => ["csm-assignments", slug] as const,
  csmStats: (slug: string) => ["csm-stats", slug] as const,
  csmTouchpoints: (slug: string, assignmentId: string) => ["csm-touchpoints", slug, assignmentId] as const,
  ltv: (slug: string, params?: unknown) => ["ltv", slug, params] as const,
  ltvStats: (slug: string) => ["ltv-stats", slug] as const,
  alertRules: (slug: string) => ["alert-rules", slug] as const,
  alertHistory: (slug: string, params?: unknown) => ["alert-history", slug, params] as const,
  onboardingMilestones: (slug: string) => ["onboarding-milestones", slug] as const,
  onboardingProgress: (slug: string, email: string) => ["onboarding-progress", slug, email] as const,
  onboardingStats: (slug: string) => ["onboarding-stats", slug] as const,
  integrations: (slug: string) => ["integrations", slug] as const,
  integrationProviders: (slug: string) => ["integration-providers", slug] as const,
  statusIncidents: (slug: string) => ["status-incidents", slug] as const,
  statusPageConfig: (slug: string) => ["status-page-config", slug] as const,
  customDashboards: (slug: string) => ["custom-dashboards", slug] as const,
  customDashboard: (slug: string, id: string) => ["custom-dashboards", slug, id] as const,
  exchangeRates: (slug: string) => ["exchange-rates", slug] as const,
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
  // Analytics data doesn't change second-to-second; 2 minutes avoids hammering
  // the backend on every tab switch.
  emailAnalytics: 2 * 60 * 1000,
  team: 30 * 1000,
  dunningConfig: 60 * 1000,
  emailConfig: 60 * 1000,
  notificationConfig: 60 * 1000,
  recoveryTrends: 2 * 60 * 1000,
  retentionOffers: 30 * 1000,
  // Churn risk scores are recalculated by the scheduler every few minutes;
  // 60 s staleTime avoids redundant refetches on every component mount.
  churnRiskScores: 60 * 1000,
  churnRiskStats: 60 * 1000,
  churnRiskConfig: 60 * 1000,
  auditLogs: 30 * 1000,
  marketPulseLatest: 10 * 1000,
  marketPulseSnapshots: 60 * 1000,
  marketPulseHeatmap: 5 * 60 * 1000,
  cohorts: 2 * 60 * 1000,
  // Forecast data is computed on demand; 2 minutes avoids repeated heavy queries.
  forecast: 2 * 60 * 1000,
  segments: 30 * 1000,
  playbooks: 30 * 1000,
  abTests: 30 * 1000,
  benchmark: 2 * 60 * 1000,
  // Mood snapshot is recomputed every 30s on the client; 15s staleTime keeps it fresh.
  moodSnapshot: 15 * 1000,
  // Ghost detection is computed on-demand; 60s avoids redundant recalculations.
  ghostCustomers: 60 * 1000,
  ghostStats: 60 * 1000,
  // Auction offers are computed on demand; 60s avoids repeated heavy queries.
  auctionOffers: 60 * 1000,
  auctionSummary: 60 * 1000,
  campaigns: 30 * 1000,
  healthScores: 60 * 1000,
  healthScoreStats: 60 * 1000,
  surveys: 30 * 1000,
  surveyStats: 30 * 1000,
  csmAssignments: 30 * 1000,
  csmStats: 60 * 1000,
  csmTouchpoints: 30 * 1000,
  ltv: 60 * 1000,
  ltvStats: 60 * 1000,
  alertRules: 30 * 1000,
  alertHistory: 30 * 1000,
  onboardingMilestones: 30 * 1000,
  onboardingProgress: 30 * 1000,
  onboardingStats: 60 * 1000,
  integrations: 30 * 1000,
  integrationProviders: 5 * 60 * 1000,
  statusIncidents: 30 * 1000,
  statusPageConfig: 60 * 1000,
  customDashboards: 30 * 1000,
  exchangeRates: 5 * 60 * 1000,
} as const;

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  processing: "Processing",
  variants_generated: "Variants Generated",
  email_sent: "Email Sent",
  recovered: "Recovered",
  lost: "Lost",
  offer_accepted: "Offer Accepted",
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

export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  paid_ads: "Paid Ads",
  email: "Email",
  social: "Social",
  referral: "Referral",
  content: "Content",
  other: "Other",
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
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
