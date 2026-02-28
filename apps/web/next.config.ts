import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@windback/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90, 100],
  },
};

export default nextConfig;
