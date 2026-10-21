import type { Budget } from "@/types";

/** Monthly ceilings for the current period, used by the budgets screen and dashboard. */
export const mockBudgets: Budget[] = [
  { id: "bud-1", categoryId: "HOUSING", limit: 850, currency: "EUR", period: "2026-08" },
  { id: "bud-2", categoryId: "GROCERIES", limit: 400, currency: "EUR", period: "2026-08" },
  { id: "bud-3", categoryId: "TRANSPORT", limit: 120, currency: "EUR", period: "2026-08" },
  { id: "bud-4", categoryId: "LEISURE", limit: 150, currency: "EUR", period: "2026-08" },
  { id: "bud-5", categoryId: "SUBSCRIPTIONS", limit: 40, currency: "EUR", period: "2026-08" },
  { id: "bud-6", categoryId: "TECH", limit: 200, currency: "EUR", period: "2026-08" },
];
