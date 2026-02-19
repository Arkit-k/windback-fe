import Link from "next/link";
import { Button } from "@windback/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-display text-6xl font-semibold text-foreground">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
