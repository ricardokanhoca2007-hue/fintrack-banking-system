import { CURRENCY_SYMBOLS } from "@/lib/constants";
import type { Currency } from "@/types";

const LOCALE = "pt-PT";

export function formatMoney(amount: number, currency: Currency = "EUR"): string {
  const formatted = Math.abs(amount).toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? "-" : ""}${CURRENCY_SYMBOLS[currency]}${formatted}`;
}

/** Money without the sign — for rows that render "+"/"−" themselves. */
export function formatAmount(amount: number, currency: Currency = "EUR"): string {
  return formatMoney(Math.abs(amount), currency);
}

export function formatCompactMoney(amount: number, currency: Currency = "EUR"): string {
  return `${CURRENCY_SYMBOLS[currency]}${Math.abs(amount).toLocaleString(LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMonthShort(date: Date): string {
  const label = date.toLocaleDateString(LOCALE, { month: "short" });
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function maskAccountNumber(accountNumber: string): string {
  return `•••• ${accountNumber.replace(/\s+/g, "").slice(-4)}`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Parses a locale-typed amount ("1 234,56") into a number, or null when invalid. */
export function parseAmountInput(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
