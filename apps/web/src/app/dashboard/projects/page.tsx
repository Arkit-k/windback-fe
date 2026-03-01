"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Label, Skeleton,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@windback/ui";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { useUsage } from "@/hooks/use-billing";
import { formatDate } from "@/lib/utils";
import { Plus, FolderOpen, ArrowRight, Zap, Copy, Check, Shield } from "lucide-react";
import type { CreateProjectResponse } from "@/types/api";

const productTypes = [
  { value: "SaaS", label: "SaaS" },
  { value: "Subscription", label: "Subscription" },
  { value: "Marketplace", label: "Marketplace" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "Other", label: "Other" },
];

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const { data: usage } = useUsage();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [productType, setProductType] = useState("SaaS");
  const [supportEmail, setSupportEmail] = useState("");
  const [keyReveal, setKeyReveal] = useState<CreateProjectResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const atProjectLimit =
    usage != null && usage.projects_used >= usage.projects_limit;

  function copyKey(value: string, label: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleCreate() {
    if (!name.trim()) return;
    createProject.mutate(
      { name: name.trim(), product_type: productType, support_email: supportEmail.trim() },
      {
        onSuccess: (result) => {
          setShowCreate(false);
          setName("");
          setProductType("SaaS");
          setSupportEmail("");
          setKeyReveal(result);
        },
      },
    );
  }

  function handleKeyRevealDone() {
    if (!keyReveal) return;
    const slug = keyReveal.project.slug;
    setKeyReveal(null);
    router.push(`/dashboard/p/${slug}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your SaaS products and their churn recovery settings.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/dashboard/p/${project.slug}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <CardDescription className="text-xs">
                  {project.product_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {formatDate(project.created_at)}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-display text-lg font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
              Create your first project to start tracking churn events and recovering revenue.
            </p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Key reveal dialog — shown once after project creation */}
      <Dialog open={!!keyReveal} onOpenChange={() => keyReveal && handleKeyRevealDone()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Save Your API Keys
            </DialogTitle>
            <DialogDescription>
              These keys are shown <strong>once only</strong>. Copy and store them securely before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Public Key", value: keyReveal?.raw_public_key ?? "", hint: "Use in the cancel widget and webhook URLs." },
              { label: "Secret Key", value: keyReveal?.raw_secret_key ?? "", hint: "Use for server-side SDK calls. Never expose in client code." },
            ].map(({ label, value, hint }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className="flex items-center gap-2 rounded-sm border border-border bg-secondary p-2">
                  <code className="flex-1 break-all text-xs font-mono">{value}</code>
                  <Button variant="outline" size="icon" className="shrink-0 h-7 w-7" onClick={() => copyKey(value, label)}>
                    {copiedKey === label ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={handleKeyRevealDone}>
            Done — I&apos;ve saved both keys
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {atProjectLimit ? "Project Limit Reached" : "Create Project"}
            </DialogTitle>
            <DialogDescription>
              {atProjectLimit
                ? `Your ${usage?.plan_tier ?? "starter"} plan allows up to ${usage?.projects_limit ?? 1} project${(usage?.projects_limit ?? 1) === 1 ? "" : "s"}. Upgrade your plan to create more projects.`
                : "Set up a new project for your SaaS product."}
            </DialogDescription>
          </DialogHeader>
          {atProjectLimit ? (
            <div className="flex flex-col gap-3">
              <Button
                className="w-full"
                onClick={() => {
                  setShowCreate(false);
                  router.push("/dashboard/billing");
                }}
              >
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>SaaS Name</Label>
                <Input
                  placeholder="My SaaS Product"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  type="email"
                  placeholder="support@example.com"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
              {createProject.isError && (
                <p className="text-sm text-destructive">
                  {createProject.error.message}
                </p>
              )}
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!name.trim() || createProject.isPending}
              >
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
