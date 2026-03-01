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
  Skeleton,
  Badge,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useEmailConfig,
  useSetEmailMethod,
  useInitDomainAuth,
  useVerifyDomain,
  useDisconnectGmail,
  useDisconnectDomain,
} from "@/hooks/use-email-config";
import { CheckCircle2, Mail, ExternalLink, Copy, Globe, Loader2 } from "lucide-react";
import type { DNSRecord } from "@/types/api";

export default function EmailSenderPage() {
  const { slug, project } = useCurrentProject();
  const { data: config, isLoading } = useEmailConfig(slug);
  const setMethod = useSetEmailMethod(slug);
  const initDomain = useInitDomainAuth(slug);
  const verifyDomain = useVerifyDomain(slug);
  const disconnectGmail = useDisconnectGmail(slug);
  const disconnectDomain = useDisconnectDomain(slug);

  const [domain, setDomain] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);

  useEffect(() => {
    if (config) {
      if (config.custom_domain) setDomain(config.custom_domain);
      if (config.custom_from_email) setFromEmail(config.custom_from_email);
      if (config.custom_from_name) setFromName(config.custom_from_name);
      if (config.dns_records && config.dns_records.length > 0) {
        setDnsRecords(config.dns_records);
      }
    }
  }, [config]);

  const currentMethod = config?.method ?? "windback_default";

  function handleSelectWindback() {
    setMethod.mutate(
      { method: "windback_default" },
      {
        onSuccess: () => toast({ title: "Email method updated", description: "Now using Windback default sender." }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  }

  function handleConnectGmail() {
    fetch(`/api/proxy/projects/${slug}/email-config/gmail/auth-url`)
      .then((r) => r.json())
      .then((data) => {
        const url = data?.data?.url;
        if (url) {
          window.location.href = url;
        } else {
          toast({ title: "Error", description: "Failed to get Gmail auth URL", variant: "destructive" });
        }
      })
      .catch(() => toast({ title: "Error", description: "Failed to get Gmail auth URL", variant: "destructive" }));
  }

  function handleDisconnectGmail() {
    disconnectGmail.mutate(undefined, {
      onSuccess: () => toast({ title: "Gmail disconnected" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }

  function handleInitDomain() {
    if (!domain || !fromEmail) return;
    initDomain.mutate(
      { domain, from_email: fromEmail, from_name: fromName || undefined },
      {
        onSuccess: (data) => {
          setDnsRecords(data.dns_records);
          toast({ title: "Domain configured", description: "Add the CNAME records below to your DNS provider." });
        },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  }

  function handleVerifyDomain() {
    verifyDomain.mutate(undefined, {
      onSuccess: (data) => {
        if (data.verified) {
          toast({ title: "Domain verified!", description: "Emails will now send from your custom domain." });
        } else {
          toast({ title: "Not verified yet", description: "DNS records haven't propagated yet. Try again in a few minutes.", variant: "destructive" });
        }
      },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }

  function handleDisconnectDomain() {
    disconnectDomain.mutate(undefined, {
      onSuccess: () => {
        setDnsRecords([]);
        setDomain("");
        setFromEmail("");
        setFromName("");
        toast({ title: "Domain disconnected" });
      },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Email Sender</h1>
        <p className="text-sm text-muted-foreground">
          Choose how Windback sends recovery and dunning emails on behalf of {project.name}.
        </p>
      </div>

      {/* Method 1: Windback Default */}
      <Card className={currentMethod === "windback_default" ? "border-[var(--accent)]" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Windback Default
              {currentMethod === "windback_default" && (
                <Badge variant="outline" className="text-[var(--accent)] border-[var(--accent)] text-xs ml-1">Active</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Emails sent from <strong>notify@windback.io</strong> with your support email as Reply-To.
              Zero setup — works immediately.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {currentMethod === "windback_default" ? (
            <div className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">
              <p>From: <span className="text-foreground font-medium">Windback Notifications &lt;notify@windback.io&gt;</span></p>
              {project.support_email && (
                <p className="mt-1">Reply-To: <span className="text-foreground font-medium">{project.support_email}</span></p>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleSelectWindback} disabled={setMethod.isPending}>
              Use Windback Default
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Method 2: Gmail OAuth */}
      <Card className={currentMethod === "gmail_oauth" ? "border-[var(--accent)]" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <ExternalLink className="h-4 w-4" />
              Gmail / Google Workspace
              {currentMethod === "gmail_oauth" && (
                <Badge variant="outline" className="text-[var(--accent)] border-[var(--accent)] text-xs ml-1">Active</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Connect your Gmail or Google Workspace account. Emails send from your actual address.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {currentMethod === "gmail_oauth" && config?.gmail_sender_email ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md bg-secondary p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span>Connected as <strong>{config.gmail_sender_email}</strong></span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGmail}
                disabled={disconnectGmail.isPending}
              >
                {disconnectGmail.isPending ? "Disconnecting..." : "Disconnect Gmail"}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={handleConnectGmail}>
              Connect Gmail
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Method 3: Custom Domain */}
      <Card className={currentMethod === "custom_domain" ? "border-[var(--accent)]" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Custom Domain
              {currentMethod === "custom_domain" && config?.domain_verified && (
                <Badge variant="outline" className="text-[var(--accent)] border-[var(--accent)] text-xs ml-1">Verified</Badge>
              )}
              {currentMethod === "custom_domain" && !config?.domain_verified && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs ml-1">Pending DNS</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Authenticate your domain with SendGrid. Add 3 CNAME records and emails send from
              your domain (e.g. hello@mail.yourdomain.com).
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Domain setup form */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Root Domain</Label>
              <Input
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">e.g. example.com (without www or mail.)</p>
            </div>
            <div className="space-y-1.5">
              <Label>From Email</Label>
              <Input
                type="email"
                placeholder="hello@mail.yourdomain.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>From Name (optional)</Label>
              <Input
                placeholder="Your Name or Company"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInitDomain}
              disabled={!domain || !fromEmail || initDomain.isPending}
            >
              {initDomain.isPending ? (
                <><Loader2 className="h-3 w-3 animate-spin mr-1" />Configuring...</>
              ) : dnsRecords.length > 0 ? "Reconfigure" : "Configure Domain"}
            </Button>
            {currentMethod === "custom_domain" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectDomain}
                disabled={disconnectDomain.isPending}
              >
                Disconnect
              </Button>
            )}
          </div>

          {/* DNS Records table */}
          {dnsRecords.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Add these CNAME records to your DNS provider:</p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Host / Name</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Value</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsRecords.map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2 font-mono">{r.type}</td>
                        <td className="px-3 py-2 font-mono break-all">{r.host}</td>
                        <td className="px-3 py-2 font-mono break-all">{r.value}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => copyToClipboard(r.value)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleVerifyDomain}
                  disabled={verifyDomain.isPending}
                >
                  {verifyDomain.isPending ? (
                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />Verifying...</>
                  ) : "Verify DNS"}
                </Button>
                {config?.domain_verified && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

