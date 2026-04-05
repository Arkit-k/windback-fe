"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TEXT =
  "Every cancelled subscription is a conversation you never had. Windback listens to the signals your payment stack sends, understands why customers leave, and crafts personalized recovery emails that actually convert. Stop losing revenue to silent churn — let AI handle the winback so your team can focus on building what matters.";

const words = TEXT.split(" ");

/** Pac-Man SVG that chomps */
function PacMan({ x, y, size = 36 }: { x: number; y: number; size?: number }) {
  return (
    <svg
      className="pointer-events-none fixed z-50"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        filter: "drop-shadow(0 0 8px rgba(251,170,138,0.6))",
        transition: "left 0.08s linear, top 0.08s linear",
      }}
      viewBox="0 0 40 40"
    >
      <circle cx="20" cy="20" r="18" fill="#FBAA8A">
        <animate attributeName="r" values="18;17;18" dur="0.3s" repeatCount="indefinite" />
      </circle>
      <path fill="var(--background, #F6F8FF)">
        <animate
          attributeName="d"
          values="M20,20 L38,12 L38,28 Z;M20,20 L38,18 L38,22 Z;M20,20 L38,12 L38,28 Z"
          dur="0.25s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx="22" cy="12" r="2.5" fill="#0F1733" />
    </svg>
  );
}

export function ScrollTextSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [pacPos, setPacPos] = useState({ x: 0, y: 0 });
  const [pacVisible, setPacVisible] = useState(false);
  const progressRef = useRef(0);

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
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
          onEnter: () => setPacVisible(true),
          onLeave: () => setPacVisible(false),
          onEnterBack: () => setPacVisible(true),
          onLeaveBack: () => setPacVisible(false),
        },
      });

      tl.to(dimSpans, { opacity: 0, stagger: 0.05, ease: "none" }, 0);
      tl.to(brightSpans, { opacity: 1, stagger: 0.05, ease: "none" }, 0);
    },
    { scope: containerRef },
  );

  // Track pac-man position based on scroll progress
  useEffect(() => {
    let raf: number;
    function updatePac() {
      const textEl = textRef.current;
      if (!textEl || !pacVisible) {
        raf = requestAnimationFrame(updatePac);
        return;
      }

      const progress = progressRef.current;
      const brightSpans = textEl.querySelectorAll<HTMLSpanElement>("[data-bright]");
      const totalWords = brightSpans.length;
      const currentIdx = Math.min(Math.floor(progress * totalWords), totalWords - 1);
      const currentSpan = brightSpans[currentIdx];

      if (currentSpan) {
        const rect = currentSpan.getBoundingClientRect();
        setPacPos({
          x: rect.right + 8,
          y: rect.top + rect.height / 2,
        });
      }

      raf = requestAnimationFrame(updatePac);
    }
    raf = requestAnimationFrame(updatePac);
    return () => cancelAnimationFrame(raf);
  }, [pacVisible]);

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex min-h-screen items-center bg-background px-6 sm:px-10 lg:px-16"
    >
      {pacVisible && <PacMan x={pacPos.x} y={pacPos.y} size={40} />}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[280px_1fr]">
        {/* Left: sticky label */}
        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Why Windback
          </p>
          <h2
            className="mt-3 text-3xl font-bold leading-[1.1] text-foreground"
            style={{ fontFamily: "'Silkscreen', cursive" }}
          >
            Built to<br />
            recover.
          </h2>
          <div className="mt-5 h-px w-12 bg-border" />
        </div>

        {/* Right: word-by-word reveal text — pixel font */}
        <p
          ref={textRef}
          className="text-center text-xl leading-relaxed font-bold sm:text-2xl md:text-[1.75rem] md:leading-[1.6] lg:text-left lg:text-[2rem] lg:leading-[1.6]"
          style={{ fontFamily: "'Silkscreen', cursive" }}
        >
          {words.map((word, i) => (
            <span key={i} className="relative mr-[0.35em] inline-block">
              <span data-dim className="text-gray-300">{word}</span>
              <span
                data-bright
                className="absolute inset-0 text-[var(--accent)]"
                style={{ opacity: 0 }}
              >{word}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
