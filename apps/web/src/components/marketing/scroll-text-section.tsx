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

      const dimSpans = container.querySelectorAll<HTMLSpanElement>("[data-dim]");
      const brightSpans = container.querySelectorAll<HTMLSpanElement>("[data-bright]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=1500",
          pin: true,
          scrub: 1,
          pinSpacing: true,
        },
      });

      tl.to(dimSpans, { opacity: 0, stagger: 0.05, ease: "none" }, 0);
      tl.to(brightSpans, { opacity: 1, stagger: 0.05, ease: "none" }, 0);
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-screen items-center bg-background px-6 sm:px-10 lg:px-16"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[280px_1fr]">
        {/* Left: sticky label */}
        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Why Windback
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-[1.1] text-foreground italic">
            Built to<br />
            recover.
          </h2>
          <div className="mt-5 h-px w-12 bg-border" />
        </div>

        {/* Right: word-by-word reveal text */}
        <p className="text-center font-serif text-2xl leading-snug italic sm:text-3xl md:text-4xl lg:text-left lg:text-[2.75rem] lg:leading-[1.3]">
          {words.map((word, i) => (
            <span key={i} className="relative mr-[0.3em] inline-block">
              {/* Gray base — visible by default, fades out on scroll */}
              <span data-dim className="text-gray-300">{word}</span>
              {/* Gradient — hidden by default, fades in on scroll */}
              <span
                data-bright
                className="absolute inset-0"
                style={{
                  opacity: 0,
                  background: "linear-gradient(to right, #2563EB, #FBAA8A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >{word}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
