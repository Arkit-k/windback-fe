"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useAlertRules,
  useAlertHistory,
  useCreateAlertRule,
  useUpdateAlertRule,
  useDeleteAlertRule,
  useAcknowledgeAlert,
} from "@/hooks/use-alerts";
import type {
  AlertRule,
  AlertHistory,
  AlertChannel,
  CreateAlertRuleRequest,
} from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  cn,
  toast,
} from "@windback/ui";
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Settings,
  History,
  Power,
  PowerOff,
} from "lucide-react";

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  slack: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  webhook: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const CONDITION_LABELS: Record<string, string> = {
  above: "Above",
  below: "Below",
  equals: "Equals",
};

const METRIC_LABELS: Record<string, string> = {
  churn_rate: "Churn Rate",
  recovery_rate: "Recovery Rate",
  mrr_change: "MRR Change",
  payment_failures: "Payment Failures",
};

export default function AlertsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: rules, isLoading: rulesLoading } = useAlertRules(slug);
  const { data: historyData, isLoading: historyLoading } =
    useAlertHistory(slug);
  const createRule = useCreateAlertRule(slug);
  const updateRule = useUpdateAlertRule(slug);
  const deleteRule = useDeleteAlertRule(slug);
  const acknowledgeAlert = useAcknowledgeAlert(slug);

  const history = historyData?.data ?? [];

  const [activeTab, setActiveTab] = useState<"rules" | "history">("rules");
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("churn_rate");
  const [condition, setCondition] = useState("above");
  const [threshold, setThreshold] = useState("");
  const [channel, setChannel] = useState<AlertChannel>("email");

  function resetForm() {
    setName("");
    setMetric("churn_rate");
    setCondition("above");
    setThreshold("");
    setChannel("email");
  }

  function handleCreate() {
    if (!name.trim() || !threshold) return;
    createRule.mutate(
      {
        name,
        metric,
        condition,
        threshold: parseFloat(threshold),
        channel,
      },
      {
        onSuccess: () => {
          toast({ title: "Alert rule created" });
          setShowCreate(false);
          resetForm();
        },
        onError: (err) =>
          toast({
            title: "Failed to create alert rule",
            description: err.message,
            variant: "destructive",
          }),
      }
    );
  }

  function handleToggleActive(rule: AlertRule) {
    updateRule.mutate(
      { id: rule.id, is_active: !rule.is_active },
      {
        onSuccess: () =>
          toast({
            title: rule.is_active ? "Rule deactivated" : "Rule activated",
          }),
        onError: (err) =>
          toast({
            title: "Failed to update rule",
            description: err.message,
            variant: "destructive",
          }),
      }
    );
  }

  function handleDeleteRule(id: string) {
    deleteRule.mutate(id, {
      onSuccess: () => toast({ title: "Alert rule deleted" }),
      onError: (err) =>
        toast({
          title: "Failed to delete rule",
          description: err.message,
          variant: "destructive",
        }),
    });
  }

  function handleAcknowledge(id: string) {
    acknowledgeAlert.mutate(id, {
      onSuccess: () => toast({ title: "Alert acknowledged" }),
      onError: (err) =>
        toast({
          title: "Failed to acknowledge alert",
          description: err.message,
          variant: "destructive",
        }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure alert rules and view triggered alert history.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        <button
          onClick={() => setActiveTab("rules")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "rules"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Rules
          {rules && (
            <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
              {rules.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "history"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="h-4 w-4" />
          History
          {historyData && (
            <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
              {historyData.total}
            </span>
          )}
        </button>
      </div>

      {/* Rules Section */}
      {activeTab === "rules" && (
        <>
          {rulesLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !rules || rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No alert rules configured. Create a rule to start monitoring.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rules.map((rule) => (
                <Card
                  key={rule.id}
                  className={cn(
                    "transition-colors hover:shadow-sm",
                    !rule.is_active && "opacity-60"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium truncate">
                        {rule.name}
                      </CardTitle>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          CHANNEL_COLORS[rule.channel] ?? CHANNEL_COLORS.webhook
                        )}
                      >
                        {rule.channel}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-foreground">
                      <span className="text-muted-foreground">When </span>
                      <span className="font-medium">
                        {METRIC_LABELS[rule.metric] ?? rule.metric}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        is {CONDITION_LABELS[rule.condition] ?? rule.condition}{" "}
                      </span>
                      <span className="font-medium">{rule.threshold}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {rule.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Power className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <PowerOff className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 border-t border-border pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleToggleActive(rule)}
                        disabled={updateRule.isPending}
                      >
                        {rule.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRule(rule.id)}
                        disabled={deleteRule.isPending}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* History Section */}
      {activeTab === "history" && (
        <>
          {historyLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
              <BellRing className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No alerts have been triggered yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((alert) => (
                <Card
                  key={alert.id}
                  className="transition-colors hover:shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium truncate">
                        {alert.rule_name}
                      </CardTitle>
                      {alert.acknowledged ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3" />
                          Acknowledged
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                          <AlertTriangle className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-foreground">
                      Metric value:{" "}
                      <span className="font-medium">
                        {alert.metric_value}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Triggered{" "}
                      {new Date(alert.triggered_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                    {!alert.acknowledged && (
                      <div className="border-t border-border pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeAlert.isPending}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Acknowledge
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Alert Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="rule-name">Name</Label>
              <Input
                id="rule-name"
                placeholder="e.g. High Churn Alert"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Metric</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="churn_rate">Churn Rate</SelectItem>
                  <SelectItem value="recovery_rate">Recovery Rate</SelectItem>
                  <SelectItem value="mrr_change">MRR Change</SelectItem>
                  <SelectItem value="payment_failures">
                    Payment Failures
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="rule-threshold">Threshold</Label>
              <Input
                id="rule-threshold"
                type="number"
                step="any"
                placeholder="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Channel</Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as AlertChannel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createRule.isPending || !name.trim() || !threshold
              }
            >
              {createRule.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
