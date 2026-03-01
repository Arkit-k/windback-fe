export type ChurnEventStatus =
  | "new"
  | "processing"
  | "variants_generated"
  | "email_sent"
  | "recovered"
  | "lost";

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
  plan_tier: 'starter' | 'growth' | 'scale';
  events_used: number;
  events_limit: number;
  projects_used: number;
  projects_limit: number;
  billing_period_start: string;
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
  tier_required: "starter" | "growth" | "scale";
  name: string;
  subject: string;
  body: string;
  sort_order: number;
  locked: boolean;
  active_for_project: boolean;
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
