"use client";

import { useState, useCallback } from "react";
import { Button, Input, Label, Badge } from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  usePlaybooks,
  useCreatePlaybook,
  useUpdatePlaybook,
  useDeletePlaybook,
  useTogglePlaybook,
  usePlaybookRuns,
} from "@/hooks/use-playbooks";
import type {
  Playbook,
  PlaybookStep,
  PlaybookStepType,
  PlaybookTriggerType,
  PlaybookTriggerConfig,
  PlaybookRun,
  CreatePlaybookRequest,
} from "@/types/api";
import {
  Plus,
  Workflow,
  Play,
  Pause,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Clock,
  Mail,
  MessageSquare,
  Gift,
  GitBranch,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Constants ---

const TRIGGER_LABELS: Record<PlaybookTriggerType, string> = {
  score_threshold: "Score Threshold",
  event_type: "Event Type",
  payment_failed: "Payment Failed",
  manual: "Manual",
};

const TRIGGER_COLORS: Record<PlaybookTriggerType, string> = {
  score_threshold: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  event_type: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  payment_failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  manual: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const STEP_TYPE_LABELS: Record<PlaybookStepType, string> = {
  send_email: "Send Email",
  wait: "Wait",
  send_slack: "Send Slack",
  offer_discount: "Offer Discount",
  check_condition: "Check Condition",
  webhook: "Webhook",
};

const STEP_TYPE_ICONS: Record<PlaybookStepType, React.ComponentType<{ className?: string }>> = {
  send_email: Mail,
  wait: Clock,
  send_slack: MessageSquare,
  offer_discount: Gift,
  check_condition: GitBranch,
  webhook: Globe,
};

const RUN_STATUS_STYLES: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  running: { icon: Loader2, color: "text-blue-500" },
  completed: { icon: CheckCircle2, color: "text-green-500" },
  failed: { icon: XCircle, color: "text-red-500" },
  cancelled: { icon: AlertCircle, color: "text-gray-400" },
};

type View = "list" | "create" | "edit" | "detail";

// --- Main Page ---

export default function PlaybooksPage() {
  const { slug } = useCurrentProject();
  const { data: playbooks, isLoading } = usePlaybooks(slug);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = playbooks?.find((p) => p.id === selectedId) ?? null;

  function openDetail(pb: Playbook) {
    setSelectedId(pb.id);
    setView("detail");
  }

  function openEdit(pb: Playbook) {
    setSelectedId(pb.id);
    setView("edit");
  }

  function goToList() {
    setView("list");
    setSelectedId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== "list" && (
            <Button variant="ghost" size="sm" onClick={goToList}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              {view === "create"
                ? "Create Playbook"
                : view === "edit"
                  ? "Edit Playbook"
                  : view === "detail"
                    ? selected?.name ?? "Playbook"
                    : "Playbooks"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === "list"
                ? "Automate churn recovery workflows with step-by-step playbooks."
                : view === "detail"
                  ? "View runs and configuration for this playbook."
                  : "Configure trigger, steps, and conditions."}
            </p>
          </div>
        </div>
        {view === "list" && (
          <Button size="sm" onClick={() => setView("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Playbook
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <PlaybookList
              playbooks={playbooks ?? []}
              isLoading={isLoading}
              slug={slug}
              onDetail={openDetail}
              onEdit={openEdit}
            />
          </motion.div>
        )}
        {view === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <PlaybookForm slug={slug} onDone={goToList} />
          </motion.div>
        )}
        {view === "edit" && selected && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <PlaybookForm slug={slug} playbook={selected} onDone={goToList} />
          </motion.div>
        )}
        {view === "detail" && selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <PlaybookDetail slug={slug} playbook={selected} onEdit={() => openEdit(selected)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- List View ---

function PlaybookList({
  playbooks,
  isLoading,
  slug,
  onDetail,
  onEdit,
}: {
  playbooks: Playbook[];
  isLoading: boolean;
  slug: string;
  onDetail: (pb: Playbook) => void;
  onEdit: (pb: Playbook) => void;
}) {
  const toggle = useTogglePlaybook(slug);
  const remove = useDeletePlaybook(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (playbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20">
        <Workflow className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No playbooks yet. Create one to start automating recovery workflows.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {playbooks.map((pb) => (
        <div
          key={pb.id}
          className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex items-start justify-between">
            <button
              onClick={() => onDetail(pb)}
              className="text-left font-medium text-foreground hover:underline"
            >
              {pb.name}
            </button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toggle.mutate(pb.id, {
                    onError: (err: Error) =>
                      toast({
                        title: "Toggle failed",
                        description: err.message,
                        variant: "destructive",
                      }),
                  })
                }
                disabled={toggle.isPending}
              >
                {pb.is_active ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>

          {pb.description && (
            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{pb.description}</p>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TRIGGER_COLORS[pb.trigger_type]}`}
            >
              {TRIGGER_LABELS[pb.trigger_type]}
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {pb.steps.length} step{pb.steps.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span>{pb.total_runs} run{pb.total_runs !== 1 ? "s" : ""}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEdit(pb)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() =>
                  remove.mutate(pb.id, {
                    onSuccess: () => toast({ title: "Playbook deleted" }),
                    onError: (err) =>
                      toast({
                        title: "Delete failed",
                        description: err.message,
                        variant: "destructive",
                      }),
                  })
                }
                disabled={remove.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Form (Create / Edit) ---

function generateStepId() {
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function PlaybookForm({
  slug,
  playbook,
  onDone,
}: {
  slug: string;
  playbook?: Playbook;
  onDone: () => void;
}) {
  const isEdit = !!playbook;
  const create = useCreatePlaybook(slug);
  const update = useUpdatePlaybook(slug, playbook?.id ?? "");

  const [name, setName] = useState(playbook?.name ?? "");
  const [description, setDescription] = useState(playbook?.description ?? "");
  const [triggerType, setTriggerType] = useState<PlaybookTriggerType>(
    playbook?.trigger_type ?? "score_threshold",
  );
  const [triggerConfig, setTriggerConfig] = useState<PlaybookTriggerConfig>(
    playbook?.trigger_config ?? { score_threshold: 80, score_direction: "above" },
  );
  const [steps, setSteps] = useState<PlaybookStep[]>(
    playbook?.steps.length
      ? playbook.steps
      : [{ id: generateStepId(), type: "send_email", config: { template: "", tone: "gentle_reminder" } }],
  );

  const moveStep = useCallback(
    (index: number, direction: -1 | 1) => {
      const newSteps = [...steps];
      const target = index + direction;
      if (target < 0 || target >= newSteps.length) return;
      [newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]];
      setSteps(newSteps);
    },
    [steps],
  );

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { id: generateStepId(), type: "send_email", config: {} },
    ]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStepType(index: number, type: PlaybookStepType) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, type, config: {} } : s)),
    );
  }

  function updateStepConfig(index: number, key: string, value: unknown) {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, config: { ...s.config, [key]: value } } : s,
      ),
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (steps.length === 0) {
      toast({ title: "At least one step is required", variant: "destructive" });
      return;
    }

    const payload: CreatePlaybookRequest = {
      name: name.trim(),
      description: description.trim(),
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      steps,
    };

    const mutation = isEdit ? update : create;

    mutation.mutate(payload as any, {
      onSuccess: () => {
        toast({ title: isEdit ? "Playbook updated" : "Playbook created" });
        onDone();
      },
      onError: (err) =>
        toast({
          title: isEdit ? "Update failed" : "Create failed",
          description: err.message,
          variant: "destructive",
        }),
    });
  }

  const isPending = create.isPending || update.isPending;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Name & Description */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label htmlFor="pb-name">Name</Label>
          <Input
            id="pb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. High-risk winback sequence"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pb-desc">Description</Label>
          <Input
            id="pb-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>
      </div>

      {/* Trigger */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground">Trigger</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Trigger Type</Label>
            <select
              value={triggerType}
              onChange={(e) => {
                const val = e.target.value as PlaybookTriggerType;
                setTriggerType(val);
                setTriggerConfig({});
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {(Object.keys(TRIGGER_LABELS) as PlaybookTriggerType[]).map((t) => (
                <option key={t} value={t}>
                  {TRIGGER_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {triggerType === "score_threshold" && (
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label>Threshold</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={triggerConfig.score_threshold ?? 80}
                  onChange={(e) =>
                    setTriggerConfig((prev) => ({
                      ...prev,
                      score_threshold: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label>Direction</Label>
                <select
                  value={triggerConfig.score_direction ?? "above"}
                  onChange={(e) =>
                    setTriggerConfig((prev) => ({
                      ...prev,
                      score_direction: e.target.value as "above" | "below",
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
            </div>
          )}

          {triggerType === "event_type" && (
            <div className="space-y-1.5">
              <Label>Event Type</Label>
              <Input
                value={triggerConfig.event_type ?? ""}
                onChange={(e) =>
                  setTriggerConfig((prev) => ({ ...prev, event_type: e.target.value }))
                }
                placeholder="e.g. cancel_button_clicked"
              />
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Steps</h3>
          <Button variant="outline" size="sm" onClick={addStep}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Step
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const Icon = STEP_TYPE_ICONS[step.type] ?? Workflow;
            return (
              <div
                key={step.id}
                className="rounded-md border border-border bg-background p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={step.type}
                      onChange={(e) => updateStepType(idx, e.target.value as PlaybookStepType)}
                      className="h-7 rounded border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {(Object.keys(STEP_TYPE_LABELS) as PlaybookStepType[]).map((t) => (
                        <option key={t} value={t}>
                          {STEP_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveStep(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveStep(idx, 1)}
                      disabled={idx === steps.length - 1}
                      className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeStep(idx)}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Step-specific config */}
                <StepConfigFields step={step} index={idx} onUpdate={updateStepConfig} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Playbook"}
        </Button>
      </div>
    </div>
  );
}

// --- Step Config Fields ---

function StepConfigFields({
  step,
  index,
  onUpdate,
}: {
  step: PlaybookStep;
  index: number;
  onUpdate: (index: number, key: string, value: unknown) => void;
}) {
  switch (step.type) {
    case "send_email":
      return (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Template</Label>
            <Input
              className="h-8 text-xs"
              value={(step.config.template as string) ?? ""}
              onChange={(e) => onUpdate(index, "template", e.target.value)}
              placeholder="Email template name"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tone</Label>
            <select
              value={(step.config.tone as string) ?? "gentle_reminder"}
              onChange={(e) => onUpdate(index, "tone", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="gentle_reminder">Gentle Reminder</option>
              <option value="urgency">Urgency</option>
              <option value="help_offer">Help Offer</option>
              <option value="final_warning">Final Warning</option>
            </select>
          </div>
        </div>
      );

    case "wait":
      return (
        <div className="mt-2 max-w-[200px] space-y-1">
          <Label className="text-xs">Wait (hours)</Label>
          <Input
            className="h-8 text-xs"
            type="number"
            min={1}
            value={(step.config.hours as number) ?? 72}
            onChange={(e) => onUpdate(index, "hours", Number(e.target.value))}
          />
        </div>
      );

    case "send_slack":
      return (
        <div className="mt-2 space-y-1">
          <Label className="text-xs">Message</Label>
          <Input
            className="h-8 text-xs"
            value={(step.config.message as string) ?? ""}
            onChange={(e) => onUpdate(index, "message", e.target.value)}
            placeholder="Slack message text"
          />
        </div>
      );

    case "offer_discount":
      return (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Discount %</Label>
            <Input
              className="h-8 text-xs"
              type="number"
              min={1}
              max={100}
              value={(step.config.percent as number) ?? 20}
              onChange={(e) => onUpdate(index, "percent", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Duration (days)</Label>
            <Input
              className="h-8 text-xs"
              type="number"
              min={1}
              value={(step.config.duration_days as number) ?? 30}
              onChange={(e) => onUpdate(index, "duration_days", Number(e.target.value))}
            />
          </div>
        </div>
      );

    case "check_condition":
      return (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Field</Label>
            <Input
              className="h-8 text-xs"
              value={(step.config.field as string) ?? ""}
              onChange={(e) => onUpdate(index, "field", e.target.value)}
              placeholder="e.g. responded"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Operator</Label>
            <select
              value={(step.config.operator as string) ?? "eq"}
              onChange={(e) => onUpdate(index, "operator", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="eq">Equals</option>
              <option value="neq">Not Equals</option>
              <option value="gt">Greater Than</option>
              <option value="lt">Less Than</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">If True (step #)</Label>
            <Input
              className="h-8 text-xs"
              type="number"
              min={1}
              value={(step.config.if_true_step as number) ?? ""}
              onChange={(e) => onUpdate(index, "if_true_step", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">If False (step #)</Label>
            <Input
              className="h-8 text-xs"
              type="number"
              min={1}
              value={(step.config.if_false_step as number) ?? ""}
              onChange={(e) => onUpdate(index, "if_false_step", Number(e.target.value))}
            />
          </div>
        </div>
      );

    case "webhook":
      return (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">URL</Label>
            <Input
              className="h-8 text-xs"
              value={(step.config.url as string) ?? ""}
              onChange={(e) => onUpdate(index, "url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Method</Label>
            <select
              value={(step.config.method as string) ?? "POST"}
              onChange={(e) => onUpdate(index, "method", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// --- Detail View ---

function PlaybookDetail({
  slug,
  playbook,
  onEdit,
}: {
  slug: string;
  playbook: Playbook;
  onEdit: () => void;
}) {
  const { data: runs, isLoading } = usePlaybookRuns(slug, playbook.id);

  return (
    <div className="space-y-6">
      {/* Info card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TRIGGER_COLORS[playbook.trigger_type]}`}
            >
              {TRIGGER_LABELS[playbook.trigger_type]}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                playbook.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {playbook.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>

        {playbook.description && (
          <p className="mb-4 text-sm text-muted-foreground">{playbook.description}</p>
        )}

        {/* Steps visualization */}
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Steps
        </h4>
        <div className="space-y-2">
          {playbook.steps.map((step, idx) => {
            const Icon = STEP_TYPE_ICONS[step.type] ?? Workflow;
            return (
              <div
                key={step.id}
                className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">{STEP_TYPE_LABELS[step.type]}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatStepConfig(step)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span>Total runs: {playbook.total_runs}</span>
          {playbook.last_run_at && (
            <span>Last run: {new Date(playbook.last_run_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Runs */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-3 text-sm font-medium text-foreground">Recent Runs</h4>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !runs || runs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No runs yet. Activate this playbook to start processing.
          </p>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => {
              const statusInfo = RUN_STATUS_STYLES[run.status] ?? RUN_STATUS_STYLES.cancelled;
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={run.id}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon
                      className={`h-4 w-4 ${statusInfo.color} ${run.status === "running" ? "animate-spin" : ""}`}
                    />
                    <div>
                      <span className="text-sm text-foreground">{run.customer_email}</span>
                      <div className="text-[10px] text-muted-foreground">
                        Step {run.current_step + 1} of {playbook.steps.length}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="capitalize">{run.status}</div>
                    <div>{new Date(run.started_at).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helpers ---

function formatStepConfig(step: PlaybookStep): string {
  const c = step.config;
  switch (step.type) {
    case "send_email":
      return c.tone ? `Tone: ${c.tone}` : "";
    case "wait":
      return c.hours ? `${c.hours}h` : "";
    case "send_slack":
      return c.message ? String(c.message).slice(0, 30) : "";
    case "offer_discount":
      return c.percent ? `${c.percent}% off` : "";
    case "check_condition":
      return c.field ? `${c.field} ${c.operator ?? "eq"} ...` : "";
    case "webhook":
      return c.method ? `${c.method} ${c.url ? String(c.url).slice(0, 20) : ""}` : "";
    default:
      return "";
  }
}
