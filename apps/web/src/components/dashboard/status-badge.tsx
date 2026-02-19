"use client";

import { Badge, type BadgeProps } from "@windback/ui";
import { STATUS_LABELS } from "@/lib/constants";
import type { ChurnEventStatus } from "@/types/api";

const statusVariantMap: Record<ChurnEventStatus, BadgeProps["variant"]> = {
  new: "new",
  processing: "processing",
  variants_generated: "variants_generated",
  email_sent: "email_sent",
  recovered: "recovered",
  lost: "lost",
};

export function StatusBadge({ status }: { status: ChurnEventStatus }) {
  return (
    <Badge variant={statusVariantMap[status]}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
