"use client";

import { motion } from "framer-motion";
import { InfiniteMarquee } from "@/components/animations/infinite-marquee";

const logos = [
  { name: "Stripe", svg: (
    <svg viewBox="0 0 60 25" className="h-6 w-auto fill-current">
      <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.4 10.4 0 01-4.56.95c-4.01 0-6.83-2.5-6.83-7.14 0-4.08 2.38-7.15 6.3-7.15 3.72 0 5.9 2.7 5.9 7.02v1.4zm-4.06-5.58c-1.01 0-2.06.76-2.06 2.45h4.13c0-1.59-.84-2.45-2.07-2.45zM25.1 6.02c-1.69 0-2.77.8-3.38 1.35l-.22-1.07h-3.87v20.14l4.43-.94.01-4.88c.63.46 1.55 1.1 3.07 1.1 3.1 0 5.93-2.5 5.93-7.97-.01-5.01-2.9-7.73-5.97-7.73zm-1.05 11.87c-1.02 0-1.62-.36-2.04-.81l-.02-6.39c.44-.5 1.06-.84 2.06-.84 1.58 0 2.67 1.77 2.67 4.01 0 2.3-1.07 4.03-2.67 4.03zM14.35 5.86l4.43-.95V1.3l-4.43.94v3.62zm0 .52h4.43V20.3h-4.43V6.38zM9.73 7.64l-.28-1.26H5.65V20.3h4.43v-9.5c1.05-1.37 2.83-1.11 3.38-.92V6.38c-.57-.21-2.65-.6-3.73 1.26zM5.1 2.8L.73 3.72l-.02 12.87c0 2.38 1.78 4.13 4.16 4.13 1.31 0 2.28-.24 2.81-.53v-3.35c-.51.21-3.08.95-3.08-1.43V9.99h3.08V6.38H4.6L5.1 2.8zM37.22 9.9c0-.67.55-1.1 1.44-1.1.97 0 2.16.34 3.13.95V6.09a8.3 8.3 0 00-3.13-.57c-2.56 0-5.27 1.34-5.27 4.49 0 4.39 6.04 3.69 6.04 5.58 0 .79-.69 1.19-1.64 1.19-1.42 0-2.79-.65-3.84-1.42v3.8a9.26 9.26 0 003.84.84c2.63 0 5.28-1.18 5.28-4.49 0-4.73-6.05-3.89-6.05-5.61z" />
    </svg>
  )},
  { name: "Razorpay", svg: (
    <svg viewBox="0 0 100 24" className="h-5 w-auto fill-current">
      <text x="0" y="18" className="text-[16px] font-semibold" style={{ fontFamily: "system-ui" }}>Razorpay</text>
    </svg>
  )},
  { name: "Paddle", svg: (
    <svg viewBox="0 0 80 24" className="h-5 w-auto fill-current">
      <text x="0" y="18" className="text-[16px] font-semibold" style={{ fontFamily: "system-ui" }}>Paddle</text>
    </svg>
  )},
  { name: "Chargebee", svg: (
    <svg viewBox="0 0 100 24" className="h-5 w-auto fill-current">
      <text x="0" y="18" className="text-[16px] font-semibold" style={{ fontFamily: "system-ui" }}>Chargebee</text>
    </svg>
  )},
  { name: "Recurly", svg: (
    <svg viewBox="0 0 80 24" className="h-5 w-auto fill-current">
      <text x="0" y="18" className="text-[16px] font-semibold" style={{ fontFamily: "system-ui" }}>Recurly</text>
    </svg>
  )},
];

export function LogoCloud() {
  return (
    <motion.section
      className="border-t border-border py-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Works with your favorite payment providers
        </p>
        <InfiniteMarquee speed={25}>
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 text-muted-foreground/40 transition-colors duration-300 hover:text-foreground cursor-default"
            >
              {logo.svg}
            </div>
          ))}
        </InfiniteMarquee>
      </div>
    </motion.section>
  );
}
