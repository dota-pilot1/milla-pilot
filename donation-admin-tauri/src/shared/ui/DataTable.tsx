import type { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type DataTableProps = TableHTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
  wrapperClassName?: string;
};

export function DataTable({ children, className, wrapperClassName, ...props }: DataTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-zinc-200", wrapperClassName)}>
      <table className={cn("w-full text-[13px]", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-zinc-50 text-[11px] uppercase text-zinc-500", className)} {...props}>
      {children}
    </thead>
  );
}

type DataTableRowProps = HTMLAttributes<HTMLTableRowElement> & { selected?: boolean };

export function DataTableRow({ children, className, selected, ...props }: DataTableRowProps) {
  return (
    <tr
      data-selected={selected}
      className={cn(
        "border-t border-zinc-100 transition-colors data-[selected=true]:bg-zinc-50",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function DataTableHeaderCell({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-2.5 text-left", className)} {...props}>
      {children}
    </th>
  );
}

export function DataTableCell({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-zinc-600", className)} {...props}>
      {children}
    </td>
  );
}
