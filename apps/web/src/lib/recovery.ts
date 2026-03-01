import type { RecoveryStrategy } from "@/types/api";

export type CancelReason =
  | "too_expensive"
  | "missing_features"
  | "not_using_enough"
  | "switching_competitor"
  | "technical_issues"
  | "poor_support"
  | "dont_need_anymore"
  | "other";

export const CANCEL_REASONS: { value: CancelReason; label: string }[] = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "missing_features", label: "Missing features" },
  { value: "not_using_enough", label: "Not using enough" },
  { value: "switching_competitor", label: "Switching to competitor" },
  { value: "technical_issues", label: "Technical issues" },
  { value: "poor_support", label: "Poor support" },
  { value: "dont_need_anymore", label: "Don't need anymore" },
  { value: "other", label: "Other" },
];

// Mirrors backend model.CancelReasonStrategyMap
export const REASON_TO_STRATEGY: Record<CancelReason, RecoveryStrategy> = {
  too_expensive: "discount",
  missing_features: "unused_feature",
  not_using_enough: "value_recap",
  switching_competitor: "social_proof",
  technical_issues: "pain_point_fix",
  poor_support: "founder_email",
  dont_need_anymore: "pause_option",
  other: "feedback_request",
};

/** Extract the base cancel reason from a raw cancel_reason string (strips ": ..." suffix) */
export function extractBaseReason(raw: string | null | undefined): CancelReason | null {
  if (!raw) return null;
  const base = raw.split(":")[0].trim();
  return base as CancelReason;
}
