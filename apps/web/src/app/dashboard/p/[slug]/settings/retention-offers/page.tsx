"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  Textarea,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import {
  useRetentionOffers,
  useUpsertRetentionOffer,
  useDeleteRetentionOffer,
} from "@/hooks/use-retention-offers";
import { CANCEL_REASON_LABELS } from "@/lib/constants";
import type { OfferType, RetentionOffer } from "@/types/api";
import { Gift, Pause, ArrowDown, Sparkles } from "lucide-react";

const OFFER_TYPES: { value: OfferType; label: string }[] = [
  { value: "discount", label: "Discount" },
  { value: "pause", label: "Pause Subscription" },
  { value: "downgrade", label: "Downgrade Plan" },
  { value: "custom", label: "Custom Offer" },
];

const OFFER_TYPE_ICONS: Record<OfferType, React.ComponentType<{ className?: string }>> = {
  discount: Gift,
  pause: Pause,
  downgrade: ArrowDown,
  custom: Sparkles,
};

interface OfferCardState {
  offer_type: OfferType;
  title: string;
  description: string;
  cta_text: string;
  discount_percent: number;
  pause_days: number;
  is_active: boolean;
}

const DEFAULT_STATE: OfferCardState = {
  offer_type: "discount",
  title: "We'd hate to see you go!",
  description: "How about a special offer to stay?",
  cta_text: "Accept Offer",
  discount_percent: 20,
  pause_days: 30,
  is_active: false,
};

function offerToState(offer: RetentionOffer | undefined): OfferCardState {
  if (!offer) return { ...DEFAULT_STATE };
  return {
    offer_type: offer.offer_type,
    title: offer.title,
    description: offer.description,
    cta_text: offer.cta_text,
    discount_percent: offer.discount_percent ?? 20,
    pause_days: offer.pause_days ?? 30,
    is_active: offer.is_active,
  };
}

export default function RetentionOffersPage() {
  const { slug, project } = useCurrentProject();
  const { data: offers, isLoading } = useRetentionOffers(slug);
  const upsertMutation = useUpsertRetentionOffer(slug);
  const deleteMutation = useDeleteRetentionOffer(slug);

  const reasons = Object.entries(CANCEL_REASON_LABELS);
  const offerMap = new Map<string, RetentionOffer>();
  offers?.forEach((o) => offerMap.set(o.cancel_reason, o));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Retention Offers
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure offers shown to customers when they try to cancel. Each cancel
          reason can have its own targeted offer to win them back.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reasons.map(([reason, label]) => (
            <OfferCard
              key={reason}
              reason={reason}
              label={label}
              existingOffer={offerMap.get(reason)}
              onSave={(state) => {
                upsertMutation.mutate(
                  {
                    reason,
                    input: {
                      offer_type: state.offer_type,
                      title: state.title,
                      description: state.description,
                      cta_text: state.cta_text,
                      discount_percent:
                        state.offer_type === "discount"
                          ? state.discount_percent
                          : undefined,
                      pause_days:
                        state.offer_type === "pause"
                          ? state.pause_days
                          : undefined,
                      is_active: state.is_active,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast({
                        title: "Offer saved",
                        description: `Retention offer for "${label}" has been updated.`,
                      });
                    },
                    onError: (err) => {
                      toast({
                        title: "Failed to save",
                        description: err.message,
                        variant: "destructive",
                      });
                    },
                  },
                );
              }}
              isSaving={upsertMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({
  reason,
  label,
  existingOffer,
  onSave,
  isSaving,
}: {
  reason: string;
  label: string;
  existingOffer?: RetentionOffer;
  onSave: (state: OfferCardState) => void;
  isSaving: boolean;
}) {
  const [state, setState] = useState<OfferCardState>(() =>
    offerToState(existingOffer),
  );

  useEffect(() => {
    setState(offerToState(existingOffer));
  }, [existingOffer]);

  const Icon = OFFER_TYPE_ICONS[state.offer_type] ?? Sparkles;

  return (
    <Card
      className={
        state.is_active
          ? "border-[var(--accent)]/30 bg-[var(--accent-light)]/30"
          : ""
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-[var(--accent)]" />
            <CardTitle className="text-sm">{label}</CardTitle>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.is_active}
            onClick={() => setState((s) => ({ ...s, is_active: !s.is_active }))}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
              state.is_active ? "bg-[var(--accent)]" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                state.is_active ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <CardDescription className="text-xs">
          Cancel reason: <code className="text-xs">{reason}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Offer Type</Label>
          <Select
            value={state.offer_type}
            onValueChange={(v) =>
              setState((s) => ({ ...s, offer_type: v as OfferType }))
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OFFER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Title</Label>
          <Input
            className="h-9 text-xs"
            value={state.title}
            onChange={(e) =>
              setState((s) => ({ ...s, title: e.target.value }))
            }
            placeholder="We'd hate to see you go!"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Textarea
            className="min-h-[60px] text-xs"
            value={state.description}
            onChange={(e) =>
              setState((s) => ({ ...s, description: e.target.value }))
            }
            placeholder="How about 20% off for the next 3 months?"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">CTA Button Text</Label>
          <Input
            className="h-9 text-xs"
            value={state.cta_text}
            onChange={(e) =>
              setState((s) => ({ ...s, cta_text: e.target.value }))
            }
            placeholder="Accept Offer"
          />
        </div>

        {state.offer_type === "discount" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Discount Percent</Label>
            <Input
              className="h-9 text-xs"
              type="number"
              min={1}
              max={100}
              value={state.discount_percent}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  discount_percent: Number(e.target.value),
                }))
              }
            />
          </div>
        )}

        {state.offer_type === "pause" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Pause Days</Label>
            <Input
              className="h-9 text-xs"
              type="number"
              min={7}
              max={90}
              value={state.pause_days}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  pause_days: Number(e.target.value),
                }))
              }
            />
          </div>
        )}

        <Button
          size="sm"
          className="w-full"
          onClick={() => onSave(state)}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}
