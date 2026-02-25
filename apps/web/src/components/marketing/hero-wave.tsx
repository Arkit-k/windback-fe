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
        quality={80}
        priority
        className="object-contain object-right-top scale-[1.6] origin-top-right"
        sizes="60vw"
      />
    </motion.div>
  );
}
