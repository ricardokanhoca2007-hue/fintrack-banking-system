import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useBudgets } from "@/hooks/useBudgets";
import { useZodForm } from "@/hooks/useZodForm";
import { CATEGORIES } from "@/lib/constants";
import type { CategoryId } from "@/types";

const schema = z.object({
  categoryId: z.string().min(1, "Escolhe a categoria."),
  limit: z
    .string()
    .min(1, "Define um limite.")
    .refine((value) => Number(value.replace(",", ".")) > 0, "O limite tem de ser positivo."),
});

type Values = z.infer<typeof schema>;

interface BudgetDialogProps {
  trigger: ReactNode;
  /** Pre-fills the form when editing an existing ceiling. */
  initial?: { categoryId: CategoryId; limit: number };
}

/** Creates or updates a monthly spending ceiling for one category. */
export function BudgetDialog({ trigger, initial }: BudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const { upsertBudget } = useBudgets();
  const { isPending, run } = useAsyncAction();

  const defaults: Values = {
    categoryId: initial?.categoryId ?? "GROCERIES",
    limit: initial ? String(initial.limit) : "",
  };
  const form = useZodForm(schema, defaults);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await run(
      () =>
        upsertBudget({
          categoryId: values.categoryId as CategoryId,
          limit: Number(values.limit.replace(",", ".")),
        }),
      { successTitle: initial ? "Orçamento atualizado" : "Orçamento criado" },
    );
    if (result !== null) {
      setOpen(false);
      form.reset(defaults);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar orçamento" : "Novo orçamento"}</DialogTitle>
          <DialogDescription>
            Definimos o limite para o mês atual e avisamos-te quando passar dos 75%.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField label="Categoria" error={form.errors.categoryId}>
            {({ id }) => (
              <Select
                value={form.values.categoryId}
                onValueChange={(value) => form.setField("categoryId", value)}
                disabled={Boolean(initial)}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((category) => category.id !== "TRANSFER").map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span aria-hidden="true">{category.emoji}</span> {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField label="Limite mensal (€)" error={form.errors.limit}>
            {(props) => (
              <Input
                {...props}
                type="number"
                min="1"
                step="10"
                value={form.values.limit}
                onChange={(event) => form.setField("limit", event.target.value)}
                onBlur={() => form.touch("limit")}
              />
            )}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
