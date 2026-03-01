"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  cn,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@windback/ui";
import { useProjects } from "@/hooks/use-projects";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Activity,
  CreditCard,
  Settings,
  HelpCircle,
  Key,
  Plug,
  Globe,
  FolderOpen,
  BarChart3,
  Receipt,
  Shield,
  RefreshCw,
  UserRound,
  Mail,
  Bell,
  FileText,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: projects } = useProjects();

  const currentSlug = useMemo(() => {
    const match = pathname.match(/^\/dashboard\/p\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const isProjectRoute = !!currentSlug;

  const mainNav = isProjectRoute
    ? [
        { href: `/dashboard/p/${currentSlug}`, label: "Overview", icon: LayoutDashboard, exact: true },
        { href: `/dashboard/p/${currentSlug}/events`, label: "Churn Events", icon: Activity },
        { href: `/dashboard/p/${currentSlug}/failed-payments`, label: "Failed Payments", icon: CreditCard },
        { href: `/dashboard/p/${currentSlug}/analytics`, label: "Analytics", icon: BarChart3 },
      ]
    : [
        { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
        { href: "/dashboard/billing", label: "Billing", icon: Receipt },
      ];

  const settingsNav = isProjectRoute
    ? [
        { href: `/dashboard/p/${currentSlug}/settings`, label: "General", icon: Settings, exact: true },
        { href: `/dashboard/p/${currentSlug}/settings/api-keys`, label: "API Keys", icon: Key },
        { href: `/dashboard/p/${currentSlug}/settings/integrations`, label: "Integrations", icon: Plug },
        { href: `/dashboard/p/${currentSlug}/settings/allowed-origins`, label: "Allowed Origins", icon: Globe },
        { href: `/dashboard/p/${currentSlug}/settings/dunning`, label: "Dunning", icon: RefreshCw },
        { href: `/dashboard/p/${currentSlug}/settings/email`, label: "Email Sender", icon: Mail },
        { href: `/dashboard/p/${currentSlug}/settings/notifications`, label: "Notifications", icon: Bell },
        { href: `/dashboard/p/${currentSlug}/settings/templates`, label: "Templates", icon: FileText },
      ]
    : [
        { href: "/dashboard/settings/profile", label: "Profile", icon: UserRound },
        { href: "/dashboard/settings/security", label: "Security", icon: Shield },
      ];

  const bottomNav = [
    { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  ];

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">

      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link
          href="/dashboard/projects"
          className="flex items-center font-display text-lg font-semibold text-[var(--accent)]"
        >
          <span>Windback<span>.</span></span>
        </Link>
      </div>

      {/* Project Switcher */}
      {isProjectRoute && projects && projects.length > 0 && (
        <div className="border-b border-border p-3">
          <Select
            value={currentSlug ?? ""}
            onValueChange={(slug) => router.push(`/dashboard/p/${slug}`)}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
              {projects.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </div>

        {settingsNav.length > 0 && (
          <>
            <div className="my-3 h-px bg-border" />
            <div className="space-y-1">
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Settings
              </span>
              {settingsNav.map((item) => (
                <NavItem key={item.href} {...item} pathname={pathname} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-1 border-t border-border p-3">
        {bottomNav.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
        <div className="mt-2 px-3 text-[10px] text-muted-foreground/50">
          Windback v1.0
        </div>
      </div>

    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
  exact,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  exact?: boolean;
}) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-all duration-150",
        isActive
          ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      <span className="overflow-hidden whitespace-nowrap">{label}</span>
    </Link>
  );
}
