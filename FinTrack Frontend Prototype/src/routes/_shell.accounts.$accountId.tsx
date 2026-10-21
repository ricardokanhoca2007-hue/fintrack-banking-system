import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { MovementDialog } from "@/components/features/transactions/MovementDialog";
import { TransactionRow } from "@/components/features/transactions/TransactionRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { totalExpenses, totalIncome } from "@/lib/finance";
import { formatDate, formatMoney } from "@/lib/formatters";

export const Route = createFileRoute("/_shell/accounts/$accountId")({
  head: () => ({
    meta: [
      { title: "Detalhe da conta | FinTrack" },
      {
        name: "description",
        content: "Saldo, dados e histórico completo de movimentos de uma conta FinTrack.",
      },
      { property: "og:title", content: "Detalhe da conta | FinTrack" },
      {
        property: "og:description",
        content: "Consulta o saldo e os movimentos de uma conta no protótipo FinTrack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountDetailPage,
});

function AccountDetailPage() {
  const { accountId } = Route.useParams();
  const { getAccount } = useAccounts();
  const { forAccount } = useTransactions();

  const account = getAccount(accountId);
  if (!account) throw notFound();

  const transactions = forAccount(account.id);
  const income = totalIncome(transactions);
  const expenses = totalExpenses(transactions);

  return (
    <div className="space-y-6">
      <PageHeader
        title={account.name}
        description={`${ACCOUNT_TYPE_LABELS[account.type]} · aberta em ${formatDate(account.createdAt)}`}
        breadcrumbs={[
          { label: "FinTrack", to: "/dashboard" },
          { label: "Contas", to: "/accounts" },
          { label: account.name },
        ]}
        actions={
          <>
            <MovementDialog
              mode="DEPOSIT"
              defaultAccountId={account.id}
              trigger={
                <Button>
                  <ArrowDownLeft className="size-4" aria-hidden="true" /> Depositar
                </Button>
              }
            />
            <MovementDialog
              mode="WITHDRAWAL"
              defaultAccountId={account.id}
              trigger={
                <Button variant="outline">
                  <ArrowUpRight className="size-4" aria-hidden="true" /> Levantar
                </Button>
              }
            />
            <MovementDialog
              mode="TRANSFER"
              defaultAccountId={account.id}
              trigger={
                <Button variant="outline">
                  <ArrowLeftRight className="size-4" aria-hidden="true" /> Transferir
                </Button>
              }
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Saldo atual"
          value={formatMoney(account.balance, account.currency)}
          icon={Wallet}
          tone="primary"
          hint={account.accountNumber}
        />
        <StatCard
          label="Entradas"
          value={formatMoney(income, account.currency)}
          icon={TrendingUp}
          tone="success"
          hint="Histórico completo"
        />
        <StatCard
          label="Saídas"
          value={formatMoney(expenses, account.currency)}
          icon={TrendingDown}
          tone="destructive"
          hint="Histórico completo"
        />
      </div>

      <SectionCard title="Dados da conta" description="Informação fornecida pela API">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "IBAN", value: account.accountNumber },
            { label: "Tipo", value: ACCOUNT_TYPE_LABELS[account.type] },
            { label: "Moeda", value: account.currency },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {item.label}
              </dt>
              <dd className="num mt-1 text-sm font-semibold break-words">{item.value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Estado
            </dt>
            <dd className="mt-1">
              <Badge variant={account.status === "ACTIVE" ? "secondary" : "destructive"}>
                {ACCOUNT_STATUS_LABELS[account.status]}
              </Badge>
            </dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        title="Movimentos"
        description={`${transactions.length} registos nesta conta`}
        bodyClassName="p-0"
      >
        {transactions.length > 0 ? (
          <ul className="divide-y divide-border">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Receipt}
            title="Sem movimentos nesta conta"
            description="Registra um depósito para veres o histórico a ganhar vida."
            action={
              <MovementDialog
                mode="DEPOSIT"
                defaultAccountId={account.id}
                trigger={<Button>Fazer depósito</Button>}
              />
            }
          />
        )}
      </SectionCard>
    </div>
  );
}
