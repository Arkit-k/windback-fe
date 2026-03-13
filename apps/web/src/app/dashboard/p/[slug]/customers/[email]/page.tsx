"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Skeleton,
} from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useCustomerTimeline } from "@/hooks/use-timeline";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Timeline, TimelineSkeleton } from "@/components/dashboard/timeline";

function riskBadgeClass(level: string) {
  switch (level) {
    case "high":
      return "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case "medium":
      return "border-yellow-500/30 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
    case "low":
      return "border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    default:
      return "";
  }
}

export default function CustomerTimelinePage() {
  const { slug } = useCurrentProject();
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  const { data, isLoading } = useCustomerTimeline(slug, email);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-16" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <TimelineSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  const customerName = data?.customer_name || email;
  const currentScore = data?.current_score;
  const riskLevel = data?.risk_level ?? "";
  const events = data?.events ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/p/${slug}/churn-risk`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              {customerName}
            </h1>
            {customerName !== email && (
              <p className="text-sm text-muted-foreground">{email}</p>
            )}
          </div>
          {currentScore != null && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm font-mono">
                Score: {currentScore}
              </Badge>
              {riskLevel && (
                <Badge className={riskBadgeClass(riskLevel)}>
                  {riskLevel}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Health Timeline</CardTitle>
          <CardDescription>
            All activity for this customer across events, emails, scores, and
            payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity recorded for this customer.
            </p>
          ) : (
            <Timeline events={events} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
