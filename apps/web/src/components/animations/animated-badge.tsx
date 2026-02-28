"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBadge({ children, className }: AnimatedBadgeProps) {
  const [angle, setAngle] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      setAngle((prev) => (prev + 1) % 360);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <motion.div
      className={`group relative inline-flex cursor-default ${className ?? ""}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Animated gradient border */}
      <div
        className="absolute -inset-[1px] rounded-full opacity-70 blur-[1px] transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `conic-gradient(from ${angle}deg, var(--accent), #60a5fa, #FBAA8A, var(--accent))`,
        }}
      />

      {/* Inner background */}
      <div className="relative flex items-center gap-2 rounded-full bg-background/95 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
        {children}
      </div>
    </motion.div>
  );
}
