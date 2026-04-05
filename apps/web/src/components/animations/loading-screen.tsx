"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete?: () => void;
}

// scatter → converge → pixel → fixing → moving → done
type Phase = "scatter" | "converge" | "pixel" | "fixing" | "moving" | "done";

interface AnimateTo {
  x: number;
  y: number;
  scale: number;
}

const LOGO_TEXT = "Windback.";
const DIGITS = "01001101001011100101101001110010110100101110010100110101001011";

interface Particle {
  char: string;
  startX: number;
  startY: number;
  rotation: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    char: DIGITS[i % DIGITS.length],
    startX: (Math.random() - 0.5) * 800,
    startY: (Math.random() - 0.5) * 600,
    rotation: (Math.random() - 0.5) * 360,
  }));
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const hasFired = useRef(false);
  const [phase, setPhase] = useState<Phase>("scatter");
  const [animateTo, setAnimateTo] = useState<AnimateTo | null>(null);
  const [fixIndex, setFixIndex] = useState(-1); // which letter the shimmer has reached

  const bgParticles = useMemo(() => generateParticles(50), []);
  // stable random start positions for logo letters
  const letterStarts = useMemo(
    () =>
      LOGO_TEXT.split("").map(() => ({
        x: (Math.random() * 2 - 1) * 500,
        y: (Math.random() * 2 - 1) * 400,
        rot: (Math.random() - 0.5) * 180,
        digit: DIGITS[Math.floor(Math.random() * DIGITS.length)],
      })),
    [],
  );

  // Phase timing
  useEffect(() => {
    if (phase === "scatter") {
      const t = setTimeout(() => setPhase("converge"), 1200);
      return () => clearTimeout(t);
    }
    if (phase === "converge") {
      const t = setTimeout(() => setPhase("pixel"), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "pixel") {
      // Hold the pixelated logo briefly, then start fixing
      const t = setTimeout(() => setPhase("fixing"), 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Fixing phase: shimmer sweeps and fixes letters one by one
  useEffect(() => {
    if (phase !== "fixing") return;
    let idx = 0;
    const interval = setInterval(() => {
      setFixIndex(idx);
      idx++;
      if (idx >= LOGO_TEXT.length) {
        clearInterval(interval);
        // Small pause after all fixed, then fly to navbar
        setTimeout(() => {
          measureAndMove();
        }, 400);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  function measureAndMove() {
    const navLogo = document.getElementById("navbar-logo");
    const loadingLogo = logoRef.current;
    if (navLogo && loadingLogo) {
      const navRect = navLogo.getBoundingClientRect();
      const loadRect = loadingLogo.getBoundingClientRect();
      const scale = navRect.height / loadRect.height;
      const x = (navRect.left + navRect.width / 2) - (loadRect.left + loadRect.width / 2);
      const y = (navRect.top + navRect.height / 2) - (loadRect.top + loadRect.height / 2);
      setAnimateTo({ x, y, scale });
      setTimeout(() => setPhase("moving"), 150);
    } else {
      setPhase("done");
      onComplete?.();
    }
  }

  function handleMoveComplete() {
    if (phase !== "moving" || hasFired.current) return;
    hasFired.current = true;
    setPhase("done");
    onComplete?.();
  }

  const isPrePixel = phase === "scatter" || phase === "converge";
  const isPixelOrFixing = phase === "pixel" || phase === "fixing";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--accent)]"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          {/* Background floating digits */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {bgParticles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute text-lg font-bold text-white select-none"
                style={{
                  fontFamily: "'Silkscreen', cursive",
                  left: "50%",
                  top: "50%",
                }}
                initial={{
                  x: p.startX,
                  y: p.startY,
                  rotate: p.rotation,
                  opacity: 0,
                }}
                animate={
                  phase === "scatter"
                    ? { x: p.startX, y: p.startY, rotate: p.rotation, opacity: 0.5 }
                    : phase === "converge"
                      ? { x: (Math.random() - 0.5) * 120, y: (Math.random() - 0.5) * 40, rotate: 0, opacity: 0.3 }
                      : { x: 0, y: 0, rotate: 0, opacity: 0 }
                }
                transition={{
                  duration: phase === "scatter" ? 0.6 : phase === "converge" ? 0.8 : 0.4,
                  delay: phase === "scatter" ? i * 0.015 : i * 0.01,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {p.char}
              </motion.span>
            ))}
          </div>

          {/* Logo */}
          <motion.div
            ref={logoRef}
            className="relative origin-center"
            animate={
              phase === "moving" && animateTo
                ? {
                    x: animateTo.x,
                    y: animateTo.y,
                    scale: animateTo.scale,
                    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
                  }
                : {}
            }
            onAnimationComplete={handleMoveComplete}
          >
            <span
              className="relative flex select-none whitespace-nowrap font-semibold tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
            >
              {LOGO_TEXT.split("").map((letter, i) => {
                const s = letterStarts[i];
                // Is this letter already "fixed" by the shimmer?
                const isFixed = phase === "fixing" ? i <= fixIndex : !isPrePixel && !isPixelOrFixing;
                // Show digit or real letter?
                const showDigit = isPrePixel && phase === "scatter";
                const displayChar = showDigit ? s.digit : letter;

                return (
                  <motion.span
                    key={i}
                    className="inline-block text-white"
                    style={{
                      fontFamily: isFixed
                        ? "var(--font-serif, 'Instrument Serif'), serif"
                        : "'Silkscreen', cursive",
                      transition: "font-family 0.15s",
                    }}
                    initial={{
                      x: s.x,
                      y: s.y,
                      rotate: s.rot,
                      opacity: 0,
                      scale: 0.5,
                    }}
                    animate={
                      phase === "scatter"
                        ? { x: s.x * 0.6, y: s.y * 0.6, rotate: s.rot * 0.5, opacity: 0.7, scale: 1 }
                        : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
                    }
                    transition={{
                      duration: phase === "scatter" ? 0.5 : 0.7,
                      delay: phase === "scatter" ? i * 0.05 : i * 0.04,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    {displayChar}
                  </motion.span>
                );
              })}

              {/* Shimmer bar that sweeps across during fixing phase */}
              {phase === "fixing" && (
                <motion.div
                  className="pointer-events-none absolute top-0 bottom-0 w-[3px]"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.9), transparent)",
                    boxShadow: "0 0 16px 4px rgba(255,255,255,0.4)",
                  }}
                  initial={{ left: "0%" }}
                  animate={{ left: "100%" }}
                  transition={{
                    duration: 0.72,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                />
              )}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
