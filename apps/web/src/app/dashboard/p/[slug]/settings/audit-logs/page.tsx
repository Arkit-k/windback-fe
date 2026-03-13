"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Skeleton,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
  Separator,
} from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useAuditLogs, type AuditLog } from "@/hooks/use-audit-logs";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PAGE_SIZE = 50;

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "api_key.rotated", label: "API Key Rotated" },
  { value: "team.member_invited", label: "Team Member Invited" },
  { value: "team.member_removed", label: "Team Member Removed" },
  { value: "project.settings_updated", label: "Settings Updated" },
  { value: "project.origins_updated", label: "Origins Updated" },
  { value: "auth.2fa_enabled", label: "2FA Enabled" },
  { value: "auth.2fa_disabled", label: "2FA Disabled" },
];

function actionLabel(action: string): string {
  const match = ACTION_OPTIONS.find((o) => o.value === action);
  return match?.label ?? action;
}

function actionVariant(
  action: string
): "default" | "secondary" | "destructive" | "outline" {
  if (action.includes("removed") || action.includes("disabled"))
    return "destructive";
  if (
    action.includes("invited") ||
    action.includes("enabled") ||
    action.includes("rotated")
  )
    return "default";
  return "secondary";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(logs: AuditLog[]) {
  const headers = ["ID", "Action", "IP Address", "Details", "Date"];
  const rows = logs.map((log) => [
    log.id,
    actionLabel(log.action),
    log.ip_address ?? "",
    log.details ? JSON.stringify(log.details) : "",
    log.created_at,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${toISODate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ExpandableDetails({ details }: { details: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {expanded ? "Hide details" : "Show details"}
      </button>
      {expanded && (
        <pre className="mt-1.5 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground overflow-x-auto max-w-full">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  const { slug } = useCurrentProject();
  const [offset, setOffset] = useState(0);

  // Filter state
  const [actionFilter, setActionFilter] = useState("all");
  const [ipSearch, setIpSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pass action filter to hook for server-side filtering when available
  const serverAction = actionFilter !== "all" ? actionFilter : undefined;
  const { data, isLoading, error } = useAuditLogs(
    slug,
    offset,
    PAGE_SIZE,
    serverAction
  );

  const logs = data?.data ?? [];

  // Client-side filtering for IP and date range
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (ipSearch.trim()) {
      const q = ipSearch.trim().toLowerCase();
      result = result.filter((log) =>
        log.ip_address?.toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((log) => new Date(log.created_at) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.created_at) <= to);
    }

    return result;
  }, [logs, ipSearch, dateFrom, dateTo]);

  const hasNext = logs.length === PAGE_SIZE;
  const hasPrev = offset > 0;

  const hasActiveFilters =
    actionFilter !== "all" || ipSearch.trim() || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground">
            A chronological record of security-sensitive actions taken in this
            project.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCsv(filteredLogs)}
          disabled={filteredLogs.length === 0}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Action type */}
            <div className="space-y-1.5">
              <Label htmlFor="action-filter" className="text-xs">
                Action Type
              </Label>
              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter(v);
                  setOffset(0);
                }}
              >
                <SelectTrigger id="action-filter">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* IP search */}
            <div className="space-y-1.5">
              <Label htmlFor="ip-search" className="text-xs">
                IP Address
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="ip-search"
                  placeholder="Search by IP..."
                  value={ipSearch}
                  onChange={(e) => setIpSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Date from */}
            <div className="space-y-1.5">
              <Label htmlFor="date-from" className="text-xs">
                From
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date to */}
            <div className="space-y-1.5">
              <Label htmlFor="date-to" className="text-xs">
                To
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {filteredLogs.length} result{filteredLogs.length !== 1 && "s"}{" "}
                  found
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActionFilter("all");
                    setIpSearch("");
                    setDateFrom("");
                    setDateTo("");
                    setOffset(0);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Audit log list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>
            Actions like API key rotations, team changes, and security settings
            are recorded here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">
              Failed to load audit logs. Please try again.
            </p>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Shield className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                {hasActiveFilters
                  ? "No audit events match your filters."
                  : "No audit events yet."}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting or clearing the filters above."
                  : "Events like API key rotations and team changes will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={actionVariant(log.action)}>
                          {actionLabel(log.action)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{formatDate(log.created_at)}</span>
                        {log.ip_address && <span>IP: {log.ip_address}</span>}
                      </div>
                    </div>
                  </div>
                  {log.details &&
                    Object.keys(log.details).length > 0 && (
                      <ExpandableDetails details={log.details} />
                    )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={!hasPrev}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Showing {offset + 1}&ndash;{offset + logs.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
