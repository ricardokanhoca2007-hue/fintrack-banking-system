import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useZodForm } from "@/hooks/useZodForm";
import { ACCOUNT_TYPE_LABELS, CURRENCIES } from "@/lib/constants";
import { formatMoney, parseAmountInput } from "@/lib/formatters";
import type { AccountType, Currency } from "@/types";

const schema = z.object({
  name: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  type: z.enum(["CURRENT", "SAVINGS", "CREDIT"]),
  currency: z.enum(["EUR", "USD", "GBP"]),
  initialBalance: z
    .string()
    .refine((value) => {
      const parsed = parseAmountInput(value);
      return parsed !== null && parsed >= 0;
    }, "Introduz um saldo inicial válido (0 ou superior)."),
});

type FormValues = z.infer<typeof schema>;

const INITIAL_VALUES: FormValues = {
  name: "",
  type: "CURRENT",
  currency: "EUR",
  initialBalance: "0",
};

export function NewAccountDialog() {
  const { createAccount } = useAccounts();
  const { isPending, run } = useAsyncAction();
  const [open, setOpen] = useState(false);
  const form = useZodForm(schema, INITIAL_VALUES);

  const submit = form.handleSubmit(async (values) => {
    const balance = parseAmountInput(values.initialBalance) ?? 0;
    const created = await run(
      () =>
        createAccount({
          name: values.name,
          type: values.type,
          currency: values.currency,
          initialBalance: balance,
        }),
      {
        successTitle: "Conta criada",
        successDescription: `${values.name} · ${formatMoney(balance, values.currency)}`,
        errorMessage: "Não foi possível criar a conta.",
      },
    );

    if (created) {
      form.reset();
      setOpen(false);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden="true" /> Nova conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar nova conta</DialogTitle>
          <DialogDescription>
            Adiciona uma conta ao teu perfil FinTrack. Os dados são de demonstração.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <FormField label="Nome da conta" error={form.errors.name}>
            {(field) => (
              <Input
                {...field}
                value={form.values.name}
                onChange={(event) => form.setField("name", event.target.value)}
                onBlur={() => form.touch("name")}
                placeholder="Ex.: Poupança Casa"
                maxLength={40}
              />
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-type">Tipo</Label>
              <Select
                value={form.values.type}
                onValueChange={(value) => form.setField("type", value as AccountType)}
              >
                <SelectTrigger id="account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {ACCOUNT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-currency">Moeda</Label>
              <Select
                value={form.values.currency}
                onValueChange={(value) => form.setField("currency", value as Currency)}
              >
                <SelectTrigger id="account-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <FormField
            label="Saldo inicial"
            error={form.errors.initialBalance}
            hint="Fica registado como depósito inicial no histórico."
          >
            {(field) => (
              <Input
                {...field}
                value={form.values.initialBalance}
                onChange={(event) => form.setField("initialBalance", event.target.value)}
                onBlur={() => form.touch("initialBalance")}
                inputMode="decimal"
              />
            )}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Criar conta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
