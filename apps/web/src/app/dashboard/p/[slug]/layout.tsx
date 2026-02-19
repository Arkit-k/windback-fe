"use client";

import { use } from "react";
import { useProject } from "@/hooks/use-projects";
import { ProjectProvider } from "@/providers/project-provider";
import { Skeleton } from "@windback/ui";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: project, isLoading, error } = useProject(slug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return <ProjectProvider project={project}>{children}</ProjectProvider>;
}
