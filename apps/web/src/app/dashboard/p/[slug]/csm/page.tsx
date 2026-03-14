"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useCSMAssignments,
  useCSMStats,
  useAssignCSM,
  useDeleteCSMAssignment,
} from "@/hooks/use-csm";
import type { CSMAssignment, CSMStats, CreateCSMAssignmentRequest } from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
  Skeleton,
  cn,
  toast,
} from "@windback/ui";
import {
  UserCheck,
  Plus,
  Trash2,
  Loader2,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function CSMPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: assignments, isLoading: assignmentsLoading } =
    useCSMAssignments(slug);
  const { data: stats, isLoading: statsLoading } = useCSMStats(slug);
  const assignCSM = useAssignCSM(slug);
  const deleteAssignment = useDeleteCSMAssignment(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [csmUserId, setCsmUserId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setCustomerEmail("");
    setCsmUserId("");
    setPriority("medium");
    setNotes("");
  }

  function handleCreate() {
    if (!customerEmail.trim() || !csmUserId.trim()) return;
    assignCSM.mutate(
      {
        customer_email: customerEmail,
        csm_user_id: csmUserId,
        priority,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "CSM assigned" });
          setShowCreate(false);
          resetForm();
        },
        onError: (err) =>
          toast({
            title: "Failed to assign CSM",
            description: err.message,
            variant: "destructive",
          }),
      }
    );
  }

  function handleDelete(id: string) {
    deleteAssignment.mutate(id, {
      onSuccess: () => toast({ title: "Assignment removed" }),
      onError: (err) =>
        toast({
          title: "Failed to remove assignment",
          description: err.message,
          variant: "destructive",
        }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            CSM Assignments
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customer success manager assignments and track touchpoints.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Assign CSM
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assignments
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total_assignments}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Touchpoints
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.recent_touchpoints}
                </div>
              </CardContent>
            </Card>
            {Object.entries(stats.by_priority).map(([key, count]) => (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {key} Priority
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : null}
      </div>

      {/* Assignments List */}
      {assignmentsLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !assignments || assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <UserCheck className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No CSM assignments yet. Assign a CSM to a customer to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="transition-colors hover:shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium truncate">
                    {assignment.customer_email}
                  </CardTitle>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      PRIORITY_COLORS[assignment.priority] ??
                        PRIORITY_COLORS.medium
                    )}
                  >
                    {assignment.priority}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">
                    {assignment.csm_name}
                  </span>
                </div>
                {assignment.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {assignment.notes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Assigned{" "}
                  {new Date(assignment.assigned_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </p>
                <div className="flex items-center gap-1 border-t border-border pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(assignment.id)}
                    disabled={deleteAssignment.isPending}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign CSM</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="csm-customer-email">Customer Email</Label>
              <Input
                id="csm-customer-email"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="csm-user-id">CSM User ID</Label>
              <Input
                id="csm-user-id"
                placeholder="CSM user identifier"
                value={csmUserId}
                onChange={(e) => setCsmUserId(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="csm-notes">Notes (optional)</Label>
              <Textarea
                id="csm-notes"
                placeholder="Additional context about this assignment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                assignCSM.isPending ||
                !customerEmail.trim() ||
                !csmUserId.trim()
              }
            >
              {assignCSM.isPending ? "Assigning..." : "Assign CSM"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
