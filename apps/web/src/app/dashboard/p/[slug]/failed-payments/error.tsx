"use client";

import { useEffect } from "react";
import { Button } from "@windback/ui";
import { CreditCard, AlertCircle } from "lucide-react";

export default function FailedPaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[failed-payments error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="relative">
        <CreditCard className="h-10 w-10 text-muted-foreground/40" />
        <AlertCircle className="absolute -right-1 -top-1 h-5 w-5 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Failed to load payment data</h2>
        <p className="text-sm text-muted-foreground">
          An error occurred loading failed payment information.
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
