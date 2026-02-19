"use client";

import { useRef } from "react";
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
    <section className="relative overflow-hidden bg-[var(--accent)] py-20">
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Subtle gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/[0.08]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <motion.p
          className="mb-12 text-center text-sm font-medium uppercase tracking-[0.2em] text-white/40"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by SaaS teams worldwide
        </motion.p>

        <motion.div
          className="grid grid-cols-2 gap-px lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="group relative px-6 py-4 text-center lg:px-8 cursor-default"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              {/* Vertical divider */}
              {i > 0 && (
                <div className="absolute left-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-white/15 lg:block" />
              )}

              {/* Icon */}
              <motion.div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-white/10"
                whileHover={{ scale: 1.15, rotate: 5, backgroundColor: "rgba(255,255,255,0.18)" }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <metric.icon className="h-4.5 w-4.5 text-white/80" />
              </motion.div>

              {/* Number */}
              <motion.div
                className="font-serif text-4xl font-normal text-white sm:text-5xl italic"
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
              <p className="mt-2 text-sm font-medium text-white/90">{metric.label}</p>
              <p className="mt-0.5 text-xs text-white/40 transition-colors duration-200 group-hover:text-white/60">{metric.sublabel}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
