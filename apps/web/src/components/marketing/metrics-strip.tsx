"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function AnimatedNumber({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const counter = useRef({ val: 0 });

  useGSAP(() => {
    if (!ref.current) return;
    gsap.to(counter.current, {
      val: value,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      onUpdate: () => {
        if (ref.current) {
          let formatted: string;
          if (value >= 1000000) {
            formatted = `${(counter.current.val / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            formatted = `${(counter.current.val / 1000).toFixed(0)}k`;
          } else {
            formatted = Math.round(counter.current.val).toString();
          }
          ref.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });
  }, [value]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

const metrics = [
  {
    category: "Platform",
    value: 1,
    prefix: "#",
    suffix: "",
    label: "Churn Recovery",
    highlight: true,
  },
  {
    category: "Scale",
    value: 50000,
    prefix: "",
    suffix: "+",
    label: "Events processed",
  },
  {
    category: "Impact",
    value: 12000,
    prefix: "",
    suffix: "+",
    label: "Customers recovered",
  },
  {
    category: "Revenue",
    value: 2400,
    prefix: "$",
    suffix: "",
    label: "Avg. MRR saved",
  },
];

export function MetricsStrip() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20">

      {/* Small label above image */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-3">
        <motion.p
          className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by SaaS teams worldwide
        </motion.p>
      </div>

      {/* Full-width image with centered logo overlay */}
      <motion.div
        className="relative w-full overflow-hidden h-[340px]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Image
          src="/stats.png"
          alt="Payback platform"
          width={1920}
          height={600}
          className="w-full h-full object-cover object-center"
          priority={false}
        />
        {/* Centered logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="font-display text-5xl font-semibold tracking-tight text-[var(--accent)] select-none">
            Windback<span className="text-[var(--accent)]">.</span>
          </span>
        </motion.div>
      </motion.div>

      {/* Below image — heading (left) + description (right) */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          {/* Left — big heading */}
          <motion.h2
            className="font-serif text-4xl leading-[1.1] tracking-tight text-foreground italic sm:text-5xl lg:text-[3.5rem] lg:max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Built to<br />recover revenue.
          </motion.h2>

          {/* Right — description */}
          <motion.p
            className="text-base text-muted-foreground leading-relaxed max-w-md lg:pt-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Windback detects cancellations and failed payments across your entire payment stack,
            then automatically generates personalized AI recovery emails that bring customers back.
          </motion.p>
        </div>

        {/* Stats row — label top, big number, sublabel */}
        <motion.div
          className="mt-12 grid grid-cols-2 gap-y-10 border-t border-border pt-10 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="group relative cursor-default pl-0 pr-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Vertical divider */}
              {i > 0 && (
                <div className="absolute -left-0 top-0 hidden h-full w-px bg-border lg:block" />
              )}

              {/* Category label */}
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                {metric.category}
              </p>

              {/* Big number */}
              <div className="font-serif text-5xl font-normal text-foreground italic sm:text-6xl">
                {metric.highlight ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    {metric.prefix}{metric.value}
                  </motion.span>
                ) : (
                  <AnimatedNumber value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                )}
              </div>

              {/* Label */}
              <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
