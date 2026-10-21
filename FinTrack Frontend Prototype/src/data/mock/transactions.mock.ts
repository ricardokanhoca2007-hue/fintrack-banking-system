import type { CategoryId, Transaction, TransactionType } from "@/types";
import { mockAccounts } from "./accounts.mock";

function tx(
  id: string,
  accountId: string,
  type: TransactionType,
  categoryId: CategoryId,
  description: string,
  amount: number,
  date: string,
  counterpartyAccountId?: string,
): Transaction {
  return {
    id,
    accountId,
    type,
    status: "COMPLETED",
    categoryId,
    description,
    amount,
    date,
    counterpartyAccountId,
    currency: mockAccounts.find((a) => a.id === accountId)?.currency ?? "EUR",
  };
}

/**
 * Six months of movements across the five demo accounts. August (the current
 * period) is deliberately lighter than July so the dashboard insights have a
 * meaningful month-over-month story to tell.
 */
export const mockTransactions: Transaction[] = [
  // ---------- Agosto 2026 (mês corrente) ----------
  tx("tx-001", "acc-1", "DEPOSIT", "SALARY", "Vencimento mensal", 2450, "2026-08-01T09:12:00Z"),
  tx("tx-002", "acc-1", "WITHDRAWAL", "HOUSING", "Renda do apartamento", 720, "2026-08-02T08:00:00Z"),
  tx("tx-003", "acc-1", "WITHDRAWAL", "GROCERIES", "Continente", 86.42, "2026-08-03T18:24:00Z"),
  tx("tx-004", "acc-1", "TRANSFER", "TRANSFER", "Reforço poupança", 300, "2026-08-04T11:05:00Z", "acc-2"),
  tx("tx-005", "acc-2", "DEPOSIT", "TRANSFER", "Reforço recebido", 300, "2026-08-04T11:05:00Z", "acc-1"),
  tx("tx-006", "acc-1", "WITHDRAWAL", "SUBSCRIPTIONS", "Spotify + Netflix", 24.98, "2026-08-04T06:00:00Z"),
  tx("tx-007", "acc-1", "WITHDRAWAL", "TRANSPORT", "Passe Andante", 40, "2026-08-05T07:40:00Z"),
  tx("tx-008", "acc-3", "WITHDRAWAL", "TECH", "Backblaze Storage", 9.5, "2026-08-05T10:15:00Z"),

  // ---------- Julho 2026 ----------
  tx("tx-011", "acc-1", "DEPOSIT", "SALARY", "Vencimento mensal", 2450, "2026-07-01T09:12:00Z"),
  tx("tx-012", "acc-1", "WITHDRAWAL", "HOUSING", "Renda do apartamento", 720, "2026-07-02T08:00:00Z"),
  tx("tx-013", "acc-1", "WITHDRAWAL", "HOUSING", "Eletricidade EDP", 62.15, "2026-07-05T09:00:00Z"),
  tx("tx-014", "acc-1", "WITHDRAWAL", "GROCERIES", "Lidl", 94.3, "2026-07-06T18:00:00Z"),
  tx("tx-015", "acc-1", "WITHDRAWAL", "GROCERIES", "Restaurante Tapas", 54.8, "2026-07-08T20:30:00Z"),
  tx("tx-016", "acc-1", "WITHDRAWAL", "HEALTH", "Consulta dentista", 75, "2026-07-15T16:00:00Z"),
  tx("tx-017", "acc-5", "WITHDRAWAL", "SHOPPING", "Zara", 118.3, "2026-07-11T19:45:00Z"),
  tx("tx-018", "acc-1", "DEPOSIT", "SALARY", "Freelance UI", 640, "2026-07-20T10:02:00Z"),
  tx("tx-019", "acc-3", "WITHDRAWAL", "SHOPPING", "Amazon US", 132.9, "2026-07-24T15:33:00Z"),
  tx("tx-020", "acc-1", "WITHDRAWAL", "LEISURE", "Cinema NOS", 21.5, "2026-07-26T21:10:00Z"),
  tx("tx-021", "acc-1", "WITHDRAWAL", "TRANSPORT", "Gasolina Galp", 68.2, "2026-07-27T13:20:00Z"),
  tx("tx-022", "acc-1", "WITHDRAWAL", "TRANSPORT", "Passe Andante", 40, "2026-07-03T07:40:00Z"),
  tx("tx-023", "acc-1", "WITHDRAWAL", "SUBSCRIPTIONS", "Spotify + Netflix", 24.98, "2026-07-04T06:00:00Z"),
  tx("tx-024", "acc-1", "WITHDRAWAL", "TECH", "Monitor 27\" LG", 289.99, "2026-07-18T14:00:00Z"),
  tx("tx-025", "acc-4", "WITHDRAWAL", "LEISURE", "Concerto Londres", 92.4, "2026-07-22T20:00:00Z"),
  tx("tx-026", "acc-1", "TRANSFER", "TRANSFER", "Reforço poupança", 300, "2026-07-05T11:05:00Z", "acc-2"),
  tx("tx-027", "acc-2", "DEPOSIT", "TRANSFER", "Reforço recebido", 300, "2026-07-05T11:05:00Z", "acc-1"),

  // ---------- Junho 2026 ----------
  tx("tx-031", "acc-1", "DEPOSIT", "SALARY", "Vencimento mensal", 2450, "2026-06-01T09:12:00Z"),
  tx("tx-032", "acc-1", "WITHDRAWAL", "HOUSING", "Renda do apartamento", 720, "2026-06-02T08:00:00Z"),
  tx("tx-033", "acc-1", "WITHDRAWAL", "HOUSING", "Eletricidade EDP", 58.4, "2026-06-06T09:00:00Z"),
  tx("tx-034", "acc-1", "WITHDRAWAL", "GROCERIES", "Continente", 102.6, "2026-06-09T18:20:00Z"),
  tx("tx-035", "acc-1", "WITHDRAWAL", "GROCERIES", "Pingo Doce", 71.15, "2026-06-19T19:00:00Z"),
  tx("tx-036", "acc-1", "WITHDRAWAL", "TRANSPORT", "Gasolina Galp", 66.2, "2026-06-22T13:20:00Z"),
  tx("tx-037", "acc-1", "WITHDRAWAL", "SUBSCRIPTIONS", "Spotify + Netflix", 24.98, "2026-06-04T06:00:00Z"),
  tx("tx-038", "acc-1", "WITHDRAWAL", "EDUCATION", "Curso Spring Boot", 149, "2026-06-12T11:30:00Z"),
  tx("tx-039", "acc-2", "DEPOSIT", "SALARY", "Juros trimestrais", 18.4, "2026-06-30T09:00:00Z"),
  tx("tx-040", "acc-3", "DEPOSIT", "SALARY", "Cliente EUA", 850, "2026-06-14T16:00:00Z"),
  tx("tx-041", "acc-1", "WITHDRAWAL", "LEISURE", "Festival Primavera", 78, "2026-06-27T22:00:00Z"),
  tx("tx-042", "acc-1", "TRANSFER", "TRANSFER", "Reforço poupança", 250, "2026-06-05T11:05:00Z", "acc-2"),
  tx("tx-043", "acc-2", "DEPOSIT", "TRANSFER", "Reforço recebido", 250, "2026-06-05T11:05:00Z", "acc-1"),

  // ---------- Maio 2026 ----------
  tx("tx-051", "acc-1", "DEPOSIT", "SALARY", "Vencimento mensal", 2450, "2026-05-01T09:12:00Z"),
  tx("tx-052", "acc-1", "WITHDRAWAL", "HOUSING", "Renda do apartamento", 720, "2026-05-02T08:00:00Z"),
  tx("tx-053", "acc-1", "WITHDRAWAL", "SHOPPING", "IKEA", 210.4, "2026-05-19T17:00:00Z"),
  tx("tx-054", "acc-1", "WITHDRAWAL", "GROCERIES", "Lidl", 92.3, "2026-05-06T18:00:00Z"),
  tx("tx-055", "acc-1", "WITHDRAWAL", "GROCERIES", "Mercado Bolhão", 47.9, "2026-05-16T11:00:00Z"),
  tx("tx-056", "acc-1", "WITHDRAWAL", "TRANSPORT", "Uber", 38.6, "2026-05-23T23:15:00Z"),
  tx("tx-057", "acc-1", "WITHDRAWAL", "SUBSCRIPTIONS", "Spotify + Netflix", 24.98, "2026-05-04T06:00:00Z"),
  tx("tx-058", "acc-4", "DEPOSIT", "SALARY", "Consultoria UK", 620, "2026-05-11T10:00:00Z"),
  tx("tx-059", "acc-1", "WITHDRAWAL", "HEALTH", "Ginásio Solinca", 42, "2026-05-08T07:30:00Z"),
  tx("tx-060", "acc-1", "TRANSFER", "TRANSFER", "Reforço poupança", 250, "2026-05-05T11:05:00Z", "acc-2"),
  tx("tx-061", "acc-2", "DEPOSIT", "TRANSFER", "Reforço recebido", 250, "2026-05-05T11:05:00Z", "acc-1"),

  // ---------- Abril 2026 ----------
  tx("tx-071", "acc-1", "DEPOSIT", "SALARY", "Vencimento mensal", 2450, "2026-04-01T09:12:00Z"),
  tx("tx-072", "acc-1", "WITHDRAWAL", "HOUSING", "Renda do apartamento", 720, "2026-04-02T08:00:00Z"),
  tx("tx-073", "acc-1", "WITHDRAWAL", "HEALTH", "Farmácia", 33.7, "2026-04-14T12:00:00Z"),
  tx("tx-074", "acc-1", "WITHDRAWAL", "GROCERIES", "Continente", 88.25, "2026-04-10T18:10:00Z"),
  tx("tx-075", "acc-1", "WITHDRAWAL", "TECH", "Teclado mecânico", 119.9, "2026-04-21T15:00:00Z"),
  tx("tx-076", "acc-1", "WITHDRAWAL", "SUBSCRIPTIONS", "Spotify + Netflix", 24.98, "2026-04-04T06:00:00Z"),
  tx("tx-077", "acc-3", "WITHDRAWAL", "SHOPPING", "Apple Store US", 249, "2026-04-18T17:30:00Z"),
  tx("tx-078", "acc-1", "WITHDRAWAL", "LEISURE", "Teatro Rivoli", 32, "2026-04-25T21:00:00Z"),

  // ---------- Março 2026 ----------
  tx("tx-091", "acc-1", "DEPOSIT", "SALARY", "Vencimento mensal", 2450, "2026-03-01T09:12:00Z"),
  tx("tx-092", "acc-1", "WITHDRAWAL", "HOUSING", "Renda do apartamento", 700, "2026-03-02T08:00:00Z"),
  tx("tx-093", "acc-1", "WITHDRAWAL", "TRANSPORT", "Uber", 46.6, "2026-03-29T23:15:00Z"),
  tx("tx-094", "acc-1", "WITHDRAWAL", "GROCERIES", "Lidl", 79.4, "2026-03-12T18:40:00Z"),
  tx("tx-095", "acc-1", "WITHDRAWAL", "EDUCATION", "Livros técnicos", 64.2, "2026-03-17T13:00:00Z"),
  tx("tx-096", "acc-1", "WITHDRAWAL", "SUBSCRIPTIONS", "Spotify + Netflix", 24.98, "2026-03-04T06:00:00Z"),
  tx("tx-097", "acc-2", "DEPOSIT", "SALARY", "Juros trimestrais", 16.1, "2026-03-31T09:00:00Z"),
];
