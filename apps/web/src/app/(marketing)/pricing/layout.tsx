import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Windback",
  description:
    "Simple, transparent pricing for AI-powered churn recovery. Start free, scale as you grow.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
