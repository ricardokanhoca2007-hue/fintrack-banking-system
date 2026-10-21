import { useState, type ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";

import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useGoals, type GoalProgress } from "@/hooks/useGoals";
import { useZodForm } from "@/hooks/useZodForm";
import { formatDate, formatMoney, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/** Savings goals with progress bars and quick contributions. */
export function GoalList({ goals }: { goals: GoalProgress[] }) {
  return (
    <ul className="space-y-4">
      {goals.map((item) => (
        <GoalRow key={item.goal.id} item={item} />
      ))}
    </ul>
  );
}

function GoalRow({ item }: { item: GoalProgress }) {
  const { contribute } = useGoals();
  const { isPending, run } = useAsyncAction();
  const { goal } = item;

  return (
    <li className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-semibold">
          <span aria-hidden="true">{goal.emoji}</span> {goal.name}
        </span>
        <span className="num shrink-0 text-xs text-muted-foreground">
          {formatMoney(goal.saved, goal.currency)} / {formatMoney(goal.target, goal.currency)}
        </span>
      </div>

      <Progress
        value={item.ratio * 100}
        className={cn("h-2", item.completed && "[&>div]:bg-success")}
        aria-label={`${goal.name}: ${formatPercent(item.ratio)} concluído`}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {item.completed
            ? "Objetivo alcançado 🎉"
            : `Faltam ${formatMoney(item.remaining, goal.currency)} · ${formatMoney(item.monthlyNeeded, goal.currency)}/mês até ${formatDate(goal.deadline)}`}
        </span>
        {!item.completed && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              void run(() => contribute(goal.id, Math.min(50, item.remaining)), {
                successTitle: "Objetivo reforçado",
              })
            }
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-3.5" aria-hidden="true" />
            )}
            {formatMoney(Math.min(50, item.remaining), goal.currency)}
          </Button>
        )}
      </div>
    </li>
  );
}

const schema = z.object({
  name: z.string().trim().min(3, "Dá um nome ao objetivo."),
  emoji: z.string().trim().min(1, "Escolhe um emoji.").max(4, "Usa apenas um emoji."),
  target: z
    .string()
    .min(1, "Indica o valor-alvo.")
    .refine((value) => Number(value.replace(",", ".")) > 0, "O valor tem de ser positivo."),
  deadline: z.string().min(1, "Define uma data-alvo."),
});

type Values = z.infer<typeof schema>;

const DEFAULTS: Values = {
  name: "",
  emoji: "🎯",
  target: "",
  deadline: "",
};

/** Creates a new savings goal. */
export function NewGoalDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { createGoal } = useGoals();
  const { isPending, run } = useAsyncAction();
  const form = useZodForm(schema, DEFAULTS);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await run(
      () =>
        createGoal({
          name: values.name,
          emoji: values.emoji,
          target: Number(values.target.replace(",", ".")),
          deadline: values.deadline,
        }),
      { successTitle: "Objetivo criado", successDescription: values.name },
    );
    if (result !== null) {
      setOpen(false);
      form.reset(DEFAULTS);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo objetivo financeiro</DialogTitle>
          <DialogDescription>
            Define quanto queres juntar e até quando — calculamos o esforço mensal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
            <FormField label="Emoji" error={form.errors.emoji}>
              {(props) => (
                <Input
                  {...props}
                  value={form.values.emoji}
                  onChange={(event) => form.setField("emoji", event.target.value)}
                  onBlur={() => form.touch("emoji")}
                />
              )}
            </FormField>
            <FormField label="Nome" error={form.errors.name}>
              {(props) => (
                <Input
                  {...props}
                  placeholder="Fundo de emergência"
                  value={form.values.name}
                  onChange={(event) => form.setField("name", event.target.value)}
                  onBlur={() => form.touch("name")}
                />
              )}
            </FormField>
          </div>

          <FormField label="Valor-alvo (€)" error={form.errors.target}>
            {(props) => (
              <Input
                {...props}
                type="number"
                min="1"
                step="10"
                value={form.values.target}
                onChange={(event) => form.setField("target", event.target.value)}
                onBlur={() => form.touch("target")}
              />
            )}
          </FormField>

          <FormField label="Data-alvo" error={form.errors.deadline}>
            {(props) => (
              <Input
                {...props}
                type="date"
                value={form.values.deadline}
                onChange={(event) => form.setField("deadline", event.target.value)}
                onBlur={() => form.touch("deadline")}
              />
            )}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Criar objetivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
