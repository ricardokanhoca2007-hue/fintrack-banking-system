import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  mockAccounts,
  mockBudgets,
  mockCards,
  mockGoals,
  mockNotifications,
  mockTransactions,
} from "@/data/mock";
import { useAuth } from "@/store/auth-store";
import { MOCK_LATENCY_MS } from "@/lib/constants";
import { generateIban } from "@/lib/finance";
import { formatMoney } from "@/lib/formatters";
import type {
  Account,
  AppNotification,
  BankCard,
  Budget,
  CardKind,
  Goal,
  NotificationKind,
  Transaction,
} from "@/types";

/**
 * In-memory store standing in for the Spring Boot API.
 *
 * Every mutator is async and artificially latent so the UI exercises real
 * loading states; replacing the bodies with `fetch` calls later requires no
 * change to the hooks or components that consume them.
 */

export interface CreateAccountInput {
  name: string;
  type: Account["type"];
  currency: Account["currency"];
  initialBalance: number;
}

export interface MovementInput {
  accountId: string;
  amount: number;
  description: string;
  categoryId: Transaction["categoryId"];
}

export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

export interface CreateCardInput {
  accountId: string;
  kind: CardKind;
  holderName: string;
}

export interface BudgetInput {
  categoryId: Budget["categoryId"];
  limit: number;
}

export interface GoalInput {
  name: string;
  emoji: string;
  target: number;
  deadline: string;
}

interface FinanceStore {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  cards: BankCard[];
  goals: Goal[];
  notifications: AppNotification[];
  createAccount: (input: CreateAccountInput) => Promise<Account>;
  deposit: (input: MovementInput) => Promise<void>;
  withdraw: (input: MovementInput) => Promise<void>;
  transfer: (input: TransferInput) => Promise<void>;
  createCard: (input: CreateCardInput) => Promise<BankCard>;
  setCardStatus: (cardId: string, status: BankCard["status"]) => Promise<void>;
  setCardDailyLimit: (cardId: string, dailyLimit: number) => Promise<void>;
  changeCardPin: (cardId: string) => Promise<void>;
  upsertBudget: (input: BudgetInput) => Promise<void>;
  removeBudget: (budgetId: string) => Promise<void>;
  createGoal: (input: GoalInput) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const FinanceStoreContext = createContext<FinanceStore | null>(null);

const delay = (ms = MOCK_LATENCY_MS) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const currentPeriod = () => new Date().toISOString().slice(0, 7);

const clone = <T,>(items: T[]): T[] => items.map((item) => ({ ...item }));

export function FinanceStoreProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const sessionId = currentUser?.id ?? null;
    const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [cards, setCards] = useState<BankCard[]>(mockCards);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  // Each session starts from a fresh copy of the demo portfolio, so mutations
  // made by one user never leak into the next one's screens.

useEffect(() => {
  let cancelled = false;

  async function loadAccounts() {
    try {
      const response = await fetch("/api/v1/accounts");

      if (!response.ok) {
        throw new Error(`Erro ao carregar contas: HTTP ${response.status}`);
      }

      const data: Account[] = await response.json();

      if (!cancelled) {
        setAccounts(data);
      }
    } catch (error) {
      console.error("Não foi possível carregar as contas da API:", error);
    }
  }

  void loadAccounts();

  setTransactions(clone(mockTransactions));
  setBudgets(clone(mockBudgets));
  setGoals(clone(mockGoals));
  setNotifications(clone(mockNotifications));

  const holder = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim().toUpperCase()
    : "FINTRACK USER";

  setCards(
    mockCards.map((card) => ({
      ...card,
      holderName: holder || card.holderName,
    })),
  );

  return () => {
    cancelled = true;
  };
}, [sessionId, currentUser]);

  const notify = useCallback((kind: NotificationKind, title: string, message: string) => {
    setNotifications((prev) => [
      { id: nextId("ntf"), kind, title, message, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const createAccount = useCallback(
    async (input: CreateAccountInput) => {
      await delay();
      const account: Account = {
        id: nextId("acc"),
        name: input.name,
        accountNumber: generateIban(input.currency),
        balance: input.initialBalance,
        currency: input.currency,
        type: input.type,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      setAccounts((prev) => [...prev, account]);

      if (input.initialBalance > 0) {
        setTransactions((prev) => [
          {
            id: nextId("tx"),
            accountId: account.id,
            type: "DEPOSIT",
            status: "COMPLETED",
            categoryId: "TRANSFER",
            description: "Depósito inicial",
            amount: input.initialBalance,
            currency: account.currency,
            date: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      notify(
        "DEPOSIT",
        "Conta criada",
        `${account.name} (${account.currency}) foi aberta com ${formatMoney(account.balance, account.currency)}.`,
      );
      return account;
    },
    [notify],
  );

  const applyMovement = useCallback(
    async (input: MovementInput, direction: 1 | -1) => {
      await delay();
      let currency: Account["currency"] = "EUR";
      let accountName = "conta";

      setAccounts((prev) =>
        prev.map((account) => {
          if (account.id !== input.accountId) return account;
          currency = account.currency;
          accountName = account.name;
          return { ...account, balance: account.balance + direction * input.amount };
        }),
      );

      setTransactions((prev) => [
        {
          id: nextId("tx"),
          accountId: input.accountId,
          type: direction === 1 ? "DEPOSIT" : "WITHDRAWAL",
          status: "COMPLETED",
          categoryId: input.categoryId,
          description: input.description,
          amount: input.amount,
          currency,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);

      notify(
        direction === 1 ? "DEPOSIT" : "PAYMENT",
        direction === 1 ? "Depósito recebido" : "Pagamento efetuado",
        `${formatMoney(input.amount, currency)} ${direction === 1 ? "creditados em" : "debitados de"} ${accountName}.`,
      );
    },
    [notify],
  );

  const deposit = useCallback(
    (input: MovementInput) => applyMovement(input, 1),
    [applyMovement],
  );

  const withdraw = useCallback(
    (input: MovementInput) => applyMovement(input, -1),
    [applyMovement],
  );

  const transfer = useCallback(
    async (input: TransferInput) => {
      await delay();
      let fromName = "conta";
      let toName = "conta";
      let fromCurrency: Account["currency"] = "EUR";
      let toCurrency: Account["currency"] = "EUR";

      setAccounts((prev) => {
        const from = prev.find((a) => a.id === input.fromAccountId);
        const to = prev.find((a) => a.id === input.toAccountId);
        fromName = from?.name ?? fromName;
        toName = to?.name ?? toName;
        fromCurrency = from?.currency ?? fromCurrency;
        toCurrency = to?.currency ?? toCurrency;

        return prev.map((account) => {
          if (account.id === input.fromAccountId)
            return { ...account, balance: account.balance - input.amount };
          if (account.id === input.toAccountId)
            return { ...account, balance: account.balance + input.amount };
          return account;
        });
      });

      const date = new Date().toISOString();
      setTransactions((prev) => [
        {
          id: nextId("tx"),
          accountId: input.fromAccountId,
          counterpartyAccountId: input.toAccountId,
          type: "TRANSFER",
          status: "COMPLETED",
          categoryId: "TRANSFER",
          description: input.description || `Transferência para ${toName}`,
          amount: input.amount,
          currency: fromCurrency,
          date,
        },
        {
          id: nextId("tx"),
          accountId: input.toAccountId,
          counterpartyAccountId: input.fromAccountId,
          type: "DEPOSIT",
          status: "COMPLETED",
          categoryId: "TRANSFER",
          description: input.description || `Transferência de ${fromName}`,
          amount: input.amount,
          currency: toCurrency,
          date,
        },
        ...prev,
      ]);

      notify(
        "TRANSFER",
        "Transferência concluída",
        `${formatMoney(input.amount, fromCurrency)} de ${fromName} para ${toName}.`,
      );
    },
    [notify],
  );

  const createCard = useCallback(
    async (input: CreateCardInput) => {
      await delay();
      const currency =
        accounts.find((account) => account.id === input.accountId)?.currency ?? "EUR";
      const expiryYear = new Date().getFullYear() + 4;
      const card: BankCard = {
        id: nextId("card"),
        accountId: input.accountId,
        holderName: input.holderName.toUpperCase(),
        last4: String(Math.floor(1000 + Math.random() * 8999)),
        brand: Math.random() > 0.5 ? "VISA" : "MASTERCARD",
        kind: input.kind,
        status: "ACTIVE",
        expiry: `${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(expiryYear).slice(-2)}`,
        currency,
        dailyLimit: input.kind === "VIRTUAL" ? 300 : 750,
        pinUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setCards((prev) => [card, ...prev]);
      notify("SECURITY", "Cartão emitido", `Novo cartão ${input.kind === "VIRTUAL" ? "virtual" : "físico"} •••• ${card.last4}.`);
      return card;
    },
    [accounts, notify],
  );

  const setCardStatus = useCallback(
    async (cardId: string, status: BankCard["status"]) => {
      await delay(320);
      let last4 = "";
      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== cardId) return card;
          last4 = card.last4;
          return { ...card, status };
        }),
      );
      const label =
        status === "ACTIVE" ? "ativado" : status === "FROZEN" ? "congelado" : "bloqueado";
      notify("SECURITY", `Cartão ${label}`, `O cartão •••• ${last4} foi ${label}.`);
    },
    [notify],
  );

  const setCardDailyLimit = useCallback(
    async (cardId: string, dailyLimit: number) => {
      await delay(320);
      let last4 = "";
      let currency: Account["currency"] = "EUR";
      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== cardId) return card;
          last4 = card.last4;
          currency = card.currency;
          return { ...card, dailyLimit };
        }),
      );
      notify(
        "SECURITY",
        "Limite diário atualizado",
        `Cartão •••• ${last4}: novo limite de ${formatMoney(dailyLimit, currency)} por dia.`,
      );
    },
    [notify],
  );

  const changeCardPin = useCallback(
    async (cardId: string) => {
      await delay(320);
      let last4 = "";
      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== cardId) return card;
          last4 = card.last4;
          return { ...card, pinUpdatedAt: new Date().toISOString() };
        }),
      );
      notify("SECURITY", "PIN alterado", `O PIN do cartão •••• ${last4} foi atualizado.`);
    },
    [notify],
  );

  const upsertBudget = useCallback(async (input: BudgetInput) => {
    await delay(320);
    const period = currentPeriod();
    setBudgets((prev) => {
      const existing = prev.find(
        (budget) => budget.categoryId === input.categoryId && budget.period === period,
      );
      if (existing) {
        return prev.map((budget) =>
          budget.id === existing.id ? { ...budget, limit: input.limit } : budget,
        );
      }
      return [
        ...prev,
        {
          id: nextId("bud"),
          categoryId: input.categoryId,
          limit: input.limit,
          currency: "EUR",
          period,
        },
      ];
    });
  }, []);

  const removeBudget = useCallback(async (budgetId: string) => {
    await delay(240);
    setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
  }, []);

  const createGoal = useCallback(async (input: GoalInput) => {
    await delay(320);
    setGoals((prev) => [
      ...prev,
      {
        id: nextId("goal"),
        name: input.name,
        emoji: input.emoji || "🎯",
        target: input.target,
        saved: 0,
        currency: "EUR",
        deadline: input.deadline,
      },
    ]);
  }, []);

  const contributeToGoal = useCallback(
    async (goalId: string, amount: number) => {
      await delay(320);
      let goalName = "objetivo";
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;
          goalName = goal.name;
          return { ...goal, saved: Math.min(goal.saved + amount, goal.target) };
        }),
      );
      notify("BUDGET", "Objetivo reforçado", `${formatMoney(amount)} alocados a "${goalName}".`);
    },
    [notify],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo<FinanceStore>(
    () => ({
      accounts,
      transactions,
      budgets,
      cards,
      goals,
      notifications,
      createAccount,
      deposit,
      withdraw,
      transfer,
      createCard,
      setCardStatus,
      setCardDailyLimit,
      changeCardPin,
      upsertBudget,
      removeBudget,
      createGoal,
      contributeToGoal,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
    }),
    [
      accounts,
      transactions,
      budgets,
      cards,
      goals,
      notifications,
      createAccount,
      deposit,
      withdraw,
      transfer,
      createCard,
      setCardStatus,
      setCardDailyLimit,
      changeCardPin,
      upsertBudget,
      removeBudget,
      createGoal,
      contributeToGoal,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
    ],
  );

  return <FinanceStoreContext.Provider value={value}>{children}</FinanceStoreContext.Provider>;
}

export function useFinanceStore(): FinanceStore {
  const context = useContext(FinanceStoreContext);
  if (!context) {
    throw new Error("useFinanceStore must be used inside <FinanceStoreProvider>");
  }
  return context;
}
