"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete?: () => void;
}

type Phase = "center" | "moving" | "done";

interface AnimateTo {
  x: number;
  y: number;
  scale: number;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const logoRef = useRef<HTMLSpanElement>(null);
  const hasFired = useRef(false);
  const [phase, setPhase] = useState<Phase>("center");
  const [animateTo, setAnimateTo] = useState<AnimateTo | null>(null);

  // After shimmer passes finish, measure + move
  function handleShimmerComplete() {
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
      // Fallback: navbar logo not found, skip fly animation
      setPhase("done");
      onComplete?.();
    }
  }

  function handleAnimationComplete() {
    if (phase !== "moving" || hasFired.current) return;
    hasFired.current = true;
    setPhase("done");
    onComplete?.();
  }

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          <motion.div
            className="relative overflow-hidden origin-center"
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
            onAnimationComplete={handleAnimationComplete}
          >
            <motion.span
              ref={logoRef}
              className="block select-none whitespace-nowrap font-display font-semibold tracking-tight text-[var(--accent)]"
              style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Windback<span>.</span>
            </motion.span>

            {/* Shimmer — text shine: narrow bright band sweeps left→right→left */}
            <motion.div
              className="pointer-events-none absolute inset-0 -skew-x-12"
              style={{
                background:
                  "linear-gradient(90deg, transparent 35%, rgba(255,255,255,0.88) 50%, transparent 65%)",
              }}
              initial={{ x: "-150%" }}
              animate={{ x: ["-150%", "150%", "-150%", "150%", "-150%", "150%", "-150%"] }}
              transition={{ duration: 2.8, ease: "easeInOut", times: [0, 0.17, 0.34, 0.51, 0.68, 0.85, 1] }}
              onAnimationComplete={handleShimmerComplete}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
