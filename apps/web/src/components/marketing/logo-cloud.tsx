"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { InfiniteMarquee } from "@/components/animations/infinite-marquee";

const logos = [
  { name: "Stripe", src: "/logos/stripe.svg", width: 80, height: 34 },
  { name: "Razorpay", src: "/logos/razorpay.svg", width: 120, height: 28 },
  { name: "Paddle", src: "/logos/paddle.svg", width: 110, height: 30 },
  { name: "Dodo Payments", src: "/logos/dodopayments.svg", width: 160, height: 30 },
  { name: "Chargebee", src: "/logos/chargebee.svg", width: 130, height: 30 },
  { name: "Polar", src: "/logos/polar.svg", width: 100, height: 30 },
  { name: "Recurly", src: "/logos/recurly.svg", width: 110, height: 28 },
];

export function LogoCloud() {
  return (
    <motion.section
      className="bg-transparent pt-24 pb-12"
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
              className="flex items-center px-4 opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 cursor-default"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
        </InfiniteMarquee>
      </div>
    </motion.section>
  );
}
