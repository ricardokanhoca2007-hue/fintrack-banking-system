import { Info, type LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type StatTone = "primary" | "success" | "destructive" | "neutral";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  /** Explains how the metric is calculated — surfaced through a discreet tooltip. */
  tooltip?: string;
  trend?: { value: string; positive: boolean };
  tone?: StatTone;
  className?: string;
}

const toneStyles: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  neutral: "bg-secondary text-secondary-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tooltip,
  trend,
  tone = "neutral",
  className,
}: StatCardProps) {
  return (
    <article className={cn("surface-card rounded-xl p-5", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </h3>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  aria-label={`Como se calcula: ${label}`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Info className="size-3.5" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent className="max-w-56">{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="num mt-2 truncate text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
        </div>
        <span
          className={cn("grid size-10 shrink-0 place-items-center rounded-xl", toneStyles[tone])}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>

      {(hint || trend) && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {trend && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 font-semibold",
                trend.positive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {trend.value}
            </span>
          )}
          {hint}
        </p>
      )}
    </article>
  );
}
