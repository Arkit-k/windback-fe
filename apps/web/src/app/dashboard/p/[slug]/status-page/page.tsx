"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useStatusIncidents,
  useStatusPageConfig,
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
  useUpdateStatusPageConfig,
} from "@/hooks/use-status-page";
import type {
  StatusIncident,
  StatusPageConfig,
  IncidentStatus,
  IncidentSeverity,
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  cn,
} from "@windback/ui";
import {
  Plus,
  Trash2,
  Loader2,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Radio,
  X,
} from "lucide-react";

const SEVERITY_COLORS: Record<string, string> = {
  minor:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  major:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const STATUS_COLORS: Record<string, string> = {
  investigating:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  identified:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  monitoring:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  resolved:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const INCIDENT_STATUSES: IncidentStatus[] = [
  "investigating",
  "identified",
  "monitoring",
  "resolved",
];

const INCIDENT_SEVERITIES: IncidentSeverity[] = ["minor", "major", "critical"];

export default function StatusPagePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: incidents, isLoading: incidentsLoading } =
    useStatusIncidents(slug);
  const { data: config, isLoading: configLoading } =
    useStatusPageConfig(slug);
  const createIncident = useCreateIncident(slug);
  const updateIncident = useUpdateIncident(slug);
  const deleteIncident = useDeleteIncident(slug);
  const updateConfig = useUpdateStatusPageConfig(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("minor");
  const [affectedComponents, setAffectedComponents] = useState("");
  const [newComponent, setNewComponent] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setSeverity("minor");
    setAffectedComponents("");
  }

  function handleCreate() {
    if (!title.trim()) return;
    const components = affectedComponents
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    createIncident.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        severity,
        affected_components: components.length > 0 ? components : undefined,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          resetForm();
        },
      },
    );
  }

  function handleUpdateStatus(id: string, status: IncidentStatus) {
    updateIncident.mutate({ id, status });
  }

  function handleDeleteIncident(id: string) {
    deleteIncident.mutate(id);
  }

  function togglePublic() {
    if (!config) return;
    updateConfig.mutate({ is_public: !config.is_public });
  }

  function handleAddComponent() {
    if (!newComponent.trim() || !config) return;
    const updated = [...(config.components ?? []), newComponent.trim()];
    updateConfig.mutate({ components: updated });
    setNewComponent("");
  }

  function handleRemoveComponent(component: string) {
    if (!config) return;
    const updated = config.components.filter((c) => c !== component);
    updateConfig.mutate({ components: updated });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Status Page
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your public status page, components, and incidents.
        </p>
      </div>

      {/* Config Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : config ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Public Status Page
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Allow anyone to view your status page.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePublic}
                  disabled={updateConfig.isPending}
                >
                  {config.is_public ? (
                    <>
                      <Eye className="mr-2 h-3 w-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-3 w-3" />
                      Private
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Components
                </p>
                <div className="flex flex-wrap gap-2">
                  {config.components.map((component) => (
                    <Badge
                      key={component}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {component}
                      <button
                        onClick={() => handleRemoveComponent(component)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a component..."
                    value={newComponent}
                    onChange={(e) => setNewComponent(e.target.value)}
                    className="max-w-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddComponent();
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddComponent}
                    disabled={!newComponent.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Incidents */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Incidents</h2>
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
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="incident-title">Title</Label>
                <Input
                  id="incident-title"
                  placeholder="e.g. API Degraded Performance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="incident-desc">Description</Label>
                <Textarea
                  id="incident-desc"
                  placeholder="Describe the incident..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Severity</Label>
                <Select
                  value={severity}
                  onValueChange={(v) => setSeverity(v as IncidentSeverity)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="incident-components">
                  Affected Components (comma-separated)
                </Label>
                <Input
                  id="incident-components"
                  placeholder="e.g. API, Dashboard, Webhooks"
                  value={affectedComponents}
                  onChange={(e) => setAffectedComponents(e.target.value)}
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
                disabled={createIncident.isPending || !title.trim()}
              >
                {createIncident.isPending ? (
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

      {incidentsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !incidents || incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <Radio className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No incidents reported. All systems operational.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <Card key={incident.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground">
                        {incident.title}
                      </h3>
                      <Badge
                        className={cn(
                          "text-xs capitalize",
                          SEVERITY_COLORS[incident.severity],
                        )}
                      >
                        {incident.severity}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs capitalize",
                          STATUS_COLORS[incident.status],
                        )}
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    {incident.description && (
                      <p className="text-sm text-muted-foreground">
                        {incident.description}
                      </p>
                    )}
                    {incident.affected_components.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          Affected:
                        </span>
                        {incident.affected_components.map((c) => (
                          <Badge
                            key={c}
                            variant="outline"
                            className="text-xs"
                          >
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Started: {formatDate(incident.started_at)}</span>
                      {incident.resolved_at && (
                        <span>
                          Resolved: {formatDate(incident.resolved_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={incident.status}
                      onValueChange={(v) =>
                        handleUpdateStatus(
                          incident.id,
                          v as IncidentStatus,
                        )
                      }
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INCIDENT_STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="capitalize text-xs"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteIncident(incident.id)}
                      disabled={deleteIncident.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
