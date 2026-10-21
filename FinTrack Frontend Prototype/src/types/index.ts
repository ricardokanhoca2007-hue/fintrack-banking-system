/**
 * Domain models.
 *
 * These interfaces mirror the contract of the future Java/Spring Boot REST API
 * (one interface per JPA entity / DTO). The UI depends only on these types, so
 * swapping the mock data layer for real `fetch` calls requires no UI changes.
 */

export type Currency = "EUR" | "USD" | "GBP";

export type AccountType = "CURRENT" | "SAVINGS" | "CREDIT";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface Account {
  id: string;
  name: string;
  /** IBAN-formatted account number, as returned by the API. */
  accountNumber: string;
  balance: number;
  currency: Currency;
  type: AccountType;
  status: AccountStatus;
  createdAt: string;
}

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export type CategoryId =
  | "SALARY"
  | "GROCERIES"
  | "TRANSPORT"
  | "HOUSING"
  | "LEISURE"
  | "HEALTH"
  | "SHOPPING"
  | "TECH"
  | "EDUCATION"
  | "SUBSCRIPTIONS"
  | "TRANSFER";

/** Chart tokens available for category colouring (all defined in styles.css). */
export type ColorToken =
  | "--chart-1"
  | "--chart-2"
  | "--chart-3"
  | "--chart-4"
  | "--chart-5"
  | "--chart-6"
  | "--chart-7"
  | "--chart-8";

export interface Category {
  id: CategoryId;
  label: string;
  /** Visual identity: shown next to the label in lists, badges and legends. */
  emoji: string;
  /** Design-system chart token used to colour this category consistently. */
  colorToken: ColorToken;
}

export interface Transaction {
  id: string;
  accountId: string;
  /** Set on transfers: the other leg's account. */
  counterpartyAccountId?: string | undefined;
  type: TransactionType;
  status: TransactionStatus;
  categoryId: CategoryId;
  description: string;
  /** Always positive; the sign is derived from `type`. */
  amount: number;
  currency: Currency;
  /** ISO-8601 timestamp. */
  date: string;
}

export interface Budget {
  id: string;
  categoryId: CategoryId;
  /** Monthly ceiling in the budget currency. */
  limit: number;
  currency: Currency;
  period: string; // YYYY-MM
}

export type CardBrand = "VISA" | "MASTERCARD";

export type CardKind = "PHYSICAL" | "VIRTUAL";

/** FROZEN is reversible by the user; BLOCKED requires re-issuing the card. */
export type CardStatus = "ACTIVE" | "FROZEN" | "BLOCKED";

export interface BankCard {
  id: string;
  accountId: string;
  holderName: string;
  /** Only the last four digits ever leave the backend. */
  last4: string;
  brand: CardBrand;
  kind: CardKind;
  status: CardStatus;
  /** MM/YY as printed on the card. */
  expiry: string;
  currency: Currency;
  dailyLimit: number;
  pinUpdatedAt: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  currency: Currency;
  /** ISO date the user wants to reach the target by. */
  deadline: string;
}

export type NotificationKind = "TRANSFER" | "DEPOSIT" | "PAYMENT" | "SECURITY" | "BUDGET";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export type Language = "pt" | "en";

export type ThemePreference = "light" | "dark";

export interface UserPreferences {
  language: Language;
  theme: ThemePreference;
  /** Currency used for aggregated totals and new accounts. */
  currency: Currency;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string | null;
  memberSince: string;
  preferences: UserPreferences;
}

/** Aggregated income/expense pair for one calendar month. */
export interface MonthlyFlow {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryTotal {
  categoryId: CategoryId;
  label: string;
  emoji: string;
  total: number;
  colorToken: ColorToken;
}

/** One point of the balance-over-time chart. */
export interface BalancePoint {
  label: string;
  balance: number;
}

export type InsightTone = "positive" | "negative" | "neutral";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  description: string;
}
