"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@windback/ui";
import { ArrowRight } from "lucide-react";
import { ScrollReveal, MagneticHover, motion } from "@/components/animations/motion";
import { useAuth } from "@/hooks/use-auth";

export function CTASection() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? "/dashboard/projects" : "/register";

  return (
    <section className="relative overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem] py-24 sm:py-28">
      {/* Background image */}
      <Image
        src="/newcta.png"
        alt=""
        fill
        className="object-cover object-[center_70%]"
        sizes="100vw"
        priority={false}
      />
      {/* Minimal dark overlay just for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <h2 className="font-serif text-4xl leading-[1.1] text-white italic sm:text-5xl lg:text-6xl">
              No Missed Leads.<br />
              No Lost Revenue.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div>
              <h3 className="text-2xl font-semibold text-white">
                Recover Smarter, Automatically
              </h3>
              <p className="mt-3 text-white/70">
                Join SaaS teams using Windback to recover voluntary cancellations and failed payments —
                with AI-powered emails, smart dunning, and real-time analytics.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MagneticHover strength={0.12}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                    <Button size="lg" variant="secondary" asChild className="relative bg-white text-[var(--accent)] hover:bg-white/90 shadow-lg shadow-black/10 overflow-hidden">
                      <Link href={ctaHref}>
                        <motion.span
                          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                          animate={{ x: ["-200%", "200%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                        />
                        Get Started Free
                        <motion.span className="inline-block" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}>
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>
                    </Button>
                  </motion.div>
                </MagneticHover>
                <MagneticHover strength={0.12}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                    <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                      <Link href="/docs">Documentation</Link>
                    </Button>
                  </motion.div>
                </MagneticHover>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["bg-blue-400", "bg-blue-300", "bg-[#FBAA8A]", "bg-sky-400", "bg-blue-200"].map((color, i) => (
                    <motion.div
                      key={i}
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${color} border-2 border-[var(--accent)] text-[9px] font-bold text-white`}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 400, damping: 15 }}
                      whileHover={{ y: -4, scale: 1.15, zIndex: 10 }}
                    >
                      {["S", "M", "A", "J", "E"][i]}
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-white/60">
                  <span>Trusted by <span className="font-semibold text-white">500+</span> SaaS teams</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.svg
                        key={i}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3 w-3 text-amber-400"
                        initial={{ opacity: 0, scale: 0, rotate: -30 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 400, damping: 12 }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                    <span className="ml-1 text-[12px]">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
