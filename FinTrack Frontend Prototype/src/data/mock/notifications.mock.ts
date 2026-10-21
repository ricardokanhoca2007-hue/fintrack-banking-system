import type { AppNotification } from "@/types";

/** Seed feed for the notification centre; new entries are appended by the store. */
export const mockNotifications: AppNotification[] = [
  {
    id: "ntf-1",
    kind: "DEPOSIT",
    title: "Depósito recebido",
    message: "Vencimento mensal de €2.450,00 creditado na Conta Corrente.",
    createdAt: "2026-08-01T09:12:00Z",
    read: false,
  },
  {
    id: "ntf-2",
    kind: "TRANSFER",
    title: "Transferência concluída",
    message: "€300,00 transferidos da Conta Corrente para a Conta Poupança.",
    createdAt: "2026-08-04T11:05:00Z",
    read: false,
  },
  {
    id: "ntf-3",
    kind: "PAYMENT",
    title: "Pagamento efetuado",
    message: "Renda do apartamento: €720,00 debitados na Conta Corrente.",
    createdAt: "2026-08-02T08:00:00Z",
    read: false,
  },
  {
    id: "ntf-4",
    kind: "BUDGET",
    title: "Orçamento a 78%",
    message: "Já usaste 78% do orçamento de Alimentação deste mês.",
    createdAt: "2026-08-03T18:30:00Z",
    read: true,
  },
  {
    id: "ntf-5",
    kind: "SECURITY",
    title: "Cartão congelado",
    message: "O cartão virtual •••• 1290 foi congelado a teu pedido.",
    createdAt: "2026-07-28T14:22:00Z",
    read: true,
  },
];
