import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.pageTree;

  return (
    <DocsLayout
      tree={tree}
      nav={{
        title: (
          <span className="text-base font-semibold tracking-tight text-fd-primary" style={{ fontFamily: "var(--font-serif), serif" }}>
            Windback<span>.</span>
          </span>
        ),
        url: "/",
      }}
      links={[
        { text: "Dashboard", url: "http://localhost:3001", external: true },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
