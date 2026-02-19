"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useDunningConfig, useUpdateDunningConfig } from "@/hooks/use-dunning-config";
import { DUNNING_TONE_LABELS } from "@/lib/constants";

const DEFAULT_CONFIG = {
  max_retries: 4,
  retry_interval_hours: 48,
  tone_sequence: ["gentle_reminder", "help_offer", "urgency", "final_warning"],
  custom_from_name: "",
};

const toneOptions = Object.entries(DUNNING_TONE_LABELS);

export default function DunningConfigPage() {
  const { slug, project } = useCurrentProject();
  const { data: config, isLoading, error } = useDunningConfig(slug);
  const updateMutation = useUpdateDunningConfig(slug);

  const [maxRetries, setMaxRetries] = useState(DEFAULT_CONFIG.max_retries);
  const [retryInterval, setRetryInterval] = useState(DEFAULT_CONFIG.retry_interval_hours);
  const [toneSequence, setToneSequence] = useState<string[]>(DEFAULT_CONFIG.tone_sequence);
  const [customFromName, setCustomFromName] = useState(DEFAULT_CONFIG.custom_from_name);

  // Load existing config when data arrives
  useEffect(() => {
    if (config) {
      setMaxRetries(config.max_retries);
      setRetryInterval(config.retry_interval_hours);
      setToneSequence(config.tone_sequence);
      setCustomFromName(config.custom_from_name ?? "");
    }
  }, [config]);

  function handleToneChange(index: number, value: string) {
    const updated = [...toneSequence];
    updated[index] = value;
    setToneSequence(updated);
  }

  function handleSave() {
    updateMutation.mutate(
      {
        max_retries: maxRetries,
        retry_interval_hours: retryInterval,
        tone_sequence: toneSequence,
        custom_from_name: customFromName || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Configuration saved", description: "Dunning settings have been updated." });
        },
        onError: (err) => {
          toast({ title: "Failed to save", description: err.message, variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Dunning Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Configure how failed payment recovery emails are sent for {project.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recovery Settings</CardTitle>
          <CardDescription>
            Control the retry behavior and tone of dunning emails sent to customers with failed payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : error && !(error as any)?.status?.toString().startsWith("404") ? (
            <p className="text-sm text-destructive">
              Failed to load dunning configuration. Please try again.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Max Retries */}
              <div className="space-y-2">
                <Label htmlFor="max-retries">Max Retries</Label>
                <Input
                  id="max-retries"
                  type="number"
                  min={1}
                  max={10}
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Number of retry attempts before marking a payment as abandoned (1-10).
                </p>
              </div>

              {/* Retry Interval */}
              <div className="space-y-2">
                <Label htmlFor="retry-interval">Retry Interval (hours)</Label>
                <Input
                  id="retry-interval"
                  type="number"
                  min={12}
                  max={168}
                  value={retryInterval}
                  onChange={(e) => setRetryInterval(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Hours between each retry attempt (12-168).
                </p>
              </div>

              {/* Tone Sequence */}
              <div className="space-y-3">
                <Label>Tone Sequence</Label>
                <p className="text-xs text-muted-foreground">
                  Choose the email tone for each retry attempt.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Retry {index + 1}
                      </label>
                      <Select
                        value={toneSequence[index] ?? "gentle_reminder"}
                        onValueChange={(v) => handleToneChange(index, v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {toneOptions.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom From Name */}
              <div className="space-y-2">
                <Label htmlFor="custom-from-name">Custom From Name</Label>
                <Input
                  id="custom-from-name"
                  type="text"
                  placeholder="e.g. Support Team"
                  value={customFromName}
                  onChange={(e) => setCustomFromName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional sender name for dunning emails. Leave empty to use the default.
                </p>
              </div>

              {/* Save */}
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
