"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function HeroWave() {
  return (
    <motion.div
      className="relative h-full w-full select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.2 }}
    >
      <Image
        src="/hero-ribbon.png"
        alt=""
        fill
        quality={100}
        priority
        className="object-contain object-right-top scale-[1.6] origin-top-right"
        sizes="60vw"
      />
      {/* Bottom gradient fade — blends ribbon into the blue section below */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-[var(--accent)]" />
    </motion.div>
  );
}
