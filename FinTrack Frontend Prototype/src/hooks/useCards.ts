import { useCallback, useMemo } from "react";

import { daysSince } from "@/lib/finance";
import { useFinanceStore, type CreateCardInput } from "@/store/finance-store";
import type { BankCard, CardStatus } from "@/types";

export interface CardWithAccount extends BankCard {
  accountName: string;
  accountNumber: string;
  /** Days since the PIN was last rotated — surfaced as a security hint. */
  pinAgeDays: number;
}

interface UseCardsResult {
  cards: CardWithAccount[];
  activeCards: CardWithAccount[];
  forAccount: (accountId: string) => CardWithAccount[];
  createCard: (input: CreateCardInput) => Promise<BankCard>;
  freeze: (cardId: string) => Promise<void>;
  unfreeze: (cardId: string) => Promise<void>;
  block: (cardId: string) => Promise<void>;
  setStatus: (cardId: string, status: CardStatus) => Promise<void>;
  setDailyLimit: (cardId: string, limit: number) => Promise<void>;
  changePin: (cardId: string) => Promise<void>;
}

/** Card read model joined with its account, plus the card mutations. */
export function useCards(): UseCardsResult {
  const {
    cards,
    accounts,
    createCard,
    setCardStatus,
    setCardDailyLimit,
    changeCardPin,
  } = useFinanceStore();

  const enriched = useMemo<CardWithAccount[]>(
    () =>
      cards.map((card) => {
        const account = accounts.find((item) => item.id === card.accountId);
        return {
          ...card,
          accountName: account?.name ?? "Conta removida",
          accountNumber: account?.accountNumber ?? "",
          pinAgeDays: daysSince(card.pinUpdatedAt),
        };
      }),
    [cards, accounts],
  );

  const forAccount = useCallback(
    (accountId: string) => enriched.filter((card) => card.accountId === accountId),
    [enriched],
  );

  return {
    cards: enriched,
    activeCards: enriched.filter((card) => card.status === "ACTIVE"),
    forAccount,
    createCard,
    freeze: (cardId) => setCardStatus(cardId, "FROZEN"),
    unfreeze: (cardId) => setCardStatus(cardId, "ACTIVE"),
    block: (cardId) => setCardStatus(cardId, "BLOCKED"),
    setStatus: setCardStatus,
    setDailyLimit: setCardDailyLimit,
    changePin: changeCardPin,
  };
}
