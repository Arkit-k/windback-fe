export type ChurnEventStatus =
  | "new"
  | "processing"
  | "variants_generated"
  | "email_sent"
  | "recovered"
  | "lost"
  | "offer_accepted";

export type RecoveryStrategy =
  | "value_recap"
  | "unused_feature"
  | "downgrade_offer"
  | "pause_option"
  | "founder_email"
  | "pain_point_fix"
  | "social_proof"
  | "feedback_request"
  | "discount";

export type Provider =
  | "stripe"
  | "razorpay"
  | "paypal"
  | "wise"
  | "paddle"
  | "polar"
  | "dodo"
  | "chargebee"
  | "lemonsqueezy"
  | "custom";

export interface User {
  id: string;
  email: string;
  name: string;
  api_key_masked: string;
  business_name?: string;
  business_location?: string;
  business_type?: string;
  referral_source?: string;
  onboarding_completed: boolean;
  avatar_url?: string;
  plan_tier?: string;
  totp_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  product_type: string;
  support_email?: string;
  stripe_account_id?: string;
  razorpay_key_id?: string;
  allowed_origins: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  product_type: string;
  support_email: string;
}

export interface CreateProjectResponse {
  project: Project;
  raw_public_key: string;
  raw_secret_key: string;
}

export interface APIKeyInfo {
  id: string;
  key_type: "public" | "secret";
  key_masked: string;
  created_at: string;
}

export interface UpdateProjectRequest {
  name?: string;
  product_type?: string;
  support_email?: string;
  stripe_account_id?: string;
  razorpay_key_id?: string;
  allowed_origins?: string[];
}

export interface RecoveryVariant {
  id: string;
  churn_event_id: string;
  strategy: RecoveryStrategy;
  subject: string;
  body: string;
  coupon_code?: string;
  coupon_percent?: number;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

export interface ChurnEvent {
  id: string;
  user_id: string;
  project_id: string;
  customer_email: string;
  customer_name: string;
  provider: Provider;
  provider_subscription_id: string;
  provider_customer_id: string;
  plan_name: string;
  mrr_cents: number;
  currency: string;
  tenure_days: number;
  last_active_at?: string;
  cancel_reason?: string;
  status: ChurnEventStatus;
  variants?: RecoveryVariant[];
  created_at: string;
  updated_at: string;
}

export interface ChurnEventListResponse {
  data: ChurnEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateChurnEventRequest {
  customer_email: string;
  provider: string;
  mrr: number;
  currency: string;
  customer_name?: string;
  provider_customer_id?: string;
  provider_subscription_id?: string;
  plan_name?: string;
  tenure_days?: number;
  cancel_reason?: string;
  cancel_reason_text?: string;
  notes?: string;
}

export interface ChurnStats {
  total_events: number;
  new_events: number;
  recovered_events: number;
  lost_events: number;
  total_mrr_at_risk: number;
  recovered_mrr: number;
  recovery_rate: number;
  total_customers: number;
  active_customers: number;
  churned_customers: number;
  winback_candidates: number;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthMeResponse {
  user: User;
}

export interface OnboardingRequest {
  business_name: string;
  business_location: string;
  business_type: string;
  referral_source: string;
}

export interface OnboardingResponse {
  user: User;
}

export interface ApiError {
  error: string;
}

// Dunning / Failed Payment Recovery types

export type PaymentFailureStatus = "failing" | "recovered" | "abandoned";

export type DunningTone =
  | "gentle_reminder"
  | "urgency"
  | "help_offer"
  | "final_warning";

export interface DunningEmail {
  id: string;
  payment_failure_id: string;
  retry_number: number;
  tone: DunningTone;
  subject: string;
  body_html: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

export interface PaymentFailure {
  id: string;
  project_id: string;
  provider: Provider;
  provider_customer_id: string;
  provider_invoice_id: string;
  customer_email: string;
  customer_name: string;
  amount_cents: number;
  currency: string;
  failure_reason?: string;
  status: PaymentFailureStatus;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  recovered_at?: string;
  dunning_emails?: DunningEmail[];
  created_at: string;
  updated_at: string;
}

export interface PaymentFailureListResponse {
  data: PaymentFailure[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaymentFailureStats {
  total_failing: number;
  total_recovered: number;
  total_abandoned: number;
  mrr_at_risk_cents: number;
  mrr_recovered_cents: number;
  recovery_rate: number;
}

// Billing types

export interface UsageInfo {
  plan_tier: 'starter' | 'growth' | 'enterprise' | 'scale';
  events_used: number;
  events_limit: number;
  projects_used: number;
  projects_limit: number;
  billing_period_start: string;
  cancel_pending: boolean;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface CancelSurveyReasonStat {
  reason: string;
  count: number;
  percent: number;
}

export interface CancelSurveyEntry {
  reason: string;
  custom_reason?: string;
  created_at: string;
}

export interface CancelSurveyStats {
  total: number;
  reasons: CancelSurveyReasonStat[];
  recent: CancelSurveyEntry[];
}

// Analytics types

export interface DailyEmailStat {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
}

export interface EmailAnalytics {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
  daily: DailyEmailStat[];
}

// Team types

export type TeamRole = "owner" | "member";

export interface TeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role: TeamRole;
  user_email: string;
  user_name: string;
  invited_by?: string;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  project_id: string;
  email: string;
  role: TeamRole;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: TeamRole;
}

// Dunning config types

export interface DunningConfig {
  id: string;
  project_id: string;
  max_retries: number;
  retry_interval_hours: number;
  tone_sequence: string[];
  custom_from_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateDunningConfigRequest {
  max_retries: number;
  retry_interval_hours: number;
  tone_sequence: string[];
  custom_from_name?: string;
}

// Email config types

export type EmailMethod = "windback_default" | "gmail_oauth" | "custom_domain";

export interface DNSRecord {
  type: string;
  host: string;
  value: string;
}

export interface ProjectEmailConfig {
  id?: string;
  project_id: string;
  method: EmailMethod;
  sender_display_name?: string;
  gmail_sender_email?: string;
  custom_domain?: string;
  custom_from_email?: string;
  custom_from_name?: string;
  custom_reply_to?: string;
  dns_records?: DNSRecord[];
  domain_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SetEmailMethodRequest {
  method: EmailMethod;
}

export interface InitDomainAuthRequest {
  domain: string;
  from_email: string;
  from_name?: string;
  reply_to?: string;
}

export interface InitDomainAuthResponse {
  dns_records: DNSRecord[];
}

export interface GmailAuthURLResponse {
  url: string;
}

// Notification config types

export interface NotificationConfig {
  id?: string;
  project_id: string;
  slack_webhook_url: string | null;
  slack_enabled: boolean;
  custom_webhook_url: string | null;
  custom_webhook_secret_preview: string;
  custom_webhook_enabled: boolean;
  notify_churn_created: boolean;
  notify_churn_recovered: boolean;
  notify_payment_failed: boolean;
  notify_payment_recovered: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateNotificationConfigRequest {
  slack_webhook_url: string | null;
  slack_enabled: boolean;
  custom_webhook_url: string | null;
  custom_webhook_enabled: boolean;
  notify_churn_created: boolean;
  notify_churn_recovered: boolean;
  notify_payment_failed: boolean;
  notify_payment_recovered: boolean;
}

// Stripe Connect types

export interface StripeConnectStatus {
  connected: boolean;
  account_id: string | null;
}

// Recovery template types

export interface RecoveryTemplate {
  id: string;
  project_id: string;
  cancel_reason: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateRequest {
  cancel_reason: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  body?: string;
  is_active?: boolean;
}

export interface SystemRecoveryTemplate {
  id: string;
  cancel_reason: string;
  strategy: string;
  tier_required: "starter" | "growth" | "business" | "scale";
  name: string;
  subject: string;
  body: string;
  sort_order: number;
  locked: boolean;
  active_for_project: boolean;
}

// Retention offer types

export type OfferType = "discount" | "pause" | "downgrade" | "custom";

export interface RetentionOffer {
  id: string;
  project_id: string;
  cancel_reason: string;
  offer_type: OfferType;
  title: string;
  description: string;
  cta_text: string;
  discount_percent?: number;
  pause_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertRetentionOfferRequest {
  offer_type: OfferType;
  title: string;
  description: string;
  cta_text?: string;
  discount_percent?: number;
  pause_days?: number;
  is_active?: boolean;
}

// Churn Risk / Predictive Scoring types

export interface ChurnSignal {
  name: string;
  weight: number;
  description: string;
}

export interface ChurnRiskScore {
  id: string;
  project_id: string;
  customer_email: string;
  customer_name?: string;
  risk_score: number;
  previous_score?: number;
  trend: "increasing" | "stable" | "decreasing";
  risk_level: "high" | "medium" | "low";
  signals: ChurnSignal[];
  email_sent: boolean;
  email_sent_at?: string;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

export interface ChurnRiskStats {
  total_customers: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  emails_sent: number;
}

export interface ChurnRiskConfig {
  id?: string;
  project_id: string;
  enabled: boolean;
  high_risk_threshold: number;
  medium_risk_threshold: number;
  auto_email_enabled: boolean;
  auto_email_threshold: number;
  webhook_url?: string;
  webhook_secret?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateChurnRiskConfigRequest {
  enabled?: boolean;
  high_risk_threshold?: number;
  medium_risk_threshold?: number;
  auto_email_enabled?: boolean;
  auto_email_threshold?: number;
  webhook_url?: string;
  webhook_secret?: string;
}

// Webhook delivery types

export interface WebhookDelivery {
  id: string;
  project_id: string;
  customer_email: string;
  webhook_url: string;
  payload: Record<string, unknown>;
  status_code?: number;
  error_message?: string;
  attempt: number;
  max_attempts: number;
  next_retry_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface WebhookDeliveryListResponse {
  data: WebhookDelivery[];
  total: number;
  limit: number;
  offset: number;
}

// Score history types

export interface ChurnScoreHistory {
  id: string;
  project_id: string;
  customer_email: string;
  risk_score: number;
  risk_level: string;
  signals: ChurnSignal[];
  calculated_at: string;
}

// Customer detail types

export interface CustomerDetail {
  score: ChurnRiskScore;
  events: UserEvent[];
  score_history: ChurnScoreHistory[];
}

export interface UserEvent {
  id: string;
  project_id: string;
  customer_email: string;
  customer_name?: string;
  event_type: string;
  properties: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

// Email preview types

export interface EmailPreview {
  subject: string;
  body_html: string;
}

// Recovery trends types

export interface RecoveryTrend {
  date: string;
  new_events: number;
  recovered: number;
  lost: number;
  mrr_at_risk_cents: number;
  mrr_recovered_cents: number;
  recovery_rate: number;
}

// Revenue Forecast types

export interface ForecastPoint {
  days_out: number;
  projected_cents: number;
  optimistic_cents: number;
  pessimistic_cents: number;
  confidence: number;
}

export interface RevenueForecast {
  current_mrr_cents: number;
  projections: ForecastPoint[];
  at_risk_mrr_cents: number;
  expected_churn_cents: number;
  expected_growth_cents: number;
  confidence_level: number;
  generated_at: string;
}

// Smart Segment types

export interface SegmentRule {
  field: string;
  operator: string;
  value: unknown;
}

export interface Segment {
  id: string;
  project_id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  color: string;
  is_active: boolean;
  customer_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSegmentRequest {
  name: string;
  description?: string;
  rules: SegmentRule[];
  color?: string;
}

export interface UpdateSegmentRequest {
  name?: string;
  description?: string;
  rules?: SegmentRule[];
  color?: string;
  is_active?: boolean;
}

// Market Pulse types
export interface MarketSnapshot {
  id: string;
  project_id: string;
  open_score: number;
  high_score: number;
  low_score: number;
  close_score: number;
  churn_rate: number;
  recovery_rate: number;
  mrr_delta_cents: number;
  event_volume: number;
  payment_failure_rate: number;
  volume: number;
  predicted_score: number;
  confidence: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface MarketPulseLatest {
  health_score: number;
  previous_score: number;
  delta: number;
  delta_percent: number;
  trend: "up" | "down" | "flat";
  churn_rate: number;
  recovery_rate: number;
  mrr_delta_cents: number;
  event_volume: number;
  predicted_score: number;
  confidence: number;
  timestamp: string;
}

export interface MarketDemandCell {
  event_type: string;
  hour: number;
  day_of_week: number;
  count: number;
  intensity: number;
}

// Customer Health Timeline types

export type TimelineEventType =
  | "churn_event"
  | "recovery_email"
  | "score_change"
  | "payment_failure"
  | "payment_recovered"
  | "user_event"
  | "dunning_email";

export type TimelineSeverity = "info" | "warning" | "critical" | "success";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  severity: TimelineSeverity;
}

export interface CustomerTimeline {
  customer_email: string;
  customer_name: string;
  current_score?: number;
  risk_level?: string;
  events: TimelineEvent[];
  total_events: number;
}

// Cohort Analysis types

export interface CohortRetentionPoint {
  month_offset: number;
  active_customers: number;
  retention_rate: number; // 0-100
  churned_count: number;
}

export interface CohortBucket {
  cohort_month: string; // "2025-01"
  total_customers: number;
  retention: CohortRetentionPoint[];
}

export interface CohortSummary {
  cohorts: CohortBucket[];
  overall_retention: number; // avg retention at month 1
  best_cohort: string;
  worst_cohort: string;
}

// Playbook types

export type PlaybookTriggerType =
  | "score_threshold"
  | "event_type"
  | "payment_failed"
  | "manual";

export interface PlaybookTriggerConfig {
  score_threshold?: number;
  score_direction?: "above" | "below";
  event_type?: string;
}

export type PlaybookStepType =
  | "send_email"
  | "wait"
  | "send_slack"
  | "offer_discount"
  | "check_condition"
  | "webhook";

export interface PlaybookStep {
  id: string;
  type: PlaybookStepType;
  config: Record<string, unknown>;
}

export interface Playbook {
  id: string;
  project_id: string;
  name: string;
  description: string;
  trigger_type: PlaybookTriggerType;
  trigger_config: PlaybookTriggerConfig;
  steps: PlaybookStep[];
  is_active: boolean;
  total_runs: number;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaybookRequest {
  name: string;
  description?: string;
  trigger_type: PlaybookTriggerType;
  trigger_config: PlaybookTriggerConfig;
  steps: PlaybookStep[];
}

export interface PlaybookRunLogEntry {
  step_id: string;
  status: "completed" | "failed" | "skipped";
  message: string;
  timestamp: string;
}

export interface PlaybookRun {
  id: string;
  playbook_id: string;
  customer_email: string;
  status: "running" | "completed" | "failed" | "cancelled";
  current_step: number;
  started_at: string;
  completed_at?: string;
  log: PlaybookRunLogEntry[];
}

// Slack Bot types

export interface SlackCommand {
  command: string;
  text: string;
  user_id: string;
  channel_id: string;
  response_url: string;
}

export interface SlackDigest {
  project_name: string;
  health_score: number;
  health_delta: number;
  new_churn_events: number;
  recoveries: number;
  failed_payments: number;
  at_risk_customers: number;
  mrr_delta_cents: number;
  top_risks: SlackRiskEntry[];
}

export interface SlackRiskEntry {
  customer_email: string;
  score: number;
  risk_level: string;
}

// A/B Testing types

export type ABTestStatus = "draft" | "running" | "completed" | "archived";
export type ABTestType = "subject_line" | "tone" | "offer" | "template";

export interface ABTestVariant {
  id: string;
  name: string;
  value: string;
  weight: number;
}

export interface ABTest {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: ABTestStatus;
  test_type: ABTestType;
  variants: ABTestVariant[];
  winner_variant_id?: string;
  total_sends: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ABTestResult {
  id: string;
  ab_test_id: string;
  variant_id: string;
  sends: number;
  opens: number;
  clicks: number;
  recoveries: number;
  revenue_cents: number;
}

export interface ABTestWithResults extends ABTest {
  results: ABTestResult[];
}

export interface CreateABTestRequest {
  name: string;
  description?: string;
  test_type: ABTestType;
  variants: ABTestVariant[];
}

// Campaign Tracking types

export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignType = "paid_ads" | "email" | "social" | "referral" | "content" | "other";

export interface CampaignGoal {
  metric: string;
  target: number;
}

export interface Campaign {
  id: string;
  project_id: string;
  name: string;
  description: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  budget_cents?: number;
  currency: string;
  goals: CampaignGoal[];
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignMetrics {
  revenue_cents_during: number;
  revenue_cents_baseline: number;
  revenue_lift_percent: number;
  new_customers_during: number;
  new_customers_baseline: number;
  churn_events_during: number;
  churn_events_baseline: number;
  recoveries_during: number;
  recoveries_baseline: number;
  payment_failures_during: number;
  payment_failures_baseline: number;
  payment_recoveries_during: number;
  payment_recoveries_baseline: number;
  payment_amount_recovered_during: number;
  payment_amount_recovered_baseline: number;
  roi_percent?: number;
}

export interface CampaignWithMetrics extends Campaign {
  metrics: CampaignMetrics;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  campaign_type: CampaignType;
  budget_cents?: number;
  currency?: string;
  goals: CampaignGoal[];
  starts_at: string;
  ends_at: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  campaign_type?: CampaignType;
  status?: CampaignStatus;
  budget_cents?: number;
  currency?: string;
  goals?: CampaignGoal[];
  starts_at?: string;
  ends_at?: string;
}

// Mood Ring types

export interface MoodHistoryPoint {
  score: number;
  level: string;
  timestamp: string;
}

export interface MoodSnapshot {
  mood_score: number;
  mood_level: string;
  mood_color: string;
  previous_score: number;
  delta: number;
  trend: "improving" | "stable" | "declining";
  engagement_score: number;
  churn_velocity_score: number;
  recovery_score: number;
  support_score: number;
  growth_score: number;
  active_customers: number;
  churn_events_today: number;
  recoveries_this_week: number;
  history: MoodHistoryPoint[];
  generated_at: string;
}

// Ghost Customer types

export type GhostLevel = "active" | "fading" | "ghost" | "zombie";

export interface GhostCustomer {
  project_id: string;
  customer_email: string;
  customer_name: string;
  ghost_score: number; // 0-100
  ghost_level: GhostLevel;
  days_since_last_event: number;
  event_frequency_decline: number; // % drop
  distinct_event_types: number;
  last_event_at?: string;
  estimated_mrr_cents: number;
  detected_at: string;
}

export interface GhostStats {
  total_customers: number;
  ghost_count: number;
  zombie_count: number;
  fading_count: number;
  active_count: number;
  at_risk_mrr_cents: number;
  ghost_percentage: number;
}

// Benchmarking types

export interface BenchmarkData {
  your_churn_rate: number;
  your_recovery_rate: number;
  your_health_score: number;
  your_avg_response_time_hours: number;
  avg_churn_rate: number;
  avg_recovery_rate: number;
  avg_health_score: number;
  avg_response_time_hours: number;
  churn_rate_percentile: number;
  recovery_rate_percentile: number;
  health_score_percentile: number;
  total_projects_benchmarked: number;
  generated_at: string;
}

// Win-Back Auction Engine types

export type WinBackOfferType =
  | "discount"
  | "pause"
  | "downgrade"
  | "feature_unlock"
  | "personal_outreach";

export interface WinBackOffer {
  customer_email: string;
  customer_name: string;
  risk_score: number;
  risk_level: string;
  estimated_ltv_cents: number;
  current_mrr_cents: number;
  offer_type: WinBackOfferType;
  discount_percent?: number;
  discount_duration_months?: number;
  pause_days?: number;
  offer_cost_cents: number;
  expected_save_cents: number;
  roi: number;
  win_probability: number;
  rationale: string;
  price_sensitivity: "low" | "medium" | "high";
  generated_at: string;
}

export interface AuctionSummary {
  total_at_risk: number;
  total_recommendations: number;
  total_offer_cost_cents: number;
  total_expected_save_cents: number;
  avg_roi: number;
  avg_win_probability: number;
  by_offer_type: Record<string, number>;
}

export interface AuctionConfig {
  max_discount_percent: number;
  max_pause_days: number;
  min_roi: number;
  preferred_strategy: "aggressive" | "balanced" | "conservative";
}

// Customer Health Score types

export interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface CustomerHealthScore {
  id: string;
  project_id: string;
  customer_email: string;
  score: number;
  risk_level: string;
  risk_factors: RiskFactor[];
  last_computed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface HealthScoreStats {
  total_customers: number;
  avg_score: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  distribution: ScoreBucket[];
}

// NPS/CSAT Survey types

export type SurveyType = "nps" | "csat";
export type SurveyStatus = "draft" | "active" | "closed";

export interface Survey {
  id: string;
  project_id: string;
  name: string;
  survey_type: SurveyType;
  status: SurveyStatus;
  question: string;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  project_id: string;
  customer_email: string;
  score: number;
  comment: string;
  responded_at: string;
}

export interface SurveyStats {
  total_responses: number;
  avg_score: number;
  nps_score: number;
  promoters: number;
  passives: number;
  detractors: number;
  recent_responses: SurveyResponse[];
}

export interface CreateSurveyRequest {
  name: string;
  survey_type: SurveyType;
  question: string;
}

export interface UpdateSurveyRequest {
  name?: string;
  question?: string;
  status?: SurveyStatus;
}

export interface SubmitSurveyResponseRequest {
  customer_email: string;
  score: number;
  comment?: string;
}

// CSM Assignment types

export interface CSMAssignment {
  id: string;
  project_id: string;
  customer_email: string;
  csm_user_id: string;
  csm_name: string;
  priority: string;
  notes: string;
  assigned_at: string;
}

export interface CSMTouchpoint {
  id: string;
  assignment_id: string;
  project_id: string;
  touchpoint_type: string;
  summary: string;
  outcome: string;
  contacted_at: string;
}

export interface CSMStats {
  total_assignments: number;
  recent_touchpoints: number;
  by_priority: Record<string, number>;
}

export interface CreateCSMAssignmentRequest {
  customer_email: string;
  csm_user_id: string;
  priority?: string;
  notes?: string;
}

export interface CreateTouchpointRequest {
  touchpoint_type: string;
  summary: string;
  outcome?: string;
}

// Customer LTV types

export interface CustomerLTV {
  id: string;
  project_id: string;
  customer_email: string;
  total_revenue_cents: number;
  avg_monthly_cents: number;
  tenure_months: number;
  predicted_ltv_cents: number;
  segment: string;
  last_computed_at: string;
}

export interface LTVSegment {
  segment: string;
  count: number;
  avg_ltv_cents: number;
}

export interface LTVStats {
  total_customers: number;
  avg_ltv_cents: number;
  total_revenue_cents: number;
  segments: LTVSegment[];
}

// Alert Rule types

export type AlertChannel = "email" | "slack" | "webhook";

export interface AlertRule {
  id: string;
  project_id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  channel: AlertChannel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertHistory {
  id: string;
  rule_id: string;
  rule_name: string;
  project_id: string;
  metric_value: number;
  message: string;
  acknowledged: boolean;
  triggered_at: string;
}

export interface CreateAlertRuleRequest {
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  channel: AlertChannel;
}

export interface UpdateAlertRuleRequest {
  name?: string;
  metric?: string;
  condition?: string;
  threshold?: number;
  channel?: AlertChannel;
  is_active?: boolean;
}

// Onboarding Tracking types

export interface OnboardingMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface MilestoneProgress {
  milestone_id: string;
  milestone_name: string;
  completed: boolean;
  completed_at?: string;
}

export interface OnboardingProgress {
  customer_email: string;
  total_milestones: number;
  completed_milestones: number;
  completion_percent: number;
  milestones: MilestoneProgress[];
}

export interface MilestoneDropoff {
  milestone_name: string;
  completions: number;
  dropoff_rate: number;
}

export interface OnboardingStats {
  total_customers: number;
  fully_onboarded: number;
  avg_completion_percent: number;
  dropoff: MilestoneDropoff[];
}

export interface CreateMilestoneRequest {
  name: string;
  description?: string;
  sort_order?: number;
}

export interface CompleteMilestoneRequest {
  customer_email: string;
}

// Integration types

export interface Integration {
  id: string;
  project_id: string;
  provider: string;
  status: string;
  config: Record<string, unknown>;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationProvider {
  name: string;
  slug: string;
  description: string;
  category: string;
  features: string[];
  is_available: boolean;
}

export interface ConnectIntegrationRequest {
  provider: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

// Status Page types

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
export type IncidentSeverity = "minor" | "major" | "critical";

export interface StatusIncident {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  affected_components: string[];
  started_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusPageConfig {
  id: string;
  project_id: string;
  is_public: boolean;
  custom_domain: string;
  branding: Record<string, unknown>;
  components: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentRequest {
  title: string;
  description?: string;
  severity?: IncidentSeverity;
  affected_components?: string[];
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
}

// Custom Dashboard types

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, unknown>;
}

export interface CustomDashboard {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  layout: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

export interface CreateDashboardRequest {
  name: string;
  layout?: DashboardWidget[];
}

export interface UpdateDashboardRequest {
  name?: string;
  is_default?: boolean;
  layout?: DashboardWidget[];
}

// Exchange Rate types

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

export interface ConvertedAmount {
  from_currency: string;
  to_currency: string;
  original_amount: number;
  converted_amount: number;
  rate: number;
}
