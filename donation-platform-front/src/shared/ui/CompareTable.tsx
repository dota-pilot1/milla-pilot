import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface CompareRow {
  label: string;
  values: string[];
  /** 해당 열이 유리한 경우 강조 (0-based). 없으면 강조 안 함. */
  favors?: number;
}

export interface CompareColumn {
  label: string;
  hint?: string;
}

export interface CompareTableProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: string;
  columns: readonly CompareColumn[];
  rows: readonly CompareRow[];
}

/**
 * 두 개 이상의 안을 항목별로 비교하는 표.
 * 페이지에서 raw <table>을 직접 만들지 않도록 여기로 모은다.
 */
export function CompareTable({
  caption,
  columns,
  rows,
  className,
  ...props
}: CompareTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)} {...props}>
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="w-40 py-2.5 pr-4 text-xs font-medium text-muted-foreground">
              항목
            </th>
            {columns.map((column) => (
              <th key={column.label} scope="col" className="py-2.5 pr-4 align-bottom">
                <span className="block text-sm font-semibold text-foreground">{column.label}</span>
                {column.hint ? (
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {column.hint}
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/60 last:border-0">
              <th
                scope="row"
                className="py-3 pr-4 align-top text-xs font-medium text-muted-foreground"
              >
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td
                  key={`${row.label}-${index}`}
                  className={cn(
                    "py-3 pr-4 align-top text-sm leading-6",
                    row.favors === index ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
