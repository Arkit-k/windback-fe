"use client";

import Link from "next/link";
import { Button } from "@windback/ui";
import { ArrowRight } from "lucide-react";
import {
  FadeUp,
  ScrollReveal,
  MagneticHover,
  motion,
} from "@/components/animations/motion";
import { RotatingWords } from "@/components/animations/rotating-words";
import { AnimatedBadge } from "@/components/animations/animated-badge";
import { FloatingParticles } from "@/components/animations/floating-particles";
import { HeroWave } from "@/components/marketing/hero-wave";

/** Wave + gradient blobs — always rendered, even during loading animation. */
export function HeroBackground() {
  return (
    <>
      {/* Ribbon visual */}
      <div
        className="pointer-events-none absolute right-0 top-0 z-0 hidden h-[135vh] w-[45%] lg:block"
        style={{ maskImage: "linear-gradient(to right, transparent, white 18%), linear-gradient(to bottom, white 65%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent, white 18%), linear-gradient(to bottom, white 65%, transparent 100%)", maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
      >
        <HeroWave />
      </div>
      {/* Peach glow — top left */}
      <motion.div
        className="pointer-events-none absolute -left-20 -top-10 h-[520px] w-[520px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(251,170,138,0.65) 0%, rgba(251,170,138,0.25) 50%, transparent 70%)" }}
        animate={{ x: [0, 80, 30, 0], y: [0, 60, -20, 0], scale: [1, 1.15, 0.92, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Blue glow — top right */}
      <motion.div
        className="pointer-events-none absolute -right-20 -top-10 h-[520px] w-[520px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.65) 0%, rgba(37,99,235,0.25) 50%, transparent 70%)" }}
        animate={{ x: [0, -80, -20, 0], y: [0, 70, 10, 0], scale: [1, 0.88, 1.18, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

export function HeroSection() {
  return (
    <section className="relative">
        <FloatingParticles count={24} />

        <div className="mx-auto max-w-6xl px-4 pb-8 pt-40 sm:px-6 sm:pt-48">
          <div className="relative z-10">
            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">

              <FadeUp delay={0.2}>
                <h1 className="font-serif text-[2.75rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
                  Turn Cancellations{" "}
                  <br className="hidden sm:block" />
                  into{" "}
                  <span className="relative inline-block italic">
                    <RotatingWords
                      words={["Revenue", "Growth", "Customers"]}
                      interval={3000}
                      className="text-[var(--accent)]"
                    />
                    <motion.span
                      className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
                    />
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.35}>
                <p className="mt-6 max-w-lg text-[1.075rem] leading-relaxed text-muted-foreground lg:max-w-none">
                  Whatever your payment stack, Windback detects cancellations and failed payments,
                  then generates personalized AI recovery emails and smart dunning sequences to bring customers back.
                </p>
              </FadeUp>

              <FadeUp delay={0.5}>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start lg:items-start">
                  <MagneticHover strength={0.12}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                      <Button size="lg" asChild>
                        <Link href="/register">
                          Start Free
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  </MagneticHover>
                  <MagneticHover strength={0.12}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                      <Button variant="outline" size="lg" asChild>
                        <Link href="/docs">Read the Docs</Link>
                      </Button>
                    </motion.div>
                  </MagneticHover>
                </div>
              </FadeUp>
            </div>
          </div>

        </div>
    </section>
  );
}
