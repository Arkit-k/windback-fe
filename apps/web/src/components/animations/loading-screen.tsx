"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete?: () => void;
}

// money → error404 → wait → scatter → converge → pixel → fixing → moving → done
type Phase = "money" | "error404" | "wait" | "scatter" | "converge" | "pixel" | "fixing" | "moving" | "done";

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

/** Pixel-art dollar bill — 16×8 grid */
function PixelBill({ size = 48 }: { size?: number }) {
  const G = "#2D8C3C";
  const D = "#1A5C28";
  const W = "#E8E8D0";
  const _ = "transparent";
  const grid = [
    [D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D],
    [D, W, W, W, W, W, W, W, W, W, W, W, W, W, W, D],
    [D, W, D, W, G, G, G, G, G, G, G, G, W, D, W, D],
    [D, W, W, G, G, W, G, G, G, G, W, G, G, W, W, D],
    [D, W, W, G, G, W, G, G, G, G, W, G, G, W, W, D],
    [D, W, D, W, G, G, G, G, G, G, G, G, W, D, W, D],
    [D, W, W, W, W, W, W, W, W, W, W, W, W, W, W, D],
    [D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D],
  ];
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 16 8"
      style={{ imageRendering: "pixelated" }}
    >
      {grid.map((row, y) =>
        row.map((color, x) =>
          color !== _ ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null
        )
      )}
    </svg>
  );
}

/** Big pixel dollar sign */
function PixelDollar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="font-bold text-green-300 select-none"
      style={{ fontFamily: "'Silkscreen', cursive", fontSize: size }}
    >
      $
    </span>
  );
}

interface FallingBill {
  id: number;
  x: number;
  delay: number;
  rotation: number;
  size: number;
  type: "bill" | "dollar";
}

function generateBills(count: number): FallingBill[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 94 + 3,
    delay: Math.random() * 1.2,
    rotation: (Math.random() - 0.5) * 40,
    size: 36 + Math.random() * 28,
    type: (i % 3 === 0 ? "dollar" : "bill") as "bill" | "dollar",
  }));
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const hasFired = useRef(false);
  const [phase, setPhase] = useState<Phase>("money");
  const [animateTo, setAnimateTo] = useState<AnimateTo | null>(null);
  const [fixIndex, setFixIndex] = useState(-1);

  const bills = useMemo(() => generateBills(25), []);
  const bgParticles = useMemo(() => generateParticles(50), []);
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
    if (phase === "money") {
      const t = setTimeout(() => setPhase("error404"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "error404") {
      const t = setTimeout(() => setPhase("wait"), 1500);
      return () => clearTimeout(t);
    }
    if (phase === "wait") {
      const t = setTimeout(() => setPhase("scatter"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "scatter") {
      const t = setTimeout(() => setPhase("converge"), 1200);
      return () => clearTimeout(t);
    }
    if (phase === "converge") {
      const t = setTimeout(() => setPhase("pixel"), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "pixel") {
      const t = setTimeout(() => setPhase("fixing"), 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Fixing phase
  useEffect(() => {
    if (phase !== "fixing") return;
    let idx = 0;
    const interval = setInterval(() => {
      setFixIndex(idx);
      idx++;
      if (idx >= LOGO_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => measureAndMove(), 400);
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

  const isMoneyPhase = phase === "money" || phase === "error404" || phase === "wait";
  const isPrePixel = phase === "scatter" || phase === "converge";
  const isPixelOrFixing = phase === "pixel" || phase === "fixing";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--accent)]"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          {/* ── Intro phases: Money → 404 → Wait ── */}
          <AnimatePresence mode="wait">
            {phase === "money" && (
              <motion.div
                key="money"
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                {/* Big centered dollar sign */}
                <motion.div
                  className="z-10 flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [0.5, 1.1, 1] }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <span
                    className="text-white font-bold select-none"
                    style={{ fontFamily: "'Silkscreen', cursive", fontSize: "clamp(4rem, 15vw, 10rem)" }}
                  >
                    $
                  </span>
                </motion.div>

                {/* Falling bills */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {bills.map((bill) => (
                    <motion.div
                      key={bill.id}
                      className="absolute"
                      style={{ left: `${bill.x}%` }}
                      initial={{ y: -80, rotate: bill.rotation, opacity: 0 }}
                      animate={{
                        y: ["-10vh", "110vh"],
                        rotate: [bill.rotation, bill.rotation + 20, bill.rotation - 10],
                        opacity: [0, 0.8, 0.8, 0.6, 0],
                      }}
                      transition={{
                        duration: 2.2 + Math.random() * 0.8,
                        delay: bill.delay,
                        ease: "easeIn",
                      }}
                    >
                      {bill.type === "bill" ? (
                        <PixelBill size={bill.size} />
                      ) : (
                        <PixelDollar size={bill.size * 0.6} />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "error404" && (
              <motion.div
                key="error404"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.span
                  className="text-white font-bold select-none"
                  style={{ fontFamily: "'Silkscreen', cursive", fontSize: "clamp(5rem, 18vw, 12rem)" }}
                  animate={{ x: [0, -3, 4, -2, 0] }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  404
                </motion.span>
                <motion.span
                  className="text-white/60 font-bold select-none"
                  style={{ fontFamily: "'Silkscreen', cursive", fontSize: "clamp(0.75rem, 2vw, 1.25rem)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  page not found
                </motion.span>
              </motion.div>
            )}

            {phase === "wait" && (
              <motion.div
                key="wait"
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.span
                  className="text-white font-bold select-none text-center leading-tight"
                  style={{ fontFamily: "'Silkscreen', cursive", fontSize: "clamp(1.25rem, 4vw, 2.5rem)" }}
                >
                  wait...
                </motion.span>
                <motion.span
                  className="text-white/50 font-bold select-none text-center"
                  style={{ fontFamily: "'Silkscreen', cursive", fontSize: "clamp(0.7rem, 1.8vw, 1rem)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  something is wrong
                </motion.span>
                <motion.span
                  className="text-white/30 font-bold select-none text-center"
                  style={{ fontFamily: "'Silkscreen', cursive", fontSize: "clamp(0.6rem, 1.5vw, 0.85rem)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 1] }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  jk, let me fix that
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Phase 2+: Binary digits scatter/converge ── */}
          {!isMoneyPhase && (
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
          )}

          {/* ── Logo (hidden during money phase) ── */}
          {!isMoneyPhase && (
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
                  const isFixed = phase === "fixing" ? i <= fixIndex : !isPrePixel && !isPixelOrFixing;
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
