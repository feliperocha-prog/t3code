import { CheckIcon, ClipboardCopyIcon } from "lucide-react";

import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { t } from "~/i18n";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toastManager } from "../ui/toast";
import { type QueryResultTable, queryResultToTsv } from "./queryResultTable";

// Rendering is the cost here, not parsing; the copy button still takes every row.
const MAX_RENDERED_ROWS = 200;
const NUMBER = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i;

/** A BigQuery result from a tool call, read-only, with a copy that pastes into Sheets. */
export function QueryResultTableView({ table }: { table: QueryResultTable }) {
  const { copyToClipboard, isCopied } = useCopyToClipboard({
    target: "query result",
    onError: () => toastManager.add({ type: "error", title: t("Could not copy the table") }),
  });
  const numericColumns = table.columns.map((_, index) => {
    const values = table.rows.map((row) => row[index] ?? "").filter((value) => value !== "");
    return values.length > 0 && values.every((value) => NUMBER.test(value));
  });
  const shownRows = table.rows.slice(0, MAX_RENDERED_ROWS);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {t("{rows} rows · {columns} columns", {
            rows: table.rows.length,
            columns: table.columns.length,
          })}
        </span>
        {table.footer ? <span className="truncate">{table.footer}</span> : null}
        <div className="ms-auto">
          <Button
            type="button"
            size="xs"
            variant="ghost-muted"
            onClick={() => copyToClipboard(queryResultToTsv(table), undefined)}
          >
            {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
            {isCopied ? t("Copied") : t("Copy for spreadsheet")}
          </Button>
        </div>
      </div>
      <div className="max-h-80 overflow-auto rounded-md border border-border bg-background tabular-nums">
        <Table>
          <TableHeader>
            <TableRow>
              {table.columns.map((column, index) => (
                <TableHead key={column} className={cn(numericColumns[index] && "text-right")}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shownRows.map((row, rowIndex) => (
              // Rows have no identity of their own; the result never reorders.
              // oxlint-disable-next-line react/no-array-index-key
              <TableRow key={rowIndex}>
                {row.map((cell, index) => (
                  <TableCell
                    key={table.columns[index]}
                    className={cn(numericColumns[index] && "text-right")}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {table.rows.length > shownRows.length ? (
        <p className="text-xs text-muted-foreground">
          {t("Showing the first {shown} rows. Copy takes all {total}.", {
            shown: shownRows.length,
            total: table.rows.length,
          })}
        </p>
      ) : null}
      {table.sql ? (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">{t("SQL")}</summary>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap font-mono select-text">
            {table.sql}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
