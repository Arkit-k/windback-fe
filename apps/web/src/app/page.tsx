import dynamic from "next/dynamic";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

// Client islands — lazy-loaded, no SSR blocking
const HeroSection = dynamic(
  () => import("@/components/marketing/hero-section").then((m) => m.HeroSection),
);
const LogoCloud = dynamic(
  () => import("@/components/marketing/logo-cloud").then((m) => m.LogoCloud),
);
const ScrollTextSection = dynamic(
  () => import("@/components/marketing/scroll-text-section").then((m) => m.ScrollTextSection),
);
const MetricsStrip = dynamic(
  () => import("@/components/marketing/metrics-strip").then((m) => m.MetricsStrip),
);
const CapabilitiesSection = dynamic(
  () => import("@/components/marketing/bento-section").then((m) => m.CapabilitiesSection),
);
const DashboardSection = dynamic(
  () => import("@/components/marketing/bento-section").then((m) => m.DashboardSection),
);
const HowItWorksSection = dynamic(
  () => import("@/components/marketing/bento-section").then((m) => m.HowItWorksSection),
);
const BentoGridSection = dynamic(
  () => import("@/components/marketing/bento-section").then((m) => m.BentoGridSection),
);
const CTASection = dynamic(
  () => import("@/components/marketing/cta-section").then((m) => m.CTASection),
);

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Very light blue gradient across the entire page */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#C7D9F7] via-[#DBEAFE] to-background" />

      <Navbar />

      <HeroSection />
      <LogoCloud />
      <ScrollTextSection />
      <MetricsStrip />
      <CapabilitiesSection />
      <DashboardSection />
      <HowItWorksSection />
      <BentoGridSection />
      <CTASection />

      <Footer />
    </div>
  );
}
