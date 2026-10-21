import { useMemo } from "react";

import { useFinanceStore, type GoalInput } from "@/store/finance-store";
import type { Goal } from "@/types";

export interface GoalProgress {
  goal: Goal;
  ratio: number;
  remaining: number;
  daysLeft: number;
  /** Amount to set aside per month to hit the target by the deadline. */
  monthlyNeeded: number;
  completed: boolean;
}

interface UseGoalsResult {
  goals: GoalProgress[];
  totalSaved: number;
  totalTarget: number;
  createGoal: (input: GoalInput) => Promise<void>;
  contribute: (goalId: string, amount: number) => Promise<void>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Savings goals with derived progress figures. */
export function useGoals(): UseGoalsResult {
  const { goals, createGoal, contributeToGoal } = useFinanceStore();

  const progress = useMemo<GoalProgress[]>(
    () =>
      goals.map((goal) => {
        const remaining = Math.max(goal.target - goal.saved, 0);
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / DAY_MS),
        );
        const monthsLeft = Math.max(daysLeft / 30, 0.5);
        return {
          goal,
          ratio: goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0,
          remaining,
          daysLeft,
          monthlyNeeded: remaining > 0 ? remaining / monthsLeft : 0,
          completed: remaining === 0,
        };
      }),
    [goals],
  );

  return {
    goals: progress,
    totalSaved: goals.reduce((sum, goal) => sum + goal.saved, 0),
    totalTarget: goals.reduce((sum, goal) => sum + goal.target, 0),
    createGoal,
    contribute: contributeToGoal,
  };
}
