"use client";

import { useCurrentProject } from "@/providers/project-provider";
import { useContagionMap } from "@/hooks/use-contagion";
import {
  ContagionGraph,
  ClusterRiskBars,
  ContagionScoreGauge,
} from "@/components/dashboard/contagion-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@windback/ui";
import { Loader2, Network, GitBranch, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function ContagionPage() {
  const { slug } = useCurrentProject();
  const { data, isLoading } = useContagionMap(slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.total_nodes === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Network className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No contagion data available yet. Once churn scores are calculated,
          the contagion map will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Churn Contagion Map
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualize how churn spreads across customer segments. Nodes represent
          customers; edges show correlated churn patterns.
        </p>
      </div>

      {/* Top row: gauge + stats */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Overall contagion score */}
        <Card>
          <CardContent className="flex items-center justify-center py-6">
            <ContagionScoreGauge score={data.overall_contagion_score} />
          </CardContent>
        </Card>

        {/* Node count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {data.total_nodes}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.nodes.filter((n) => n.is_churned).length} churned
            </p>
          </CardContent>
        </Card>

        {/* Edge count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              Correlations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {data.total_edges}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              churn correlation edges
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Network graph */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="h-4 w-4" />
              Network Graph
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContagionGraph
              nodes={data.nodes}
              edges={data.edges}
              clusters={data.clusters}
            />
            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                Churned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
                High risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
                Medium risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                Low risk
              </span>
              <span className="text-muted-foreground/60">
                Node size = risk score | Line thickness = correlation strength
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cluster risk breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Cluster Risk Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClusterRiskBars clusters={data.clusters} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
