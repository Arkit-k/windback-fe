"use client";

import { useCallback, useRef } from "react";
import { Button } from "@windback/ui";
import { FileDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Print-friendly CSS injected into the iframe                        */
/* ------------------------------------------------------------------ */

const PRINT_CSS = `
  @media print {
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, sans-serif;
      color: #111;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }
    .print-header h1 {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }
    .print-header .logo {
      font-size: 14px;
      color: #6b7280;
    }
    .print-date {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th, td {
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      text-align: left;
      font-size: 13px;
    }
    th { background: #f9fafb; font-weight: 600; }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .stat-card .label { font-size: 12px; color: #6b7280; }
    .stat-card .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .page-break { page-break-before: always; }
  }
`;

/* ------------------------------------------------------------------ */
/*  PDFExportButton                                                    */
/* ------------------------------------------------------------------ */

interface PDFExportButtonProps {
  title?: string;
}

export function PDFExportButton({ title = "Dashboard Report" }: PDFExportButtonProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handlePrint = useCallback(() => {
    // Gather stat cards from the page
    const statCards = Array.from(
      document.querySelectorAll("[data-stat-card]"),
    ).map((el) => ({
      label: el.querySelector("[data-stat-label]")?.textContent ?? "",
      value: el.querySelector("[data-stat-value]")?.textContent ?? "",
    }));

    // Gather tables
    const tables = Array.from(document.querySelectorAll("table")).map(
      (t) => t.outerHTML,
    );

    // Build HTML for print
    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <!DOCTYPE html>
      <html><head>
        <title>${title} - Windback</title>
        <style>${PRINT_CSS}</style>
      </head><body>
        <div class="print-header">
          <div>
            <h1>${title}</h1>
            <span class="logo">Windback</span>
          </div>
        </div>
        <p class="print-date">Generated on ${now}</p>
        ${
          statCards.length > 0
            ? `<div class="stat-grid">${statCards.map((s) => `<div class="stat-card"><div class="label">${s.label}</div><div class="value">${s.value}</div></div>`).join("")}</div>`
            : ""
        }
        ${tables.join("")}
      </body></html>
    `;

    // Create or reuse a hidden iframe
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

    // Give the browser a tick to render before printing
    setTimeout(() => {
      iframe!.contentWindow?.print();
    }, 250);
  }, [title]);

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <FileDown className="mr-1.5 h-4 w-4" />
      Export PDF
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  PrintLayout — wrapper that adds @media print styles inline         */
/* ------------------------------------------------------------------ */

interface PrintLayoutProps {
  children: React.ReactNode;
}

export function PrintLayout({ children }: PrintLayoutProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          /* Hide chrome */
          nav, aside, [data-sidebar], [data-topbar], header:has(nav) {
            display: none !important;
          }
          /* Remove shadows and borders that don't print well */
          .shadow, .shadow-sm, .shadow-md, .shadow-lg {
            box-shadow: none !important;
          }
          /* Ensure page breaks at sensible points */
          .print\\:break-before { page-break-before: always; }
          .print\\:break-after  { page-break-after: always; }
          .print\\:avoid-break  { page-break-inside: avoid; }
        }
      `,
        }}
      />
      {children}
    </>
  );
}
