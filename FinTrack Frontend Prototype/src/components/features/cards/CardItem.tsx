import { useState } from "react";
import {
  KeyRound,
  Loader2,
  Lock,
  Play,
  ShieldAlert,
  Snowflake,
  SlidersHorizontal,
} from "lucide-react";

import { CardVisual } from "@/components/features/cards/CardVisual";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCards, type CardWithAccount } from "@/hooks/useCards";
import { CARD_STATUS_LABELS } from "@/lib/constants";
import { formatMoney, maskAccountNumber } from "@/lib/formatters";

const STATUS_VARIANT = {
  ACTIVE: "default",
  FROZEN: "secondary",
  BLOCKED: "destructive",
} as const;

/** One card with its management actions: freeze, block, PIN and daily limit. */
export function CardItem({ card }: { card: CardWithAccount }) {
  const { freeze, unfreeze, block, setDailyLimit, changePin } = useCards();
  const { isPending, run } = useAsyncAction();
  const [limit, setLimit] = useState(card.dailyLimit);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);

  const blocked = card.status === "BLOCKED";
  const limitChanged = limit !== card.dailyLimit;

  return (
    <article className="surface-card flex flex-col gap-4 rounded-xl p-5">
      <CardVisual card={card} accountName={card.accountName} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{card.accountName}</p>
          <p className="num truncate text-xs text-muted-foreground">
            {maskAccountNumber(card.accountNumber)} · limite{" "}
            {formatMoney(card.dailyLimit, card.currency)}/dia
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[card.status]}>{CARD_STATUS_LABELS[card.status]}</Badge>
      </div>

      {editingLimit && !blocked && (
        <div className="space-y-3 rounded-xl border border-border bg-muted/50 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Limite diário
            </span>
            <span className="num text-sm font-bold">{formatMoney(limit, card.currency)}</span>
          </div>
          <Slider
            value={[limit]}
            min={50}
            max={5000}
            step={50}
            onValueChange={([value]) => setLimit(value ?? limit)}
            aria-label="Limite diário do cartão"
          />
          <Button
            size="sm"
            className="w-full"
            disabled={isPending || !limitChanged}
            onClick={() =>
              void run(() => setDailyLimit(card.id, limit), {
                successTitle: "Limite atualizado",
                successDescription: `${formatMoney(limit, card.currency)} por dia.`,
              }).then(() => setEditingLimit(false))
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Guardar limite
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {card.status === "FROZEN" ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              void run(() => unfreeze(card.id), { successTitle: "Cartão reativado" })
            }
          >
            <Play className="size-4" aria-hidden="true" /> Reativar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending || blocked}
            onClick={() =>
              void run(() => freeze(card.id), {
                successTitle: "Cartão congelado",
                successDescription: "Podes reativá-lo a qualquer momento.",
              })
            }
          >
            <Snowflake className="size-4" aria-hidden="true" /> Congelar
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={blocked}
          onClick={() => setEditingLimit((previous) => !previous)}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Limites
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={isPending || blocked}
          onClick={() =>
            void run(() => changePin(card.id), {
              successTitle: "PIN alterado",
              successDescription: "Guarda o novo PIN em segurança.",
            })
          }
        >
          <KeyRound className="size-4" aria-hidden="true" /> Alterar PIN
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isPending || blocked}
          onClick={() => setConfirmBlock(true)}
        >
          <Lock className="size-4" aria-hidden="true" /> Bloquear
        </Button>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldAlert className="size-3.5 shrink-0" aria-hidden="true" />
        PIN atualizado há {card.pinAgeDays} {card.pinAgeDays === 1 ? "dia" : "dias"}
      </p>

      <ConfirmDialog
        open={confirmBlock}
        onOpenChange={setConfirmBlock}
        title="Bloquear cartão definitivamente?"
        description="O bloqueio é irreversível neste protótipo: será necessário emitir um novo cartão."
        summary={[
          { label: "Cartão", value: `•••• ${card.last4}` },
          { label: "Conta", value: card.accountName },
        ]}
        confirmLabel="Bloquear cartão"
        isPending={isPending}
        onConfirm={() =>
          void run(() => block(card.id), { successTitle: "Cartão bloqueado" }).then(() =>
            setConfirmBlock(false),
          )
        }
      />
    </article>
  );
}
