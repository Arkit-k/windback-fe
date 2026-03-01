"use client";

import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Label, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useRecoveryTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/use-recovery-templates";
import { useSystemTemplates, useActivateSystemTemplate } from "@/hooks/use-system-templates";
import { useUsage } from "@/hooks/use-billing";
import { CANCEL_REASONS } from "@/lib/recovery";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, Lock, CheckCircle2, Sparkles } from "lucide-react";
import type { RecoveryTemplate, SystemRecoveryTemplate } from "@/types/api";

const TEMPLATE_VARS = "{{customer_name}}  {{customer_email}}  {{plan_name}}  {{cancel_reason}}";

const STRATEGY_LABELS: Record<string, string> = {
  discount: "Discount",
  value_recap: "Value Recap",
  unused_feature: "Feature Highlight",
  downgrade_offer: "Downgrade Offer",
  pause_option: "Pause Offer",
  founder_email: "Founder Email",
  pain_point_fix: "Issue Fix",
  social_proof: "Social Proof",
  feedback_request: "Feedback",
};

const TIER_COLORS: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700",
  growth: "bg-blue-100 text-blue-700",
  scale: "bg-purple-100 text-purple-700",
};

function cancelReasonLabel(reason: string) {
  return CANCEL_REASONS.find((r) => r.value === reason)?.label ?? reason;
}

// Group system templates by cancel_reason
function groupByReason(templates: SystemRecoveryTemplate[]) {
  const groups: Record<string, SystemRecoveryTemplate[]> = {};
  for (const t of templates) {
    if (!groups[t.cancel_reason]) groups[t.cancel_reason] = [];
    groups[t.cancel_reason].push(t);
  }
  return groups;
}

export default function TemplatesPage() {
  const { slug } = useCurrentProject();
  const { data: templates, isLoading: tmplLoading } = useRecoveryTemplates(slug);
  const { data: systemTemplates, isLoading: sysLoading } = useSystemTemplates(slug);
  const { data: usage } = useUsage();

  const createTemplate = useCreateTemplate(slug);
  const updateTemplate = useUpdateTemplate(slug);
  const deleteTemplate = useDeleteTemplate(slug);
  const activatePreset = useActivateSystemTemplate(slug);

  const planTier = usage?.plan_tier ?? "starter";

  const CUSTOM_TEMPLATE_LIMITS: Record<string, number> = {
    starter: 5,
    growth: 100,
    scale: 250,
  };
  const customLimit = CUSTOM_TEMPLATE_LIMITS[planTier] ?? 5;
  const customCount = templates?.length ?? 0;
  const atCustomLimit = customCount >= customLimit;

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<RecoveryTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SystemRecoveryTemplate | null>(null);

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

  function handleActivatePreset(tmpl: SystemRecoveryTemplate) {
    if (tmpl.locked) return;
    activatePreset.mutate(tmpl.id, {
      onSuccess: () => {
        toast({ title: "Template activated", description: `"${tmpl.name}" is now active for ${cancelReasonLabel(tmpl.cancel_reason)} cancellations.` });
        setPreviewTemplate(null);
      },
      onError: (err) => toast({ title: "Failed to activate template", description: err.message, variant: "destructive" }),
    });
  }

  const grouped = groupByReason(systemTemplates ?? []);
  const reasons = CANCEL_REASONS.filter((r) => grouped[r.value]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Email Templates</h1>
          <p className="text-sm text-muted-foreground">
            Write custom winback emails for specific cancel reasons. Active templates replace AI generation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {atCustomLimit && (
            <span className="text-xs text-muted-foreground">
              {customCount}/{customLimit} templates — upgrade for more
            </span>
          )}
          <Button onClick={openCreate} size="sm" disabled={atCustomLimit}>
            <Plus className="h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Template Library
          </TabsTrigger>
          <TabsTrigger value="my-templates">
            My Templates
            <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
              {customCount}/{customLimit}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ─────────── PRESET LIBRARY TAB ─────────── */}
        <TabsContent value="library" className="mt-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {planTier === "starter" && "Starter: 10 templates unlocked"}
              {planTier === "growth" && "Growth: 30 templates unlocked"}
              {planTier === "scale" && "Scale: all 50 templates unlocked"}
            </span>
            {planTier !== "scale" && (
              <Badge variant="outline" className="text-xs">
                {planTier === "starter" ? "Upgrade to Growth for 30" : "Upgrade to Scale for 50"}
              </Badge>
            )}
          </div>

          {sysLoading ? (
            <div className="text-sm text-muted-foreground">Loading templates…</div>
          ) : (
            <Tabs defaultValue={reasons[0]?.value ?? ""} orientation="horizontal">
              <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
                {reasons.map((r) => {
                  const group = grouped[r.value] ?? [];
                  const hasActive = group.some((t) => t.active_for_project);
                  return (
                    <TabsTrigger key={r.value} value={r.value} className="text-xs">
                      {r.label}
                      {hasActive && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {reasons.map((r) => (
                <TabsContent key={r.value} value={r.value}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(grouped[r.value] ?? []).map((tmpl) => (
                      <PresetCard
                        key={tmpl.id}
                        template={tmpl}
                        onPreview={() => setPreviewTemplate(tmpl)}
                        onActivate={() => handleActivatePreset(tmpl)}
                        activating={activatePreset.isPending}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </TabsContent>

        {/* ─────────── MY TEMPLATES TAB ─────────── */}
        <TabsContent value="my-templates" className="mt-4">
          {tmplLoading ? (
            <div className="text-sm text-muted-foreground">Loading templates…</div>
          ) : !templates || templates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">No custom templates yet.</p>
                <p className="text-muted-foreground text-xs mt-1 max-w-sm">
                  Create a template from scratch, or activate a preset from the Template Library.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreate} disabled={atCustomLimit}>
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
        </TabsContent>
      </Tabs>

      {/* ─────────── Preset Preview Dialog ─────────── */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => { if (!open) setPreviewTemplate(null); }}>
        {previewTemplate && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                <span className="flex items-center gap-2">
                  {previewTemplate.name}
                  {previewTemplate.active_for_project && (
                    <Badge className="text-xs bg-green-600 text-white ml-1">Active</Badge>
                  )}
                </span>
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <Badge variant="secondary" className="text-xs">{cancelReasonLabel(previewTemplate.cancel_reason)}</Badge>
                <Badge variant="outline" className="text-xs">{STRATEGY_LABELS[previewTemplate.strategy] ?? previewTemplate.strategy}</Badge>
                <Badge className={`text-xs ${TIER_COLORS[previewTemplate.tier_required]}`}>
                  {previewTemplate.tier_required.charAt(0).toUpperCase() + previewTemplate.tier_required.slice(1)}
                </Badge>
              </div>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                <p className="text-sm bg-secondary px-3 py-2 rounded">{previewTemplate.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
                <pre className="text-xs bg-secondary px-3 py-2 rounded whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {previewTemplate.body}
                </pre>
              </div>
              {previewTemplate.locked ? (
                <div className="flex items-center justify-between rounded border border-border bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Requires{" "}
                    <span className="font-medium capitalize">{previewTemplate.tier_required}</span> plan
                  </div>
                  <Button size="sm" variant="default">Upgrade</Button>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
                  <Button
                    onClick={() => handleActivatePreset(previewTemplate)}
                    disabled={activatePreset.isPending || previewTemplate.active_for_project}
                  >
                    {previewTemplate.active_for_project ? (
                      <><CheckCircle2 className="h-4 w-4 mr-1" /> Already Active</>
                    ) : activatePreset.isPending ? "Activating…" : "Use This Template"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ─────────── Create / Edit Dialog ─────────── */}
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

// ─────────── Preset Card component ───────────

interface PresetCardProps {
  template: SystemRecoveryTemplate;
  onPreview: () => void;
  onActivate: () => void;
  activating: boolean;
}

function PresetCard({ template, onPreview, onActivate, activating }: PresetCardProps) {
  return (
    <Card
      className={`relative transition-all cursor-pointer hover:border-primary/50 ${
        template.active_for_project ? "border-green-500 ring-1 ring-green-500/30" : ""
      } ${template.locked ? "opacity-60" : ""}`}
      onClick={onPreview}
    >
      {template.locked && (
        <div className="absolute top-2 right-2 z-10">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      {template.active_for_project && (
        <div className="absolute top-2 right-2 z-10">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2 pr-5">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-snug truncate">{template.name}</CardTitle>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {STRATEGY_LABELS[template.strategy] ?? template.strategy}
              </span>
              {template.locked && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TIER_COLORS[template.tier_required]}`}>
                  {template.tier_required.charAt(0).toUpperCase() + template.tier_required.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2">{template.subject}</p>
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={onPreview}>
            Preview
          </Button>
          {template.locked ? (
            <Button size="sm" className="flex-1 text-xs h-7" variant="secondary">
              Upgrade
            </Button>
          ) : template.active_for_project ? (
            <Button size="sm" className="flex-1 text-xs h-7 text-green-700 border-green-400" variant="outline" disabled>
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={onActivate}
              disabled={activating}
            >
              Use This
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
