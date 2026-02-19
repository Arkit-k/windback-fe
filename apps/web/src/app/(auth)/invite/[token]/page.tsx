"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@windback/ui";
import { useAcceptInvitation } from "@/hooks/use-team";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const acceptMutation = useAcceptInvitation();

  useEffect(() => {
    if (token && !acceptMutation.isPending && !acceptMutation.isSuccess && !acceptMutation.isError) {
      acceptMutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Team Invitation</CardTitle>
            <CardDescription>Processing your invitation...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            {acceptMutation.isPending && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-muted-foreground">
                  Accepting your invitation...
                </p>
              </>
            )}

            {acceptMutation.isSuccess && (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Invitation accepted!
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You have been added to the project team.
                  </p>
                </div>
                <Link
                  href="/dashboard/projects"
                  className="mt-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)]/90"
                >
                  Go to Dashboard
                </Link>
              </>
            )}

            {acceptMutation.isError && (
              <>
                <XCircle className="h-10 w-10 text-destructive" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Failed to accept invitation
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {acceptMutation.error?.message || "The invitation may have expired or already been used."}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-2 text-sm text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent)]/80"
                >
                  Back to Login
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
