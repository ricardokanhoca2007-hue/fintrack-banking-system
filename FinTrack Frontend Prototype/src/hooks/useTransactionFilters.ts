import { useCallback, useMemo, useState } from "react";

import { getCategoryLabel } from "@/lib/constants";
import type { CategoryId, Transaction, TransactionType } from "@/types";

export interface TransactionFilters {
  query: string;
  type: TransactionType | "ALL";
  accountId: string | "ALL";
  categoryId: CategoryId | "ALL";
  from: string;
  to: string;
  /** Empty string means "no bound"; values are compared against the absolute amount. */
  minAmount: string;
  maxAmount: string;
}

const EMPTY_FILTERS: TransactionFilters = {
  query: "",
  type: "ALL",
  accountId: "ALL",
  categoryId: "ALL",
  from: "",
  to: "",
  minAmount: "",
  maxAmount: "",
};

function matches(transaction: Transaction, filters: TransactionFilters): boolean {
  if (filters.type !== "ALL" && transaction.type !== filters.type) return false;
  if (filters.accountId !== "ALL" && transaction.accountId !== filters.accountId) return false;
  if (filters.categoryId !== "ALL" && transaction.categoryId !== filters.categoryId) return false;
  if (filters.from && new Date(transaction.date) < new Date(filters.from)) return false;
  if (filters.to && new Date(transaction.date) > new Date(`${filters.to}T23:59:59`)) return false;

  const min = Number(filters.minAmount.replace(",", "."));
  const max = Number(filters.maxAmount.replace(",", "."));
  if (filters.minAmount && Number.isFinite(min) && transaction.amount < min) return false;
  if (filters.maxAmount && Number.isFinite(max) && transaction.amount > max) return false;

  const query = filters.query.trim().toLowerCase();
  if (!query) return true;

  const haystack = `${transaction.description} ${getCategoryLabel(transaction.categoryId)}`;
  return haystack.toLowerCase().includes(query);
}

/** Filter state + derived result set for the transactions ledger. */
export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);

  const setFilter = useCallback(
    <TKey extends keyof TransactionFilters>(key: TKey, value: TransactionFilters[TKey]) =>
      setFilters((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const results = useMemo(
    () => transactions.filter((transaction) => matches(transaction, filters)),
    [transactions, filters],
  );

  const isFiltering = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS),
    [filters],
  );

  const activeFilterCount = useMemo(
    () =>
      (Object.keys(EMPTY_FILTERS) as (keyof TransactionFilters)[]).filter(
        (key) => filters[key] !== EMPTY_FILTERS[key],
      ).length,
    [filters],
  );

  return { filters, setFilter, reset, results, isFiltering, activeFilterCount } as const;
}
