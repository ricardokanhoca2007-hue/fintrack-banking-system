import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { exportTransactions, type ExportFormat } from "@/lib/export";
import type { Account, Transaction } from "@/types";

interface ExportMenuProps {
  transactions: Transaction[];
  accounts: Account[];
}

const OPTIONS: { format: ExportFormat; label: string; icon: typeof FileText }[] = [
  { format: "csv", label: "CSV (.csv)", icon: Table2 },
  { format: "xlsx", label: "Excel (.xls)", icon: FileSpreadsheet },
  { format: "pdf", label: "PDF (.pdf)", icon: FileText },
];

/** Exports the currently filtered ledger to CSV, Excel or PDF. */
export function ExportMenu({ transactions, accounts }: ExportMenuProps) {
  const { isPending, run } = useAsyncAction();
  const [open, setOpen] = useState(false);
  const disabled = transactions.length === 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="size-4" aria-hidden="true" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">
          {transactions.length} movimentos
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.format}
            onSelect={() =>
              void run(() => exportTransactions(option.format, transactions, accounts), {
                successTitle: "Exportação concluída",
                successDescription: `Ficheiro ${option.format.toUpperCase()} gerado com ${transactions.length} movimentos.`,
                errorMessage: "Não foi possível gerar o ficheiro.",
              })
            }
          >
            <option.icon className="size-4" aria-hidden="true" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
