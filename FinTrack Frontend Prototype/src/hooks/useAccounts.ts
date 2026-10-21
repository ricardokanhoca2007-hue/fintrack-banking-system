import { useCallback, useMemo } from "react";

import { balanceByType, totalBalance } from "@/lib/finance";
import { useFinanceStore, type CreateAccountInput } from "@/store/finance-store";
import type { Account } from "@/types";

interface UseAccountsResult {
  accounts: Account[];
  activeAccounts: Account[];
  aggregatedBalance: number;
  savingsBalance: number;
  getAccount: (id: string) => Account | undefined;
  createAccount: (input: CreateAccountInput) => Promise<Account>;
}

/** Account-level read model plus the create mutation. */
export function useAccounts(): UseAccountsResult {
  const { accounts, createAccount } = useFinanceStore();

  const getAccount = useCallback(
    (id: string) => accounts.find((account) => account.id === id),
    [accounts],
  );

  return useMemo(
    () => ({
      accounts,
      activeAccounts: accounts.filter((account) => account.status === "ACTIVE"),
      aggregatedBalance: totalBalance(accounts, "EUR"),
      savingsBalance: balanceByType(accounts, "SAVINGS"),
      getAccount,
      createAccount,
    }),
    [accounts, getAccount, createAccount],
  );
}
