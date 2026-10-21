import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  FilterX,
  List,
  Receipt,
  Rows3,
  Search,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/common/SectionCard";
import { ExportMenu } from "@/components/features/transactions/ExportMenu";
import { MovementDialog } from "@/components/features/transactions/MovementDialog";
import { TransactionTimeline } from "@/components/features/transactions/TransactionTimeline";
import { TransactionRow } from "@/components/features/transactions/TransactionRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactionFilters } from "@/hooks/useTransactionFilters";
import { useTransactions } from "@/hooks/useTransactions";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CATEGORIES, TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { totalExpenses, totalIncome } from "@/lib/finance";
import { formatMoney } from "@/lib/formatters";
import type { CategoryId, TransactionType } from "@/types";

export const Route = createFileRoute("/_shell/transactions")({
  head: () => ({
    meta: [
      { title: "Transações | FinTrack" },
      {
        name: "description",
        content:
          "Histórico de transações FinTrack com filtros por tipo, conta e data, e ações de depósito, levantamento e transferência.",
      },
      { property: "og:title", content: "Transações FinTrack" },
      {
        property: "og:description",
        content: "Pesquisa e filtra todos os movimentos das tuas contas no protótipo FinTrack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { filters, setFilter, reset, results, isFiltering, activeFilterCount } =
    useTransactionFilters(transactions);
  const [view, setView] = useState<"list" | "timeline">("timeline");

  const accountName = (accountId: string) => accounts.find((a) => a.id === accountId)?.name;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Histórico completo de movimentos, com filtros e ações rápidas."
        breadcrumbs={[{ label: "FinTrack", to: "/dashboard" }, { label: "Transações" }]}
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
            <ExportMenu transactions={results} accounts={accounts} />
          </>
        }
      />

      <SectionCard
        title="Filtros"
        description="Combina pesquisa, tipo, categoria, conta, valor e intervalo de datas"
        action={
          isFiltering && (
            <>
              <Badge variant="secondary">
                {activeFilterCount} {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={reset}>
                <FilterX className="size-4" aria-hidden="true" /> Limpar
              </Button>
            </>
          )
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="filter-query">Pesquisar</Label>
            <div className="relative">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="filter-query"
                value={filters.query}
                onChange={(event) => setFilter("query", event.target.value)}
                placeholder="Descrição ou categoria"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-type">Tipo</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilter("type", value as TransactionType | "ALL")}
            >
              <SelectTrigger id="filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {(Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {TRANSACTION_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-account">Conta</Label>
            <Select
              value={filters.accountId}
              onValueChange={(value) => setFilter("accountId", value)}
            >
              <SelectTrigger id="filter-account">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-category">Categoria</Label>
            <Select
              value={filters.categoryId}
              onValueChange={(value) => setFilter("categoryId", value as CategoryId | "ALL")}
            >
              <SelectTrigger id="filter-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span aria-hidden="true">{category.emoji}</span> {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="filter-min">Valor mín.</Label>
              <Input
                id="filter-min"
                type="number"
                min="0"
                step="10"
                inputMode="decimal"
                placeholder="0"
                value={filters.minAmount}
                onChange={(event) => setFilter("minAmount", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-max">Valor máx.</Label>
              <Input
                id="filter-max"
                type="number"
                min="0"
                step="10"
                inputMode="decimal"
                placeholder="—"
                value={filters.maxAmount}
                onChange={(event) => setFilter("maxAmount", event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="filter-from">De</Label>
              <Input
                id="filter-from"
                type="date"
                value={filters.from}
                onChange={(event) => setFilter("from", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-to">Até</Label>
              <Input
                id="filter-to"
                type="date"
                value={filters.to}
                onChange={(event) => setFilter("to", event.target.value)}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`${results.length} ${results.length === 1 ? "movimento" : "movimentos"}`}
        description={`Entradas ${formatMoney(totalIncome(results))} · Saídas ${formatMoney(totalExpenses(results))}`}
        bodyClassName="p-0"
        action={
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => value && setView(value as "list" | "timeline")}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="timeline" aria-label="Vista de timeline">
              <Rows3 className="size-4" aria-hidden="true" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vista de lista">
              <List className="size-4" aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroup>
        }
      >
        {results.length > 0 ? (
          <div aria-live="polite">
            {view === "timeline" ? (
              <TransactionTimeline transactions={results} accountName={accountName} />
            ) : (
              <ul className="divide-y divide-border">
                {results.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    accountName={accountName(transaction.accountId)}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title={isFiltering ? "Nenhum movimento corresponde aos filtros" : "Ainda sem movimentos"}
            description={
              isFiltering
                ? "Ajusta ou limpa os filtros para voltares a ver o histórico completo."
                : "Registra um depósito, levantamento ou transferência para começares o histórico."
            }
            action={
              isFiltering ? (
                <Button variant="outline" onClick={reset}>
                  <FilterX className="size-4" aria-hidden="true" /> Limpar filtros
                </Button>
              ) : (
                <MovementDialog mode="DEPOSIT" trigger={<Button>Fazer depósito</Button>} />
              )
            }
          />
        )}
      </SectionCard>
    </div>
  );
}
