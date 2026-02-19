import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";

const mdxSource = docs.toFumadocsSource();

// fumadocs-mdx v11 returns files as a lazy function, resolve it for loader
if (typeof mdxSource.files === "function") {
  (mdxSource as any).files = (mdxSource.files as unknown as () => unknown[])();
}

export const source = loader({
  baseUrl: "/docs",
  source: mdxSource,
});
