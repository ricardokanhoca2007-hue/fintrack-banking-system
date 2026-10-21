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
import { useAccounts } from "@/hooks/useAccounts";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCards } from "@/hooks/useCards";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useZodForm } from "@/hooks/useZodForm";
import { CARD_KIND_LABELS } from "@/lib/constants";
import type { CardKind } from "@/types";

const schema = z.object({
  accountId: z.string().min(1, "Escolhe a conta associada."),
  kind: z.enum(["PHYSICAL", "VIRTUAL"]),
  holderName: z.string().trim().min(3, "Indica o nome do titular."),
});

type Values = z.infer<typeof schema>;

/** Issues a new physical or virtual card for one of the user's accounts. */
export function NewCardDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { activeAccounts } = useAccounts();
  const { createCard } = useCards();
  const { fullName } = useUserProfile();
  const { isPending, run } = useAsyncAction();

  const initialValues: Values = {
    accountId: activeAccounts[0]?.id ?? "",
    kind: "VIRTUAL",
    holderName: fullName,
  };

  const form = useZodForm(schema, initialValues);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await run(() => createCard(values), {
      successTitle: `Cartão ${CARD_KIND_LABELS[values.kind].toLowerCase()} emitido`,
      successDescription: "Já podes definir limites e PIN.",
    });
    if (result) {
      setOpen(false);
      form.reset(initialValues);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Emitir novo cartão</DialogTitle>
          <DialogDescription>
            Cartões virtuais são criados instantaneamente; os físicos seriam enviados por correio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField label="Conta associada" error={form.errors.accountId}>
            {({ id }) => (
              <Select
                value={form.values.accountId}
                onValueChange={(value) => {
                  form.setField("accountId", value);
                  form.touch("accountId");
                }}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Selecionar conta" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} · {account.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField label="Tipo de cartão" error={form.errors.kind}>
            {({ id }) => (
              <Select
                value={form.values.kind}
                onValueChange={(value) => form.setField("kind", value as CardKind)}
              >
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CARD_KIND_LABELS) as CardKind[]).map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {CARD_KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField
            label="Nome do titular"
            error={form.errors.holderName}
            hint="Aparece impresso no cartão."
          >
            {(props) => (
              <Input
                {...props}
                value={form.values.holderName}
                onChange={(event) => form.setField("holderName", event.target.value)}
                onBlur={() => form.touch("holderName")}
              />
            )}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Emitir cartão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
