"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp, Users, DollarSign, Award } from "lucide-react";

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
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
        once: true,
      },
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
    value: 1,
    prefix: "#",
    suffix: "",
    label: "Churn Recovery Platform",
    sublabel: "Purpose-built for SaaS",
    highlight: true,
    icon: Award,
  },
  {
    value: 50000,
    prefix: "",
    suffix: "+",
    label: "Events processed",
    sublabel: "Across all customers",
    icon: TrendingUp,
  },
  {
    value: 12000,
    prefix: "",
    suffix: "+",
    label: "Customers recovered",
    sublabel: "And counting",
    icon: Users,
  },
  {
    value: 2400,
    prefix: "$",
    suffix: "",
    label: "Avg. MRR saved",
    sublabel: "Per recovered customer",
    icon: DollarSign,
  },
];

export function MetricsStrip() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-3">

        {/* Row 1 — heading */}
        <motion.p
          className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by SaaS teams worldwide
        </motion.p>

      </div>

      {/* Row 2 — edge-to-edge image */}
      <motion.div
        className="w-full overflow-hidden h-[340px]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Image
          src="/stats.jfif"
          alt="Payback platform"
          width={1920}
          height={600}
          className="w-full h-full object-cover object-center"
          priority={false}
        />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Row 3 — stats, right-aligned */}
        <motion.div
          className="mt-10 flex flex-wrap justify-end gap-x-10 gap-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="group relative cursor-default text-right"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              {/* Vertical divider — shown between items */}
              {i > 0 && (
                <div className="absolute -left-5 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-border sm:block" />
              )}

              {/* Number */}
              <motion.div
                className="font-serif text-4xl font-normal text-[var(--accent)] sm:text-5xl italic"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {metric.highlight ? (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {metric.prefix}{metric.value}
                  </motion.span>
                ) : (
                  <AnimatedNumber value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                )}
              </motion.div>

              {/* Label */}
              <p className="mt-1 text-sm font-medium text-foreground">{metric.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground">{metric.sublabel}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
