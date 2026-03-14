"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCustomDashboards,
  useCreateDashboard,
  useDeleteDashboard,
} from "@/hooks/use-custom-dashboards";
import type { CustomDashboard } from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Skeleton,
} from "@windback/ui";
import {
  Plus,
  Trash2,
  Loader2,
  LayoutDashboard,
  BarChart3,
  Star,
} from "lucide-react";

export default function DashboardsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const { data: dashboards, isLoading } = useCustomDashboards(slug);
  const createDashboard = useCreateDashboard(slug);
  const deleteDashboard = useDeleteDashboard(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  function resetForm() {
    setName("");
  }

  function handleCreate() {
    if (!name.trim()) return;
    createDashboard.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setShowCreate(false);
          resetForm();
        },
      },
    );
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteDashboard.mutate(id);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Dashboards
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage custom dashboards with widgets.
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
              New Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="dashboard-name">Name</Label>
                <Input
                  id="dashboard-name"
                  placeholder="e.g. Revenue Overview"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
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
                disabled={createDashboard.isPending || !name.trim()}
              >
                {createDashboard.isPending ? (
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

      {/* Dashboard Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !dashboards || dashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <LayoutDashboard className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No dashboards yet. Create your first custom dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((dashboard) => (
            <Card
              key={dashboard.id}
              className="cursor-pointer transition-colors hover:border-[var(--accent)] hover:shadow-sm"
              onClick={() =>
                router.push(
                  `/dashboard/p/${slug}/dashboards/${dashboard.id}`,
                )
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {dashboard.name}
                      </h3>
                      {dashboard.is_default && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 text-xs"
                        >
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {dashboard.layout?.length ?? 0} widgets
                      </span>
                      <span>Created {formatDate(dashboard.created_at)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => handleDelete(e, dashboard.id)}
                    disabled={deleteDashboard.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
