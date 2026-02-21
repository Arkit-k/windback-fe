"use client";

import { useMemo } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@windback/ui";
import { StatCard } from "@/components/dashboard/stat-card";
import { useCurrentProject } from "@/providers/project-provider";
import { useEmailAnalytics, useRecoveryTrends } from "@/hooks/use-analytics";
import { formatPercent } from "@/lib/utils";
import { Mail, Eye, MousePointerClick, Download } from "lucide-react";
import { motion } from "framer-motion";

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function AnalyticsPage() {
  const { slug } = useCurrentProject();
  const { data: analytics, isLoading } = useEmailAnalytics(slug);
  const { data: trendsData, isLoading: trendsLoading } = useRecoveryTrends(slug);

  const trends = trendsData?.data;

  const { thirtyDaysAgo, today } = useMemo(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(past.getDate() - 30);
    return {
      today: now.toISOString().split("T")[0],
      thirtyDaysAgo: past.toISOString().split("T")[0],
    };
  }, []);

  function handleExport() {
    window.open(
      `/api/proxy/projects/${slug}/analytics/export?from=${thirtyDaysAgo}&to=${today}`
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Email Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Track the performance of your recovery emails.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Total Sent",
            value: (analytics?.total_sent ?? 0).toLocaleString(),
            icon: Mail,
          },
          {
            title: "Open Rate",
            value: analytics ? formatPercent(analytics.open_rate ?? 0) : "0%",
            subtitle: analytics
              ? `${(analytics.total_opened ?? 0).toLocaleString()} opened`
              : undefined,
            icon: Eye,
          },
          {
            title: "Click Rate",
            value: analytics ? formatPercent(analytics.click_rate ?? 0) : "0%",
            subtitle: analytics
              ? `${(analytics.total_clicked ?? 0).toLocaleString()} clicked`
              : undefined,
            icon: MousePointerClick,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <StatCard {...stat} isLoading={isLoading} />
          </motion.div>
        ))}
      </div>

      {/* Daily Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : analytics?.daily && analytics.daily.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Sent
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Opened
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Clicked
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Open Rate
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Click Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.daily.map((day) => {
                    const openRate =
                      day.sent > 0 ? (day.opened / day.sent) * 100 : 0;
                    const clickRate =
                      day.sent > 0 ? (day.clicked / day.sent) * 100 : 0;

                    return (
                      <tr
                        key={day.date}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 text-foreground">
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {day.sent.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {day.opened.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {day.clicked.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {openRate.toFixed(1)}%
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {clickRate.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No email analytics data yet. Analytics will appear once recovery
              emails have been sent.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recovery Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : trends && trends.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      New Events
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Recovered
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Lost
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      MRR at Risk
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      MRR Recovered
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Recovery Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((trend) => (
                    <tr
                      key={trend.date}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 text-foreground">
                        {new Date(trend.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right text-foreground">
                        {trend.new_events.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-green-600">
                        {trend.recovered.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-red-500">
                        {trend.lost.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-foreground">
                        {formatCents(trend.mrr_at_risk_cents)}
                      </td>
                      <td className="py-3 text-right text-green-600">
                        {formatCents(trend.mrr_recovered_cents)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {(trend.recovery_rate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recovery trend data yet. Trends will appear as churn events are
              processed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
