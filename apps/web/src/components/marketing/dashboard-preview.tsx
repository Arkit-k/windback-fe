"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp, DollarSign, ArrowUpRight, Mail, Sparkles } from "lucide-react";

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
  status: string;
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
          {status.replace("_", " ")}
        </motion.span>
        <span className="text-[11px] font-medium text-foreground w-12 text-right">{mrr}</span>
      </div>
    </motion.div>
  );
}

export function DashboardPreview() {
  return (
    <motion.div
      className="relative mx-auto mt-16 max-w-5xl px-4 sm:px-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Browser chrome */}
      <motion.div
        className="overflow-hidden rounded-sm border border-border/60 bg-card transition-shadow duration-500 hover:shadow-xl hover:shadow-primary/5"
        whileHover={{ y: -3, transition: { type: "spring", stiffness: 200, damping: 25 } }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/50 px-4 py-2.5">
          <div className="flex gap-1.5">
            {["bg-red-400/80", "bg-yellow-400/80", "bg-green-400/80"].map((color, i) => (
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

        {/* Dashboard content */}
        <div className="flex min-h-[360px] sm:min-h-[420px]">
          {/* Mini sidebar */}
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
                { label: "Overview", active: true },
                { label: "Churn Events", active: false },
                { label: "Settings", active: false },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className={`rounded-sm px-2.5 py-1.5 text-[11px] cursor-default transition-colors duration-150 ${
                    item.active
                      ? "bg-[var(--accent-light)] font-medium text-[var(--accent)]"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {item.label}
                </motion.div>
              ))}
              <div className="my-2 h-px bg-border/40" />
              <div className="px-2.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Settings</div>
              {["API Keys", "Integrations", "Origins"].map((label) => (
                <motion.div
                  key={label}
                  className="rounded-sm px-2.5 py-1.5 text-[11px] text-muted-foreground cursor-default transition-colors duration-150 hover:bg-secondary/50 hover:text-foreground"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main area */}
          <div className="flex-1 bg-background p-4 sm:p-5">
            {/* Header */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-foreground">Overview</h3>
              <p className="text-[10px] text-muted-foreground">Track your churn events and recovery performance.</p>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStatCard icon={Activity} label="Total Events" value="1,284" change="+12% this month" delay={0.5} />
              <MiniStatCard icon={TrendingUp} label="Recovered" value="342" change="+8 this week" delay={0.6} />
              <MiniStatCard icon={DollarSign} label="MRR at Risk" value="$24.8k" change="-$3.2k recovered" delay={0.7} />
              <MiniStatCard icon={ArrowUpRight} label="Recovery Rate" value="26.6%" change="+2.1% vs last month" delay={0.8} />
            </div>

            {/* Recent events table */}
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
                  View all →
                </motion.span>
              </div>
              <MiniTableRow name="Sarah Johnson" email="sarah@acme.co" status="recovered" mrr="$99/mo" delay={1.0} />
              <MiniTableRow name="Mike Chen" email="mike@startup.io" status="processing" mrr="$249/mo" delay={1.05} />
              <MiniTableRow name="Emily Park" email="emily@design.co" status="new" mrr="$49/mo" delay={1.1} />
              <MiniTableRow name="Alex Rivera" email="alex@saas.dev" status="email_sent" mrr="$199/mo" delay={1.15} />
              <MiniTableRow name="Jordan Lee" email="jordan@growth.co" status="recovered" mrr="$149/mo" delay={1.2} />
            </motion.div>

            {/* AI generation indicator */}
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
              <span className="text-[10px] text-[var(--accent)]">AI generated 9 recovery variants for Sarah Johnson</span>
              <motion.div
                className="ml-auto"
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Mail className="h-3.5 w-3.5 text-[var(--accent)]" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
