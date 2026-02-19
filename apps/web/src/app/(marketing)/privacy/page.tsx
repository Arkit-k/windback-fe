import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Windback",
  description: "Learn how Windback collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 1, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p className="mt-2">
              We collect information you provide directly, such as your name, email
              address, and company details when you create an account. We also receive
              webhook event data from your connected payment providers, which may include
              subscription IDs, plan details, and cancellation reasons.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p className="mt-2">We use the information we collect to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Provide, maintain, and improve our services</li>
              <li>Generate AI-powered recovery emails for your churned customers</li>
              <li>Send you product updates and support communications</li>
              <li>Monitor and analyze usage patterns to improve the platform</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
            <p className="mt-2">
              We do not sell your personal information. We share data only with service
              providers that help us operate the platform (e.g., hosting, email delivery,
              AI processing) and only to the extent necessary to provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Data Retention</h2>
            <p className="mt-2">
              We retain your account data for as long as your account is active. Webhook
              event data is retained for 12 months from the date of receipt. You can
              request deletion of your data at any time by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Security</h2>
            <p className="mt-2">
              We implement industry-standard security measures including encryption in
              transit (TLS) and at rest, access controls, and regular security audits.
              Webhook payloads are verified using provider-specific signature validation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
            <p className="mt-2">
              You have the right to access, correct, or delete your personal data. You
              may also request a copy of your data in a portable format. To exercise any
              of these rights, contact us at{" "}
              <a href="mailto:support@windback.dev" className="text-[var(--accent)] hover:underline">
                support@windback.dev
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Cookies</h2>
            <p className="mt-2">
              We use essential cookies to maintain your session and preferences. We do
              not use third-party advertising cookies. Analytics cookies are only used
              with your consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this privacy policy from time to time. We will notify you of
              any material changes via email or an in-app notification.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <p>
              Questions about this policy? Contact us at{" "}
              <a href="mailto:support@windback.dev" className="text-[var(--accent)] hover:underline">
                support@windback.dev
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
