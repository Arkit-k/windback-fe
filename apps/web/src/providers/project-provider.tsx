"use client";

import { createContext, useContext } from "react";
import type { Project } from "@/types/api";

interface ProjectContextValue {
  project: Project;
  slug: string;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  return (
    <ProjectContext.Provider value={{ project, slug: project.slug }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useCurrentProject(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useCurrentProject must be used within a ProjectProvider");
  }
  return context;
}
