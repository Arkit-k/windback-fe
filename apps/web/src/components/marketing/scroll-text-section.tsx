"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TEXT =
  "Every cancelled subscription is a conversation you never had. Windback listens to the signals your payment stack sends, understands why customers leave, and crafts personalized recovery emails that actually convert. Stop losing revenue to silent churn — let AI handle the winback so your team can focus on building what matters.";

const words = TEXT.split(" ");

export function ScrollTextSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const spans = container.querySelectorAll<HTMLSpanElement>("[data-word]");
      if (spans.length === 0) return;

      gsap.fromTo(
        spans,
        { color: "rgba(255,255,255,0.15)" },
        {
          color: "rgba(255,255,255,1)",
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=1500",
            pin: true,
            scrub: 1,
            pinSpacing: true,
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-screen items-center bg-[var(--accent)] px-6 sm:px-10 lg:px-16"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[280px_1fr]">
        {/* Left: sticky label */}
        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Why Windback
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-[1.1] text-white italic">
            Built to<br />
            recover.
          </h2>
          <div className="mt-5 h-px w-12 bg-white/20" />
        </div>

        {/* Right: word-by-word reveal text */}
        <p className="text-center font-serif text-2xl leading-snug italic text-white sm:text-3xl md:text-4xl lg:text-left lg:text-[2.75rem] lg:leading-[1.3]">
          {words.map((word, i) => (
            <span
              key={i}
              data-word
              className="mr-[0.3em] inline-block"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
