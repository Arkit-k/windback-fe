"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, DollarSign, ArrowUpRight, Mail, Sparkles } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useStats } from "@/hooks/use-stats";
import { useChurnEvents } from "@/hooks/use-churn-events";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import type { ChurnEventStatus } from "@/types/api";

type PreviewTab = "overview" | "events" | "settings";
type SettingsView = "project" | "api_keys" | "integrations" | "origins";

function safeFormatCurrency(cents: number, currency: string) {
  try {
    return formatCurrency(cents, currency);
  } catch {
    return formatCurrency(cents, "USD");
  }
}

function MiniStatCard({ icon: Icon, label, value, change, delay }: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  delay: number;
}) {
  return (
    <motion.div
      className="rounded-sm border border-border/50 bg-card p-3 transition-all duration-200 hover:border-primary/40 hover:shadow-sm cursor-default"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 20 } }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.15 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
        </motion.div>
      </div>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      <span className="text-[10px] text-green-600">{change}</span>
    </motion.div>
  );
}

function MiniTableRow({ name, email, status, mrr, delay }: {
  name: string;
  email: string;
  status: ChurnEventStatus | string;
  mrr: string;
  delay: number;
}) {
  const statusColors: Record<string, string> = {
    recovered: "bg-green-50 text-green-700",
    processing: "bg-amber-50 text-amber-700",
    new: "bg-blue-50 text-blue-700",
    email_sent: "bg-orange-50 text-orange-700",
  };

  return (
    <motion.div
      className="flex items-center justify-between border-b border-border/40 px-3 py-2 last:border-0 transition-colors duration-150 hover:bg-secondary/30 cursor-default"
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-foreground truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{email}</p>
      </div>
      <div className="flex items-center gap-2">
        <motion.span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusColors[status] ?? "bg-gray-50 text-gray-600"}`}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {STATUS_LABELS[status] ?? String(status ?? "new").replace("_", " ")}
        </motion.span>
        <span className="text-[11px] font-medium text-foreground w-14 text-right">{mrr}</span>
      </div>
    </motion.div>
  );
}

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("overview");
  const [settingsView, setSettingsView] = useState<SettingsView>("project");
  const { data: projects } = useProjects({ enabled: true });
  const activeProject = projects?.[0];
  const activeSlug = activeProject?.slug ?? "";

  const { data: stats } = useStats(activeSlug);
  const { data: events } = useChurnEvents(activeSlug, { page: 1 });

  const hasLiveData = !!activeSlug && (!!stats || (events?.data?.length ?? 0) > 0);

  const statValues = {
    totalEvents: hasLiveData ? (stats?.total_events ?? 0).toLocaleString() : "1,284",
    recovered: hasLiveData ? (stats?.recovered_events ?? 0).toLocaleString() : "342",
    mrrAtRisk: hasLiveData && stats ? safeFormatCurrency(stats.total_mrr_at_risk ?? 0, "USD") : "$24.8k",
    recoveryRate: hasLiveData && stats ? formatPercent(stats.recovery_rate ?? 0) : "26.6%",
  };

  const recentEvents = hasLiveData
    ? (events?.data ?? []).slice(0, 5).map((event) => ({
      name: event.customer_name || "Unknown Customer",
      email: event.customer_email,
      status: event.status,
      mrr: safeFormatCurrency(event.mrr_cents, String(event.currency || "USD").toUpperCase()),
    }))
    : [
      { name: "Sarah Johnson", email: "sarah@acme.co", status: "recovered", mrr: "$99/mo" },
      { name: "Mike Chen", email: "mike@startup.io", status: "processing", mrr: "$249/mo" },
      { name: "Emily Park", email: "emily@design.co", status: "new", mrr: "$49/mo" },
      { name: "Alex Rivera", email: "alex@saas.dev", status: "email_sent", mrr: "$199/mo" },
      { name: "Jordan Lee", email: "jordan@growth.co", status: "recovered", mrr: "$149/mo" },
    ];

  const highlightedName = recentEvents[0]?.name ?? "Sarah Johnson";
  const generatedCount = events?.data?.[0]?.variants?.length ?? 9;

  const headerContent: Record<PreviewTab, { title: string; description: string }> = {
    overview: {
      title: "Overview",
      description: "Track your churn events and recovery performance.",
    },
    events: {
      title: "Churn Events",
      description: "Review customer churn signals and recovery status in one place.",
    },
    settings: {
      title: "Settings",
      description: "Control project details, integrations, and recovery configuration.",
    },
  };

  return (
    <motion.div
      className="relative mx-auto mt-16 max-w-5xl px-4 sm:px-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        className="overflow-hidden rounded-sm border border-border/60 bg-card transition-shadow duration-500 hover:shadow-xl hover:shadow-primary/5"
        whileHover={{ y: -3, transition: { type: "spring", stiffness: 200, damping: 25 } }}
      >
        <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/50 px-4 py-2.5">
          <div className="flex gap-1.5">
            {["bg-red-400/80", "bg-yellow-400/80", "bg-green-400/80"].map((color) => (
              <motion.div
                key={color}
                className={`h-2.5 w-2.5 rounded-full ${color}`}
                whileHover={{ scale: 1.4 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              />
            ))}
          </div>
          <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-sm bg-background/80 text-[10px] text-muted-foreground">
            app.windbackai.com/dashboard
          </div>
        </div>

        <div className="flex min-h-[360px] sm:min-h-[420px]">
          <motion.div
            className="hidden w-44 shrink-0 border-r border-border/40 bg-card p-3 sm:block"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="mb-4 font-display text-sm font-semibold text-[var(--accent)]">Windback<span>.</span></div>
            <div className="space-y-0.5">
              {[
                { label: "Overview", tab: "overview" as PreviewTab },
                { label: "Churn Events", tab: "events" as PreviewTab },
                { label: "Settings", tab: "settings" as PreviewTab },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.tab);
                    if (item.tab === "settings") setSettingsView("project");
                  }}
                  className={`w-full rounded-sm px-2.5 py-1.5 text-left text-[11px] transition-colors duration-150 ${
                    activeTab === item.tab
                      ? "bg-[var(--accent-light)] font-medium text-[var(--accent)]"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="my-2 h-px bg-border/40" />
              <div className="px-2.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Settings</div>
              {[
                { label: "API Keys", view: "api_keys" as SettingsView },
                { label: "Integrations", view: "integrations" as SettingsView },
                { label: "Origins", view: "origins" as SettingsView },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActiveTab("settings");
                    setSettingsView(item.view);
                  }}
                  className={`w-full rounded-sm px-2.5 py-1.5 text-left text-[11px] transition-colors duration-150 ${
                    activeTab === "settings" && settingsView === item.view
                      ? "bg-[var(--accent-light)] font-medium text-[var(--accent)]"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <div className="flex-1 bg-background p-4 sm:p-5">
            <motion.div
              className="mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-foreground">{headerContent[activeTab].title}</h3>
              <p className="text-[10px] text-muted-foreground">{headerContent[activeTab].description}</p>
            </motion.div>

            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MiniStatCard icon={Activity} label="Total Events" value={statValues.totalEvents} change={hasLiveData ? "live project data" : "+12% this month"} delay={0.5} />
                  <MiniStatCard icon={TrendingUp} label="Recovered" value={statValues.recovered} change={hasLiveData ? `of ${statValues.totalEvents} events` : "+8 this week"} delay={0.6} />
                  <MiniStatCard icon={DollarSign} label="MRR at Risk" value={statValues.mrrAtRisk} change={hasLiveData && stats ? `${safeFormatCurrency(stats.recovered_mrr ?? 0, "USD")} recovered` : "-$3.2k recovered"} delay={0.7} />
                  <MiniStatCard icon={ArrowUpRight} label="Recovery Rate" value={statValues.recoveryRate} change={hasLiveData ? "updates with event status changes" : "+2.1% vs last month"} delay={0.8} />
                </div>

                <motion.div
                  className="mt-4 rounded-sm border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
                    <span className="text-[11px] font-semibold text-foreground">Recent Events</span>
                    <motion.span
                      className="text-[10px] text-[var(--accent)] cursor-pointer"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      View all -&gt;
                    </motion.span>
                  </div>
                  {recentEvents.map((event, idx) => (
                    <MiniTableRow
                      key={`overview-${event.email}-${idx}`}
                      name={event.name}
                      email={event.email}
                      status={event.status}
                      mrr={event.mrr}
                      delay={1.0 + idx * 0.05}
                    />
                  ))}
                </motion.div>

                <motion.div
                  className="mt-3 flex items-center gap-2 rounded-sm border border-[var(--accent)]/20 bg-[var(--accent-light)] px-3 py-2 cursor-default"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  whileHover={{ scale: 1.01, borderColor: "var(--accent)" }}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                  </motion.div>
                  <span className="text-[10px] text-[var(--accent)]">AI generated {generatedCount} recovery variants for {highlightedName}</span>
                  <motion.div
                    className="ml-auto"
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Mail className="h-3.5 w-3.5 text-[var(--accent)]" />
                  </motion.div>
                </motion.div>
              </>
            )}

            {activeTab === "events" && (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <MiniStatCard icon={Activity} label="All Events" value={statValues.totalEvents} change={hasLiveData ? "from your project" : "sample data"} delay={0.5} />
                  <MiniStatCard icon={TrendingUp} label="Recovered" value={statValues.recovered} change={hasLiveData ? statValues.recoveryRate : "26.6% recovery rate"} delay={0.6} />
                  <MiniStatCard icon={DollarSign} label="MRR at Risk" value={statValues.mrrAtRisk} change={hasLiveData ? "updates in real time" : "sample MRR"} delay={0.7} />
                </div>

                <motion.div
                  className="mt-4 rounded-sm border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <div className="border-b border-border/40 px-3 py-2">
                    <span className="text-[11px] font-semibold text-foreground">All Churn Events</span>
                  </div>
                  {recentEvents.map((event, idx) => (
                    <MiniTableRow
                      key={`events-${event.email}-${idx}`}
                      name={event.name}
                      email={event.email}
                      status={event.status}
                      mrr={event.mrr}
                      delay={0.9 + idx * 0.05}
                    />
                  ))}
                </motion.div>
              </>
            )}

            {activeTab === "settings" && settingsView === "project" && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Project</p>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{activeProject?.name ?? "Windback Demo"}</p>
                  <p className="text-[10px] text-muted-foreground">/{activeProject?.slug ?? "demo-project"}</p>
                </div>

                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Support Email</p>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{activeProject?.support_email ?? "support@windback.ai"}</p>
                </div>

                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Allowed Origins</p>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{activeProject?.allowed_origins?.length ?? 0} configured</p>
                </div>

                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Integrations</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className={`rounded-full px-2 py-0.5 ${activeProject?.stripe_account_id ? "bg-green-50 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      Stripe {activeProject?.stripe_account_id ? "connected" : "not connected"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${activeProject?.razorpay_key_id ? "bg-green-50 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      Razorpay {activeProject?.razorpay_key_id ? "connected" : "not connected"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && settingsView === "api_keys" && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active API Key</p>
                  <p className="mt-1 font-mono text-[11px] text-foreground">wb_live_************************</p>
                </div>
                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Last Rotated</p>
                  <p className="mt-1 text-[12px] font-medium text-foreground">7 days ago</p>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && settingsView === "integrations" && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Payment Providers</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className={`rounded-full px-2 py-0.5 ${activeProject?.stripe_account_id ? "bg-green-50 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      Stripe {activeProject?.stripe_account_id ? "connected" : "not connected"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${activeProject?.razorpay_key_id ? "bg-green-50 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      Razorpay {activeProject?.razorpay_key_id ? "connected" : "not connected"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && settingsView === "origins" && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="rounded-sm border border-border/50 bg-card px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Allowed Origins</p>
                  <p className="mt-1 text-[12px] font-medium text-foreground">
                    {(activeProject?.allowed_origins ?? []).length > 0
                      ? (activeProject?.allowed_origins ?? []).join(", ")
                      : "No origins configured"}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
