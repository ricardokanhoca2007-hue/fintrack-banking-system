import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Plus } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { CardItem } from "@/components/features/cards/CardItem";
import { NewCardDialog } from "@/components/features/cards/NewCardDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useCards } from "@/hooks/useCards";
import { CARD_KIND_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/formatters";

export const Route = createFileRoute("/_shell/cards")({
  head: () => ({
    meta: [
      { title: "Cartões | FinTrack" },
      {
        name: "description",
        content:
          "Gere os teus cartões FinTrack físicos e virtuais: congelar, bloquear, alterar PIN e definir limites diários.",
      },
      { property: "og:title", content: "Cartões FinTrack" },
      {
        property: "og:description",
        content: "Cartões físicos e virtuais com controlos de segurança e limites de gasto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const { cards, activeCards } = useCards();

  const virtualCount = cards.filter((card) => card.kind === "VIRTUAL").length;
  const totalLimit = activeCards.reduce((sum, card) => sum + card.dailyLimit, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartões"
        description="Cartões físicos e virtuais associados às tuas contas."
        breadcrumbs={[{ label: "FinTrack", to: "/dashboard" }, { label: "Cartões" }]}
        actions={
          <NewCardDialog
            trigger={
              <Button>
                <Plus className="size-4" aria-hidden="true" /> Emitir cartão
              </Button>
            }
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Cartões ativos"
          value={String(activeCards.length)}
          icon={CreditCard}
          tone="primary"
          hint={`${cards.length} no total`}
        />
        <StatCard
          label={CARD_KIND_LABELS.VIRTUAL}
          value={String(virtualCount)}
          icon={CreditCard}
          tone="neutral"
          hint="Ideais para compras online"
        />
        <StatCard
          label="Limite diário combinado"
          value={formatMoney(totalLimit)}
          icon={CreditCard}
          tone="success"
          hint="Apenas cartões ativos"
          tooltip="Soma dos limites diários definidos em cada cartão ativo."
        />
      </div>

      {cards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="surface-card rounded-xl p-6">
          <EmptyState
            icon={CreditCard}
            title="Ainda sem cartões"
            description="Emite um cartão virtual para pagar online em segundos, ou um físico para o dia a dia."
            action={
              <NewCardDialog
                trigger={
                  <Button>
                    <Plus className="size-4" aria-hidden="true" /> Emitir primeiro cartão
                  </Button>
                }
              />
            }
          />
        </div>
      )}
    </div>
  );
}
