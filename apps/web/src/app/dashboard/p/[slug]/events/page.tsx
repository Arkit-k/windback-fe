"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button, Skeleton } from "@windback/ui";
import { EventsTable } from "@/components/dashboard/events-table";
import { useCurrentProject } from "@/providers/project-provider";
import { useChurnEvents } from "@/hooks/use-churn-events";
import { STATUS_LABELS, ITEMS_PER_PAGE } from "@/lib/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

function EventsContent() {
  const { slug } = useCurrentProject();
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data, isLoading } = useChurnEvents(slug, { status, page });

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || value === "1") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/dashboard/p/${slug}/events?${params.toString()}`);
  }

  const totalPages = Math.ceil((data?.total ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Churn Events</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} total events
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Events</CardTitle>
          <Select value={status} onValueChange={(v) => updateParams({ status: v, page: "1" })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <EventsTable events={data?.data ?? []} isLoading={isLoading} projectSlug={slug} />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: (page - 1).toString() })}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: (page + 1).toString() })}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>}>
      <EventsContent />
    </Suspense>
  );
}
