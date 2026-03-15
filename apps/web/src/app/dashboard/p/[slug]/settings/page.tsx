"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Separator, Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@windback/ui";
import { toast } from "@windback/ui";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentProject } from "@/providers/project-provider";
import { useAutoSend, useUpdateAutoSend, useUpdateProject } from "@/hooks/use-projects";
import { formatDate } from "@/lib/utils";
import { Zap, ZapOff, Pencil } from "lucide-react";

const PRODUCT_TYPES = ["SaaS", "E-commerce", "Marketplace", "Mobile App", "Other"];

export default function ProjectSettingsPage() {
  const { user } = useAuth();
  const { project, slug } = useCurrentProject();
  const { data: autoSend, isLoading: autoSendLoading } = useAutoSend(slug);
  const updateAutoSend = useUpdateAutoSend(slug);
  const updateProject = useUpdateProject(slug);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [productType, setProductType] = useState(project.product_type);
  const [supportEmail, setSupportEmail] = useState(project.support_email || "");

  function handleToggleAutoSend() {
    const newVal = !autoSend;
    updateAutoSend.mutate(newVal, {
      onSuccess: () =>
        toast({
          title: newVal ? "Auto-send enabled" : "Auto-send disabled",
          description: newVal
            ? "Winback emails will be sent automatically after variants are generated."
            : "Variants will be generated but emails won't send until you manually approve.",
        }),
      onError: (err) =>
        toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
    });
  }

  function handleSaveProject() {
    updateProject.mutate(
      { name, product_type: productType, support_email: supportEmail },
      {
        onSuccess: () => {
          setEditing(false);
          toast({ title: "Project updated" });
        },
        onError: (err) =>
          toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleCancelEdit() {
    setName(project.name);
    setProductType(project.product_type);
    setSupportEmail(project.support_email || "");
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage project settings for {project.name}.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Details about this project.</CardDescription>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Project"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-type">Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger id="product-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSaveProject} disabled={updateProject.isPending} size="sm">
                  {updateProject.isPending ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={updateProject.isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Project Name</p>
                  <p className="text-sm font-medium">{project.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Product Type</p>
                  <p className="text-sm font-medium">{project.product_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Support Email</p>
                  <p className="text-sm font-medium">{project.support_email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Slug</p>
                  <p className="text-sm font-mono">{project.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{formatDate(project.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="text-sm font-medium">{user?.email || "—"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Connected Providers</p>
                <div className="mt-2 flex gap-2">
                  {project.stripe_account_id && (
                    <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                      Stripe
                    </span>
                  )}
                  {project.razorpay_key_id && (
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      Razorpay
                    </span>
                  )}
                  {!project.stripe_account_id && !project.razorpay_key_id && (
                    <span className="text-sm text-muted-foreground">No providers connected yet</span>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Behavior</CardTitle>
          <CardDescription>
            Control whether winback emails are sent automatically or require manual approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              {autoSend === false ? (
                <ZapOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Zap className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium">Auto-send winback emails</p>
                <p className="text-xs text-muted-foreground">
                  {autoSend === false
                    ? "Disabled — variants are generated but emails wait for manual send."
                    : "Enabled — the best variant is sent automatically after generation."}
                </p>
              </div>
            </div>
            <Button
              variant={autoSend ? "outline" : "default"}
              size="sm"
              onClick={handleToggleAutoSend}
              disabled={autoSendLoading || updateAutoSend.isPending}
            >
              {updateAutoSend.isPending ? "Saving…" : autoSend ? "Disable" : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
