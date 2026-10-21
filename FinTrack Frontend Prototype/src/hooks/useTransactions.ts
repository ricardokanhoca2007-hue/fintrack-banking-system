import { useCallback, useMemo } from "react";

import { sortByDateDesc } from "@/lib/finance";
import {
  useFinanceStore,
  type MovementInput,
  type TransferInput,
} from "@/store/finance-store";
import type { Transaction } from "@/types";

interface UseTransactionsResult {
  transactions: Transaction[];
  recent: (limit: number) => Transaction[];
  forAccount: (accountId: string) => Transaction[];
  deposit: (input: MovementInput) => Promise<void>;
  withdraw: (input: MovementInput) => Promise<void>;
  transfer: (input: TransferInput) => Promise<void>;
}

/** Transaction read model (always date-sorted) plus the movement mutations. */
export function useTransactions(): UseTransactionsResult {
  const { transactions, deposit, withdraw, transfer } = useFinanceStore();

  const sorted = useMemo(() => sortByDateDesc(transactions), [transactions]);

  const forAccount = useCallback(
    (accountId: string) => sorted.filter((t) => t.accountId === accountId),
    [sorted],
  );

  const recent = useCallback((limit: number) => sorted.slice(0, limit), [sorted]);

  return { transactions: sorted, recent, forAccount, deposit, withdraw, transfer };
}
