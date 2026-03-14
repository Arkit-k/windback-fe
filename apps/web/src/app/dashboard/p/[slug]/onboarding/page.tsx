"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useOnboardingMilestones,
  useOnboardingStats,
  useCreateMilestone,
  useDeleteMilestone,
} from "@/hooks/use-onboarding";
import type {
  OnboardingMilestone,
  OnboardingStats,
  MilestoneDropoff,
} from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Skeleton,
  cn,
} from "@windback/ui";
import {
  Plus,
  Trash2,
  ListChecks,
  Users,
  CheckCircle2,
  BarChart3,
  Loader2,
  TrendingDown,
} from "lucide-react";

export default function OnboardingPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: milestones, isLoading: milestonesLoading } =
    useOnboardingMilestones(slug);
  const { data: stats, isLoading: statsLoading } = useOnboardingStats(slug);
  const createMilestone = useCreateMilestone(slug);
  const deleteMilestone = useDeleteMilestone(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("0");

  function resetForm() {
    setName("");
    setDescription("");
    setSortOrder("0");
  }

  function handleCreate() {
    if (!name.trim()) return;
    createMilestone.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        sort_order: parseInt(sortOrder) || 0,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          resetForm();
        },
      },
    );
  }

  function handleDelete(id: string) {
    deleteMilestone.mutate(id);
  }

  const maxCompletions =
    stats?.dropoff && stats.dropoff.length > 0
      ? Math.max(...stats.dropoff.map((d) => d.completions))
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Onboarding
          </h1>
          <p className="text-sm text-muted-foreground">
            Track customer onboarding milestones and identify dropoff points.
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setShowCreate(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="milestone-name">Name</Label>
                <Input
                  id="milestone-name"
                  placeholder="e.g. Account Created"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="milestone-desc">Description</Label>
                <Textarea
                  id="milestone-desc"
                  placeholder="Describe this milestone..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="milestone-order">Sort Order</Label>
                <Input
                  id="milestone-order"
                  type="number"
                  placeholder="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMilestone.isPending || !name.trim()}
              >
                {createMilestone.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Customers Tracked
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.total_customers ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Fully Onboarded
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.fully_onboarded ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Completion
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.avg_completion_percent?.toFixed(1) ?? "0"}%
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {milestonesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !milestones || milestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <ListChecks className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No milestones yet. Add your first milestone to start tracking
                onboarding.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {milestone.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Order: {milestone.sort_order}
                        </Badge>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(milestone.id)}
                      disabled={deleteMilestone.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dropoff Funnel */}
      {stats?.dropoff && stats.dropoff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Dropoff Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.dropoff.map((step, i) => {
                const widthPercent =
                  maxCompletions > 0
                    ? (step.completions / maxCompletions) * 100
                    : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {step.milestone_name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {step.completions} completions
                        </span>
                        <Badge
                          variant={
                            step.dropoff_rate > 30 ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {step.dropoff_rate.toFixed(1)}% dropoff
                        </Badge>
                      </div>
                    </div>
                    <div className="h-3 w-full rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-3 rounded-full transition-all",
                          step.dropoff_rate > 30
                            ? "bg-destructive/70"
                            : "bg-primary",
                        )}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
