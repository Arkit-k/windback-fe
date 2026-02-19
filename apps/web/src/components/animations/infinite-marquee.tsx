"use client";

import { motion } from "framer-motion";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

export function InfiniteMarquee({
  children,
  speed = 30,
  className,
  pauseOnHover = true,
}: InfiniteMarqueeProps) {
  return (
    <div
      className={`group relative flex overflow-hidden ${className ?? ""}`}
      style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
    >
      <motion.div
        className={`flex shrink-0 items-center gap-12 ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
