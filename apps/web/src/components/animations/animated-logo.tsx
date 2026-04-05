"use client";

import { useEffect, useState, useRef } from "react";

const LETTERS = "Windback.".split("");
const SERIF = "var(--font-serif, 'Instrument Serif'), serif";
const PIXEL = "'Silkscreen', cursive";

// Cycle: serif → pixel (sweep right) → pause → serif (sweep right) → pause → repeat
const SWEEP_INTERVAL = 60; // ms per letter
const PAUSE_AFTER_SWEEP = 2500; // ms to hold before next sweep

interface AnimatedLogoProps {
  id?: string;
  className?: string;
}

export function AnimatedLogo({ id, className = "" }: AnimatedLogoProps) {
  const [pixelCount, setPixelCount] = useState(0); // how many letters are in pixel font (from left)
  const [direction, setDirection] = useState<"toPixel" | "toSerif">("toPixel");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function tick() {
      setPixelCount((prev) => {
        const next = direction === "toPixel" ? prev + 1 : prev - 1;

        if (direction === "toPixel" && next > LETTERS.length) {
          // All letters are pixel — pause then sweep back
          setTimeout(() => setDirection("toSerif"), PAUSE_AFTER_SWEEP);
          return LETTERS.length;
        }
        if (direction === "toSerif" && next < 0) {
          // All letters are serif — pause then sweep to pixel
          setTimeout(() => setDirection("toPixel"), PAUSE_AFTER_SWEEP);
          return 0;
        }
        return next;
      });
    }

    timerRef.current = setInterval(tick, SWEEP_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [direction]);

  return (
    <span id={id} className={`font-semibold text-[var(--accent)] select-none ${className}`}>
      {LETTERS.map((char, i) => {
        const isPixel = i < pixelCount;
        return (
          <span
            key={i}
            style={{
              fontFamily: isPixel ? PIXEL : SERIF,
              display: "inline-block",
              transition: "font-family 0.1s",
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
