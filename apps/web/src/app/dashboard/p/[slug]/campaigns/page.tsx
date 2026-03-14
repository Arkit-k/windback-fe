"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useCampaigns,
  useCreateCampaign,
  useDeleteCampaign,
  useUpdateCampaign,
  useDuplicateCampaign,
} from "@/hooks/use-campaigns";
import type { CampaignFilters } from "@/hooks/use-campaigns";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS, ITEMS_PER_PAGE } from "@/lib/constants";
import type { Campaign, CampaignType, CampaignGoal, CampaignStatus } from "@/types/api";
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
import { Megaphone, Plus, Trash2, X, Loader2, Calendar, DollarSign, ArrowUpDown, Search, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { CampaignListPDFExportButton } from "@/components/dashboard/campaign-pdf-export";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const GOAL_METRIC_OPTIONS: Record<string, string> = {
  revenue_increase_cents: "Revenue Increase",
  new_signups: "New Signups",
  churn_reduction: "Churn Reduction",
  recovery_rate: "Recovery Rate",
  payment_recovery: "Payment Recovery",
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "created_at", label: "Date Created" },
  { value: "name", label: "Name" },
  { value: "starts_at", label: "Start Date" },
  { value: "budget_cents", label: "Budget" },
];

export default function CampaignsPage() {
  const { slug } = useCurrentProject();
  const router = useRouter();

  // Filter / sort / pagination state
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<string>("desc");
  const [page, setPage] = useState(1);

  const filters = useMemo<CampaignFilters>(() => ({
    status: filterStatus !== "all" ? filterStatus : undefined,
    type: filterType !== "all" ? filterType : undefined,
    search: searchQuery.trim() || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
    page,
  }), [filterStatus, filterType, searchQuery, sortBy, sortDir, page]);

  const { data: campaignData, isLoading, isFetching } = useCampaigns(slug, filters);
  const campaigns = campaignData?.data;
  const totalPages = Math.ceil((campaignData?.total ?? 0) / ITEMS_PER_PAGE);

  const createCampaign = useCreateCampaign(slug);
  const deleteCampaign = useDeleteCampaign(slug);
  const updateCampaign = useUpdateCampaign(slug);
  const duplicateCampaign = useDuplicateCampaign(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState<CampaignType>("paid_ads");
  const [budgetCents, setBudgetCents] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [goals, setGoals] = useState<CampaignGoal[]>([
    { metric: "revenue_increase_cents", target: 0 },
  ]);

  const dateError = startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)
    ? "End date must be after start date"
    : null;

  function resetForm() {
    setName("");
    setDescription("");
    setCampaignType("paid_ads");
    setBudgetCents("");
    setCurrency("USD");
    setStartsAt("");
    setEndsAt("");
    setGoals([{ metric: "revenue_increase_cents", target: 0 }]);
  }

  function handleCreate() {
    if (!name.trim() || !startsAt || !endsAt || dateError) return;
    const budget = budgetCents ? Math.round(parseFloat(budgetCents) * 100) : undefined;
    createCampaign.mutate(
      {
        name,
        description: description || undefined,
        campaign_type: campaignType,
        budget_cents: budget,
        currency,
        goals: goals.filter((g) => g.target > 0),
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
      },
      {
        onSuccess: () => {
          toast({ title: "Campaign created" });
          setShowCreate(false);
          resetForm();
        },
        onError: (err) =>
          toast({ title: "Failed to create campaign", description: err.message, variant: "destructive" }),
      },
    );
  }

  function openEditDialog(campaign: Campaign) {
    setEditCampaign(campaign);
    setName(campaign.name);
    setDescription(campaign.description || "");
    setCampaignType(campaign.campaign_type as CampaignType);
    setBudgetCents(campaign.budget_cents ? (campaign.budget_cents / 100).toString() : "");
    setCurrency(campaign.currency);
    setStartsAt(campaign.starts_at.slice(0, 10));
    setEndsAt(campaign.ends_at.slice(0, 10));
    setGoals(campaign.goals.length > 0 ? campaign.goals : [{ metric: "revenue_increase_cents", target: 0 }]);
  }

  function handleEdit() {
    if (!editCampaign || !name.trim() || !startsAt || !endsAt || dateError) return;
    const budget = budgetCents ? Math.round(parseFloat(budgetCents) * 100) : undefined;
    updateCampaign.mutate(
      {
        id: editCampaign.id,
        name,
        description,
        campaign_type: campaignType,
        budget_cents: budget,
        currency,
        goals: goals.filter((g) => g.target > 0),
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
      },
      {
        onSuccess: () => {
          toast({ title: "Campaign updated" });
          setEditCampaign(null);
          resetForm();
        },
        onError: (err) =>
          toast({ title: "Failed to update campaign", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleDelete(campaignId: string) {
    deleteCampaign.mutate(campaignId, {
      onSuccess: () => {
        toast({ title: "Campaign deleted" });
      },
      onError: (err) =>
        toast({ title: "Failed to delete campaign", description: err.message, variant: "destructive" }),
    });
  }

  function handleDuplicate(campaignId: string) {
    duplicateCampaign.mutate(campaignId, {
      onSuccess: () => toast({ title: "Campaign duplicated" }),
      onError: (err) =>
        toast({ title: "Failed to duplicate campaign", description: err.message, variant: "destructive" }),
    });
  }

  function addGoal() {
    setGoals([...goals, { metric: "revenue_increase_cents", target: 0 }]);
  }

  function removeGoal(index: number) {
    if (goals.length <= 1) return;
    setGoals(goals.filter((_, i) => i !== index));
  }

  function updateGoal(index: number, field: keyof CampaignGoal, value: string | number) {
    setGoals(goals.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatBudget(cents: number | undefined, curr: string) {
    if (!cents) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
    }).format(cents / 100);
  }

  function toggleSortDir() {
    setSortDir(sortDir === "desc" ? "asc" : "desc");
    setPage(1);
  }

  // Campaign form dialog (shared between create and edit)
  function CampaignFormDialog({
    open,
    onOpenChange,
    title,
    descriptionText,
    submitLabel,
    onSubmit,
    isPending,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    descriptionText: string;
    submitLabel: string;
    onSubmit: () => void;
    isPending: boolean;
  }) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{descriptionText}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label htmlFor="campaign-name">Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g. Spring Paid Ads Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="campaign-desc">Description (optional)</Label>
              <Input
                id="campaign-desc"
                placeholder="What is this campaign about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Campaign Type</Label>
              <Select value={campaignType} onValueChange={(v) => setCampaignType(v as CampaignType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="campaign-budget">Budget</Label>
                <Input
                  id="campaign-budget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={budgetCents}
                  onChange={(e) => setBudgetCents(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="campaign-currency">Currency</Label>
                <Input
                  id="campaign-currency"
                  placeholder="USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="campaign-start">Start Date</Label>
                <Input
                  id="campaign-start"
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="campaign-end">End Date</Label>
                <Input
                  id="campaign-end"
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
            {dateError && (
              <p className="text-xs text-destructive">{dateError}</p>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Goals</Label>
                <Button variant="ghost" size="sm" onClick={addGoal} type="button">
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
              {goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={goal.metric}
                    onValueChange={(v) => updateGoal(i, "metric", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GOAL_METRIC_OPTIONS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="w-24"
                    type="number"
                    placeholder="Target"
                    value={goal.target || ""}
                    onChange={(e) => updateGoal(i, "target", parseInt(e.target.value) || 0)}
                  />
                  {goals.length > 1 && (
                    <button type="button" onClick={() => removeGoal(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isPending || !name.trim() || !startsAt || !endsAt || !!dateError}
            >
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Track marketing campaigns and measure their impact on revenue and churn.
          </p>
        </div>
        <div className="flex gap-2">
          {campaigns && campaigns.length > 0 && (
            <CampaignListPDFExportButton campaigns={campaigns} />
          )}
          <Button onClick={() => { resetForm(); setShowCreate(true); }} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Search + Filters + Sorting */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 w-48 pl-8 text-xs"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Type:</span>
          <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={toggleSortDir}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title={sortDir === "desc" ? "Descending" : "Ascending"}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Campaign Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {filterStatus !== "all" || filterType !== "all" || searchQuery.trim()
              ? "No campaigns match your filters."
              : "No campaigns yet. Create your first campaign to start tracking."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-[var(--accent)] hover:shadow-sm">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/p/${slug}/campaigns/${campaign.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground truncate">{campaign.name}</h3>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[campaign.status] ?? STATUS_COLORS.draft}`}
                    >
                      {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {CAMPAIGN_TYPE_LABELS[campaign.campaign_type] ?? campaign.campaign_type}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(campaign.starts_at)} — {formatDate(campaign.ends_at)}
                    </span>
                  </div>
                  {campaign.budget_cents && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      {formatBudget(campaign.budget_cents, campaign.currency)}
                    </div>
                  )}
                </button>
                <div className="mt-3 flex items-center gap-1 border-t border-border pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => { e.stopPropagation(); openEditDialog(campaign); }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(campaign.id); }}
                    disabled={duplicateCampaign.isPending}
                  >
                    <Copy className="mr-1 h-3 w-3" /> Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(campaign.id); }}
                    disabled={deleteCampaign.isPending}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({campaignData?.total ?? 0} campaigns)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <CampaignFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Create Campaign"
        descriptionText="Set up a marketing campaign to track its impact on revenue and churn."
        submitLabel="Create Campaign"
        onSubmit={handleCreate}
        isPending={createCampaign.isPending}
      />

      {/* Edit Dialog */}
      <CampaignFormDialog
        open={!!editCampaign}
        onOpenChange={(v) => { if (!v) { setEditCampaign(null); resetForm(); } }}
        title="Edit Campaign"
        descriptionText="Update campaign details."
        submitLabel="Save Changes"
        onSubmit={handleEdit}
        isPending={updateCampaign.isPending}
      />
    </div>
  );
}
