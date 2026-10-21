import type {
  AccountStatus,
  AccountType,
  CardKind,
  CardStatus,
  Category,
  CategoryId,
  Currency,
  Language,
  NotificationKind,
  TransactionStatus,
  TransactionType,
  UserPreferences,
} from "@/types";

/** Presentation labels and lookups. Kept apart from the models so the domain stays language-agnostic. */

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export const CURRENCIES: Currency[] = ["EUR", "USD", "GBP"];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CURRENT: "Conta à ordem",
  SAVINGS: "Poupança",
  CREDIT: "Crédito",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "Ativa",
  INACTIVE: "Inativa",
  BLOCKED: "Bloqueada",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT: "Depósito",
  WITHDRAWAL: "Levantamento",
  TRANSFER: "Transferência",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  COMPLETED: "Concluída",
  PENDING: "Pendente",
  FAILED: "Falhada",
};

export const CARD_KIND_LABELS: Record<CardKind, string> = {
  PHYSICAL: "Físico",
  VIRTUAL: "Virtual",
};

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  ACTIVE: "Ativo",
  FROZEN: "Congelado",
  BLOCKED: "Bloqueado",
};

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  TRANSFER: "Transferência",
  DEPOSIT: "Depósito",
  PAYMENT: "Pagamento",
  SECURITY: "Segurança",
  BUDGET: "Orçamento",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  pt: "Português (PT)",
  en: "English (UK)",
};

export const CATEGORIES: Category[] = [
  { id: "SALARY", label: "Salário", emoji: "💰", colorToken: "--chart-1" },
  { id: "GROCERIES", label: "Alimentação", emoji: "🍔", colorToken: "--chart-2" },
  { id: "TRANSPORT", label: "Transporte", emoji: "🚗", colorToken: "--chart-3" },
  { id: "HOUSING", label: "Habitação", emoji: "🏠", colorToken: "--chart-4" },
  { id: "LEISURE", label: "Lazer", emoji: "🎬", colorToken: "--chart-5" },
  { id: "HEALTH", label: "Saúde", emoji: "🩺", colorToken: "--chart-6" },
  { id: "SHOPPING", label: "Compras", emoji: "🛍️", colorToken: "--chart-7" },
  { id: "TECH", label: "Tecnologia", emoji: "💻", colorToken: "--chart-8" },
  { id: "EDUCATION", label: "Educação", emoji: "🎓", colorToken: "--chart-2" },
  { id: "SUBSCRIPTIONS", label: "Subscrições", emoji: "📺", colorToken: "--chart-5" },
  { id: "TRANSFER", label: "Transferência", emoji: "🔁", colorToken: "--chart-1" },
];

const CATEGORY_BY_ID = new Map<CategoryId, Category>(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  return CATEGORY_BY_ID.get(id) ?? CATEGORIES[0]!;
}

export function getCategoryLabel(id: CategoryId): string {
  return getCategory(id).label;
}

/** Amount above which a movement asks for explicit confirmation. */
export const HIGH_VALUE_THRESHOLD = 500;

/** Simulated network latency, so loading states behave like they will against the real API. */
export const MOCK_LATENCY_MS = 550;

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: "pt",
  theme: "light",
  currency: "EUR",
};
