"use client";

import { Badge } from "@windback/ui";
import { DUNNING_TONE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Mail, Eye, MousePointerClick, Clock } from "lucide-react";
import type { DunningEmail } from "@/types/api";

interface DunningTimelineProps {
  emails: DunningEmail[];
}

export function DunningTimeline({ emails }: DunningTimelineProps) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">
          No dunning emails sent yet
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

      {emails.map((email, index) => (
        <div key={email.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Timeline dot */}
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border border-border">
            <span className="text-xs font-semibold text-muted-foreground">
              {email.retry_number}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {email.subject}
              </p>
              <Badge variant="outline">
                {DUNNING_TONE_LABELS[email.tone] || email.tone}
              </Badge>
            </div>

            {/* Status indicators */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {email.sent_at ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Mail className="h-3 w-3" />
                  Sent {formatDate(email.sent_at)}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              )}

              {email.opened_at && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Eye className="h-3 w-3" />
                  Opened {formatDate(email.opened_at)}
                </span>
              )}

              {email.clicked_at && (
                <span className="flex items-center gap-1 text-violet-600">
                  <MousePointerClick className="h-3 w-3" />
                  Clicked {formatDate(email.clicked_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
