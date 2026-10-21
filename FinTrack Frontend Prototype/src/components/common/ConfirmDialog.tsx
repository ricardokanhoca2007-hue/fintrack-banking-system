import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmationRow {
  label: string;
  value: string;
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Operation summary shown before the user commits. */
  summary?: ConfirmationRow[];
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
}

/** Confirmation step for destructive or high-value operations. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  summary = [],
  confirmLabel,
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {summary.length > 0 && (
          <dl className="rounded-xl border border-border bg-muted/60 p-4 text-sm">
            {summary.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 py-1.5 first:pt-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="num text-right font-semibold">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
