"use client";

import { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Skeleton,
  toast,
} from "@windback/ui";
import {
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  FileJson,
  AlertTriangle,
} from "lucide-react";
import { useCurrentProject } from "@/providers/project-provider";
import { useDunningConfig, useUpdateDunningConfig } from "@/hooks/use-dunning-config";
import { useChurnRiskConfig, useUpdateChurnRiskConfig } from "@/hooks/use-churn-risk";
import { useNotificationConfig, useUpdateNotificationConfig } from "@/hooks/use-notification-config";
import { useRetentionOffers, useUpsertRetentionOffer } from "@/hooks/use-retention-offers";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useEmailConfig, useSetEmailMethod } from "@/hooks/use-email-config";
import { useRecoveryTemplates, useCreateTemplate, useUpdateTemplate } from "@/hooks/use-recovery-templates";
import type {
  DunningConfig,
  ChurnRiskConfig,
  NotificationConfig,
  RetentionOffer,
  ProjectEmailConfig,
  RecoveryTemplate,
  UpdateDunningConfigRequest,
  UpdateChurnRiskConfigRequest,
  UpdateNotificationConfigRequest,
  UpsertRetentionOfferRequest,
} from "@/types/api";

const EXPORT_VERSION = 1;

interface ExportedSettings {
  version: number;
  exported_at: string;
  project_name: string;
  settings: {
    dunning_config?: Partial<DunningConfig> | null;
    churn_risk_config?: Partial<ChurnRiskConfig> | null;
    notification_config?: Partial<NotificationConfig> | null;
    retention_offers?: Partial<RetentionOffer>[] | null;
    allowed_origins?: string[] | null;
    email_method?: string | null;
    recovery_templates?: Partial<RecoveryTemplate>[] | null;
  };
}

type SectionKey = keyof ExportedSettings["settings"];

const SECTION_LABELS: Record<SectionKey, string> = {
  dunning_config: "Dunning Configuration",
  churn_risk_config: "Churn Risk Configuration",
  notification_config: "Notification Configuration",
  retention_offers: "Retention Offers",
  allowed_origins: "Allowed Origins",
  email_method: "Email Method",
  recovery_templates: "Recovery Templates",
};

type ImportStep = "idle" | "preview" | "importing" | "done";

interface ImportProgress {
  section: SectionKey;
  status: "pending" | "importing" | "success" | "error";
  error?: string;
}

export default function ImportExportPage() {
  const { slug, project } = useCurrentProject();

  // --- Data hooks (read) ---
  const { data: dunningConfig, isLoading: loadingDunning } = useDunningConfig(slug);
  const { data: churnRiskConfig, isLoading: loadingChurn } = useChurnRiskConfig(slug);
  const { data: notificationConfig, isLoading: loadingNotif } = useNotificationConfig(slug);
  const { data: retentionOffers, isLoading: loadingOffers } = useRetentionOffers(slug);
  const { data: emailConfig, isLoading: loadingEmail } = useEmailConfig(slug);
  const { data: recoveryTemplates, isLoading: loadingTemplates } = useRecoveryTemplates(slug);

  // --- Mutation hooks (write) ---
  const updateDunning = useUpdateDunningConfig(slug);
  const updateChurnRisk = useUpdateChurnRiskConfig(slug);
  const updateNotification = useUpdateNotificationConfig(slug);
  const upsertOffer = useUpsertRetentionOffer(slug);
  const updateProject = useUpdateProject(slug);
  const setEmailMethod = useSetEmailMethod(slug);
  const createTemplate = useCreateTemplate(slug);
  const updateTemplate = useUpdateTemplate(slug);

  // --- Export state ---
  const [exporting, setExporting] = useState(false);

  // --- Import state ---
  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importData, setImportData] = useState<ExportedSettings | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = loadingDunning || loadingChurn || loadingNotif || loadingOffers || loadingEmail || loadingTemplates;

  // ============================
  // EXPORT
  // ============================
  const handleExport = useCallback(() => {
    setExporting(true);
    try {
      const payload: ExportedSettings = {
        version: EXPORT_VERSION,
        exported_at: new Date().toISOString(),
        project_name: project.name,
        settings: {
          dunning_config: dunningConfig
            ? {
                max_retries: dunningConfig.max_retries,
                retry_interval_hours: dunningConfig.retry_interval_hours,
                tone_sequence: dunningConfig.tone_sequence,
                custom_from_name: dunningConfig.custom_from_name,
              }
            : null,
          churn_risk_config: churnRiskConfig
            ? {
                enabled: churnRiskConfig.enabled,
                high_risk_threshold: churnRiskConfig.high_risk_threshold,
                medium_risk_threshold: churnRiskConfig.medium_risk_threshold,
                auto_email_enabled: churnRiskConfig.auto_email_enabled,
                auto_email_threshold: churnRiskConfig.auto_email_threshold,
                webhook_url: churnRiskConfig.webhook_url,
              }
            : null,
          notification_config: notificationConfig
            ? {
                slack_webhook_url: notificationConfig.slack_webhook_url,
                slack_enabled: notificationConfig.slack_enabled,
                custom_webhook_url: notificationConfig.custom_webhook_url,
                custom_webhook_enabled: notificationConfig.custom_webhook_enabled,
                notify_churn_created: notificationConfig.notify_churn_created,
                notify_churn_recovered: notificationConfig.notify_churn_recovered,
                notify_payment_failed: notificationConfig.notify_payment_failed,
                notify_payment_recovered: notificationConfig.notify_payment_recovered,
              }
            : null,
          retention_offers: retentionOffers?.map((offer) => ({
            cancel_reason: offer.cancel_reason,
            offer_type: offer.offer_type,
            title: offer.title,
            description: offer.description,
            cta_text: offer.cta_text,
            discount_percent: offer.discount_percent,
            pause_days: offer.pause_days,
            is_active: offer.is_active,
          })) ?? null,
          allowed_origins: project.allowed_origins ?? null,
          email_method: emailConfig?.method ?? null,
          recovery_templates: recoveryTemplates?.map((t) => ({
            cancel_reason: t.cancel_reason,
            name: t.name,
            subject: t.subject,
            body: t.body,
            is_active: t.is_active,
          })) ?? null,
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.slug}-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Settings exported", description: "Your project settings have been downloaded." });
    } catch {
      toast({ title: "Export failed", description: "Could not export settings.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }, [project, dunningConfig, churnRiskConfig, notificationConfig, retentionOffers, emailConfig, recoveryTemplates]);

  // ============================
  // IMPORT - FILE SELECT
  // ============================
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setImportData(null);
    setImportStep("idle");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text) as ExportedSettings;

        // Basic validation
        if (!parsed.version || !parsed.settings || typeof parsed.settings !== "object") {
          throw new Error("Invalid file format: missing version or settings object.");
        }
        if (parsed.version > EXPORT_VERSION) {
          throw new Error(
            `Unsupported export version ${parsed.version}. This app supports version ${EXPORT_VERSION}.`
          );
        }

        setImportData(parsed);
        setImportStep("preview");
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Failed to parse JSON file.");
      }
    };
    reader.onerror = () => setParseError("Could not read the selected file.");
    reader.readAsText(file);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ============================
  // IMPORT - APPLY
  // ============================
  const handleApply = useCallback(async () => {
    if (!importData) return;
    const { settings } = importData;
    setImportStep("importing");

    // Build the list of sections that have data
    const sections: SectionKey[] = (Object.keys(settings) as SectionKey[]).filter(
      (k) => settings[k] != null
    );

    const progress: ImportProgress[] = sections.map((s) => ({
      section: s,
      status: "pending" as const,
    }));
    setImportProgress([...progress]);

    const updateProgress = (section: SectionKey, status: ImportProgress["status"], error?: string) => {
      const idx = progress.findIndex((p) => p.section === section);
      if (idx >= 0) {
        progress[idx] = { section, status, error };
        setImportProgress([...progress]);
      }
    };

    // Apply each section sequentially
    for (const section of sections) {
      updateProgress(section, "importing");
      try {
        switch (section) {
          case "dunning_config": {
            const cfg = settings.dunning_config;
            if (cfg) {
              await updateDunning.mutateAsync({
                max_retries: cfg.max_retries ?? 4,
                retry_interval_hours: cfg.retry_interval_hours ?? 48,
                tone_sequence: (cfg.tone_sequence as string[]) ?? ["gentle_reminder"],
                custom_from_name: cfg.custom_from_name,
              } satisfies UpdateDunningConfigRequest);
            }
            break;
          }
          case "churn_risk_config": {
            const cfg = settings.churn_risk_config;
            if (cfg) {
              await updateChurnRisk.mutateAsync({
                enabled: cfg.enabled,
                high_risk_threshold: cfg.high_risk_threshold,
                medium_risk_threshold: cfg.medium_risk_threshold,
                auto_email_enabled: cfg.auto_email_enabled,
                auto_email_threshold: cfg.auto_email_threshold,
                webhook_url: cfg.webhook_url,
              } satisfies UpdateChurnRiskConfigRequest);
            }
            break;
          }
          case "notification_config": {
            const cfg = settings.notification_config;
            if (cfg) {
              await updateNotification.mutateAsync({
                slack_webhook_url: cfg.slack_webhook_url ?? null,
                slack_enabled: cfg.slack_enabled ?? false,
                custom_webhook_url: cfg.custom_webhook_url ?? null,
                custom_webhook_enabled: cfg.custom_webhook_enabled ?? false,
                notify_churn_created: cfg.notify_churn_created ?? false,
                notify_churn_recovered: cfg.notify_churn_recovered ?? false,
                notify_payment_failed: cfg.notify_payment_failed ?? false,
                notify_payment_recovered: cfg.notify_payment_recovered ?? false,
              } satisfies UpdateNotificationConfigRequest);
            }
            break;
          }
          case "retention_offers": {
            const offers = settings.retention_offers;
            if (offers?.length) {
              for (const offer of offers) {
                if (offer.cancel_reason) {
                  await upsertOffer.mutateAsync({
                    reason: offer.cancel_reason,
                    input: {
                      offer_type: offer.offer_type ?? "custom",
                      title: offer.title ?? "",
                      description: offer.description ?? "",
                      cta_text: offer.cta_text,
                      discount_percent: offer.discount_percent,
                      pause_days: offer.pause_days,
                      is_active: offer.is_active,
                    } satisfies UpsertRetentionOfferRequest,
                  });
                }
              }
            }
            break;
          }
          case "allowed_origins": {
            const origins = settings.allowed_origins;
            if (origins) {
              await updateProject.mutateAsync({ allowed_origins: origins });
            }
            break;
          }
          case "email_method": {
            const method = settings.email_method;
            if (method) {
              await setEmailMethod.mutateAsync({
                method: method as "windback_default" | "gmail_oauth" | "custom_domain",
              });
            }
            break;
          }
          case "recovery_templates": {
            const templates = settings.recovery_templates;
            if (templates?.length) {
              // Try to match existing templates by cancel_reason, update if found, create if not
              const existing = recoveryTemplates ?? [];
              for (const tpl of templates) {
                const match = existing.find((e) => e.cancel_reason === tpl.cancel_reason && e.name === tpl.name);
                if (match) {
                  await updateTemplate.mutateAsync({
                    id: match.id,
                    data: {
                      name: tpl.name,
                      subject: tpl.subject,
                      body: tpl.body,
                      is_active: tpl.is_active,
                    },
                  });
                } else {
                  await createTemplate.mutateAsync({
                    cancel_reason: tpl.cancel_reason ?? "other",
                    name: tpl.name ?? "Imported Template",
                    subject: tpl.subject ?? "",
                    body: tpl.body ?? "",
                    is_active: tpl.is_active ?? true,
                  });
                }
              }
            }
            break;
          }
        }
        updateProgress(section, "success");
      } catch (err) {
        updateProgress(section, "error", err instanceof Error ? err.message : "Unknown error");
      }
    }

    setImportStep("done");
    const hadErrors = progress.some((p) => p.status === "error");
    if (hadErrors) {
      toast({
        title: "Import completed with errors",
        description: "Some settings could not be applied. Check details below.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Import complete", description: "All settings have been applied successfully." });
    }
  }, [
    importData,
    updateDunning,
    updateChurnRisk,
    updateNotification,
    upsertOffer,
    updateProject,
    setEmailMethod,
    createTemplate,
    updateTemplate,
    recoveryTemplates,
  ]);

  const handleReset = useCallback(() => {
    setImportStep("idle");
    setImportData(null);
    setParseError(null);
    setImportProgress([]);
  }, []);

  // ============================
  // Detected sections in import
  // ============================
  const includedSections: SectionKey[] = importData
    ? (Object.keys(importData.settings) as SectionKey[]).filter(
        (k) => importData.settings[k] != null
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Import / Export Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Export your project settings as JSON or import settings from another project.
        </p>
      </div>

      {/* ======================== EXPORT ======================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Settings
          </CardTitle>
          <CardDescription>
            Download all current settings for <strong>{project.name}</strong> as a JSON file.
            This includes dunning config, churn risk config, notifications, retention offers,
            allowed origins, email method, and recovery templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-36" />
            </div>
          ) : (
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Settings
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ======================== IMPORT ======================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Settings
          </CardTitle>
          <CardDescription>
            Upload a previously exported JSON file to apply settings to this project.
            Existing settings will be overwritten for each included section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          {importStep === "idle" && (
            <div>
              <label
                htmlFor="settings-file"
                className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-[var(--accent)] hover:bg-secondary/50"
              >
                <FileJson className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Click to select a .json settings file
                </span>
                <input
                  ref={fileInputRef}
                  id="settings-file"
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              {parseError && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {parseError}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {importStep === "preview" && importData && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Import Preview</h3>
                  <Badge variant="secondary">v{importData.version}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>Source project:</strong> {importData.project_name}
                  </p>
                  <p>
                    <strong>Exported at:</strong>{" "}
                    {new Date(importData.exported_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sections included
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {includedSections.map((key) => (
                      <Badge key={key} variant="outline">
                        {SECTION_LABELS[key]}
                      </Badge>
                    ))}
                  </div>
                  {includedSections.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No settings sections found in this file.
                    </p>
                  )}
                </div>
                {importData.project_name !== project.name && (
                  <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    This export is from a different project ({importData.project_name}).
                    Settings will be applied to <strong>{project.name}</strong>.
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApply}
                  disabled={includedSections.length === 0}
                >
                  Apply Settings
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Importing / Done */}
          {(importStep === "importing" || importStep === "done") && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {importStep === "importing" ? "Applying settings..." : "Import Complete"}
                </h3>
                <div className="space-y-2">
                  {importProgress.map((item) => (
                    <div
                      key={item.section}
                      className="flex items-center gap-3 text-sm"
                    >
                      {item.status === "pending" && (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      {item.status === "importing" && (
                        <Loader2 className="h-4 w-4 animate-spin text-accent-readable" />
                      )}
                      {item.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {item.status === "error" && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span
                        className={
                          item.status === "error"
                            ? "text-destructive"
                            : item.status === "success"
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }
                      >
                        {SECTION_LABELS[item.section]}
                      </span>
                      {item.error && (
                        <span className="text-xs text-destructive">({item.error})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {importStep === "done" && (
                <Button variant="outline" onClick={handleReset}>
                  Import Another File
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
