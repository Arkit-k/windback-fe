"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-4xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
