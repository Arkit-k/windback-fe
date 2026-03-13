import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@windback/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90, 100],
  },
};

// Only wrap with Sentry if the required env vars are present.
// Without SENTRY_ORG + SENTRY_PROJECT the plugin breaks the build silently.
let config: NextConfig = nextConfig;

if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
  const { withSentryConfig } = require("@sentry/nextjs");
  config = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: { enabled: true },
    tunnelRoute: "/monitoring",
    sourcemaps: { deleteSourcemapsAfterUpload: true },
    disableLogger: true,
  });
}

export default config;
