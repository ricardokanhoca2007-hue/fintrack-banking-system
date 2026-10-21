import { useMemo } from "react";

import { TransactionRow } from "@/components/features/transactions/TransactionRow";
import { totalExpenses, totalIncome } from "@/lib/finance";
import { formatMoney } from "@/lib/formatters";
import type { Transaction } from "@/types";

interface TransactionTimelineProps {
  transactions: Transaction[];
  accountName?: (accountId: string) => string | undefined;
}

const LOCALE = "pt-PT";

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (sameDay(date, today)) return "Hoje";
  if (sameDay(date, yesterday)) return "Ontem";
  return date.toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Ledger grouped by day, with a per-day net summary — the timeline view. */
export function TransactionTimeline({ transactions, accountName }: TransactionTimelineProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const transaction of transactions) {
      const key = transaction.date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), transaction]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [transactions]);

  return (
    <div className="divide-y divide-border">
      {groups.map(([day, items]) => {
        const net = totalIncome(items) - totalExpenses(items);
        return (
          <section key={day}>
            <div className="sticky top-14 z-10 flex items-baseline justify-between gap-3 border-b border-border bg-surface/95 px-4 py-2 backdrop-blur">
              <h3 className="truncate text-xs font-bold tracking-wide text-muted-foreground uppercase">
                {dayLabel(items[0]!.date)}
              </h3>
              <span className="num shrink-0 text-xs font-semibold text-muted-foreground">
                {net >= 0 ? "+" : "−"}
                {formatMoney(Math.abs(net))}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {items.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  accountName={accountName?.(transaction.accountId)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
