"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from "@windback/ui";
import { AlertTriangle, Check, Mail, ArrowUpDown } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { useCurrentProject } from "@/providers/project-provider";
import { useRouter } from "next/navigation";
import { FilterBar } from "@/components/dashboard/filter-bar";
import type { ChurnRiskScore } from "@/types/api";

interface RiskScoresTableProps {
  scores?: ChurnRiskScore[];
  isLoading: boolean;
  limit?: number;
}

type RiskLevel = "all" | "high" | "medium" | "low";
type SortDir = "desc" | "asc";

const riskLevels: { value: RiskLevel; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function ScoreBadge({ score }: { score: number }) {
  let className = "text-xs ";
  if (score >= 70) {
    className +=
      "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
  } else if (score >= 40) {
    className +=
      "border-yellow-500/30 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
  } else {
    className +=
      "border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400";
  }

  return <Badge className={className}>{score}</Badge>;
}

function SignalPill({ description }: { description: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
      {description}
    </span>
  );
}

export function RiskScoresTable({
  scores,
  isLoading,
  limit,
}: RiskScoresTableProps) {
  const { slug } = useCurrentProject();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("all");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filteredScores = useMemo(() => {
    let result = scores ?? [];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.customer_email.toLowerCase().includes(q) ||
          (s.customer_name?.toLowerCase().includes(q) ?? false),
      );
    }

    if (riskLevel !== "all") {
      result = result.filter((s) => s.risk_level === riskLevel);
    }

    result = [...result].sort((a, b) =>
      sortDir === "desc"
        ? b.risk_score - a.risk_score
        : a.risk_score - b.risk_score,
    );

    return limit ? result.slice(0, limit) : result;
  }, [scores, search, riskLevel, sortDir, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            At-Risk Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4" />
          At-Risk Customers
          {scores && scores.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {scores.length} total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-4 space-y-3">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by customer email..."
          >
            {/* Risk level pills */}
            <div className="flex items-center gap-1.5">
              {riskLevels.map((level) => (
                <Badge
                  key={level.value}
                  variant={riskLevel === level.value ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => setRiskLevel(level.value)}
                >
                  {level.label}
                </Badge>
              ))}
            </div>

            {/* Sort toggle */}
            <button
              type="button"
              onClick={() =>
                setSortDir((d) => (d === "desc" ? "asc" : "desc"))
              }
              className="inline-flex items-center gap-1.5 rounded-sm border border-input/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Score {sortDir === "desc" ? "High-Low" : "Low-High"}
            </button>
          </FilterBar>
        </div>

        {filteredScores.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {scores && scores.length > 0
              ? "No customers match the current filters."
              : "No churn risk scores yet. Send events via the tracking API and recalculate to see at-risk customers."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 pr-4 font-medium">Signals</th>
                  <th className="pb-3 pr-4 font-medium">Last Calculated</th>
                  <th className="pb-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((score) => {
                  const signals =
                    typeof score.signals === "string"
                      ? JSON.parse(score.signals)
                      : score.signals;

                  return (
                    <tr
                      key={score.id}
                      className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        router.push(
                          `/dashboard/p/${slug}/churn-risk/customers/${encodeURIComponent(score.customer_email)}`,
                        )
                      }
                    >
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {score.customer_name || score.customer_email}
                          </p>
                          {score.customer_name && (
                            <p className="text-xs text-muted-foreground">
                              {score.customer_email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <ScoreBadge score={score.risk_score} />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {signals
                            ?.filter(
                              (s: { weight: number }) => s.weight > 0,
                            )
                            .slice(0, 3)
                            .map(
                              (
                                s: { name: string; description: string },
                                i: number,
                              ) => (
                                <SignalPill
                                  key={`${s.name}-${i}`}
                                  description={s.description}
                                />
                              ),
                            )}
                          {signals?.filter(
                            (s: { weight: number }) => s.weight > 0,
                          ).length > 3 && (
                            <span className="text-[11px] text-muted-foreground">
                              +
                              {signals.filter(
                                (s: { weight: number }) => s.weight > 0,
                              ).length - 3}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {formatRelativeDate(score.last_calculated)}
                      </td>
                      <td className="py-3">
                        {score.email_sent ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Check className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
