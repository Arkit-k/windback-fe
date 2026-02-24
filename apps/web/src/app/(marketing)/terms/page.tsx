import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Windback",
  description: "Terms and conditions for using the Windback platform.",
};

export default function TermsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 1, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using Windback (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service. If you do not agree to these terms, do not
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p className="mt-2">
              Windback provides a SaaS platform that detects subscription cancellations via
              payment provider webhooks and generates AI-powered recovery emails to help
              businesses win back churned customers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Account Registration</h2>
            <p className="mt-2">
              You must provide accurate and complete information when creating an account.
              You are responsible for maintaining the security of your account credentials
              and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Acceptable Use</h2>
            <p className="mt-2">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the Service for any unlawful purpose</li>
              <li>Send spam or unsolicited communications through the Service</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Interfere with or disrupt the integrity of the Service</li>
              <li>Reverse engineer or decompile any part of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Payment Terms</h2>
            <p className="mt-2">
              Paid plans are billed monthly or annually in advance. All fees are
              non-refundable except as described in our 30-day satisfaction guarantee.
              We reserve the right to change pricing with 30 days&apos; notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Intellectual Property</h2>
            <p className="mt-2">
              The Service and its original content, features, and functionality are owned
              by Windback and are protected by international copyright, trademark, and
              other intellectual property laws. AI-generated email content is licensed to
              you for use in customer communications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
            <p className="mt-2">
              Windback shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of the Service.
              Our total liability shall not exceed the amount you paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Termination</h2>
            <p className="mt-2">
              We may terminate or suspend your account at any time for violation of these
              terms. You may cancel your account at any time through the dashboard
              settings. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Changes to Terms</h2>
            <p className="mt-2">
              We reserve the right to modify these terms at any time. Material changes
              will be communicated via email at least 30 days in advance. Continued use
              of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <p>
              Questions about these terms? Contact us at{" "}
              <a href="mailto:support@windbackai.com" className="text-[var(--accent)] hover:underline">
                support@windbackai.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
