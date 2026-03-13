"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useSegments,
  useCreateSegment,
  useUpdateSegment,
  useDeleteSegment,
  useEvaluateSegmentRules,
} from "@/hooks/use-segments";
import type { Segment, SegmentRule, CreateSegmentRequest } from "@/types/api";
import { Plus, Trash2, Filter, Users, X } from "lucide-react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const FIELD_OPTIONS = [
  { value: "risk_score", label: "Risk Score" },
  { value: "risk_level", label: "Risk Level" },
];

const OPERATOR_OPTIONS = [
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "eq", label: "Equals" },
  { value: "gte", label: "Greater or equal" },
  { value: "lte", label: "Less or equal" },
  { value: "contains", label: "Contains" },
  { value: "in", label: "In" },
];

const COLOR_PRESETS = [
  "#6366f1",
  "#10b981",
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

/* -------------------------------------------------------------------------- */
/*  Rule Builder                                                               */
/* -------------------------------------------------------------------------- */

function RuleRow({
  rule,
  index,
  onChange,
  onRemove,
}: {
  rule: SegmentRule;
  index: number;
  onChange: (index: number, rule: SegmentRule) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={rule.field}
        onValueChange={(v) => onChange(index, { ...rule, field: v })}
      >
        <SelectTrigger className="w-36 text-xs">
          <SelectValue placeholder="Field" />
        </SelectTrigger>
        <SelectContent>
          {FIELD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={rule.operator}
        onValueChange={(v) => onChange(index, { ...rule, operator: v })}
      >
        <SelectTrigger className="w-36 text-xs">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          {OPERATOR_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        className="w-28 text-xs"
        placeholder="Value"
        value={String(rule.value ?? "")}
        onChange={(e) => {
          const raw = e.target.value;
          // Attempt to parse as number for numeric fields.
          const parsed = rule.field === "risk_score" ? Number(raw) || raw : raw;
          onChange(index, { ...rule, value: parsed });
        }}
      />

      <button
        type="button"
        className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Create / Edit Dialog                                                       */
/* -------------------------------------------------------------------------- */

function SegmentDialog({
  open,
  onOpenChange,
  slug,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  existing?: Segment | null;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [color, setColor] = useState(existing?.color ?? "#6366f1");
  const [rules, setRules] = useState<SegmentRule[]>(
    existing?.rules ?? [{ field: "risk_score", operator: "gte", value: 70 }],
  );
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const createMutation = useCreateSegment(slug);
  const updateMutation = useUpdateSegment(slug, existing?.id ?? "");
  const evaluateMutation = useEvaluateSegmentRules(slug);

  const isEditing = !!existing;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleRuleChange = useCallback(
    (index: number, rule: SegmentRule) => {
      setRules((prev) => {
        const next = [...prev];
        next[index] = rule;
        return next;
      });
      setMatchCount(null);
    },
    [],
  );

  const handleRuleRemove = useCallback((index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
    setMatchCount(null);
  }, []);

  const addRule = () => {
    setRules((prev) => [...prev, { field: "risk_score", operator: "gte", value: 50 }]);
    setMatchCount(null);
  };

  const handlePreview = async () => {
    try {
      const result = await evaluateMutation.mutateAsync(rules);
      setMatchCount(result.matching_customers);
    } catch {
      // error is handled by mutation state
    }
  };

  const handleSave = async () => {
    if (!name.trim() || rules.length === 0) return;

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          name,
          description,
          color,
          rules,
        });
      } else {
        await createMutation.mutateAsync({
          name,
          description,
          color,
          rules,
        });
      }
      onOpenChange(false);
    } catch {
      // error is handled by mutation state
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Segment" : "Create Segment"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="seg-name">Name</Label>
            <Input
              id="seg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="High-risk enterprise"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seg-desc">Description</Label>
            <Input
              id="seg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Customers with risk score above 70"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: c === color ? "white" : "transparent",
                    boxShadow: c === color ? `0 0 0 2px ${c}` : "none",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rules</Label>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <RuleRow
                  key={i}
                  rule={rule}
                  index={i}
                  onChange={handleRuleChange}
                  onRemove={handleRuleRemove}
                />
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addRule}>
              <Plus className="mr-1 h-3 w-3" /> Add Rule
            </Button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={evaluateMutation.isPending || rules.length === 0}
            >
              {evaluateMutation.isPending ? "Evaluating..." : "Preview"}
            </Button>
            {matchCount !== null && (
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{matchCount}</span> customers match
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || !name.trim() || rules.length === 0}>
            {isSaving ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Delete Confirmation Dialog                                                 */
/* -------------------------------------------------------------------------- */

function DeleteDialog({
  open,
  onOpenChange,
  segment,
  slug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment: Segment | null;
  slug: string;
}) {
  const deleteMutation = useDeleteSegment(slug);

  const handleDelete = async () => {
    if (!segment) return;
    try {
      await deleteMutation.mutateAsync(segment.id);
      onOpenChange(false);
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Segment</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          Are you sure you want to delete <strong>{segment?.name}</strong>? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Segment Card                                                               */
/* -------------------------------------------------------------------------- */

function SegmentCard({
  segment,
  onEdit,
  onDelete,
}: {
  segment: Segment;
  onEdit: (seg: Segment) => void;
  onDelete: (seg: Segment) => void;
}) {
  return (
    <Card className="group relative">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <div>
              <h3 className="font-semibold text-foreground">{segment.name}</h3>
              {segment.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {segment.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={() => onEdit(segment)}
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
            <button
              className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(segment)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {segment.customer_count} customers
          </span>
          <span>
            {segment.rules.length} rule{segment.rules.length !== 1 ? "s" : ""}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              segment.is_active
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {segment.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading & Empty States                                                     */
/* -------------------------------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-secondary" />
        <div className="h-9 w-32 rounded bg-secondary" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Filter className="h-10 w-10 text-muted-foreground/40" />
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">No segments yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Create rule-based customer segments to target specific groups for retention campaigns.
        </p>
      </div>
      <Button onClick={onCreate}>
        <Plus className="mr-1 h-4 w-4" /> Create Segment
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SegmentsPage() {
  const { slug } = useCurrentProject();
  const { data: segments, isLoading } = useSegments(slug);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSegment, setDeletingSegment] = useState<Segment | null>(null);

  const handleCreate = () => {
    setEditingSegment(null);
    setDialogOpen(true);
  };

  const handleEdit = (seg: Segment) => {
    setEditingSegment(seg);
    setDialogOpen(true);
  };

  const handleDeleteClick = (seg: Segment) => {
    setDeletingSegment(seg);
    setDeleteDialogOpen(true);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smart Segments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rule-based customer segments for targeted retention
          </p>
        </div>
        {segments && segments.length > 0 && (
          <Button onClick={handleCreate}>
            <Plus className="mr-1 h-4 w-4" /> Create Segment
          </Button>
        )}
      </div>

      {!segments || segments.length === 0 ? (
        <EmptyState onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((seg) => (
            <SegmentCard
              key={seg.id}
              segment={seg}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      {dialogOpen && (
        <SegmentDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingSegment(null);
          }}
          slug={slug}
          existing={editingSegment}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingSegment(null);
        }}
        segment={deletingSegment}
        slug={slug}
      />
    </motion.div>
  );
}
