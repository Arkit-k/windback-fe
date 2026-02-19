"use client";

import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Skeleton } from "@windback/ui";
import { StatusBadge } from "./status-badge";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import type { ChurnEvent } from "@/types/api";

interface EventsTableProps {
  events: ChurnEvent[];
  isLoading?: boolean;
  projectSlug?: string;
}

export function EventsTable({ events, isLoading, projectSlug }: EventsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border py-16">
        <p className="text-sm text-muted-foreground">No churn events yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Set up a webhook integration to start tracking cancellations.
        </p>
      </div>
    );
  }

  const basePath = projectSlug
    ? `/dashboard/p/${projectSlug}/events`
    : "/dashboard/events";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead className="text-right">MRR</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id} className="cursor-pointer">
            <TableCell>
              <Link
                href={`${basePath}/${event.id}`}
                className="block"
              >
                <p className="font-medium text-foreground">{event.customer_name}</p>
                <p className="text-xs text-muted-foreground">{event.customer_email}</p>
              </Link>
            </TableCell>
            <TableCell>
              <span className="capitalize text-sm">{event.provider}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{event.plan_name}</span>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {formatCurrency(event.mrr_cents, event.currency)}
            </TableCell>
            <TableCell>
              <StatusBadge status={event.status} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeDate(event.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
