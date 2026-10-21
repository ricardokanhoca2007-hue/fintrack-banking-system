import { useMemo } from "react";

import { getCategory } from "@/lib/constants";
import { monthKey, spentInPeriod } from "@/lib/finance";
import { useFinanceStore, type BudgetInput } from "@/store/finance-store";
import type { Budget, Category, CategoryId } from "@/types";

export interface BudgetProgress {
  budget: Budget;
  category: Category;
  label: string;
  spent: number;
  remaining: number;
  /** Capped at 1.5 so an overspend stays readable on a progress bar. */
  ratio: number;
  exceeded: boolean;
}

interface UseBudgetsResult {
  period: string;
  budgets: BudgetProgress[];
  totalLimit: number;
  totalSpent: number;
  budgetedCategoryIds: CategoryId[];
  upsertBudget: (input: BudgetInput) => Promise<void>;
  removeBudget: (budgetId: string) => Promise<void>;
}

/** Budget ceilings for the running month, joined with actual spending. */
export function useBudgets(): UseBudgetsResult {
  const { budgets, transactions, upsertBudget, removeBudget } = useFinanceStore();
  const period = monthKey(new Date());

  const progress = useMemo<BudgetProgress[]>(
    () =>
      budgets
        .map((budget) => {
          const spent = spentInPeriod(transactions, budget.categoryId, budget.period);
          return {
            budget,
            category: getCategory(budget.categoryId),
            label: getCategory(budget.categoryId).label,
            spent,
            remaining: Math.max(budget.limit - spent, 0),
            ratio: budget.limit > 0 ? Math.min(spent / budget.limit, 1.5) : 0,
            exceeded: spent > budget.limit,
          };
        })
        .sort((a, b) => b.ratio - a.ratio),
    [budgets, transactions],
  );

  return {
    period,
    budgets: progress,
    totalLimit: budgets.reduce((sum, budget) => sum + budget.limit, 0),
    totalSpent: progress.reduce((sum, item) => sum + item.spent, 0),
    budgetedCategoryIds: budgets.map((budget) => budget.categoryId),
    upsertBudget,
    removeBudget,
  };
}
