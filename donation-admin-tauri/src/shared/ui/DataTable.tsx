import { ArrowUpDown, ChevronUp } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "../lib/cn";

type DataTableProps = TableHTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
  wrapperClassName?: string;
};

export function DataTable({ children, className, wrapperClassName, ...props }: DataTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-zinc-200", wrapperClassName)}>
      <table className={cn("w-full border-collapse text-[13px]", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100/70 text-[11px] uppercase text-zinc-500",
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

type DataTableRowProps = HTMLAttributes<HTMLTableRowElement> & { selected?: boolean };
type DataTableCellAlign = "left" | "center" | "right";

const dataTableCellAlignClass: Record<DataTableCellAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTableRow({ children, className, selected, ...props }: DataTableRowProps) {
  return (
    <tr
      data-selected={selected}
      className={cn(
        "border-t border-zinc-200 transition-colors data-[selected=true]:bg-zinc-50",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

type DataTableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  align?: DataTableCellAlign;
};

export function DataTableHeaderCell({
  children,
  className,
  align = "left",
  ...props
}: DataTableHeaderCellProps) {
  return (
    <th
      className={cn(
        "border-r border-zinc-200 px-4 py-2.5 font-extrabold last:border-r-0",
        dataTableCellAlignClass[align],
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

type DataTableSortDirection = "asc" | "desc";

type DataTableSortableHeaderCellProps = Omit<DataTableHeaderCellProps, "children"> & {
  children: ReactNode;
  direction?: DataTableSortDirection | null;
  onSort: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export function DataTableSortableHeaderCell({
  children,
  direction = null,
  onSort,
  className,
  ...props
}: DataTableSortableHeaderCellProps) {
  return (
    <DataTableHeaderCell
      className={className}
      aria-sort={direction === null ? "none" : direction === "asc" ? "ascending" : "descending"}
      {...props}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md py-0.5 text-left transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
        onClick={onSort}
      >
        <span>{children}</span>
        {direction ? (
          <ChevronUp
            size={13}
            className={cn("text-zinc-700 transition-transform", direction === "desc" && "rotate-180")}
          />
        ) : (
          <ArrowUpDown size={13} className="text-zinc-400" />
        )}
      </button>
    </DataTableHeaderCell>
  );
}

type DataTableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: DataTableCellAlign;
};

export function DataTableCell({ children, className, align = "left", ...props }: DataTableCellProps) {
  return (
    <td
      className={cn(
        "border-r border-zinc-200 px-4 py-3 text-zinc-600 last:border-r-0",
        dataTableCellAlignClass[align],
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
