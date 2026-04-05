"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const LETTERS = "Windback.".split("");
const SERIF = "var(--font-serif, 'Instrument Serif'), serif";
const PIXEL = "'Silkscreen', cursive";

const SWEEP_INTERVAL = 60;
const PAUSE_AFTER_SWEEP = 2500;

interface AnimatedLogoProps {
  id?: string;
  className?: string;
}

export function AnimatedLogo({ id, className = "" }: AnimatedLogoProps) {
  const [pixelCount, setPixelCount] = useState(0);
  const directionRef = useRef<"toPixel" | "toSerif">("toPixel");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const startSweep = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pausedRef.current = false;

    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;

      setPixelCount((prev) => {
        const dir = directionRef.current;
        const next = dir === "toPixel" ? prev + 1 : prev - 1;

        if (dir === "toPixel" && next > LETTERS.length) {
          pausedRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => {
            directionRef.current = "toSerif";
            startSweep();
          }, PAUSE_AFTER_SWEEP);
          return LETTERS.length;
        }
        if (dir === "toSerif" && next < 0) {
          pausedRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => {
            directionRef.current = "toPixel";
            startSweep();
          }, PAUSE_AFTER_SWEEP);
          return 0;
        }
        return next;
      });
    }, SWEEP_INTERVAL);
  }, []);

  useEffect(() => {
    startSweep();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startSweep]);

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
