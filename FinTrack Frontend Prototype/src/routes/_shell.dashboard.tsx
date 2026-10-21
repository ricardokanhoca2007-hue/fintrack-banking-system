import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Lightbulb,
  PiggyBank,
  Receipt,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { BalanceTrendChart } from "@/components/features/dashboard/BalanceTrendChart";
import { BudgetProgressList } from "@/components/features/dashboard/BudgetProgressList";
import { CategoryBreakdownChart } from "@/components/features/dashboard/CategoryBreakdownChart";
import { GoalList, NewGoalDialog } from "@/components/features/dashboard/GoalList";
import { InsightList } from "@/components/features/dashboard/InsightList";
import { MonthlyFlowChart } from "@/components/features/dashboard/MonthlyFlowChart";
import { MovementDialog } from "@/components/features/transactions/MovementDialog";
import { TransactionRow } from "@/components/features/transactions/TransactionRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/useAccounts";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useGoals } from "@/hooks/useGoals";
import { useTransactions } from "@/hooks/useTransactions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatMoney, formatPercent } from "@/lib/formatters";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | FinTrack" },
      {
        name: "description",
        content:
          "Painel FinTrack: saldo agregado, insights automáticos, previsão de saldo, orçamentos e objetivos de poupança.",
      },
      { property: "og:title", content: "Dashboard FinTrack" },
      {
        property: "og:description",
        content: "Visão global das tuas contas, insights automáticos e objetivos no FinTrack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const metrics = useDashboardMetrics();
  const { accounts } = useAccounts();
  const { recent } = useTransactions();
  const { user } = useUserProfile();
  const { goals } = useGoals();

  const recentTransactions = recent(6);
  const accountName = (accountId: string) => accounts.find((a) => a.id === accountId)?.name;
  const forecastPositive = metrics.forecast.projected >= metrics.forecast.current;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user.firstName}`}
        description={`Resumo financeiro dos últimos ${metrics.windowDays} dias.`}
        breadcrumbs={[{ label: "FinTrack", to: "/dashboard" }, { label: "Dashboard" }]}
        actions={
          <>
            <MovementDialog
              mode="DEPOSIT"
              trigger={
                <Button>
                  <ArrowDownLeft className="size-4" aria-hidden="true" /> Depositar
                </Button>
              }
            />
            <MovementDialog
              mode="WITHDRAWAL"
              trigger={
                <Button variant="outline">
                  <ArrowUpRight className="size-4" aria-hidden="true" /> Levantar
                </Button>
              }
            />
            <MovementDialog
              mode="TRANSFER"
              trigger={
                <Button variant="outline">
                  <ArrowLeftRight className="size-4" aria-hidden="true" /> Transferir
                </Button>
              }
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saldo agregado"
          value={formatMoney(metrics.aggregatedBalance)}
          icon={Wallet}
          tone="primary"
          hint={
            metrics.foreignBalances.length > 0
              ? metrics.foreignBalances
                  .map((entry) => formatMoney(entry.balance, entry.currency))
                  .join(" · ")
              : `${metrics.accountCount} contas`
          }
          tooltip="Soma dos saldos das contas em euros. Contas em USD e GBP são apresentadas em separado."
        />
        <StatCard
          label="Receitas"
          value={formatMoney(metrics.income)}
          icon={TrendingUp}
          tone="success"
          hint={`Últimos ${metrics.windowDays} dias`}
        />
        <StatCard
          label="Despesas"
          value={formatMoney(metrics.expenses)}
          icon={TrendingDown}
          tone="destructive"
          hint={`Últimos ${metrics.windowDays} dias`}
        />
        <StatCard
          label="Taxa de poupança"
          value={formatPercent(Math.max(metrics.savingsRate, 0))}
          icon={PiggyBank}
          tone="primary"
          trend={{
            value: formatMoney(metrics.netFlow),
            positive: metrics.netFlow >= 0,
          }}
          hint="fluxo líquido"
          tooltip="Percentagem das receitas que não foi gasta no período: (receitas − despesas) ÷ receitas."
        />
      </div>

      {metrics.insights.length > 0 && (
        <SectionCard
          title="Insights automáticos"
          description="Leitura do teu mês, gerada a partir dos movimentos"
        >
          <InsightList insights={metrics.insights} />
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <SectionCard title="Receitas vs. despesas" description="Evolução dos últimos 6 meses">
          <MonthlyFlowChart data={metrics.monthlyFlow} />
        </SectionCard>

        <SectionCard
          title="Previsão de saldo"
          description={`Projeção para o fim do mês (${metrics.forecast.daysRemaining} dias restantes)`}
        >
          <BalanceTrendChart data={metrics.balanceTrend} projected={metrics.forecast.projected} />
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Ao ritmo atual de {formatMoney(metrics.forecast.dailyNet)}/dia, o saldo deve{" "}
            {forecastPositive ? "subir" : "descer"} para{" "}
            <strong className="num font-semibold text-foreground">
              {formatMoney(metrics.forecast.projected)}
            </strong>
            .
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <SectionCard title="Despesas por categoria" description={`Últimos ${metrics.windowDays} dias`}>
          {metrics.expensesByCategory.length > 0 ? (
            <CategoryBreakdownChart data={metrics.expensesByCategory} />
          ) : (
            <EmptyState
              icon={Receipt}
              title="Sem despesas registadas"
              description="Assim que registares levantamentos ou transferências, vês aqui a distribuição por categoria."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Objetivos"
          description="Progresso das tuas metas de poupança"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/budgets">Gerir</Link>
            </Button>
          }
        >
          {goals.length > 0 ? (
            <GoalList goals={goals.slice(0, 3)} />
          ) : (
            <EmptyState
              icon={Target}
              title="Sem objetivos"
              description="Define uma meta de poupança e acompanha o progresso aqui."
              action={<NewGoalDialog trigger={<Button>Criar objetivo</Button>} />}
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <SectionCard
          title="Atividade recente"
          description="Últimos movimentos em todas as contas"
          bodyClassName="p-0"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/transactions">Ver tudo</Link>
            </Button>
          }
        >
          {recentTransactions.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  accountName={accountName(transaction.accountId)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Receipt}
              title="Ainda sem movimentos"
              description="Faz o teu primeiro depósito para começares a acompanhar a atividade das contas."
              action={
                <MovementDialog mode="DEPOSIT" trigger={<Button>Fazer depósito</Button>} />
              }
            />
          )}
        </SectionCard>

        <SectionCard
          title="Orçamentos do mês"
          description="Limites definidos por categoria"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/budgets">Gerir</Link>
            </Button>
          }
        >
          {metrics.budgetProgress.length > 0 ? (
            <BudgetProgressList items={metrics.budgetProgress.slice(0, 5)} />
          ) : (
            <EmptyState
              icon={PiggyBank}
              title="Sem orçamentos"
              description="Define limites por categoria para controlares melhor as despesas."
              action={
                <Button asChild>
                  <Link to="/budgets">Criar orçamento</Link>
                </Button>
              }
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
