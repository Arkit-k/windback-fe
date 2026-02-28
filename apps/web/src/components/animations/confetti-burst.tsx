"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiBurstProps {
  /** Set to true to trigger the burst */
  trigger: boolean;
  /** Duration in ms before confetti fades out */
  duration?: number;
  /** Number of particles */
  count?: number;
  className?: string;
}

const COLORS = [
  "#2563EB", // blue
  "#60A5FA", // light blue
  "#FBAA8A", // peach
  "#38BDF8", // sky
  "#FDD0BC", // light peach
  "#93C5FD", // blue-300
  "#BFDBFE", // blue-200
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  shape: "circle" | "rect" | "triangle";
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(-120, 120),
    y: randomBetween(-200, -40),
    rotation: randomBetween(-360, 360),
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    size: randomBetween(4, 10),
    shape: (["circle", "rect", "triangle"] as const)[Math.floor(Math.random() * 3)]!,
  }));
}

function ParticleShape({ shape, size, color }: { shape: string; size: number; color: string }) {
  if (shape === "circle") {
    return (
      <div
        className="rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    );
  }
  if (shape === "triangle") {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }}
      />
    );
  }
  return (
    <div
      className="rounded-sm"
      style={{ width: size, height: size * 0.6, backgroundColor: color }}
    />
  );
}

export function ConfettiBurst({
  trigger,
  duration = 2000,
  count = 30,
  className,
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setParticles(generateParticles(count));
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, count, duration]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <AnimatePresence>
        {visible &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/2"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.8],
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration / 1000,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <ParticleShape shape={p.shape} size={p.size} color={p.color} />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
