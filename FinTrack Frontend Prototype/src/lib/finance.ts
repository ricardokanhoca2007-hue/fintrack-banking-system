import { getCategory } from "@/lib/constants";
import { formatMonthShort } from "@/lib/formatters";
import type {
  Account,
  BalancePoint,
  CategoryId,
  CategoryTotal,
  Currency,
  MonthlyFlow,
  Transaction,
  TransactionType,
} from "@/types";

/** Expenses are everything that leaves an account. */
const OUTGOING_TYPES: TransactionType[] = ["WITHDRAWAL", "TRANSFER"];

export function isIncoming(transaction: Transaction): boolean {
  return transaction.type === "DEPOSIT";
}

export function isOutgoing(transaction: Transaction): boolean {
  return OUTGOING_TYPES.includes(transaction.type);
}

export function signedAmount(transaction: Transaction): number {
  return isIncoming(transaction) ? transaction.amount : -transaction.amount;
}

export function sumAmounts(transactions: Transaction[]): number {
  return transactions.reduce((total, t) => total + t.amount, 0);
}

/**
 * Aggregated balance for a single currency. Balances are never converted:
 * FX rates belong to the backend, so each currency is reported on its own.
 */
export function totalBalance(accounts: Account[], currency: Currency = "EUR"): number {
  return accounts.filter((a) => a.currency === currency).reduce((sum, a) => sum + a.balance, 0);
}

export function balanceByType(accounts: Account[], type: Account["type"]): number {
  return accounts.filter((a) => a.type === type).reduce((sum, a) => sum + a.balance, 0);
}

export function withinLastDays(transaction: Transaction, days: number, now = Date.now()): boolean {
  return new Date(transaction.date).getTime() > now - days * 24 * 60 * 60 * 1000;
}

export function totalIncome(transactions: Transaction[]): number {
  return sumAmounts(transactions.filter(isIncoming));
}

export function totalExpenses(transactions: Transaction[]): number {
  return sumAmounts(transactions.filter(isOutgoing));
}

export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const monthKey = (date: Date | string) => {
  const value = typeof date === "string" ? new Date(date) : date;
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
};

/** Transactions belonging to a `YYYY-MM` period. */
export function inPeriod(transactions: Transaction[], period: string): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === period);
}

/** Income vs. expenses for the last `months` calendar months, oldest first. */
export function aggregateMonthlyFlow(
  transactions: Transaction[],
  months = 6,
  reference = new Date(),
): MonthlyFlow[] {
  const buckets: MonthlyFlow[] = [];
  const index = new Map<string, MonthlyFlow>();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - offset, 1);
    const flow: MonthlyFlow = { month: formatMonthShort(date), income: 0, expenses: 0, net: 0 };
    buckets.push(flow);
    index.set(monthKey(date), flow);
  }

  for (const transaction of transactions) {
    const bucket = index.get(monthKey(transaction.date));
    if (!bucket) continue;
    if (isIncoming(transaction)) bucket.income += transaction.amount;
    else bucket.expenses += transaction.amount;
  }

  for (const bucket of buckets) bucket.net = bucket.income - bucket.expenses;

  return buckets;
}

/**
 * Balance trend reconstructed backwards from today's balance: the API will
 * eventually return snapshots, but the shape consumed by the chart is the same.
 */
export function aggregateBalanceTrend(
  accounts: Account[],
  transactions: Transaction[],
  months = 6,
  currency: Currency = "EUR",
  reference = new Date(),
): BalancePoint[] {
  const scopedAccountIds = new Set(
    accounts.filter((a) => a.currency === currency).map((a) => a.id),
  );
  const scoped = transactions.filter((t) => scopedAccountIds.has(t.accountId));
  const flow = aggregateMonthlyFlow(scoped, months, reference);

  let running = totalBalance(accounts, currency);
  const points: BalancePoint[] = [];

  // Walk from the newest month backwards, undoing each month's net flow.
  for (let index = flow.length - 1; index >= 0; index -= 1) {
    const bucket = flow[index]!;
    points.unshift({ label: bucket.month, balance: Math.round(running * 100) / 100 });
    running -= bucket.net;
  }

  return points;
}

/** Expense totals per category, largest first. */
export function aggregateExpensesByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<CategoryId, number>();

  for (const transaction of transactions) {
    if (!isOutgoing(transaction)) continue;
    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amount,
    );
  }

  return [...totals.entries()]
    .map(([categoryId, total]) => {
      const category = getCategory(categoryId);
      return {
        categoryId: category.id,
        label: category.label,
        emoji: category.emoji,
        total,
        colorToken: category.colorToken,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function spentInPeriod(
  transactions: Transaction[],
  categoryId: CategoryId,
  period: string,
): number {
  return sumAmounts(
    transactions.filter(
      (t) => t.categoryId === categoryId && isOutgoing(t) && monthKey(t.date) === period,
    ),
  );
}

/**
 * Straight-line projection of the month-end balance: today's balance plus the
 * remaining days at the average daily net flow observed so far this month.
 */
export function forecastMonthEndBalance(
  accounts: Account[],
  transactions: Transaction[],
  currency: Currency = "EUR",
  reference = new Date(),
): { current: number; projected: number; dailyNet: number; daysRemaining: number } {
  const current = totalBalance(accounts, currency);
  const period = monthKey(reference);
  const scopedIds = new Set(accounts.filter((a) => a.currency === currency).map((a) => a.id));
  const monthTransactions = inPeriod(
    transactions.filter((t) => scopedIds.has(t.accountId)),
    period,
  );

  const net = totalIncome(monthTransactions) - totalExpenses(monthTransactions);
  const dayOfMonth = reference.getDate();
  const daysInMonth = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const dailyNet = dayOfMonth > 0 ? net / dayOfMonth : 0;

  return {
    current,
    projected: current + dailyNet * daysRemaining,
    dailyNet,
    daysRemaining,
  };
}

export function daysSince(iso: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)));
}

export function generateIban(currency: Currency): string {
  const group = () => String(Math.floor(1000 + Math.random() * 8999));
  const prefix =
    currency === "USD" ? "US64 SVBK" : currency === "GBP" ? "GB29 NWBK" : "PT50 0002";
  return `${prefix} ${group()} ${group()} ${group()} ${group()} ${Math.floor(Math.random() * 9)}`;
}
