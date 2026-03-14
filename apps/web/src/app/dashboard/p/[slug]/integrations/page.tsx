"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useIntegrations,
  useIntegrationProviders,
  useConnectIntegration,
  useDisconnectIntegration,
} from "@/hooks/use-integrations";
import type { Integration, IntegrationProvider } from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Skeleton,
  cn,
} from "@windback/ui";
import {
  Plug,
  Unplug,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  connected:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  syncing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  error: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  connected: <CheckCircle2 className="h-3 w-3" />,
  syncing: <RefreshCw className="h-3 w-3 animate-spin" />,
  error: <AlertCircle className="h-3 w-3" />,
};

export default function IntegrationsPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: integrations, isLoading: integrationsLoading } =
    useIntegrations(slug);
  const { data: providers, isLoading: providersLoading } =
    useIntegrationProviders(slug);
  const connectIntegration = useConnectIntegration(slug);
  const disconnectIntegration = useDisconnectIntegration(slug);

  const [showConnect, setShowConnect] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<IntegrationProvider | null>(null);
  const [configJson, setConfigJson] = useState("{}");

  const connectedProviderSlugs = new Set(
    integrations?.map((i) => i.provider) ?? [],
  );
  const availableProviders =
    providers?.filter((p) => !connectedProviderSlugs.has(p.slug)) ?? [];

  function openConnect(provider: IntegrationProvider) {
    setSelectedProvider(provider);
    setConfigJson("{}");
    setShowConnect(true);
  }

  function handleConnect() {
    if (!selectedProvider) return;
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(configJson);
    } catch {
      return;
    }
    connectIntegration.mutate(
      { provider: selectedProvider.slug, config },
      {
        onSuccess: () => {
          setShowConnect(false);
          setSelectedProvider(null);
        },
      },
    );
  }

  function handleDisconnect(id: string) {
    disconnectIntegration.mutate(id);
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const isLoading = integrationsLoading || providersLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect third-party services to enhance your workflow.
        </p>
      </div>

      {/* Connected Integrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Connected</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !integrations || integrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
            <Plug className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No integrations connected yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground capitalize">
                        {integration.provider}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICONS[integration.status]}
                        <Badge
                          className={cn(
                            "text-xs",
                            STATUS_COLORS[integration.status] ??
                              STATUS_COLORS.connected,
                          )}
                        >
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last synced: {formatDate(integration.last_synced_at)}
                  </p>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDisconnect(integration.id)}
                      disabled={disconnectIntegration.isPending}
                    >
                      <Unplug className="mr-2 h-3 w-3" />
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Providers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Available</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-28 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : availableProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
            <Zap className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              All available providers are connected.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableProviders.map((provider) => (
              <Card key={provider.slug}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {provider.name}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {provider.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {provider.description}
                    </p>
                    {provider.features.length > 0 && (
                      <ul className="space-y-1">
                        {provider.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      size="sm"
                      onClick={() => openConnect(provider)}
                      className="w-full"
                    >
                      <Plug className="mr-2 h-3 w-3" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Connect Dialog */}
      <Dialog open={showConnect} onOpenChange={setShowConnect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect {selectedProvider?.name ?? "Provider"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProvider && (
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium text-foreground">
                  {selectedProvider.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedProvider.description}
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {selectedProvider.category}
                </Badge>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="integration-config">
                Configuration (JSON)
              </Label>
              <Textarea
                id="integration-config"
                placeholder='{"api_key": "...", "secret": "..."}'
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConnect(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={connectIntegration.isPending}
            >
              {connectIntegration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
