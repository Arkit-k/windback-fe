"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentProject } from "@/providers/project-provider";
import { useCampaign, useUpdateCampaign, useDeleteCampaign, useDuplicateCampaign } from "@/hooks/use-campaigns";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS } from "@/lib/constants";
import { BarChart } from "@/components/dashboard/mini-chart";
import type { BarChartDatum } from "@/components/dashboard/mini-chart";
import type { CampaignType, CampaignGoal } from "@/types/api";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  toast,
} from "@windback/ui";
import { ArrowLeft, Loader2, Trash2, TrendingUp, TrendingDown, Minus, Target, Copy, Pencil, Plus, X } from "lucide-react";
import { CampaignPDFExportButton } from "@/components/dashboard/campaign-pdf-export";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const GOAL_METRIC_LABELS: Record<string, string> = {
  revenue_increase_cents: "Revenue Increase",
  new_signups: "New Signups",
  churn_reduction: "Churn Reduction",
  recovery_rate: "Recovery Rate",
  payment_recovery: "Payment Recovery",
};

const GOAL_METRIC_OPTIONS = GOAL_METRIC_LABELS;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBudget(cents: number | undefined, curr: string) {
  if (!cents) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: curr }).format(cents / 100);
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function liftPercent(during: number, baseline: number): number {
  if (baseline === 0) return during > 0 ? 100 : 0;
  return ((during - baseline) / baseline) * 100;
}

function LiftBadge({ lift }: { lift: number }) {
  if (lift > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600">
        <TrendingUp className="h-3 w-3" />+{lift.toFixed(1)}%
      </span>
    );
  if (lift < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600">
        <TrendingDown className="h-3 w-3" />{lift.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
      <Minus className="h-3 w-3" />0%
    </span>
  );
}

function MetricCard({
  label,
  during,
  baseline,
  lift,
  formatValue,
}: {
  label: string;
  during: number;
  baseline: number;
  lift: number;
  formatValue?: (v: number) => string;
}) {
  const fmt = formatValue ?? ((v: number) => v.toString());
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <LiftBadge lift={lift} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">During Campaign</p>
          <p className="text-lg font-semibold text-foreground">{fmt(during)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Baseline</p>
          <p className="text-lg font-semibold text-muted-foreground">{fmt(baseline)}</p>
        </div>
      </div>
    </div>
  );
}

function GoalProgress({
  metric,
  target,
  actual,
}: {
  metric: string;
  target: number;
  actual: number;
}) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  const isAchieved = actual >= target;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {GOAL_METRIC_LABELS[metric] ?? metric.replace(/_/g, " ")}
          </span>
        </div>
        <span className={`text-xs font-medium ${isAchieved ? "text-green-600" : "text-muted-foreground"}`}>
          {actual.toLocaleString()} / {target.toLocaleString()}
        </span>
      </div>
      <div className="mt-3">
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAchieved ? "bg-green-500" : "bg-[var(--accent)]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
      </div>
    </div>
  );
}

export default function CampaignDetailPage() {
  const { slug } = useCurrentProject();
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const { data: campaign, isLoading } = useCampaign(slug, campaignId);
  const updateCampaign = useUpdateCampaign(slug);
  const deleteCampaign = useDeleteCampaign(slug);
  const duplicateCampaign = useDuplicateCampaign(slug);

  // Edit dialog state
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<CampaignType>("paid_ads");
  const [editBudget, setEditBudget] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editGoals, setEditGoals] = useState<CampaignGoal[]>([]);

  const editDateError = editStartsAt && editEndsAt && new Date(editEndsAt) <= new Date(editStartsAt)
    ? "End date must be after start date"
    : null;

  function openEditDialog() {
    if (!campaign) return;
    setEditName(campaign.name);
    setEditDescription(campaign.description || "");
    setEditType(campaign.campaign_type as CampaignType);
    setEditBudget(campaign.budget_cents ? (campaign.budget_cents / 100).toString() : "");
    setEditCurrency(campaign.currency);
    setEditStartsAt(campaign.starts_at.slice(0, 10));
    setEditEndsAt(campaign.ends_at.slice(0, 10));
    setEditGoals(campaign.goals.length > 0 ? [...campaign.goals] : [{ metric: "revenue_increase_cents", target: 0 }]);
    setShowEdit(true);
  }

  function handleEdit() {
    if (!editName.trim() || !editStartsAt || !editEndsAt || editDateError) return;
    const budget = editBudget ? Math.round(parseFloat(editBudget) * 100) : undefined;
    updateCampaign.mutate(
      {
        id: campaignId,
        name: editName,
        description: editDescription,
        campaign_type: editType,
        budget_cents: budget,
        currency: editCurrency,
        goals: editGoals.filter((g) => g.target > 0),
        starts_at: new Date(editStartsAt).toISOString(),
        ends_at: new Date(editEndsAt).toISOString(),
      },
      {
        onSuccess: () => {
          toast({ title: "Campaign updated" });
          setShowEdit(false);
        },
        onError: (err) =>
          toast({ title: "Failed to update campaign", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleStatusChange(status: string) {
    updateCampaign.mutate(
      { id: campaignId, status: status as "draft" | "active" | "paused" | "completed" },
      {
        onSuccess: () => toast({ title: `Campaign ${status}` }),
        onError: (err) =>
          toast({ title: "Failed to update campaign", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleDelete() {
    deleteCampaign.mutate(campaignId, {
      onSuccess: () => {
        toast({ title: "Campaign deleted" });
        router.push(`/dashboard/p/${slug}/campaigns`);
      },
      onError: (err) =>
        toast({ title: "Failed to delete campaign", description: err.message, variant: "destructive" }),
    });
  }

  function handleDuplicate() {
    duplicateCampaign.mutate(campaignId, {
      onSuccess: () => toast({ title: "Campaign duplicated" }),
      onError: (err) =>
        toast({ title: "Failed to duplicate campaign", description: err.message, variant: "destructive" }),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        Campaign not found.
      </div>
    );
  }

  const m = campaign.metrics;

  // Compute goal actuals from metrics
  function getGoalActual(metric: string): number {
    switch (metric) {
      case "revenue_increase_cents":
        return Math.max(0, m.revenue_cents_during - m.revenue_cents_baseline);
      case "new_signups":
        return m.new_customers_during;
      case "churn_reduction":
        return Math.max(0, m.churn_events_baseline - m.churn_events_during);
      case "recovery_rate":
        return m.recoveries_during;
      case "payment_recovery":
        return m.payment_recoveries_during;
      default:
        return 0;
    }
  }

  // Build bar chart data for comparison visualization
  const comparisonChart: BarChartDatum[] = [
    {
      label: "Revenue ($)",
      values: [
        { value: m.revenue_cents_during / 100, color: "#6366f1", name: "During" },
        { value: m.revenue_cents_baseline / 100, color: "#94a3b8", name: "Baseline" },
      ],
    },
    {
      label: "Churn Events",
      values: [
        { value: m.churn_events_during, color: "#6366f1", name: "During" },
        { value: m.churn_events_baseline, color: "#94a3b8", name: "Baseline" },
      ],
    },
    {
      label: "Recoveries",
      values: [
        { value: m.recoveries_during, color: "#6366f1", name: "During" },
        { value: m.recoveries_baseline, color: "#94a3b8", name: "Baseline" },
      ],
    },
    {
      label: "Pmt Failures",
      values: [
        { value: m.payment_failures_during, color: "#6366f1", name: "During" },
        { value: m.payment_failures_baseline, color: "#94a3b8", name: "Baseline" },
      ],
    },
    {
      label: "Pmt Recovered",
      values: [
        { value: m.payment_recoveries_during, color: "#6366f1", name: "During" },
        { value: m.payment_recoveries_baseline, color: "#94a3b8", name: "Baseline" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push(`/dashboard/p/${slug}/campaigns`)}
          className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold text-foreground">
                {campaign.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[campaign.status] ?? STATUS_COLORS.draft}`}
              >
                {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {CAMPAIGN_TYPE_LABELS[campaign.campaign_type] ?? campaign.campaign_type}
              {campaign.description && ` — ${campaign.description}`}
            </p>
          </div>
          <div className="flex gap-2">
            <CampaignPDFExportButton campaign={campaign} />
            <Button size="sm" variant="outline" onClick={openEditDialog}>
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={handleDuplicate} disabled={duplicateCampaign.isPending}>
              <Copy className="mr-1 h-4 w-4" /> Duplicate
            </Button>
            {campaign.status === "draft" && (
              <Button size="sm" onClick={() => handleStatusChange("active")} disabled={updateCampaign.isPending}>
                Activate
              </Button>
            )}
            {campaign.status === "active" && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange("paused")} disabled={updateCampaign.isPending}>
                Pause
              </Button>
            )}
            {(campaign.status === "active" || campaign.status === "paused") && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange("completed")} disabled={updateCampaign.isPending}>
                Complete
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleteCampaign.isPending}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Campaign Info + ROI */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Date Range</p>
          <p className="mt-1 text-sm font-medium">
            {formatDate(campaign.starts_at)} — {formatDate(campaign.ends_at)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="mt-1 text-sm font-medium">
            {formatBudget(campaign.budget_cents, campaign.currency)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Goals</p>
          <p className="mt-1 text-sm font-medium">
            {campaign.goals.length > 0
              ? campaign.goals.map((g) => GOAL_METRIC_LABELS[g.metric] ?? g.metric.replace(/_/g, " ")).join(", ")
              : "None set"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">ROI</p>
          <p className="mt-1 text-sm font-medium">
            {m.roi_percent != null ? (
              <span className={m.roi_percent >= 0 ? "text-green-600" : "text-red-600"}>
                {m.roi_percent >= 0 ? "+" : ""}{m.roi_percent.toFixed(1)}%
              </span>
            ) : (
              <span className="text-muted-foreground">Set budget to calculate</span>
            )}
          </p>
        </div>
      </div>

      {/* Goal Progress Bars */}
      {campaign.goals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Goal Progress</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {campaign.goals.map((goal, i) => (
              <GoalProgress
                key={i}
                metric={goal.metric}
                target={goal.target}
                actual={getGoalActual(goal.metric)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Comparison Bar Chart */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Campaign vs Baseline Overview</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <BarChart data={comparisonChart} height={260} />
        </div>
      </div>

      {/* Detailed Metrics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Revenue (Recovered)"
            during={m.revenue_cents_during}
            baseline={m.revenue_cents_baseline}
            lift={m.revenue_lift_percent}
            formatValue={formatCents}
          />
          <MetricCard
            label="Churn Customers"
            during={m.new_customers_during}
            baseline={m.new_customers_baseline}
            lift={liftPercent(m.new_customers_during, m.new_customers_baseline)}
          />
          <MetricCard
            label="Churn Events"
            during={m.churn_events_during}
            baseline={m.churn_events_baseline}
            lift={liftPercent(m.churn_events_during, m.churn_events_baseline)}
          />
          <MetricCard
            label="Recoveries"
            during={m.recoveries_during}
            baseline={m.recoveries_baseline}
            lift={liftPercent(m.recoveries_during, m.recoveries_baseline)}
          />
          <MetricCard
            label="Payment Failures"
            during={m.payment_failures_during}
            baseline={m.payment_failures_baseline}
            lift={liftPercent(m.payment_failures_during, m.payment_failures_baseline)}
          />
          <MetricCard
            label="Payments Recovered"
            during={m.payment_recoveries_during}
            baseline={m.payment_recoveries_baseline}
            lift={liftPercent(m.payment_recoveries_during, m.payment_recoveries_baseline)}
          />
          <MetricCard
            label="Payment Amount Recovered"
            during={m.payment_amount_recovered_during}
            baseline={m.payment_amount_recovered_baseline}
            lift={liftPercent(m.payment_amount_recovered_during, m.payment_amount_recovered_baseline)}
            formatValue={formatCents}
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-desc">Description</Label>
              <Input id="edit-desc" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Campaign Type</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v as CampaignType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-budget">Budget</Label>
                <Input id="edit-budget" type="number" step="0.01" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-currency">Currency</Label>
                <Input id="edit-currency" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-start">Start Date</Label>
                <Input id="edit-start" type="date" value={editStartsAt} onChange={(e) => setEditStartsAt(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-end">End Date</Label>
                <Input id="edit-end" type="date" value={editEndsAt} onChange={(e) => setEditEndsAt(e.target.value)} />
              </div>
            </div>
            {editDateError && <p className="text-xs text-destructive">{editDateError}</p>}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Goals</Label>
                <Button variant="ghost" size="sm" onClick={() => setEditGoals([...editGoals, { metric: "revenue_increase_cents", target: 0 }])} type="button">
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
              {editGoals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={goal.metric} onValueChange={(v) => setEditGoals(editGoals.map((g, j) => j === i ? { ...g, metric: v } : g))}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(GOAL_METRIC_OPTIONS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="w-24"
                    type="number"
                    placeholder="Target"
                    value={goal.target || ""}
                    onChange={(e) => setEditGoals(editGoals.map((g, j) => j === i ? { ...g, target: parseInt(e.target.value) || 0 } : g))}
                  />
                  {editGoals.length > 1 && (
                    <button type="button" onClick={() => setEditGoals(editGoals.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateCampaign.isPending || !editName.trim() || !editStartsAt || !editEndsAt || !!editDateError}>
              {updateCampaign.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
