import type { Goal } from "@/types";

/** Savings goals shown on the dashboard with progress bars. */
export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    name: "Comprar carro",
    emoji: "🚗",
    target: 12000,
    saved: 8640,
    currency: "EUR",
    deadline: "2027-03-31",
  },
  {
    id: "goal-2",
    name: "Viagem ao Japão",
    emoji: "🗾",
    target: 4000,
    saved: 1480,
    currency: "EUR",
    deadline: "2027-06-30",
  },
  {
    id: "goal-3",
    name: "Fundo de emergência",
    emoji: "🛟",
    target: 6000,
    saved: 5400,
    currency: "EUR",
    deadline: "2026-12-31",
  },
  {
    id: "goal-4",
    name: "Setup de trabalho",
    emoji: "💻",
    target: 2500,
    saved: 620,
    currency: "EUR",
    deadline: "2027-01-31",
  },
];
