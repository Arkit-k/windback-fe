"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Badge } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useUpdateOrigins } from "@/hooks/use-settings";
import { X, Plus } from "lucide-react";
import { toast } from "@windback/ui";

export default function ProjectAllowedOriginsPage() {
  const { project, slug } = useCurrentProject();
  const updateOrigins = useUpdateOrigins(project.slug);
  const [origins, setOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState("");

  useEffect(() => {
    if (project?.allowed_origins) {
      setOrigins(project.allowed_origins);
    }
  }, [project?.allowed_origins]);

  function addOrigin() {
    const trimmed = newOrigin.trim();
    if (!trimmed || origins.includes(trimmed)) return;

    try {
      new URL(trimmed);
    } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid URL (e.g. https://example.com)", variant: "destructive" });
      return;
    }

    setOrigins([...origins, trimmed]);
    setNewOrigin("");
  }

  function removeOrigin(origin: string) {
    setOrigins(origins.filter((o) => o !== origin));
  }

  function save() {
    updateOrigins.mutate(
      { allowed_origins: origins },
      { onSuccess: () => toast({ title: "Origins updated" }) },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Allowed Origins</h1>
        <p className="text-sm text-muted-foreground">
          Configure which domains can embed the cancellation widget for {project.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Origins</CardTitle>
          <CardDescription>
            Add the domains where your cancellation widget will be embedded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOrigin()}
            />
            <Button variant="outline" onClick={addOrigin}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {origins.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {origins.map((origin) => (
                <Badge key={origin} variant="secondary" className="gap-1 py-1 pl-3 pr-1">
                  {origin}
                  <button
                    onClick={() => removeOrigin(origin)}
                    className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No origins configured yet.</p>
          )}

          <Button onClick={save} disabled={updateOrigins.isPending}>
            {updateOrigins.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
