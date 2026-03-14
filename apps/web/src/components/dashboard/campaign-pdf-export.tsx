"use client";

import { useCallback, useRef } from "react";
import { Button } from "@windback/ui";
import { FileDown } from "lucide-react";
import type { Campaign, CampaignWithMetrics } from "@/types/api";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Print-friendly CSS for campaign report                             */
/* ------------------------------------------------------------------ */

const REPORT_CSS = `
  @media print {
    @page { margin: 20mm 15mm; size: A4; }
  }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px;
    font-family: system-ui, -apple-system, sans-serif;
    color: #111;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e5e7eb;
  }
  .report-header h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
  .report-header .subtitle { font-size: 13px; color: #6b7280; }
  .report-header .logo { font-size: 13px; color: #9ca3af; text-align: right; }
  .report-header .date { font-size: 11px; color: #9ca3af; }
  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge-draft { background: #f4f4f5; color: #52525b; }
  .badge-active { background: #dbeafe; color: #1d4ed8; }
  .badge-paused { background: #fef3c7; color: #b45309; }
  .badge-completed { background: #dcfce7; color: #15803d; }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .info-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 14px 18px;
  }
  .info-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
  .info-card .val { font-size: 14px; font-weight: 600; margin-top: 4px; }
  h2 { font-size: 16px; font-weight: 700; margin: 28px 0 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .metric-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px 20px;
  }
  .metric-card .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .metric-card .metric-name { font-size: 13px; font-weight: 600; }
  .lift { font-size: 12px; font-weight: 600; }
  .lift-up { color: #16a34a; }
  .lift-down { color: #dc2626; }
  .lift-flat { color: #6b7280; }
  .metric-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .metric-row .sub-label { font-size: 11px; color: #6b7280; }
  .metric-row .sub-value { font-size: 20px; font-weight: 700; margin-top: 2px; }
  .metric-row .sub-value.baseline { color: #6b7280; }
  .goals-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .goals-table th, .goals-table td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
  .goals-table th { background: #f9fafb; font-weight: 600; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
  .page-break { page-break-before: always; }

  /* Multi-campaign summary table */
  .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .summary-table th, .summary-table td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 12px; }
  .summary-table th { background: #f9fafb; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
  .summary-table td.num { text-align: right; font-variant-numeric: tabular-nums; }
`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function fmtBudget(cents: number | undefined, currency: string) {
  if (!cents) return "—";
  return fmtCurrency(cents, currency);
}

function liftPct(during: number, baseline: number): number {
  if (baseline === 0) return during > 0 ? 100 : 0;
  return ((during - baseline) / baseline) * 100;
}

function liftHtml(lift: number): string {
  if (lift > 0) return `<span class="lift lift-up">+${lift.toFixed(1)}%</span>`;
  if (lift < 0) return `<span class="lift lift-down">${lift.toFixed(1)}%</span>`;
  return `<span class="lift lift-flat">0%</span>`;
}

function metricCard(name: string, during: string | number, baseline: string | number, lift: number): string {
  return `
    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-name">${name}</span>
        ${liftHtml(lift)}
      </div>
      <div class="metric-row">
        <div><div class="sub-label">During Campaign</div><div class="sub-value">${during}</div></div>
        <div><div class="sub-label">Baseline</div><div class="sub-value baseline">${baseline}</div></div>
      </div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/*  Single Campaign PDF Export                                         */
/* ------------------------------------------------------------------ */

function buildSingleCampaignHtml(campaign: CampaignWithMetrics): string {
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const m = campaign.metrics;

  const goalsRows = campaign.goals.length > 0
    ? campaign.goals.map(g =>
        `<tr><td>${g.metric.replace(/_/g, " ")}</td><td class="num">${g.target.toLocaleString()}</td></tr>`
      ).join("")
    : `<tr><td colspan="2" style="color:#9ca3af">No goals set</td></tr>`;

  return `<!DOCTYPE html><html><head>
    <title>${campaign.name} — Campaign Report</title>
    <style>${REPORT_CSS}</style>
  </head><body>
    <div class="report-header">
      <div>
        <h1>${campaign.name}</h1>
        <div class="subtitle">
          ${CAMPAIGN_TYPE_LABELS[campaign.campaign_type] ?? campaign.campaign_type}
          ${campaign.description ? ` — ${campaign.description}` : ""}
        </div>
      </div>
      <div style="text-align:right">
        <div class="logo">Windback</div>
        <div class="date">Generated ${now}</div>
        <div style="margin-top:6px">
          <span class="badge badge-${campaign.status}">${CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}</span>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card"><div class="label">Date Range</div><div class="val">${fmtDate(campaign.starts_at)} — ${fmtDate(campaign.ends_at)}</div></div>
      <div class="info-card"><div class="label">Budget</div><div class="val">${fmtBudget(campaign.budget_cents, campaign.currency)}</div></div>
      <div class="info-card"><div class="label">Currency</div><div class="val">${campaign.currency}</div></div>
    </div>

    <h2>Goals</h2>
    <table class="goals-table">
      <thead><tr><th>Metric</th><th>Target</th></tr></thead>
      <tbody>${goalsRows}</tbody>
    </table>

    ${m.roi_percent != null ? `<div class="info-grid" style="grid-template-columns:1fr"><div class="info-card"><div class="label">Return on Investment (ROI)</div><div class="val" style="font-size:18px;color:${m.roi_percent >= 0 ? '#16a34a' : '#dc2626'}">${m.roi_percent >= 0 ? '+' : ''}${m.roi_percent.toFixed(1)}%</div></div></div>` : ''}

    <h2>Churn & Recovery Metrics</h2>
    <div class="metrics-grid">
      ${metricCard("Revenue (Recovered)", fmtCurrency(m.revenue_cents_during), fmtCurrency(m.revenue_cents_baseline), m.revenue_lift_percent)}
      ${metricCard("Churn Customers", m.new_customers_during, m.new_customers_baseline, liftPct(m.new_customers_during, m.new_customers_baseline))}
      ${metricCard("Churn Events", m.churn_events_during, m.churn_events_baseline, liftPct(m.churn_events_during, m.churn_events_baseline))}
      ${metricCard("Recoveries", m.recoveries_during, m.recoveries_baseline, liftPct(m.recoveries_during, m.recoveries_baseline))}
    </div>

    <h2>Payment Failure Metrics</h2>
    <div class="metrics-grid">
      ${metricCard("Payment Failures", m.payment_failures_during, m.payment_failures_baseline, liftPct(m.payment_failures_during, m.payment_failures_baseline))}
      ${metricCard("Payments Recovered", m.payment_recoveries_during, m.payment_recoveries_baseline, liftPct(m.payment_recoveries_during, m.payment_recoveries_baseline))}
      ${metricCard("Amount Recovered", fmtCurrency(m.payment_amount_recovered_during), fmtCurrency(m.payment_amount_recovered_baseline), liftPct(m.payment_amount_recovered_during, m.payment_amount_recovered_baseline))}
    </div>

    <div class="footer">Campaign Report — ${campaign.name} — Windback</div>
  </body></html>`;
}

export function CampaignPDFExportButton({ campaign }: { campaign: CampaignWithMetrics }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleExport = useCallback(() => {
    const html = buildSingleCampaignHtml(campaign);
    printHtml(html, iframeRef);
  }, [campaign]);

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <FileDown className="mr-1.5 h-4 w-4" />
      Export PDF
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Multi-Campaign Summary PDF Export                                   */
/* ------------------------------------------------------------------ */

function buildMultiCampaignHtml(campaigns: Campaign[]): string {
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const rows = campaigns.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${CAMPAIGN_TYPE_LABELS[c.campaign_type] ?? c.campaign_type}</td>
      <td><span class="badge badge-${c.status}">${CAMPAIGN_STATUS_LABELS[c.status] ?? c.status}</span></td>
      <td>${fmtDate(c.starts_at)}</td>
      <td>${fmtDate(c.ends_at)}</td>
      <td class="num">${fmtBudget(c.budget_cents, c.currency)}</td>
      <td class="num">${c.goals.length}</td>
    </tr>
  `).join("");

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_cents ?? 0), 0);
  const byStatus = campaigns.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});
  const byType = campaigns.reduce<Record<string, number>>((acc, c) => {
    acc[c.campaign_type] = (acc[c.campaign_type] ?? 0) + 1;
    return acc;
  }, {});

  return `<!DOCTYPE html><html><head>
    <title>Campaigns Report</title>
    <style>${REPORT_CSS}</style>
  </head><body>
    <div class="report-header">
      <div>
        <h1>Campaigns Report</h1>
        <div class="subtitle">${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""}</div>
      </div>
      <div style="text-align:right">
        <div class="logo">Windback</div>
        <div class="date">Generated ${now}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card"><div class="label">Total Campaigns</div><div class="val">${campaigns.length}</div></div>
      <div class="info-card"><div class="label">Total Budget</div><div class="val">${totalBudget > 0 ? fmtCurrency(totalBudget) : "—"}</div></div>
      <div class="info-card"><div class="label">By Status</div><div class="val">${Object.entries(byStatus).map(([s, n]) => `${CAMPAIGN_STATUS_LABELS[s] ?? s}: ${n}`).join(", ")}</div></div>
    </div>

    <div class="info-grid">
      <div class="info-card" style="grid-column:span 3"><div class="label">By Type</div><div class="val">${Object.entries(byType).map(([t, n]) => `${CAMPAIGN_TYPE_LABELS[t] ?? t}: ${n}`).join(", ")}</div></div>
    </div>

    <h2>All Campaigns</h2>
    <table class="summary-table">
      <thead><tr>
        <th>Name</th><th>Type</th><th>Status</th><th>Start</th><th>End</th><th>Budget</th><th>Goals</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">Campaigns Report — Windback</div>
  </body></html>`;
}

export function CampaignListPDFExportButton({ campaigns }: { campaigns: Campaign[] }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleExport = useCallback(() => {
    const html = buildMultiCampaignHtml(campaigns);
    printHtml(html, iframeRef);
  }, [campaigns]);

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <FileDown className="mr-1.5 h-4 w-4" />
      Export PDF
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared print helper                                                */
/* ------------------------------------------------------------------ */

function printHtml(html: string, iframeRef: React.MutableRefObject<HTMLIFrameElement | null>) {
  let iframe = iframeRef.current;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "-9999px";
    iframe.style.bottom = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    iframeRef.current = iframe;
  }

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe!.contentWindow?.print();
  }, 300);
}
