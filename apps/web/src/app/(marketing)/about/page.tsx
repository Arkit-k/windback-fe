import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Windback",
  description: "Learn about Windback's mission to help SaaS companies recover churned revenue with AI.",
};

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          About Windback
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          We believe no SaaS company should lose customers without a fight.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Our Mission
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Windback exists to help subscription businesses recover lost revenue
              automatically. When a customer cancels, most teams either do nothing or
              send a generic &quot;we&apos;re sorry to see you go&quot; email.
              We think there&apos;s a better way.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Using AI, Windback analyzes every cancellation event — the customer&apos;s
              history, plan details, and cancellation reason — then generates
              personalized winback emails designed to bring them back.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              What We Do
            </h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>Detect subscription cancellations in real-time via webhooks from Stripe, Razorpay, Paddle, and custom providers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>Generate 9 AI-powered email variants tailored to each churned customer using GPT-4o.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>Provide a clean dashboard to review, send, and track recovery outcomes.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Our Values
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {[
                { title: "Developer-First", desc: "RESTful APIs, typed SDKs, and comprehensive docs so you can integrate in minutes." },
                { title: "Privacy by Default", desc: "We only process the data needed for recovery. No selling, no profiling, no surprises." },
                { title: "Transparent Pricing", desc: "Simple tiers, no hidden fees, and a generous free plan to get started." },
                { title: "Results-Driven", desc: "We measure success by one metric: how much revenue we help you recover." },
              ].map((value) => (
                <div key={value.title} className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{value.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Founder */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Founder
            </h2>
            <div className="mt-4 rounded-lg border border-border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-blue-400 text-2xl font-bold text-white">
                  AK
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Arkit Karmokar
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Developer &amp; Entrepreneur
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href="https://linkedin.com/in/arkit-karmokar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-foreground"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                    <a
                      href="https://x.com/arkitkarmokar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-foreground"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X / Twitter
                    </a>
                    <a
                      href="mailto:arkit@windbackai.com"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-foreground"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Get in Touch
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Have questions or want to partner with us? Reach out at{" "}
              <a href="mailto:support@windbackai.com" className="text-[var(--accent)] hover:underline">
                support@windbackai.com
              </a>{" "}
              or{" "}
              <Link href="/docs" className="text-[var(--accent)] hover:underline">
                explore our docs
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
