import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank, Plus, Target, Trash2, Wallet } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { BudgetDialog } from "@/components/features/budgets/BudgetDialog";
import { GoalList, NewGoalDialog } from "@/components/features/dashboard/GoalList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { formatMoney, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/budgets")({
  head: () => ({
    meta: [
      { title: "Orçamentos e objetivos | FinTrack" },
      {
        name: "description",
        content:
          "Define limites mensais por categoria e acompanha os teus objetivos de poupança no FinTrack.",
      },
      { property: "og:title", content: "Orçamentos FinTrack" },
      {
        property: "og:description",
        content: "Limites por categoria com barras de progresso e objetivos de poupança.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BudgetsPage,
});

function BudgetsPage() {
  const { budgets, totalLimit, totalSpent, removeBudget } = useBudgets();
  const { goals, totalSaved, totalTarget } = useGoals();
  const { isPending, run } = useAsyncAction();

  const usageRatio = totalLimit > 0 ? totalSpent / totalLimit : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos e objetivos"
        description="Controla quanto podes gastar por categoria e quanto já juntaste."
        breadcrumbs={[{ label: "FinTrack", to: "/dashboard" }, { label: "Orçamentos" }]}
        actions={
          <>
            <BudgetDialog
              trigger={
                <Button>
                  <Plus className="size-4" aria-hidden="true" /> Novo orçamento
                </Button>
              }
            />
            <NewGoalDialog
              trigger={
                <Button variant="outline">
                  <Target className="size-4" aria-hidden="true" /> Novo objetivo
                </Button>
              }
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Limite total do mês"
          value={formatMoney(totalLimit)}
          icon={Wallet}
          tone="primary"
          hint={`${budgets.length} categorias`}
        />
        <StatCard
          label="Já gasto"
          value={formatMoney(totalSpent)}
          icon={PiggyBank}
          tone={usageRatio > 1 ? "destructive" : "success"}
          hint={`${formatPercent(usageRatio)} dos limites`}
          tooltip="Soma das despesas do mês nas categorias com orçamento definido."
        />
        <StatCard
          label="Poupado em objetivos"
          value={formatMoney(totalSaved)}
          icon={Target}
          tone="primary"
          hint={`de ${formatMoney(totalTarget)}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Limites por categoria"
          description="Mês corrente · avisamos aos 75% do limite"
        >
          {budgets.length > 0 ? (
            <ul className="space-y-5">
              {budgets.map((item) => (
                <li key={item.budget.id} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold">
                      <span aria-hidden="true">{item.category.emoji}</span> {item.label}
                    </span>
                    <span
                      className={cn(
                        "num shrink-0 text-xs",
                        item.exceeded
                          ? "font-semibold text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatMoney(item.spent, item.budget.currency)} /{" "}
                      {formatMoney(item.budget.limit, item.budget.currency)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(item.ratio * 100, 100)}
                    className={cn("h-2", item.exceeded && "[&>div]:bg-destructive")}
                    aria-label={`${item.label}: ${formatPercent(item.ratio)} do orçamento usado`}
                  />
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {item.exceeded
                        ? `Excedeste em ${formatMoney(item.spent - item.budget.limit, item.budget.currency)}`
                        : `Ainda podes gastar ${formatMoney(item.remaining, item.budget.currency)}`}
                    </span>
                    <span className="flex gap-1">
                      <BudgetDialog
                        initial={{ categoryId: item.budget.categoryId, limit: item.budget.limit }}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            Editar
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remover orçamento de ${item.label}`}
                        disabled={isPending}
                        onClick={() =>
                          void run(() => removeBudget(item.budget.id), {
                            successTitle: "Orçamento removido",
                          })
                        }
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={PiggyBank}
              title="Sem orçamentos definidos"
              description="Define um limite mensal por categoria para controlares melhor as despesas."
              action={
                <BudgetDialog
                  trigger={
                    <Button>
                      <Plus className="size-4" aria-hidden="true" /> Criar orçamento
                    </Button>
                  }
                />
              }
            />
          )}
        </SectionCard>

        <SectionCard title="Objetivos de poupança" description="Progresso e esforço mensal">
          {goals.length > 0 ? (
            <GoalList goals={goals} />
          ) : (
            <EmptyState
              icon={Target}
              title="Sem objetivos"
              description="Cria um objetivo (viagem, fundo de emergência, portátil novo) e acompanha o progresso."
              action={
                <NewGoalDialog
                  trigger={
                    <Button>
                      <Plus className="size-4" aria-hidden="true" /> Criar objetivo
                    </Button>
                  }
                />
              }
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
