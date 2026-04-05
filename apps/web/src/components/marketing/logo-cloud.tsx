"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { InfiniteMarquee } from "@/components/animations/infinite-marquee";

const logos = [
  { name: "Stripe", src: "/logos/stripe.svg", width: 120, height: 40 },
  { name: "Razorpay", src: "/logos/razorpay.svg", width: 180, height: 40 },
  { name: "PayPal", src: "/logos/paypal.svg", width: 150, height: 40 },
  { name: "Dodo Payments", src: "/logos/dodo.svg", width: 220, height: 40 },
  { name: "Polar", src: "/logos/polar.svg", width: 130, height: 40 },
  { name: "LemonSqueezy", src: "/logos/lemonsqueezy.svg", width: 200, height: 40 },
];

export function LogoCloud() {
  return (
    <motion.section
      id="logo-cloud"
      className="bg-transparent pt-16 pb-4"
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
              className="flex items-center px-8 opacity-60 transition-all duration-300 hover:opacity-100 cursor-default"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-9 w-auto object-contain"
              />
            </div>
          ))}
        </InfiniteMarquee>
      </div>
    </motion.section>
  );
}
