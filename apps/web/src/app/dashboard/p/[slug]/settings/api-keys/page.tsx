"use client";

import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useRotateAPIKey } from "@/hooks/use-churn-events";
import { useAPIKeys } from "@/hooks/use-projects";
import { Copy, Check, Shield, RefreshCw, AlertTriangle } from "lucide-react";

export default function ProjectApiKeysPage() {
  const { project, slug } = useCurrentProject();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<"secret" | "public" | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [newKeyCopied, setNewKeyCopied] = useState(false);

  const rotateMutation = useRotateAPIKey(slug);
  const { data: apiKeys } = useAPIKeys(slug);

  const publicKeyMasked = apiKeys?.find((k) => k.key_type === "public")?.key_masked;
  const secretKeyMasked = apiKeys?.find((k) => k.key_type === "secret")?.key_masked;

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function copyNewKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setNewKeyCopied(true);
    setTimeout(() => setNewKeyCopied(false), 2000);
  }

  function handleRotate() {
    if (!confirmType) return;
    rotateMutation.mutate(
      { key_type: confirmType },
      {
        onSuccess: (data) => {
          setConfirmType(null);
          setNewKey(data.key);
          toast({ title: "Key rotated", description: "Your old key will expire in 24 hours." });
        },
        onError: (err) => {
          toast({ title: "Rotation failed", description: err.message, variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground">API keys for {project.name}.</p>
      </div>

      <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <strong>Security Notice</strong>
        </div>
        <p className="mt-1">
          Secret keys are shown only once at creation and during rotation. Store them securely.
          Rotating a key issues a new one — the old key remains valid for 24 hours to allow migration.
        </p>
      </div>

      {/* Public Key */}
      <Card>
        <CardHeader>
          <CardTitle>Public Key</CardTitle>
          <CardDescription>
            Use this in the cancel widget and client-side integrations. Safe to expose publicly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-mono text-muted-foreground">
              {publicKeyMasked ?? "Loading…"}
            </code>
          </div>
          <p className="text-xs text-muted-foreground">
            Your public key is embedded in the webhook URL shown in{" "}
            <a href={`/dashboard/p/${slug}/settings/integrations`} className="underline">
              Integrations
            </a>
            .
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setConfirmType("public")}
          >
            <RefreshCw className="h-3 w-3" />
            Rotate Public Key
          </Button>
        </CardContent>
      </Card>

      {/* Secret Key */}
      <Card>
        <CardHeader>
          <CardTitle>Secret Key</CardTitle>
          <CardDescription>
            Use this for server-side SDK calls and the PATCH cancel-reason endpoint. Never expose in client-side code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-mono text-muted-foreground">
              {secretKeyMasked ?? "Loading…"}
            </code>
          </div>
          <p className="text-xs text-muted-foreground">
            Your secret key was shown once when the project was created. Rotate to get a new one.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setConfirmType("secret")}
          >
            <RefreshCw className="h-3 w-3" />
            Rotate Secret Key
          </Button>
        </CardContent>
      </Card>

      {/* Webhook URL reference */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>
            Configure this in your payment provider to automatically track churn events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["stripe", "razorpay", "paddle", "dodo", "custom"].map((provider) => {
              const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/webhooks/${provider}/${publicKeyMasked ?? "YOUR_PUBLIC_KEY"}`;
              return (
                <div key={provider}>
                  <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">{provider}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-sm border border-border bg-secondary px-3 py-2 text-xs font-mono">
                      {url}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => copyToClipboard(url, provider)}
                    >
                      {copiedKey === provider ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confirm rotation dialog */}
      <Dialog open={!!confirmType} onOpenChange={() => setConfirmType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Rotate {confirmType === "secret" ? "Secret" : "Public"} Key?
            </DialogTitle>
            <DialogDescription>
              A new {confirmType} key will be generated. Your existing key will remain valid for
              24 hours to give you time to update integrations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmType(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRotate}
              disabled={rotateMutation.isPending}
            >
              {rotateMutation.isPending ? "Rotating..." : "Yes, Rotate Key"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New key reveal dialog */}
      <Dialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your New Key</DialogTitle>
            <DialogDescription>
              Copy this now — it will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-sm border border-border bg-secondary p-3">
            <code className="flex-1 break-all text-sm font-mono">{newKey}</code>
            <Button variant="outline" size="icon" onClick={copyNewKey} className="shrink-0">
              {newKeyCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button className="w-full" onClick={() => setNewKey(null)}>
            Done — I've saved the key
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
