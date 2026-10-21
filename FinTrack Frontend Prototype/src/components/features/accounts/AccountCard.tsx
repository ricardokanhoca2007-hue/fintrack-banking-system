import { Link } from "@tanstack/react-router";
import { ChevronRight, CreditCard, Landmark, PiggyBank } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/formatters";
import type { Account, AccountType } from "@/types";

const TYPE_ICONS: Record<AccountType, typeof Landmark> = {
  CURRENT: Landmark,
  SAVINGS: PiggyBank,
  CREDIT: CreditCard,
};

export function AccountCard({ account }: { account: Account }) {
  const Icon = TYPE_ICONS[account.type];

  return (
    <Link
      to="/accounts/$accountId"
      params={{ accountId: account.id }}
      className="surface-card group block rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{account.name}</p>
          <p className="num truncate text-xs text-muted-foreground">{account.accountNumber}</p>
        </div>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <p className="num text-2xl font-extrabold">
          {formatMoney(account.balance, account.currency)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
          <Badge variant="outline">{account.currency}</Badge>
          {account.status !== "ACTIVE" && (
            <Badge variant="destructive">{ACCOUNT_STATUS_LABELS[account.status]}</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
