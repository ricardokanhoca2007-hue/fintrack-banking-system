import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Insight, InsightTone } from "@/types";

const TONE_STYLES: Record<InsightTone, { wrapper: string; icon: string }> = {
  positive: { wrapper: "border-success/30 bg-success/5", icon: "bg-success/15 text-success" },
  negative: {
    wrapper: "border-destructive/30 bg-destructive/5",
    icon: "bg-destructive/15 text-destructive",
  },
  neutral: { wrapper: "border-border bg-muted/40", icon: "bg-primary/10 text-primary" },
};

const TONE_ICONS = {
  positive: TrendingDown,
  negative: TrendingUp,
  neutral: Lightbulb,
} as const;

/** Automatic, plain-language reading of the user's month. */
export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {insights.map((insight) => {
        const tone = TONE_STYLES[insight.tone];
        const Icon = TONE_ICONS[insight.tone];
        return (
          <li
            key={insight.id}
            className={cn("flex items-start gap-3 rounded-xl border p-4", tone.wrapper)}
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tone.icon)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{insight.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{insight.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
