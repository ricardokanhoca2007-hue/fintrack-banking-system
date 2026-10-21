import { Nfc, Snowflake } from "lucide-react";

import { CARD_KIND_LABELS, CARD_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BankCard } from "@/types";

interface CardVisualProps {
  card: BankCard;
  /** Label of the account the card draws from. */
  accountName: string;
  className?: string;
}

const SURFACE: Record<BankCard["kind"], string> = {
  PHYSICAL: "bg-[var(--gradient-brand)] text-primary-foreground",
  VIRTUAL:
    "bg-[linear-gradient(135deg,var(--color-foreground),color-mix(in_oklab,var(--color-primary)_55%,var(--color-foreground)))] text-primary-foreground",
};

/** Purely presentational bank card, no PAN — only the last four digits exist client-side. */
export function CardVisual({ card, accountName, className }: CardVisualProps) {
  const inactive = card.status !== "ACTIVE";

  return (
    <div
      className={cn(
        "relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-[var(--shadow-card)] transition-all",
        SURFACE[card.kind],
        inactive && "opacity-70 saturate-50",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-white/15 blur-2xl"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-80">
            FinTrack · {CARD_KIND_LABELS[card.kind]}
          </p>
          <p className="mt-1 truncate text-sm font-semibold opacity-90">{accountName}</p>
        </div>
        {card.status === "FROZEN" ? (
          <Snowflake className="size-5 opacity-90" aria-hidden="true" />
        ) : (
          <Nfc className="size-5 opacity-90" aria-hidden="true" />
        )}
      </div>

      <div className="relative">
        <p className="num text-lg font-semibold tracking-[0.18em]">•••• •••• •••• {card.last4}</p>
        <div className="mt-3 flex items-end justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="text-[9px] tracking-widest uppercase opacity-70">Titular</p>
            <p className="truncate font-semibold">{card.holderName}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] tracking-widest uppercase opacity-70">Validade</p>
            <p className="num font-semibold">{card.expiry}</p>
          </div>
          <p className="text-sm font-bold tracking-wide">{card.brand}</p>
        </div>
      </div>

      {inactive && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/35 py-1 text-center text-[11px] font-bold tracking-widest uppercase backdrop-blur-[1px]">
          {CARD_STATUS_LABELS[card.status]}
        </span>
      )}
    </div>
  );
}
