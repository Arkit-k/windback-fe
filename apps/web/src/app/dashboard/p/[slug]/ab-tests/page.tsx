"use client";

import { useState } from "react";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useABTests,
  useCreateABTest,
  useStartABTest,
  useCompleteABTest,
  useDeleteABTest,
} from "@/hooks/use-ab-tests";
import type { ABTestVariant, ABTestWithResults, ABTestType } from "@/types/api";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  toast,
} from "@windback/ui";
import { FlaskConical, Plus, Trash2, Play, Trophy, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const TEST_TYPE_LABELS: Record<string, string> = {
  subject_line: "Subject Line",
  tone: "Tone",
  offer: "Offer",
  template: "Template",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  running: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function generateVariantId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ABTestsPage() {
  const { slug } = useCurrentProject();
  const { data: tests, isLoading } = useABTests(slug);
  const createTest = useCreateABTest(slug);
  const startTest = useStartABTest(slug);
  const completeTest = useCompleteABTest(slug);
  const deleteTest = useDeleteABTest(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTestWithResults | null>(null);
  const [declareWinnerFor, setDeclareWinnerFor] = useState<ABTestWithResults | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [testType, setTestType] = useState<ABTestType>("subject_line");
  const [variants, setVariants] = useState<ABTestVariant[]>([
    { id: generateVariantId(), name: "Variant A", value: "", weight: 50 },
    { id: generateVariantId(), name: "Variant B", value: "", weight: 50 },
  ]);

  function resetForm() {
    setName("");
    setDescription("");
    setTestType("subject_line");
    setVariants([
      { id: generateVariantId(), name: "Variant A", value: "", weight: 50 },
      { id: generateVariantId(), name: "Variant B", value: "", weight: 50 },
    ]);
  }

  function handleCreate() {
    if (!name.trim() || variants.length < 2) return;
    createTest.mutate(
      { name, description, test_type: testType, variants },
      {
        onSuccess: () => {
          toast({ title: "A/B test created" });
          setShowCreate(false);
          resetForm();
        },
        onError: (err) =>
          toast({ title: "Failed to create test", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleStart(testId: string) {
    startTest.mutate(testId, {
      onSuccess: () => toast({ title: "Test started" }),
      onError: (err) =>
        toast({ title: "Failed to start test", description: err.message, variant: "destructive" }),
    });
  }

  function handleDeclareWinner(testId: string, variantId: string) {
    completeTest.mutate(
      { testId, winnerVariantId: variantId },
      {
        onSuccess: () => {
          toast({ title: "Winner declared" });
          setDeclareWinnerFor(null);
          setSelectedTest(null);
        },
        onError: (err) =>
          toast({ title: "Failed to declare winner", description: err.message, variant: "destructive" }),
      },
    );
  }

  function handleDelete(testId: string) {
    deleteTest.mutate(testId, {
      onSuccess: () => {
        toast({ title: "Test deleted" });
        setSelectedTest(null);
      },
      onError: (err) =>
        toast({ title: "Failed to delete test", description: err.message, variant: "destructive" }),
    });
  }

  function addVariant() {
    const letter = String.fromCharCode(65 + variants.length);
    setVariants([
      ...variants,
      { id: generateVariantId(), name: `Variant ${letter}`, value: "", weight: Math.floor(100 / (variants.length + 1)) },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 2) return;
    setVariants(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof ABTestVariant, value: string | number) {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">A/B Tests</h1>
          <p className="text-sm text-muted-foreground">
            Split-test subject lines, tones, and offers to maximize recovery.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </div>

      {/* Test Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !tests || tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <FlaskConical className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No A/B tests yet. Create your first test to start optimizing.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <button
                type="button"
                onClick={() => setSelectedTest(test)}
                className="w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-[var(--accent)] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground truncate">{test.name}</h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[test.status] ?? STATUS_COLORS.draft}`}
                  >
                    {test.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {TEST_TYPE_LABELS[test.test_type] ?? test.test_type}
                  {" \u00b7 "}
                  {test.variants?.length ?? 0} variants
                  {" \u00b7 "}
                  {test.total_sends} sends
                </p>
                {test.winner_variant_id && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                    <Trophy className="h-3 w-3" />
                    Winner:{" "}
                    {test.variants?.find((v) => v.id === test.winner_variant_id)?.name ??
                      test.winner_variant_id}
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
            <DialogDescription>
              Set up variants to split-test your recovery emails.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="test-name">Name</Label>
              <Input
                id="test-name"
                placeholder="e.g. Subject line test - March"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="test-desc">Description (optional)</Label>
              <Input
                id="test-desc"
                placeholder="What are you testing?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Test Type</Label>
              <Select value={testType} onValueChange={(v) => setTestType(v as ABTestType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subject_line">Subject Line</SelectItem>
                  <SelectItem value="tone">Tone</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variants</Label>
                <Button variant="ghost" size="sm" onClick={addVariant} type="button">
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
              {variants.map((v, i) => (
                <div key={v.id} className="flex items-center gap-2">
                  <Input
                    className="w-28"
                    placeholder="Name"
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                  />
                  <Input
                    className="flex-1"
                    placeholder="Value (e.g. subject line text)"
                    value={v.value}
                    onChange={(e) => updateVariant(i, "value", e.target.value)}
                  />
                  <Input
                    className="w-16"
                    type="number"
                    placeholder="%"
                    value={v.weight}
                    onChange={(e) => updateVariant(i, "weight", parseInt(e.target.value) || 0)}
                  />
                  {variants.length > 2 && (
                    <button type="button" onClick={() => removeVariant(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createTest.isPending || !name.trim()}>
              {createTest.isPending ? "Creating..." : "Create Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTest.name}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedTest.status] ?? STATUS_COLORS.draft}`}
                  >
                    {selectedTest.status}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {TEST_TYPE_LABELS[selectedTest.test_type] ?? selectedTest.test_type}
                  {selectedTest.description && ` \u2014 ${selectedTest.description}`}
                </DialogDescription>
              </DialogHeader>

              {/* Results Bars */}
              <div className="space-y-4">
                {selectedTest.results?.map((result) => {
                  const variant = selectedTest.variants?.find((v) => v.id === result.variant_id);
                  const isWinner = selectedTest.winner_variant_id === result.variant_id;
                  const maxSends = Math.max(...(selectedTest.results?.map((r) => r.sends) ?? [1]), 1);
                  const maxRecoveries = Math.max(...(selectedTest.results?.map((r) => r.recoveries) ?? [1]), 1);

                  return (
                    <div
                      key={result.id}
                      className={`rounded-lg border p-3 ${isWinner ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {variant?.name ?? result.variant_id}
                          {isWinner && (
                            <Trophy className="ml-1 inline h-3.5 w-3.5 text-green-600" />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${(result.revenue_cents / 100).toFixed(2)} revenue
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Sends</span>
                          <div className="mt-1 h-2 rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${(result.sends / maxSends) * 100}%` }}
                            />
                          </div>
                          <span className="font-medium">{result.sends}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opens</span>
                          <div className="mt-1 h-2 rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-cyan-500"
                              style={{ width: `${result.sends > 0 ? (result.opens / result.sends) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-medium">{result.opens}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks</span>
                          <div className="mt-1 h-2 rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-violet-500"
                              style={{ width: `${result.sends > 0 ? (result.clicks / result.sends) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-medium">{result.clicks}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recoveries</span>
                          <div className="mt-1 h-2 rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${(result.recoveries / maxRecoveries) * 100}%` }}
                            />
                          </div>
                          <span className="font-medium">{result.recoveries}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter className="gap-2">
                {selectedTest.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => handleStart(selectedTest.id)}
                    disabled={startTest.isPending}
                  >
                    <Play className="mr-1 h-4 w-4" />
                    {startTest.isPending ? "Starting..." : "Start Test"}
                  </Button>
                )}
                {selectedTest.status === "running" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeclareWinnerFor(selectedTest)}
                  >
                    <Trophy className="mr-1 h-4 w-4" />
                    Declare Winner
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(selectedTest.id)}
                  disabled={deleteTest.isPending}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  {deleteTest.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Declare Winner Dialog */}
      <Dialog open={!!declareWinnerFor} onOpenChange={() => setDeclareWinnerFor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Declare Winner</DialogTitle>
            <DialogDescription>Choose the winning variant to auto-promote.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {declareWinnerFor?.variants?.map((v) => (
              <Button
                key={v.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  declareWinnerFor && handleDeclareWinner(declareWinnerFor.id, v.id)
                }
                disabled={completeTest.isPending}
              >
                <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                {v.name}: {v.value || "(no value)"}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
