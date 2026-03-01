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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Windback — AI-Powered Subscription Churn Recovery",
    template: "%s — Windback",
  },
  description:
    "Windback detects subscription cancellations and failed payments, then generates personalized AI recovery emails and smart dunning sequences to win customers back. Built for SaaS founders on Stripe, Razorpay, Paddle, and Dodo Payments.",
  keywords: [
    "churn recovery",
    "subscription recovery",
    "dunning management",
    "failed payment recovery",
    "SaaS churn",
    "AI recovery email",
    "Stripe churn recovery",
    "subscription retention",
    "cancel flow",
    "involuntary churn",
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
        "AI-powered subscription churn recovery platform. Detects cancellations and failed payments from Stripe, Razorpay, Paddle, and Dodo Payments, then generates personalized recovery emails and smart dunning sequences.",
      offers: [
        { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "USD", description: "Free plan — up to 50 churn events/month" },
        { "@type": "Offer", name: "Growth", price: "29", priceCurrency: "USD", description: "Up to 500 churn events/month, smart dunning, cancellation flow widget" },
        { "@type": "Offer", name: "Scale", price: "99", priceCurrency: "USD", description: "Unlimited churn events, advanced dunning, audit logs, dedicated support" },
      ],
      featureList: [
        "AI recovery email generation",
        "Smart dunning sequences",
        "Failed payment detection",
        "Cancellation flow widget",
        "Stripe, Razorpay, Paddle, Dodo Payments integration",
        "Recovery analytics and trends",
        "Team management",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How does Windback recover churned customers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Windback detects subscription cancellations and failed payments via webhooks from Stripe, Razorpay, Paddle, and Dodo Payments. It automatically generates personalized AI recovery emails and smart dunning retry sequences to win back customers.",
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
            text: "Windback offers three plans: Starter (free), Growth ($29/month or $24/month annually), and Scale ($99/month or $79/month annually). All paid plans come with a 14-day free trial.",
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
