import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TRANSACTION_STATUS_LABELS, getCategoryLabel } from "@/lib/constants";
import { isIncoming } from "@/lib/finance";
import { formatAmount, formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

const TYPE_ICONS = {
  DEPOSIT: ArrowDownLeft,
  WITHDRAWAL: ArrowUpRight,
  TRANSFER: ArrowLeftRight,
} as const;

interface TransactionRowProps {
  transaction: Transaction;
  /** Shown on ledgers that mix accounts. */
  accountName?: string | undefined;
}

export function TransactionRow({ transaction, accountName }: TransactionRowProps) {
  const incoming = isIncoming(transaction);
  const Icon = TYPE_ICONS[transaction.type];

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          incoming ? "bg-success/10 text-success" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{transaction.description}</p>
        <p className="truncate text-xs text-muted-foreground">
          {getCategoryLabel(transaction.categoryId)} · {formatDateTime(transaction.date)}
          {accountName ? ` · ${accountName}` : ""}
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "num text-sm font-bold whitespace-nowrap",
            incoming ? "text-success" : "text-foreground",
          )}
        >
          {incoming ? "+" : "−"}
          {formatAmount(transaction.amount, transaction.currency)}
        </p>
        {transaction.status !== "COMPLETED" && (
          <Badge variant="outline" className="mt-1 text-[10px]">
            {TRANSACTION_STATUS_LABELS[transaction.status]}
          </Badge>
        )}
      </div>
    </li>
  );
}
