"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useSurveys,
  useCreateSurvey,
  useDeleteSurvey,
} from "@/hooks/use-surveys";
import type { Survey, SurveyType, CreateSurveyRequest } from "@/types/api";
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
  ClipboardList,
  Plus,
  Trash2,
  Loader2,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  nps: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  csat: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  closed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function SurveysPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: surveys, isLoading } = useSurveys(slug);
  const createSurvey = useCreateSurvey(slug);
  const deleteSurvey = useDeleteSurvey(slug);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [surveyType, setSurveyType] = useState<SurveyType>("nps");
  const [question, setQuestion] = useState("");

  function resetForm() {
    setName("");
    setSurveyType("nps");
    setQuestion("");
  }

  function handleCreate() {
    if (!name.trim() || !question.trim()) return;
    createSurvey.mutate(
      { name, survey_type: surveyType, question },
      {
        onSuccess: () => {
          toast({ title: "Survey created" });
          setShowCreate(false);
          resetForm();
        },
        onError: (err) =>
          toast({
            title: "Failed to create survey",
            description: err.message,
            variant: "destructive",
          }),
      }
    );
  }

  function handleDelete(id: string) {
    deleteSurvey.mutate(id, {
      onSuccess: () => toast({ title: "Survey deleted" }),
      onError: (err) =>
        toast({
          title: "Failed to delete survey",
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
            Surveys
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage NPS and CSAT surveys to measure customer
            satisfaction.
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
          Create Survey
        </Button>
      </div>

      {/* Survey List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !surveys || surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No surveys yet. Create your first survey to start collecting
            feedback.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card
              key={survey.id}
              className="transition-colors hover:shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium truncate">
                    {survey.name}
                  </CardTitle>
                  <div className="flex shrink-0 gap-1">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase",
                        TYPE_COLORS[survey.survey_type] ?? TYPE_COLORS.nps
                      )}
                    >
                      {survey.survey_type}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_COLORS[survey.status] ?? STATUS_COLORS.draft
                      )}
                    >
                      {survey.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {survey.question}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>
                    {survey.response_count}{" "}
                    {survey.response_count === 1 ? "response" : "responses"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {new Date(survey.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-1 border-t border-border pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(survey.id)}
                    disabled={deleteSurvey.isPending}
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Survey</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="survey-name">Name</Label>
              <Input
                id="survey-name"
                placeholder="e.g. Monthly NPS Survey"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Survey Type</Label>
              <Select
                value={surveyType}
                onValueChange={(v) => setSurveyType(v as SurveyType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nps">NPS</SelectItem>
                  <SelectItem value="csat">CSAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="survey-question">Question</Label>
              <Input
                id="survey-question"
                placeholder="How likely are you to recommend us?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createSurvey.isPending || !name.trim() || !question.trim()
              }
            >
              {createSurvey.isPending ? "Creating..." : "Create Survey"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
