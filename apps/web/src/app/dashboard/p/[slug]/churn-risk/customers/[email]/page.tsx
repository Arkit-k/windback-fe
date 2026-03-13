"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Separator,
  Skeleton,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useCustomerDetail, usePreviewEmail } from "@/hooks/use-churn-risk";
import { useParams } from "next/navigation";
import { formatRelativeDate } from "@/lib/utils";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ChurnSignal } from "@/types/api";
import { sanitizeHTML } from "@/lib/sanitize";

export default function CustomerDetailPage() {
  const { slug } = useCurrentProject();
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  const { data, isLoading } = useCustomerDetail(slug, email);
  const previewEmail = usePreviewEmail(slug);
  const [preview, setPreview] = useState<{
    subject: string;
    body_html: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data?.score) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Customer not found.
      </div>
    );
  }

  const { score, events, score_history } = data;
  const signals: ChurnSignal[] =
    typeof score.signals === "string"
      ? JSON.parse(score.signals)
      : score.signals;

  function handlePreview() {
    previewEmail.mutate(email, {
      onSuccess: (data) => setPreview(data),
      onError: (err) =>
        toast({
          title: "Preview failed",
          description: err.message,
          variant: "destructive",
        }),
    });
  }

  const trendIcon =
    score.trend === "increasing" ? (
      <TrendingUp className="h-4 w-4 text-red-500" />
    ) : score.trend === "decreasing" ? (
      <TrendingDown className="h-4 w-4 text-green-500" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/p/${slug}/churn-risk`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {score.customer_name || email}
          </h1>
          {score.customer_name && (
            <p className="text-sm text-muted-foreground">{email}</p>
          )}
        </div>
      </div>

      {/* Score overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <p className="text-3xl font-bold">{score.risk_score}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Risk Level</p>
            <Badge
              className={
                score.risk_level === "high"
                  ? "mt-1 border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  : score.risk_level === "medium"
                    ? "mt-1 border-yellow-500/30 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                    : "mt-1 border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              }
            >
              {score.risk_level}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Trend</p>
            <div className="mt-1 flex items-center gap-1">
              {trendIcon}
              <span className="text-sm capitalize">{score.trend}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Email Status</p>
            <div className="mt-1 flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {score.email_sent ? (
                <span className="text-green-600">
                  Sent {score.email_sent_at && formatRelativeDate(score.email_sent_at)}
                </span>
              ) : (
                <span className="text-muted-foreground">Not sent</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Signals</CardTitle>
          <CardDescription>
            Risk signals detected for this customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signals detected.</p>
          ) : (
            <div className="space-y-2">
              {signals.map((s, i) => (
                <div
                  key={`${s.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{s.description}</p>
                    <p className="text-xs text-muted-foreground">{s.name}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      s.weight > 0
                        ? "border-red-300 text-red-600"
                        : "border-green-300 text-green-600"
                    }
                  >
                    {s.weight > 0 ? "+" : ""}
                    {s.weight}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score history chart */}
      {score_history && score_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score History</CardTitle>
            <CardDescription>
              Risk score over the last {score_history.length} calculations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1">
              {[...score_history].reverse().map((h, i) => (
                <div key={h.id} className="group relative flex-1">
                  <div
                    className={`w-full rounded-t ${
                      h.risk_score >= 70
                        ? "bg-red-400"
                        : h.risk_score >= 40
                          ? "bg-yellow-400"
                          : "bg-green-400"
                    }`}
                    style={{ height: `${Math.max(h.risk_score, 4)}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-popover px-2 py-1 text-xs shadow-md border whitespace-nowrap">
                    {h.risk_score} — {new Date(h.calculated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Email Preview
          </CardTitle>
          <CardDescription>
            Preview the AI-generated retention email for this customer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handlePreview}
            disabled={previewEmail.isPending}
            variant="outline"
            size="sm"
          >
            {previewEmail.isPending ? "Generating..." : "Generate Preview"}
          </Button>
          {preview && (
            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-sm font-medium">
                Subject: {preview.subject}
              </p>
              <Separator />
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(preview.body_html) }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Event Timeline</CardTitle>
          <CardDescription>
            Last 30 days of behavioral events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!events || events.length === 0) ? (
            <p className="text-sm text-muted-foreground">No events recorded.</p>
          ) : (
            <div className="space-y-2">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <code className="rounded bg-muted px-2 py-0.5 text-xs">
                      {e.event_type}
                    </code>
                    {e.properties &&
                      Object.keys(e.properties).length > 0 &&
                      Object.keys(e.properties).some(
                        (k) => k !== "" && e.properties[k] !== undefined,
                      ) && (
                        <span className="text-xs text-muted-foreground">
                          {Object.entries(e.properties)
                            .map(([k, v]) => `${k}=${v}`)
                            .join(", ")}
                        </span>
                      )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(e.occurred_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
