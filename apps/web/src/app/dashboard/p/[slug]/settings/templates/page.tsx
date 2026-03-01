"use client";

import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Label, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useRecoveryTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/use-recovery-templates";
import { CANCEL_REASONS } from "@/lib/recovery";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { RecoveryTemplate } from "@/types/api";

const TEMPLATE_VARS = "{{customer_name}}  {{customer_email}}  {{plan_name}}  {{cancel_reason}}";

export default function TemplatesPage() {
  const { slug } = useCurrentProject();
  const { data: templates, isLoading } = useRecoveryTemplates(slug);
  const createTemplate = useCreateTemplate(slug);
  const updateTemplate = useUpdateTemplate(slug);
  const deleteTemplate = useDeleteTemplate(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<RecoveryTemplate | null>(null);

  // Form state
  const [form, setForm] = useState({
    cancel_reason: "",
    name: "",
    subject: "",
    body: "",
    is_active: true,
  });

  function resetForm() {
    setForm({ cancel_reason: "", name: "", subject: "", body: "", is_active: true });
  }

  function openCreate() {
    resetForm();
    setShowCreate(true);
  }

  function openEdit(tmpl: RecoveryTemplate) {
    setEditTarget(tmpl);
    setForm({
      cancel_reason: tmpl.cancel_reason,
      name: tmpl.name,
      subject: tmpl.subject,
      body: tmpl.body,
      is_active: tmpl.is_active,
    });
  }

  function handleCreate() {
    if (!form.cancel_reason || !form.name || !form.subject || !form.body) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    createTemplate.mutate(
      { cancel_reason: form.cancel_reason, name: form.name, subject: form.subject, body: form.body, is_active: form.is_active },
      {
        onSuccess: () => {
          toast({ title: "Template created" });
          setShowCreate(false);
          resetForm();
        },
        onError: (err) => toast({ title: "Failed to create template", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleUpdate() {
    if (!editTarget) return;
    updateTemplate.mutate(
      { id: editTarget.id, data: { name: form.name, subject: form.subject, body: form.body, is_active: form.is_active } },
      {
        onSuccess: () => {
          toast({ title: "Template updated" });
          setEditTarget(null);
        },
        onError: (err) => toast({ title: "Failed to update template", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: string) {
    deleteTemplate.mutate(id, {
      onSuccess: () => toast({ title: "Template deleted" }),
      onError: (err) => toast({ title: "Failed to delete template", description: err.message, variant: "destructive" }),
    });
  }

  function handleToggleActive(tmpl: RecoveryTemplate) {
    updateTemplate.mutate(
      { id: tmpl.id, data: { is_active: !tmpl.is_active } },
      {
        onSuccess: () => toast({ title: tmpl.is_active ? "Template deactivated" : "Template activated" }),
        onError: (err) => toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
      }
    );
  }

  const cancelReasonLabel = (reason: string) =>
    CANCEL_REASONS.find((r) => r.value === reason)?.label ?? reason;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Email Templates</h1>
          <p className="text-sm text-muted-foreground">
            Write custom winback emails for specific cancel reasons. Active templates replace AI generation.
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading templates…</div>
      ) : !templates || templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">No templates yet.</p>
            <p className="text-muted-foreground text-xs mt-1 max-w-sm">
              Create a template for a cancel reason and it will be used instead of AI when a customer churns with that reason.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create first template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((tmpl) => (
            <Card key={tmpl.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm">{tmpl.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{cancelReasonLabel(tmpl.cancel_reason)}</Badge>
                      {tmpl.is_active ? (
                        <Badge className="text-xs bg-green-600 text-white">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{tmpl.subject}</CardDescription>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => handleToggleActive(tmpl)}
                      disabled={updateTemplate.isPending}
                    >
                      {tmpl.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tmpl)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tmpl.id)}
                      disabled={deleteTemplate.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.body}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">Updated {formatDate(tmpl.updated_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={showCreate || !!editTarget}
        onOpenChange={(open) => {
          if (!open) { setShowCreate(false); setEditTarget(null); }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription>
              Available variables: <code className="text-xs bg-secondary px-1 rounded">{TEMPLATE_VARS}</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Cancel Reason</Label>
              <Select
                value={form.cancel_reason}
                onValueChange={(v) => setForm((f) => ({ ...f, cancel_reason: v }))}
                disabled={!!editTarget}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cancel reason" />
                </SelectTrigger>
                <SelectContent>
                  {CANCEL_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tmpl-name">Template Name</Label>
              <Textarea
                id="tmpl-name"
                rows={1}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Too Expensive Winback"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tmpl-subject">Subject</Label>
              <Textarea
                id="tmpl-subject"
                rows={2}
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. We'd love to keep you, {{customer_name}}"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tmpl-body">Body</Label>
              <Textarea
                id="tmpl-body"
                rows={10}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder={"Hi {{customer_name}},\n\nWe noticed you cancelled your {{plan_name}} plan…"}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="tmpl-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-border"
              />
              <Label htmlFor="tmpl-active" className="cursor-pointer">
                Active — use this template instead of AI for this cancel reason
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowCreate(false); setEditTarget(null); }}>
                Cancel
              </Button>
              <Button
                onClick={editTarget ? handleUpdate : handleCreate}
                disabled={createTemplate.isPending || updateTemplate.isPending}
              >
                {createTemplate.isPending || updateTemplate.isPending ? "Saving…" : editTarget ? "Save changes" : "Create template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
