"use client";

/**
 * Windback Wordmark Logo
 *
 * "Wind" in bold accent blue, "back" in regular foreground,
 * with a return-arrow icon integrated into the mark —
 * communicating "winding back lost revenue".
 */
export function WindbackLogo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizes = {
    sm: { text: "text-lg", icon: 16, gap: "gap-1.5", dot: "h-1 w-1" },
    default: { text: "text-xl", icon: 18, gap: "gap-2", dot: "h-1.5 w-1.5" },
    lg: { text: "text-2xl", icon: 22, gap: "gap-2.5", dot: "h-2 w-2" },
  };

  const s = sizes[size];

  return (
    <span className={`inline-flex items-center ${s.gap} select-none`}>
      {/* Icon mark — return arrow in a rounded square */}
      <span
        className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] shrink-0"
        style={{
          width: size === "sm" ? 24 : size === "lg" ? 34 : 28,
          height: size === "sm" ? 24 : size === "lg" ? 34 : 28,
        }}
      >
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 14 4 9 9 4" />
          <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
        </svg>
      </span>

      {/* Wordmark */}
      <span className={`${s.text} font-semibold tracking-tight leading-none`}>
        <span className="text-[var(--accent)]" style={{ fontFamily: "var(--font-sans)" }}>
          Wind
        </span>
        <span className="text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
          back
        </span>
      </span>
    </span>
  );
}

/**
 * Compact logo mark only (no text) — for tight spaces like favicons, mobile headers.
 */
export function WindbackMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.64}
        height={size * 0.64}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 14 4 9 9 4" />
        <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
      </svg>
    </span>
  );
}
