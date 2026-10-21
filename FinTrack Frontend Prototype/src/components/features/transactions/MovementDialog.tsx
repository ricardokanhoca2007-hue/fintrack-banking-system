import { useMemo, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { ConfirmDialog, type ConfirmationRow } from "@/components/common/ConfirmDialog";
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
import { useTransactions } from "@/hooks/useTransactions";
import { useZodForm } from "@/hooks/useZodForm";
import { CATEGORIES, HIGH_VALUE_THRESHOLD, TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { formatMoney, parseAmountInput } from "@/lib/formatters";
import type { CategoryId, TransactionType } from "@/types";

const COPY: Record<TransactionType, { title: string; description: string; cta: string }> = {
  DEPOSIT: {
    title: "Novo depósito",
    description: "Adiciona fundos a uma das tuas contas.",
    cta: "Depositar",
  },
  WITHDRAWAL: {
    title: "Novo levantamento",
    description: "Retira fundos de uma das tuas contas.",
    cta: "Levantar",
  },
  TRANSFER: {
    title: "Transferência entre contas",
    description: "Move fundos entre duas contas do teu perfil.",
    cta: "Transferir",
  },
};

interface MovementDialogProps {
  mode: TransactionType;
  trigger: ReactNode;
  defaultAccountId?: string | undefined;
}

export function MovementDialog({ mode, trigger, defaultAccountId }: MovementDialogProps) {
  const { activeAccounts, getAccount } = useAccounts();
  const { deposit, withdraw, transfer } = useTransactions();
  const { isPending, run } = useAsyncAction();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isTransfer = mode === "TRANSFER";

  const schema = useMemo(
    () =>
      z
        .object({
          fromAccountId: z.string().min(1, "Seleciona uma conta."),
          toAccountId: z.string(),
          amount: z.string().refine((value) => {
            const parsed = parseAmountInput(value);
            return parsed !== null && parsed > 0;
          }, "Introduz um montante superior a zero."),
          categoryId: z.string().min(1),
          description: z.string().max(60),
        })
        .superRefine((values, ctx) => {
          const amount = parseAmountInput(values.amount) ?? 0;
          const source = activeAccounts.find((a) => a.id === values.fromAccountId);

          if (mode !== "DEPOSIT" && source && amount > source.balance) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["amount"],
              message: `Saldo insuficiente (disponível ${formatMoney(source.balance, source.currency)}).`,
            });
          }

          if (!isTransfer) return;

          if (!values.toAccountId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["toAccountId"],
              message: "Seleciona a conta de destino.",
            });
          } else if (values.toAccountId === values.fromAccountId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["toAccountId"],
              message: "A origem e o destino têm de ser contas diferentes.",
            });
          }
        }),
    [activeAccounts, mode, isTransfer],
  );

  const form = useZodForm(schema, {
    fromAccountId: defaultAccountId ?? activeAccounts[0]?.id ?? "",
    toAccountId: activeAccounts.find((a) => a.id !== (defaultAccountId ?? activeAccounts[0]?.id))?.id ?? "",
    amount: "",
    categoryId: (mode === "DEPOSIT" ? "SALARY" : "SHOPPING") satisfies CategoryId as string,
    description: "",
  });

  const amount = parseAmountInput(form.values.amount) ?? 0;
  const source = getAccount(form.values.fromAccountId);
  const destination = getAccount(form.values.toAccountId);
  const needsConfirmation = isTransfer || amount >= HIGH_VALUE_THRESHOLD;

  const summary: ConfirmationRow[] = [
    { label: "Operação", value: TRANSACTION_TYPE_LABELS[mode] },
    { label: "Montante", value: formatMoney(amount, source?.currency) },
    { label: isTransfer ? "De" : "Conta", value: source?.name ?? "—" },
    ...(isTransfer ? [{ label: "Para", value: destination?.name ?? "—" }] : []),
    {
      label: "Saldo após operação",
      value: formatMoney(
        (source?.balance ?? 0) + (mode === "DEPOSIT" ? amount : -amount),
        source?.currency,
      ),
    },
  ];

  async function execute() {
    const values = form.values;
    const result = await run(
      () => {
        if (isTransfer) {
          return transfer({
            fromAccountId: values.fromAccountId,
            toAccountId: values.toAccountId,
            amount,
            description: values.description,
          });
        }
        const payload = {
          accountId: values.fromAccountId,
          amount,
          description: values.description || TRANSACTION_TYPE_LABELS[mode],
          categoryId: values.categoryId as CategoryId,
        };
        return mode === "DEPOSIT" ? deposit(payload) : withdraw(payload);
      },
      {
        successTitle: `${COPY[mode].title} concluído`,
        successDescription: `${formatMoney(amount, source?.currency)} registado com sucesso.`,
        errorMessage: "Não foi possível concluir a operação.",
      },
    );

    setConfirming(false);
    if (result !== null) {
      form.reset();
      setOpen(false);
    }
  }

  const submit = form.handleSubmit(async () => {
    if (needsConfirmation) {
      setConfirming(true);
      return;
    }
    await execute();
  });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) form.reset();
        }}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY[mode].title}</DialogTitle>
            <DialogDescription>{COPY[mode].description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="movement-from">{isTransfer ? "Conta de origem" : "Conta"}</Label>
              <Select
                value={form.values.fromAccountId}
                onValueChange={(value) => form.setField("fromAccountId", value)}
              >
                <SelectTrigger id="movement-from">
                  <SelectValue placeholder="Escolher conta" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} — {formatMoney(account.balance, account.currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isTransfer && (
              <FormField label="Conta de destino" error={form.errors.toAccountId}>
                {() => (
                  <Select
                    value={form.values.toAccountId}
                    onValueChange={(value) => {
                      form.setField("toAccountId", value);
                      form.touch("toAccountId");
                    }}
                  >
                    <SelectTrigger aria-invalid={Boolean(form.errors.toAccountId)}>
                      <SelectValue placeholder="Escolher conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAccounts
                        .filter((account) => account.id !== form.values.fromAccountId)
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} — {formatMoney(account.balance, account.currency)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}

            <FormField
              label="Montante"
              error={form.errors.amount}
              hint={
                source
                  ? `Disponível: ${formatMoney(source.balance, source.currency)}`
                  : undefined
              }
            >
              {(field) => (
                <Input
                  {...field}
                  value={form.values.amount}
                  onChange={(event) => form.setField("amount", event.target.value)}
                  onBlur={() => form.touch("amount")}
                  placeholder="0,00"
                  inputMode="decimal"
                  autoComplete="off"
                />
              )}
            </FormField>

            {!isTransfer && (
              <div className="space-y-2">
                <Label htmlFor="movement-category">Categoria</Label>
                <Select
                  value={form.values.categoryId}
                  onValueChange={(value) => form.setField("categoryId", value)}
                >
                  <SelectTrigger id="movement-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <FormField label="Descrição" error={form.errors.description} hint="Opcional">
              {(field) => (
                <Input
                  {...field}
                  value={form.values.description}
                  onChange={(event) => form.setField("description", event.target.value)}
                  maxLength={60}
                  placeholder={isTransfer ? "Ex.: Poupança mensal" : "Ex.: Supermercado"}
                />
              )}
            </FormField>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {COPY[mode].cta}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Confirmar ${TRANSACTION_TYPE_LABELS[mode].toLowerCase()}`}
        description="Revê os detalhes antes de confirmar. Esta operação altera os saldos das contas envolvidas."
        summary={summary}
        confirmLabel={COPY[mode].cta}
        isPending={isPending}
        onConfirm={execute}
      />
    </>
  );
}
