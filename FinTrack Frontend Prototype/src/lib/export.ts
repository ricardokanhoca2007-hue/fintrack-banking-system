import { TRANSACTION_TYPE_LABELS, getCategory } from "@/lib/constants";
import { formatDateTime } from "@/lib/formatters";
import { signedAmount } from "@/lib/finance";
import type { Account, Transaction } from "@/types";

/**
 * Client-side export of the transaction ledger.
 *
 * Prototype-only: the real backend will stream these files, but the column
 * contract below is what the report endpoint should return.
 */

export type ExportFormat = "csv" | "xlsx" | "pdf";

const COLUMNS = ["Data", "Descrição", "Categoria", "Conta", "Tipo", "Moeda", "Valor"] as const;

interface Row {
  cells: string[];
}

function buildRows(transactions: Transaction[], accounts: Account[]): Row[] {
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  return transactions.map((transaction) => ({
    cells: [
      formatDateTime(transaction.date),
      transaction.description,
      `${getCategory(transaction.categoryId).emoji} ${getCategory(transaction.categoryId).label}`,
      accountName(transaction.accountId),
      TRANSACTION_TYPE_LABELS[transaction.type],
      transaction.currency,
      signedAmount(transaction).toFixed(2).replace(".", ","),
    ],
  }));
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function exportCsv(rows: Row[], filename: string) {
  const lines = [COLUMNS.map(escapeCsv).join(";")];
  for (const row of rows) lines.push(row.cells.map(escapeCsv).join(";"));
  // BOM keeps accented characters readable in Excel.
  download(new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" }), filename);
}

/** SpreadsheetML table — opens natively in Excel, Numbers and LibreOffice. */
function exportExcel(rows: Row[], filename: string) {
  const head = COLUMNS.map((column) => `<th>${column}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  download(new Blob([`\uFEFF${html}`], { type: "application/vnd.ms-excel" }), filename);
}

async function exportPdf(rows: Row[], filename: string, subtitle: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 56;

  doc.setFontSize(18);
  doc.text("FinTrack — Histórico de transações", marginX, y);
  y += 18;
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(subtitle, marginX, y);
  doc.setTextColor(20);
  y += 24;

  const widths = [96, 150, 96, 82, 74, 58];
  const header = ["Data", "Descrição", "Categoria", "Conta", "Tipo", "Valor"];

  const writeHeader = () => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    let x = marginX;
    header.forEach((label, index) => {
      doc.text(label, x, y);
      x += widths[index]!;
    });
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.setDrawColor(210);
    doc.line(marginX, y, 555, y);
    y += 12;
  };

  writeHeader();

  for (const row of rows) {
    if (y > 780) {
      doc.addPage();
      y = 56;
      writeHeader();
    }
    // Drop the currency column: the amount cell already carries the sign.
    const cells = [
      row.cells[0]!,
      row.cells[1]!,
      row.cells[2]!,
      row.cells[3]!,
      row.cells[4]!,
      `${row.cells[5]} ${row.cells[6]}`,
    ];
    let x = marginX;
    cells.forEach((cell, index) => {
      const width = widths[index]!;
      doc.text(doc.splitTextToSize(cell, width - 8)[0] ?? "", x, y);
      x += width;
    });
    y += 16;
  }

  doc.save(filename);
}

export async function exportTransactions(
  format: ExportFormat,
  transactions: Transaction[],
  accounts: Account[],
): Promise<void> {
  const rows = buildRows(transactions, accounts);
  const stamp = new Date().toISOString().slice(0, 10);
  const subtitle = `${transactions.length} movimentos · exportado a ${stamp}`;

  if (format === "csv") return exportCsv(rows, `fintrack-transacoes-${stamp}.csv`);
  if (format === "xlsx") return exportExcel(rows, `fintrack-transacoes-${stamp}.xls`);
  return exportPdf(rows, `fintrack-transacoes-${stamp}.pdf`, subtitle);
}
