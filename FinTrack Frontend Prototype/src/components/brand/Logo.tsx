import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="brand-gradient grid size-9 shrink-0 place-items-center rounded-xl shadow-[var(--shadow-glow)]">
        <Wallet className="size-5 text-primary-foreground" />
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          Fin<span className="brand-text">Track</span>
        </span>
      )}
    </div>
  );
}
