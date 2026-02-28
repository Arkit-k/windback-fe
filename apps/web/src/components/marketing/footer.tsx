"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const footerLinks = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/docs", label: "Documentation" },
      { href: "/docs/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { href: "/docs/integrations/stripe", label: "Stripe" },
      { href: "/docs/integrations/razorpay", label: "Razorpay" },
      { href: "/docs/integrations/paddle", label: "Paddle" },
      { href: "/docs/integrations/custom-webhook", label: "Custom Webhook" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "API Reference" },
      { href: "/docs/sdks", label: "SDKs" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "https://github.com/windback-dev", label: "GitHub", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "mailto:support@windbackai.com", label: "Support", external: true },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

function SocialIcon({ d, href, label }: { d: string; href: string; label: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d={d} />
      </svg>
    </motion.a>
  );
}

function WindbackLogoMark() {
  return (
    <span className="font-display text-xl font-semibold tracking-tight text-[var(--accent)] select-none">
      Windback<span className="text-[var(--accent)]">.</span>
    </span>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative border-t border-border bg-card overflow-hidden">
      {/* Centered half-circular gradient glow at bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-[600px] w-[900px]"
        style={{ background: "radial-gradient(ellipse at center, rgba(37,99,235,0.5) 0%, rgba(96,165,250,0.28) 30%, rgba(191,219,254,0.12) 55%, transparent 75%)" }}
      />
      {/* Subtle gradient accent at top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── Top section: Brand + Newsletter ── */}
        <div className="flex flex-col gap-8 border-b border-border/60 py-10 lg:flex-row lg:items-end lg:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <motion.div
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link href="/" className="inline-flex items-center">
                <WindbackLogoMark />
              </Link>
            </motion.div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Stop losing revenue to churn. Windback detects cancellations
              in real-time and uses AI to win customers back — automatically.
            </p>

          </div>

          {/* Newsletter */}
          <div className="max-w-sm lg:text-right">
            <p className="text-sm font-semibold text-foreground">
              Stay in the loop
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Get product updates and churn recovery tips. No spam.
            </p>
            <AnimatePresence mode="wait">
              {subscribed ? (
                <motion.div
                  key="subscribed"
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-green-50 px-4 py-2.5 text-[13px] font-medium text-green-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <motion.svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                  You&apos;re subscribed!
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubscribe}
                  className="mt-3 flex gap-2"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:shadow-[0_0_12px_hsl(from_var(--accent)_h_s_l_/_0.1)]"
                  />
                  <motion.button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent)]/90"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Subscribe
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Link columns ── */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {footerLinks.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIdx * 0.08, duration: 0.4 }}
            >
              <h3 className="text-[13px] font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <motion.a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <span className="mr-0 opacity-0 transition-all group-hover:mr-1.5 group-hover:opacity-100">
                          <ArrowRight className="h-3 w-3 text-[var(--accent)]" />
                        </span>
                        {link.label}
                      </motion.a>
                    ) : (
                      <motion.div
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Link
                          href={link.href}
                          className="group inline-flex items-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="mr-0 opacity-0 transition-all group-hover:mr-1.5 group-hover:opacity-100">
                            <ArrowRight className="h-3 w-3 text-[var(--accent)]" />
                          </span>
                          {link.label}
                        </Link>
                      </motion.div>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Windback. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-1">
            <SocialIcon
              label="Twitter / X"
              href="https://x.com/windbackdev"
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
            <SocialIcon
              label="GitHub"
              href="https://github.com/windback-dev"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
            <SocialIcon
              label="Discord"
              href="https://discord.gg/windback"
              d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
            />
            <SocialIcon
              label="LinkedIn"
              href="https://linkedin.com/company/windback-dev"
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
