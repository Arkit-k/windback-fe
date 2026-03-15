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
import { useSidebarCampaigns } from "@/hooks/use-campaigns";
import { useMemo, useState } from "react";
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
  Gift,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  Users,
  LineChart,
  Filter,
  Workflow,
  FlaskConical,
  Ghost,
  Heart,
  Gavel,
  Network,
  Radar,
  Clock,
  ChevronDown,
  Megaphone,
  Plus,
  HeartPulse,
  MessageSquare,
  Headphones,
  DollarSign,
  BellRing,
  ListChecks,
  Store,
  Radio,
  LayoutGrid,
  ArrowRightLeft,
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
    ? []
    : [
        { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
        { href: "/dashboard/billing", label: "Billing", icon: Receipt },
      ];

  const settingsNav = isProjectRoute
    ? []
    : [
        { href: "/dashboard/settings/profile", label: "Profile", icon: UserRound },
        { href: "/dashboard/settings/security", label: "Security", icon: Shield },
      ];

  const p = `/dashboard/p/${currentSlug}`;

  type SidebarEntry =
    | { type: "link"; href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }
    | { type: "group"; label: string; icon: React.ComponentType<{ className?: string }>; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] }
    | { type: "dynamic-group"; href: string; label: string; icon: React.ComponentType<{ className?: string }> };

  const projectNav: SidebarEntry[] = isProjectRoute
    ? [
        { type: "link", href: p, label: "Overview", icon: LayoutDashboard, exact: true },
        {
          type: "group", label: "Churn & Retention", icon: Activity,
          items: [
            { href: `${p}/events`, label: "Churn Events", icon: Activity },
            { href: `${p}/churn-risk`, label: "Churn Risk", icon: AlertTriangle },
            { href: `${p}/ghost-customers`, label: "Ghost Customers", icon: Ghost },
            { href: `${p}/win-back`, label: "Win-Back", icon: Gavel },
            { href: `${p}/contagion`, label: "Contagion Map", icon: Network },
          ],
        },
        { type: "link", href: `${p}/failed-payments`, label: "Failed Payments", icon: CreditCard },
        {
          type: "group", label: "Analytics", icon: BarChart3,
          items: [
            { href: `${p}/analytics`, label: "Analytics", icon: BarChart3 },
            { href: `${p}/market-pulse`, label: "Market Pulse", icon: TrendingUp },
            { href: `${p}/cohorts`, label: "Cohorts", icon: Users },
            { href: `${p}/forecasting`, label: "Forecasting", icon: LineChart },
            { href: `${p}/segments`, label: "Segments", icon: Filter },
            { href: `${p}/benchmarking`, label: "Benchmarks", icon: BarChart3 },
            { href: `${p}/mood`, label: "Mood Ring", icon: Heart },
            { href: `${p}/competitor-radar`, label: "Competitor Radar", icon: Radar },
            { href: `${p}/time-machine`, label: "Time Machine", icon: Clock },
            { href: `${p}/ltv`, label: "LTV Tracking", icon: DollarSign },
            { href: `${p}/exchange-rates`, label: "Exchange Rates", icon: ArrowRightLeft },
          ],
        },
        {
          type: "group", label: "Customer Success", icon: HeartPulse,
          items: [
            { href: `${p}/health-scores`, label: "Health Scores", icon: HeartPulse },
            { href: `${p}/surveys`, label: "NPS/CSAT Surveys", icon: MessageSquare },
            { href: `${p}/csm`, label: "CSM Assignments", icon: Headphones },
            { href: `${p}/onboarding`, label: "Onboarding", icon: ListChecks },
          ],
        },
        {
          type: "group", label: "Automation", icon: Workflow,
          items: [
            { href: `${p}/playbooks`, label: "Playbooks", icon: Workflow },
            { href: `${p}/ab-tests`, label: "A/B Tests", icon: FlaskConical },
            { href: `${p}/alerts`, label: "Alerts", icon: BellRing },
          ],
        },
        { type: "dynamic-group", href: `${p}/campaigns`, label: "Campaigns", icon: Megaphone },
        {
          type: "group", label: "Tools", icon: Radio,
          items: [
            { href: `${p}/integrations`, label: "Integrations", icon: Store },
            { href: `${p}/status-page`, label: "Status Page", icon: Radio },
            { href: `${p}/dashboards`, label: "Custom Dashboards", icon: LayoutGrid },
          ],
        },
        {
          type: "group", label: "Settings", icon: Settings,
          items: [
            { href: `${p}/settings`, label: "General", icon: Settings, exact: true },
            { href: `${p}/settings/api-keys`, label: "API Keys", icon: Key },
            { href: `${p}/settings/integrations`, label: "Integrations", icon: Plug },
            { href: `${p}/settings/allowed-origins`, label: "Allowed Origins", icon: Globe },
            { href: `${p}/settings/dunning`, label: "Dunning", icon: RefreshCw },
            { href: `${p}/settings/email`, label: "Email Sender", icon: Mail },
            { href: `${p}/settings/notifications`, label: "Notifications", icon: Bell },
            { href: `${p}/settings/templates`, label: "Templates", icon: FileText },
            { href: `${p}/settings/retention-offers`, label: "Retention Offers", icon: Gift },
            { href: `${p}/settings/churn-risk`, label: "Churn Risk", icon: AlertTriangle },
            { href: `${p}/settings/audit-logs`, label: "Audit Log", icon: Shield },
            { href: `${p}/settings/import-export`, label: "Import / Export", icon: ArrowLeftRight },
          ],
        },
      ]
    : [];

  const bottomNav = [
    { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  ];

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card md:w-60">

      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link
          href="/dashboard/projects"
          className="flex items-center font-display text-lg font-semibold text-accent-readable"
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
              {projects.map((proj) => (
                <SelectItem key={proj.slug} value={proj.slug}>
                  {proj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar p-3">
        {/* Non-project routes: flat lists */}
        {mainNav.length > 0 && (
          <div className="space-y-1">
            {mainNav.map((item) => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
        )}

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

        {/* Project routes: grouped nav */}
        {projectNav.length > 0 && (
          <div className="space-y-1">
            {projectNav.map((entry) =>
              entry.type === "link" ? (
                <NavItem key={entry.href} href={entry.href} label={entry.label} icon={entry.icon} exact={entry.exact} pathname={pathname} />
              ) : entry.type === "dynamic-group" ? (
                <DynamicNavGroup key={entry.label} href={entry.href} label={entry.label} icon={entry.icon} slug={currentSlug!} pathname={pathname} />
              ) : (
                <NavGroup key={entry.label} label={entry.label} icon={entry.icon} items={entry.items} pathname={pathname} />
              )
            )}
          </div>
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

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
  exact,
}: NavItemProps & { pathname: string }) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-all duration-150",
        isActive
          ? "bg-[var(--accent-light)] text-accent-readable font-medium"
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

function DynamicNavGroup({
  href,
  label,
  icon: Icon,
  slug,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  slug: string;
  pathname: string;
}) {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const [open, setOpen] = useState(isActive);
  const { data: campaignData } = useSidebarCampaigns(slug, open || isActive);
  const campaigns = campaignData?.data;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm transition-all duration-150",
          isActive
            ? "text-accent-readable font-medium"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 overflow-hidden whitespace-nowrap text-left">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="ml-2 space-y-0.5 border-l border-border pl-1 pt-0.5">
          {campaigns?.map((c) => (
            <NavItem
              key={c.id}
              href={`${href}/${c.id}`}
              label={c.name}
              icon={Megaphone}
              pathname={pathname}
            />
          ))}
          <Link
            href={href}
            className="flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150"
          >
            <Plus className="h-3 w-3" /> New
          </Link>
        </div>
      </div>
    </div>
  );
}

function NavGroup({
  label,
  icon: Icon,
  items,
  pathname,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItemProps[];
  pathname: string;
}) {
  const hasActiveChild = items.some((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm transition-all duration-150",
          hasActiveChild
            ? "text-accent-readable font-medium"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 overflow-hidden whitespace-nowrap text-left">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="ml-2 space-y-0.5 border-l border-border pl-1 pt-0.5">
          {items.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </div>
      </div>
    </div>
  );
}
