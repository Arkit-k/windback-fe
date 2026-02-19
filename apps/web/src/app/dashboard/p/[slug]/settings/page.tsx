"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Separator } from "@windback/ui";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentProject } from "@/providers/project-provider";
import { formatDate } from "@/lib/utils";

export default function ProjectSettingsPage() {
  const { user } = useAuth();
  const { project } = useCurrentProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage project settings for {project.name}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Details about this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
