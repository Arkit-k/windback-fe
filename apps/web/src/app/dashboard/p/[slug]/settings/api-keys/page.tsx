"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { Copy, Check, Shield } from "lucide-react";

export default function ProjectApiKeysPage() {
  const { project } = useCurrentProject();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          API keys for {project.name}.
        </p>
      </div>

      <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <strong>Security Notice</strong>
        </div>
        <p className="mt-1">
          Your secret key is stored securely and cannot be viewed again.
          API keys are generated automatically when a project is created.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Key</CardTitle>
          <CardDescription>
            Used for the cancellation widget and public-facing integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-mono">
              cg_pub_••••••••
            </code>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Public keys are shown as masked values. Use the integrations page for webhook URLs.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secret Key</CardTitle>
          <CardDescription>
            Used for server-side API calls. Never expose this in client-side code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-mono text-muted-foreground">
              cg_sk_••••••••••••••••••••
            </code>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Your secret key was shown once during project creation and cannot be retrieved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
