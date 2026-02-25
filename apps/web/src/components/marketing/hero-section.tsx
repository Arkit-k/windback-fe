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

export function HeroSection() {
  return (
    <>
      {/* Ribbon visual */}
      <div className="pointer-events-none absolute right-0 top-0 z-0 hidden h-[140vh] w-[55%] lg:block">
        <HeroWave />
      </div>

      <section className="relative overflow-hidden">
        <FloatingParticles count={24} />
        <div className="pointer-events-none absolute left-1/4 top-16 -z-[1] h-[480px] w-[640px] -translate-x-1/2 opacity-[0.07] blur-[80px]" style={{ background: "radial-gradient(ellipse, var(--accent), transparent 70%)" }} />

        <motion.div
          className="pointer-events-none absolute -left-20 top-0 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(from var(--accent) h s l / 0.35), transparent 70%)" }}
          animate={{ x: [0, 100, 40, 0], y: [0, 60, -30, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -right-20 top-12 h-[420px] w-[420px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(129, 140, 248, 0.3), transparent 70%)" }}
          animate={{ x: [0, -80, -20, 0], y: [0, 80, 10, 0], scale: [1, 0.85, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute left-1/3 -top-10 h-[350px] w-[350px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(96, 165, 250, 0.25), transparent 70%)" }}
          animate={{ x: [0, 60, -40, 0], y: [0, -40, 50, 0], scale: [1, 1.25, 0.8, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 sm:pt-32">
          <div className="relative z-10">
            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
              <FadeUp delay={0.1}>
                <AnimatedBadge className="mb-6 mx-auto lg:mx-0">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                  </span>
                  <span className="bg-gradient-to-r from-[var(--accent)] via-blue-500 to-violet-500 bg-clip-text text-transparent">
                    AI-Powered Churn Recovery
                  </span>
                </AnimatedBadge>
              </FadeUp>

              <FadeUp delay={0.2}>
                <h1 className="font-serif text-[2.75rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
                  Turn Cancellations{" "}
                  <br className="hidden sm:block" />
                  into{" "}
                  <span className="relative inline-block italic">
                    <RotatingWords
                      words={["Revenue", "Growth", "Customers"]}
                      interval={3000}
                      className="bg-gradient-to-r from-[var(--accent)] to-blue-400 bg-clip-text text-transparent"
                    />
                    <motion.span
                      className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-[var(--accent)] to-blue-400"
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
                      <Button size="lg" asChild className="relative overflow-hidden shadow-[0_0_20px_hsl(from_var(--accent)_h_s_l_/_0.25)] hover:shadow-[0_0_32px_hsl(from_var(--accent)_h_s_l_/_0.4)] transition-shadow duration-300">
                        <Link href="/register">
                          <motion.span
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            animate={{ x: ["-200%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
                          />
                          Start Free
                          <motion.span className="inline-block ml-1" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}>
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
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
    </>
  );
}
