"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { LoadingScreen } from "@/components/animations/loading-screen";
import { HeroBackground } from "@/components/marketing/hero-section";

const HeroSection = dynamic(() => import("@/components/marketing/hero-section").then((m) => m.HeroSection));
const LogoCloud = dynamic(() => import("@/components/marketing/logo-cloud").then((m) => m.LogoCloud));
const ScrollTextSection = dynamic(() => import("@/components/marketing/scroll-text-section").then((m) => m.ScrollTextSection));
const MetricsStrip = dynamic(() => import("@/components/marketing/metrics-strip").then((m) => m.MetricsStrip));
const CapabilitiesSection = dynamic(() => import("@/components/marketing/bento-section").then((m) => m.CapabilitiesSection));
const DashboardSection = dynamic(() => import("@/components/marketing/bento-section").then((m) => m.DashboardSection));
const HowItWorksSection = dynamic(() => import("@/components/marketing/bento-section").then((m) => m.HowItWorksSection));
const BentoGridSection = dynamic(() => import("@/components/marketing/bento-section").then((m) => m.BentoGridSection));
const CTASection = dynamic(() => import("@/components/marketing/cta-section").then((m) => m.CTASection));

// Reveal: state-driven fade-up used for post-load staggered entrance.
// Not using whileInView because all sections are in viewport on load.
function Reveal({ children, delay = 0, loaded }: { children: React.ReactNode; delay?: number; loaded: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 1.1, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <LoadingScreen onComplete={() => setLoaded(true)} />

      <div className="relative flex min-h-screen flex-col overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#BFCFF8] via-[#DBEAFE] to-background" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <Navbar />
        </motion.div>

        {/* Hero background (wave + blobs) always visible — matches loading screen exactly */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <HeroBackground />
        </div>

        <Reveal loaded={loaded} delay={0.1}>
          <HeroSection />
        </Reveal>

        <Reveal loaded={loaded} delay={0.25}>
          <LogoCloud />
        </Reveal>

        <Reveal loaded={loaded} delay={0.4}>
          <MetricsStrip />
        </Reveal>

        {/* ScrollTextSection uses GSAP ScrollTrigger pin — must not be inside a translated wrapper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 1.1, delay: 0.5 }}
        >
          <ScrollTextSection />
        </motion.div>

        <Reveal loaded={loaded} delay={0.6}>
          <CapabilitiesSection />
        </Reveal>

        <Reveal loaded={loaded} delay={0.68}>
          <DashboardSection />
        </Reveal>

        <Reveal loaded={loaded} delay={0.75}>
          <HowItWorksSection />
        </Reveal>

        <Reveal loaded={loaded} delay={0.82}>
          <BentoGridSection />
        </Reveal>

        <Reveal loaded={loaded} delay={0.88}>
          <CTASection />
        </Reveal>

        <Reveal loaded={loaded} delay={0.93}>
          <Footer />
        </Reveal>
      </div>
    </>
  );
}
