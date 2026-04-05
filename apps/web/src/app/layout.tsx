import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@windback/ui";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: "Windback — AI-Powered Customer Retention & Revenue Recovery Platform",
    template: "%s — Windback",
  },
  description:
    "The complete customer retention platform for SaaS. AI-powered churn recovery, smart dunning, health scores, NPS surveys, LTV tracking, onboarding analytics, campaign ROI, and more. Built for founders on Stripe, Razorpay, Paddle, and Dodo Payments.",
  keywords: [
    "churn recovery",
    "customer retention platform",
    "subscription recovery",
    "dunning management",
    "failed payment recovery",
    "SaaS churn",
    "AI recovery email",
    "customer health score",
    "NPS survey",
    "customer success",
    "LTV tracking",
    "onboarding analytics",
    "revenue recovery",
    "Stripe churn recovery",
    "subscription retention",
  ],
  authors: [{ name: "Windback", url: SITE_URL }],
  creator: "Windback",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Windback",
    title: "Windback — AI-Powered Subscription Churn Recovery",
    description:
      "Detect cancellations and failed payments. Win back customers with AI-generated recovery emails and smart dunning sequences.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Windback — AI-Powered Churn Recovery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Windback — AI-Powered Subscription Churn Recovery",
    description:
      "Detect cancellations and failed payments. Win back customers with AI-generated recovery emails.",
    images: ["/og.png"],
    creator: "@windbackai",
    site: "@windbackai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    "msvalidate.01": "",
  },
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Windback";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: APP_NAME,
      url: SITE_URL,
      contactPoint: {
        "@type": "ContactPoint",
        email: SUPPORT_EMAIL,
        contactType: "customer support",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: APP_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "The complete AI-powered customer retention and revenue recovery platform for SaaS. Churn recovery, smart dunning, health scores, NPS surveys, LTV tracking, onboarding analytics, and more.",
      offers: [
        { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "USD", description: "Free plan — up to 50 churn events/month, 1 project" },
        { "@type": "Offer", name: "Growth", price: "39", priceCurrency: "USD", description: "500 events/month, 5 projects, health scores, NPS surveys" },
        { "@type": "Offer", name: "Enterprise", price: "89", priceCurrency: "USD", description: "2,000 events/month, 15 projects, LTV tracking, CSM, alerts, campaigns" },
        { "@type": "Offer", name: "Scale", price: "129", priceCurrency: "USD", description: "Unlimited events & projects, integrations, status page, A/B testing" },
      ],
      featureList: [
        "AI recovery email generation",
        "Smart dunning sequences",
        "Failed payment detection",
        "Customer health scores",
        "NPS/CSAT surveys",
        "LTV tracking & forecasting",
        "Customer success workflows",
        "Onboarding tracking",
        "Campaign tracking & ROI",
        "Cancellation flow widget",
        "Stripe, Razorpay, Paddle, Dodo Payments integration",
        "Recovery analytics and trends",
        "Custom dashboards",
        "Team management",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What does Windback do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Windback is a complete customer retention platform for SaaS. It detects cancellations and failed payments, generates AI recovery emails, runs smart dunning sequences, tracks customer health scores, conducts NPS surveys, monitors LTV, tracks onboarding progress, and provides campaign ROI analytics — all to help you retain more customers and recover more revenue.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between churn recovery and dunning?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Churn recovery handles voluntary cancellations — when a customer actively cancels their subscription. Dunning handles involuntary churn — failed payments due to expired cards or insufficient funds. Windback handles both automatically.",
          },
        },
        {
          "@type": "Question",
          name: "Which payment providers does Windback support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Windback supports Stripe, Razorpay, Paddle, and Dodo Payments out of the box. You can also connect any payment provider via a custom webhook endpoint.",
          },
        },
        {
          "@type": "Question",
          name: "Does Windback have a free plan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Windback's Starter plan is free and includes up to 50 churn events per month, AI recovery email generation, and failed payment detection for 1 project.",
          },
        },
        {
          "@type": "Question",
          name: "How much does Windback cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Windback offers four plans: Starter (free), Growth ($39/month), Enterprise ($89/month), and Scale ($129/month). Annual billing saves ~15%. All paid plans come with a 14-day free trial.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" as="style" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" as="style" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GG0YF57TMY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GG0YF57TMY');
          `}
        </Script>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
