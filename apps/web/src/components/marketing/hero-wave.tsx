"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function HeroWave() {
  return (
    <motion.div
      className="relative h-full w-full select-none"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Image
        src="/hero-ribbon.png"
        alt=""
        fill
        className="object-cover object-right-top"
        priority
      />
    </motion.div>
  );
}
