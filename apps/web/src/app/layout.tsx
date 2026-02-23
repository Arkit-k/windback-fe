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

export const metadata: Metadata = {
  title: "Windback — AI-Powered Churn Recovery",
  description:
    "Detect subscription cancellations and win back customers with AI-generated recovery emails.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
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
