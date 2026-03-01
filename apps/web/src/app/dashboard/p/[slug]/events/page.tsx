"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Button, Skeleton,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Input, Label,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { EventsTable } from "@/components/dashboard/events-table";
import { useCurrentProject } from "@/providers/project-provider";
import { useChurnEvents, useCreateChurnEvent } from "@/hooks/use-churn-events";
import { STATUS_LABELS, ITEMS_PER_PAGE, CANCEL_REASON_LABELS, PROVIDER_LABELS } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const providerOptions = Object.entries(PROVIDER_LABELS).map(([value, label]) => ({ value, label }));
const cancelReasonOptions = Object.entries(CANCEL_REASON_LABELS).map(([value, label]) => ({ value, label }));

function CreateEventModal({ slug, open, onClose }: { slug: string; open: boolean; onClose: () => void }) {
  const createMutation = useCreateChurnEvent(slug);
  const router = useRouter();

  const [form, setForm] = useState({
    customer_email: "",
    customer_name: "",
    provider: "stripe",
    mrr_dollars: "",
    currency: "USD",
    plan_name: "",
    tenure_days: "",
    cancel_reason: "",
    cancel_reason_text: "",
    provider_customer_id: "",
    provider_subscription_id: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mrrCents = Math.round(parseFloat(form.mrr_dollars || "0") * 100);
    createMutation.mutate(
      {
        customer_email: form.customer_email,
        customer_name: form.customer_name || undefined,
        provider: form.provider,
        mrr: mrrCents,
        currency: form.currency || "USD",
        plan_name: form.plan_name || undefined,
        tenure_days: form.tenure_days ? parseInt(form.tenure_days, 10) : undefined,
        cancel_reason: form.cancel_reason || undefined,
        cancel_reason_text: form.cancel_reason_text || undefined,
        provider_customer_id: form.provider_customer_id || undefined,
        provider_subscription_id: form.provider_subscription_id || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: (event) => {
          toast({ title: "Churn event created", variant: "success" as "default" });
          onClose();
          router.push(`/dashboard/p/${slug}/events/${event.id}`);
        },
        onError: (err) => {
          toast({ title: "Failed to create event", description: err.message, variant: "destructive" });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Churn Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Required fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ce-email">Customer Email *</Label>
              <Input
                id="ce-email"
                type="email"
                placeholder="customer@example.com"
                value={form.customer_email}
                onChange={(e) => set("customer_email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce-name">Customer Name</Label>
              <Input
                id="ce-name"
                placeholder="Jane Doe"
                value={form.customer_name}
                onChange={(e) => set("customer_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Provider *</Label>
              <Select value={form.provider} onValueChange={(v) => set("provider", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {providerOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce-mrr">MRR (USD) *</Label>
              <Input
                id="ce-mrr"
                type="number"
                step="0.01"
                min="0"
                placeholder="49.00"
                value={form.mrr_dollars}
                onChange={(e) => set("mrr_dollars", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce-currency">Currency</Label>
              <Input
                id="ce-currency"
                placeholder="USD"
                maxLength={3}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce-plan">Plan Name</Label>
              <Input
                id="ce-plan"
                placeholder="Pro"
                value={form.plan_name}
                onChange={(e) => set("plan_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce-tenure">Tenure (days)</Label>
              <Input
                id="ce-tenure"
                type="number"
                min="0"
                placeholder="180"
                value={form.tenure_days}
                onChange={(e) => set("tenure_days", e.target.value)}
              />
            </div>
          </div>

          {/* Cancel reason */}
          <div className="space-y-1.5">
            <Label>Cancel Reason</Label>
            <Select value={form.cancel_reason} onValueChange={(v) => set("cancel_reason", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason (optional)" />
              </SelectTrigger>
              <SelectContent>
                {cancelReasonOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.cancel_reason && (
            <div className="space-y-1.5">
              <Label htmlFor="ce-reason-text">Cancel Reason Detail</Label>
              <Input
                id="ce-reason-text"
                placeholder="Optional free-text elaboration"
                value={form.cancel_reason_text}
                onChange={(e) => set("cancel_reason_text", e.target.value)}
              />
            </div>
          )}

          {/* Provider IDs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ce-customer-id">Provider Customer ID</Label>
              <Input
                id="ce-customer-id"
                placeholder="cus_xxxx"
                value={form.provider_customer_id}
                onChange={(e) => set("provider_customer_id", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce-sub-id">Provider Subscription ID</Label>
              <Input
                id="ce-sub-id"
                placeholder="sub_xxxx"
                value={form.provider_subscription_id}
                onChange={(e) => set("provider_subscription_id", e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="ce-notes">Notes</Label>
            <Input
              id="ce-notes"
              placeholder="Internal notes (optional)"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventsContent() {
  const { slug } = useCurrentProject();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

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
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} total events</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
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

      <CreateEventModal slug={slug} open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
