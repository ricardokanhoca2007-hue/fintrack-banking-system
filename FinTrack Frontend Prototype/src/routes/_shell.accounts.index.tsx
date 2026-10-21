import { createFileRoute } from "@tanstack/react-router";
import { Landmark, PiggyBank, Wallet } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { AccountCard } from "@/components/features/accounts/AccountCard";
import { NewAccountDialog } from "@/components/features/accounts/NewAccountDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAccounts } from "@/hooks/useAccounts";
import { formatMoney } from "@/lib/formatters";

export const Route = createFileRoute("/_shell/accounts/")({
  head: () => ({
    meta: [
      { title: "Contas | FinTrack" },
      {
        name: "description",
        content:
          "Gere as tuas contas FinTrack: saldos, moedas, tipos de conta e criação de novas contas.",
      },
      { property: "og:title", content: "Contas FinTrack" },
      {
        property: "og:description",
        content: "Lista de contas bancárias com saldo, moeda e estado no protótipo FinTrack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const { accounts, aggregatedBalance, savingsBalance } = useAccounts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        description="Todas as tuas contas num só lugar."
        breadcrumbs={[{ label: "FinTrack", to: "/dashboard" }, { label: "Contas" }]}
        actions={<NewAccountDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Saldo agregado"
          value={formatMoney(aggregatedBalance)}
          icon={Wallet}
          tone="primary"
          tooltip="Soma dos saldos das contas em euros."
        />
        <StatCard
          label="Poupanças"
          value={formatMoney(savingsBalance)}
          icon={PiggyBank}
          tone="success"
        />
        <StatCard
          label="Contas ativas"
          value={String(accounts.filter((account) => account.status === "ACTIVE").length)}
          icon={Landmark}
          tone="neutral"
          hint={`${accounts.length} no total`}
        />
      </div>

      {accounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : (
        <div className="surface-card rounded-xl">
          <EmptyState
            icon={Landmark}
            title="Ainda não tens contas"
            description="Cria a tua primeira conta para começares a registar movimentos e acompanhar saldos."
            action={<NewAccountDialog />}
          />
        </div>
      )}
    </div>
  );
}
