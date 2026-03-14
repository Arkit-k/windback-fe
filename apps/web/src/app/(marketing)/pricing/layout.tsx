import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for AI-powered churn recovery. Free plan available. Growth $39/mo, Enterprise $89/mo, Scale $129/mo. No hidden fees.",
  alternates: { canonical: "https://windback.io/pricing" },
  openGraph: {
    title: "Windback Pricing — Start Free",
    description: "Free plan + paid plans from $39/mo. 14-day free trial on all paid plans. No credit card required.",
    url: "https://windback.io/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
