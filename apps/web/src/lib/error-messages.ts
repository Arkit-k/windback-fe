/**
 * Converts raw backend/API error messages into human-readable text.
 * Catches Go validator errors, common HTTP errors, and technical messages.
 */

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  password: "Password",
  support_email: "Support email",
  business_name: "Business name",
  business_location: "Business location",
  business_type: "Business type",
  referral_source: "Referral source",
  product_type: "Product type",
  subject: "Subject",
  body: "Body",
  amount: "Amount",
  url: "URL",
  webhook_url: "Webhook URL",
  api_key: "API key",
  token: "Token",
  code: "Code",
  slug: "Slug",
  SupportEmail: "Support email",
  Name: "Name",
  Email: "Email",
  Password: "Password",
  ProductType: "Product type",
};

const TAG_MESSAGES: Record<string, string> = {
  required: "is required",
  email: "must be a valid email address",
  min: "is too short",
  max: "is too long",
  url: "must be a valid URL",
  uuid: "is invalid",
  oneof: "has an invalid value",
  alphanum: "must contain only letters and numbers",
  gt: "must be greater than zero",
  gte: "must be zero or more",
};

function humanizeField(raw: string): string {
  return FIELD_LABELS[raw] || raw.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase());
}

function parseValidationError(msg: string): string | null {
  // Go validator: "Key: 'TypeName.FieldName' Error:Field validation for 'FieldName' failed on the 'tag' tag"
  const match = msg.match(/Field validation for '(\w+)' failed on the '(\w+)' tag/);
  if (match) {
    const field = humanizeField(match[1]);
    const tag = TAG_MESSAGES[match[2]] || "is invalid";
    return `${field} ${tag}.`;
  }

  // Multiple validation errors separated by newlines
  if (msg.includes("Field validation for")) {
    const lines = msg.split("\n").filter((l) => l.includes("Field validation for"));
    const parsed = lines.map((l) => parseValidationError(l)).filter(Boolean);
    if (parsed.length > 0) return parsed.join(" ");
  }

  return null;
}

const ERROR_MAP: Array<[RegExp | string, string]> = [
  ["email already registered", "An account with this email already exists."],
  ["email already exists", "An account with this email already exists."],
  ["invalid credentials", "Incorrect email or password."],
  ["invalid email or password", "Incorrect email or password."],
  ["unauthorized", "Please sign in to continue."],
  ["token expired", "Your session has expired. Please sign in again."],
  ["token invalid", "Your session is invalid. Please sign in again."],
  ["not found", "The requested resource was not found."],
  ["forbidden", "You don't have permission to do this."],
  ["rate limit", "Too many requests. Please wait a moment and try again."],
  ["too many requests", "Too many requests. Please wait a moment and try again."],
  ["conflict", "This action conflicts with existing data."],
  ["already exists", "This already exists."],
  ["onboarding already completed", "Onboarding has already been completed."],
  ["invitation expired", "This invitation has expired."],
  ["invitation already accepted", "This invitation has already been accepted."],
  ["project limit", "You've reached the maximum number of projects for your plan."],
  ["event limit", "You've reached the event limit for your plan."],
  ["subscription required", "Please upgrade your plan to use this feature."],
  ["plan required", "Please upgrade your plan to use this feature."],
  [/failed to (create|update|delete|save|send|connect|disconnect)/i, "Something went wrong. Please try again."],
  [/internal server error/i, "Something went wrong on our end. Please try again later."],
  [/database|sql|query|connection refused/i, "A temporary error occurred. Please try again."],
  [/pq:|pgx:|postgres/i, "A temporary error occurred. Please try again."],
];

export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  let msg = "";

  if (error instanceof Error) {
    msg = error.message;
  } else if (typeof error === "string") {
    msg = error;
  } else {
    return fallback;
  }

  if (!msg || msg === "Request failed") return fallback;

  // Check for Go validation errors first
  const validationMsg = parseValidationError(msg);
  if (validationMsg) return validationMsg;

  // Check known error patterns
  const lower = msg.toLowerCase();
  for (const [pattern, friendly] of ERROR_MAP) {
    if (typeof pattern === "string") {
      if (lower.includes(pattern)) return friendly;
    } else {
      if (pattern.test(msg)) return friendly;
    }
  }

  // If the message looks technical (contains stack traces, code refs, etc.), use fallback
  if (
    msg.includes("::") ||
    msg.includes("at ") ||
    msg.includes("goroutine") ||
    msg.includes("panic") ||
    msg.length > 200
  ) {
    return fallback;
  }

  // If the message looks reasonable (short, no code), return it as-is
  return msg;
}
