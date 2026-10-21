import { useMemo } from "react";

import {
  aggregateBalanceTrend,
  aggregateExpensesByCategory,
  aggregateMonthlyFlow,
  balanceByType,
  forecastMonthEndBalance,
  totalBalance,
  totalExpenses,
  totalIncome,
  withinLastDays,
} from "@/lib/finance";
import { buildInsights } from "@/lib/insights";
import { useBudgets, type BudgetProgress } from "@/hooks/useBudgets";
import { useFinanceStore } from "@/store/finance-store";
import type { BalancePoint, CategoryTotal, Currency, Insight, MonthlyFlow } from "@/types";

/** Rolling window used by the dashboard headline metrics. */
export const DASHBOARD_WINDOW_DAYS = 60;

export type { BudgetProgress };

interface UseDashboardMetricsResult {
  windowDays: number;
  aggregatedBalance: number;
  savingsBalance: number;
  /** Balances of accounts held in currencies other than the base one. */
  foreignBalances: { currency: Currency; balance: number }[];
  income: number;
  expenses: number;
  netFlow: number;
  savingsRate: number;
  accountCount: number;
  monthlyFlow: MonthlyFlow[];
  balanceTrend: BalancePoint[];
  forecast: { current: number; projected: number; dailyNet: number; daysRemaining: number };
  expensesByCategory: CategoryTotal[];
  budgetProgress: BudgetProgress[];
  insights: Insight[];
}

/** All dashboard aggregations in one place, derived from the store. */
export function useDashboardMetrics(): UseDashboardMetricsResult {
  const { accounts, transactions, budgets } = useFinanceStore();
  const { budgets: budgetProgress } = useBudgets();

  return useMemo(() => {
    const windowTransactions = transactions.filter((t) =>
      withinLastDays(t, DASHBOARD_WINDOW_DAYS),
    );
    const income = totalIncome(windowTransactions);
    const expenses = totalExpenses(windowTransactions);

    const foreignBalances = (["USD", "GBP"] as Currency[])
      .map((currency) => ({ currency, balance: totalBalance(accounts, currency) }))
      .filter((entry) => accounts.some((account) => account.currency === entry.currency));

    return {
      windowDays: DASHBOARD_WINDOW_DAYS,
      aggregatedBalance: totalBalance(accounts, "EUR"),
      savingsBalance: balanceByType(accounts, "SAVINGS"),
      foreignBalances,
      income,
      expenses,
      netFlow: income - expenses,
      savingsRate: income > 0 ? (income - expenses) / income : 0,
      accountCount: accounts.length,
      monthlyFlow: aggregateMonthlyFlow(transactions, 6),
      balanceTrend: aggregateBalanceTrend(accounts, transactions, 6),
      forecast: forecastMonthEndBalance(accounts, transactions),
      expensesByCategory: aggregateExpensesByCategory(windowTransactions),
      budgetProgress,
      insights: buildInsights(transactions, budgets),
    };
  }, [accounts, transactions, budgets, budgetProgress]);
}
