"use client";

import { Button } from "@windback/ui";
import { toast } from "@windback/ui";
import { ChurnRiskHeroCard } from "@/components/dashboard/churn-risk-hero-card";
import { RiskScoresTable } from "@/components/dashboard/risk-scores-table";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useChurnRiskStats,
  useChurnRiskScores,
  useRecalculateChurnRisk,
  useExportChurnRiskCSV,
} from "@/hooks/use-churn-risk";
import { RefreshCw, Settings, Download } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ChurnRiskPage() {
  const { slug } = useCurrentProject();
  const { data: stats, isLoading: statsLoading } = useChurnRiskStats(slug);
  const { data: scores, isLoading: scoresLoading } = useChurnRiskScores(slug);
  const recalculate = useRecalculateChurnRisk(slug);
  const exportCSV = useExportChurnRiskCSV(slug);

  function handleRecalculate() {
    recalculate.mutate(undefined, {
      onSuccess: () => toast({ title: "Scores recalculated" }),
      onError: (err) =>
        toast({
          title: "Recalculation failed",
          description: err.message,
          variant: "destructive",
        }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Churn Risk
          </h1>
          <p className="text-sm text-muted-foreground">
            Predictive churn scores for your customers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculate.isPending}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${recalculate.isPending ? "animate-spin" : ""}`}
            />
            {recalculate.isPending ? "Recalculating..." : "Recalculate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportCSV.mutate(undefined, {
                onError: (err) =>
                  toast({
                    title: "Export failed",
                    description: err.message,
                    variant: "destructive",
                  }),
              })
            }
            disabled={exportCSV.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            {exportCSV.isPending ? "Exporting..." : "Export CSV"}
          </Button>
          <Link href={`/dashboard/p/${slug}/settings/churn-risk`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ChurnRiskHeroCard stats={stats} isLoading={statsLoading} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <RiskScoresTable scores={scores ?? []} isLoading={scoresLoading} />
      </motion.div>
    </div>
  );
}
