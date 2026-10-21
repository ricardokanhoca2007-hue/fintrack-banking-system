import { getCategory } from "@/lib/constants";
import {
  daysSince,
  inPeriod,
  isIncoming,
  isOutgoing,
  monthKey,
  spentInPeriod,
  sumAmounts,
  totalExpenses,
  totalIncome,
} from "@/lib/finance";
import { formatMoney } from "@/lib/formatters";
import type { Budget, Insight, Transaction } from "@/types";

/**
 * Derives plain-language insights from the ledger.
 *
 * Pure and side-effect free: the same function will work unchanged against the
 * transactions returned by the Spring Boot API.
 */
export function buildInsights(
  transactions: Transaction[],
  budgets: Budget[],
  reference = new Date(),
): Insight[] {
  const insights: Insight[] = [];

  const current = monthKey(reference);
  const previousDate = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  const previous = monthKey(previousDate);

  const currentMonth = inPeriod(transactions, current);
  const previousMonth = inPeriod(transactions, previous);

  const currentExpenses = totalExpenses(currentMonth);
  const previousExpenses = totalExpenses(previousMonth);

  if (previousExpenses > 0 && currentExpenses > 0) {
    const delta = (currentExpenses - previousExpenses) / previousExpenses;
    const pct = Math.abs(Math.round(delta * 100));
    if (pct >= 3) {
      insights.push(
        delta < 0
          ? {
              id: "expenses-trend",
              tone: "positive",
              title: `Gastaste ${pct}% menos este mês`,
              description: `${formatMoney(currentExpenses)} em despesas até agora, contra ${formatMoney(previousExpenses)} no mês anterior.`,
            }
          : {
              id: "expenses-trend",
              tone: "negative",
              title: `Gastaste ${pct}% mais este mês`,
              description: `${formatMoney(currentExpenses)} em despesas, acima dos ${formatMoney(previousExpenses)} do mês anterior.`,
            },
      );
    }
  }

  // Biggest category swing month over month.
  const categoryDelta = new Map<string, number>();
  for (const transaction of currentMonth.filter(isOutgoing)) {
    categoryDelta.set(
      transaction.categoryId,
      (categoryDelta.get(transaction.categoryId) ?? 0) + transaction.amount,
    );
  }
  for (const transaction of previousMonth.filter(isOutgoing)) {
    categoryDelta.set(
      transaction.categoryId,
      (categoryDelta.get(transaction.categoryId) ?? 0) - transaction.amount,
    );
  }
  const ranked = [...categoryDelta.entries()].sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1]),
  );
  const top = ranked[0];
  if (top && Math.abs(top[1]) >= 20) {
    const category = getCategory(top[0] as Transaction["categoryId"]);
    insights.push({
      id: `category-${category.id}`,
      tone: top[1] > 0 ? "negative" : "positive",
      title: `${category.emoji} ${category.label} ${top[1] > 0 ? "aumentou" : "diminuiu"} ${formatMoney(Math.abs(top[1]))}`,
      description:
        top[1] > 0
          ? "Esta é a categoria que mais cresceu face ao mês anterior."
          : "Esta é a categoria onde poupaste mais face ao mês anterior.",
    });
  }

  // Latest salary credit.
  const lastSalary = transactions
    .filter((t) => t.categoryId === "SALARY" && isIncoming(t))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  if (lastSalary) {
    const days = daysSince(lastSalary.date, reference.getTime());
    insights.push({
      id: "last-salary",
      tone: "neutral",
      title:
        days === 0
          ? "Recebeste salário hoje"
          : `Recebeste salário há ${days} ${days === 1 ? "dia" : "dias"}`,
      description: `${lastSalary.description}: ${formatMoney(lastSalary.amount, lastSalary.currency)}.`,
    });
  }

  // Budget nearing or over its ceiling.
  const atRisk = budgets
    .map((budget) => ({
      budget,
      spent: spentInPeriod(transactions, budget.categoryId, budget.period),
    }))
    .filter(({ budget, spent }) => budget.limit > 0 && spent / budget.limit >= 0.75)
    .sort((a, b) => b.spent / b.budget.limit - a.spent / a.budget.limit)[0];
  if (atRisk) {
    const category = getCategory(atRisk.budget.categoryId);
    const ratio = Math.round((atRisk.spent / atRisk.budget.limit) * 100);
    insights.push({
      id: `budget-${atRisk.budget.id}`,
      tone: ratio > 100 ? "negative" : "neutral",
      title:
        ratio > 100
          ? `Orçamento de ${category.label} excedido`
          : `Orçamento de ${category.label} a ${ratio}%`,
      description: `${formatMoney(atRisk.spent, atRisk.budget.currency)} de ${formatMoney(atRisk.budget.limit, atRisk.budget.currency)} usados neste período.`,
    });
  }

  // Savings rate of the running month.
  const income = totalIncome(currentMonth);
  if (income > 0) {
    const rate = Math.round(((income - currentExpenses) / income) * 100);
    insights.push({
      id: "savings-rate",
      tone: rate >= 20 ? "positive" : rate >= 0 ? "neutral" : "negative",
      title: `Taxa de poupança de ${rate}% este mês`,
      description: `Recebeste ${formatMoney(income)} e gastaste ${formatMoney(currentExpenses)}.`,
    });
  }

  // Largest single expense of the month.
  const largest = currentMonth
    .filter(isOutgoing)
    .sort((a, b) => b.amount - a.amount)[0];
  if (largest && sumAmounts([largest]) >= 100) {
    insights.push({
      id: "largest-expense",
      tone: "neutral",
      title: `Maior despesa: ${largest.description}`,
      description: `${formatMoney(largest.amount, largest.currency)} em ${getCategory(largest.categoryId).label}.`,
    });
  }

  return insights.slice(0, 5);
}
