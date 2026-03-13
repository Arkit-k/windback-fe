"use client";

import { useEffect } from "react";
import { Button } from "@windback/ui";
import { AlertCircle } from "lucide-react";

export default function CompetitorRadarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[competitor-radar error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred loading competitor radar data."}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
