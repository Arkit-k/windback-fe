"use client";

import { useState } from "react";
import { Button } from "@windback/ui";
import { StatCard } from "@/components/dashboard/stat-card";
import { useCurrentProject } from "@/providers/project-provider";
import { useStats } from "@/hooks/use-stats";
import {
  useWinBackCustomers,
  useSendWinBackEmail,
} from "@/hooks/use-winback-customers";
import { motion } from "framer-motion";
import {
  UserSearch,
  Users,
  UserCheck,
  UserX,
  MailPlus,
  Send,
  Loader2,
} from "lucide-react";
import type { WinBackCustomer } from "@/hooks/use-winback-customers";

function maskEmail(email: string): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, 2) + "***";
  return local.slice(0, 2) + "***@" + domain;
}

function formatCents(cents: number): string {
  if (Math.abs(cents) >= 100_00) return `$${(cents / 100).toFixed(0)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export default function OldCustomersPage() {
  const { slug } = useCurrentProject();
  const { data: stats, isLoading: statsLoading } = useStats(slug);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWinBackCustomers(slug, page);
  const sendMutation = useSendWinBackEmail(slug);

  const customers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-light)]">
            <UserSearch className="h-5 w-5 text-accent-readable" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Lost Gems
            </h1>
            <p className="text-sm text-muted-foreground">
              Former paying customers who churned. Send them a personalized AI win-back email.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Lifecycle Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Paid Customers",
            value: (stats?.total_customers ?? 0).toString(),
            icon: Users,
          },
          {
            title: "Active Diamonds",
            value: (stats?.active_customers ?? 0).toString(),
            subtitle: "Currently paying",
            icon: UserCheck,
          },
          {
            title: "Lost Gems",
            value: (stats?.churned_customers ?? 0).toString(),
            subtitle: "Used to pay",
            icon: UserX,
          },
          {
            title: "Win-Back Candidates",
            value: (stats?.winback_candidates ?? 0).toString(),
            subtitle:
              (stats?.winback_candidates ?? 0) > 0
                ? "Ready to re-engage"
                : undefined,
            icon: MailPlus,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <StatCard {...stat} isLoading={statsLoading} />
          </motion.div>
        ))}
      </div>

      {/* Old Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">MRR</th>
                <th className="px-4 py-3">Churned</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No churned paying customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <CustomerRow
                    key={c.id}
                    customer={c}
                    index={i}
                    onSend={() => sendMutation.mutate(c.id)}
                    isSending={sendMutation.isPending}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} customers</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerRow({
  customer: c,
  index,
  onSend,
  isSending,
}: {
  customer: WinBackCustomer;
  index: number;
  onSend: () => void;
  isSending: boolean;
}) {
  const statusBadge: Record<string, { label: string; className: string }> = {
    not_contacted: {
      label: "Not contacted",
      className: "bg-secondary text-muted-foreground",
    },
    email_sent: {
      label: "Email sent",
      className: "bg-blue-500/10 text-blue-400",
    },
    recovered: {
      label: "Recovered",
      className: "bg-emerald-500/10 text-emerald-400",
    },
  };
  const badge = statusBadge[c.winback_status] ?? statusBadge.not_contacted;

  return (
    <motion.tr
      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.02 * Math.min(index, 20) }}
    >
      <td className="px-4 py-2.5">
        <div className="font-medium text-foreground">
          {maskEmail(c.customer_email)}
        </div>
        {c.customer_name && (
          <div className="text-xs text-muted-foreground">{c.customer_name}</div>
        )}
      </td>
      <td className="px-4 py-2.5 text-foreground">
        {c.plan_name || "\u2014"}
      </td>
      <td className="px-4 py-2.5 text-foreground">{formatCents(c.mrr_cents)}</td>
      <td className="px-4 py-2.5 text-muted-foreground">
        {new Date(c.churned_at).toLocaleDateString()}
      </td>
      <td
        className="max-w-[150px] truncate px-4 py-2.5 text-muted-foreground"
        title={c.cancel_reason ?? ""}
      >
        {c.cancel_reason ?? "\u2014"}
      </td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-2.5">
        {c.winback_status === "not_contacted" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onSend}
            disabled={isSending}
            className="gap-1.5"
          >
            {isSending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            Send
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">{badge.label}</span>
        )}
      </td>
    </motion.tr>
  );
}
