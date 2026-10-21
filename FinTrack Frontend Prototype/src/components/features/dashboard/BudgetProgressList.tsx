import { Progress } from "@/components/ui/progress";
import type { BudgetProgress } from "@/hooks/useDashboardMetrics";
import { formatMoney, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function BudgetProgressList({ items }: { items: BudgetProgress[] }) {
  return (
    <ul className="space-y-4">
      {items.map(({ budget, label, spent, ratio }) => {
        const exceeded = spent > budget.limit;
        return (
          <li key={budget.id} className="space-y-2">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-semibold">{label}</span>
              <span
                className={cn(
                  "num shrink-0 text-xs",
                  exceeded ? "font-semibold text-destructive" : "text-muted-foreground",
                )}
              >
                {formatMoney(spent, budget.currency)} / {formatMoney(budget.limit, budget.currency)}
              </span>
            </div>
            <Progress
              value={Math.min(ratio * 100, 100)}
              className={cn("h-2", exceeded && "[&>div]:bg-destructive")}
              aria-label={`${label}: ${formatPercent(ratio)} do orçamento usado`}
            />
          </li>
        );
      })}
    </ul>
  );
}
