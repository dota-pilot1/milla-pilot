import { cn } from "../lib/cn";

export type CompareColumn = {
  label: string;
  hint?: string;
};

export type CompareRow = {
  label: string;
  values: string[];
  /** 해당 열이 유리한 경우 강조 (0-based) */
  favors?: number;
};

type CompareTableProps = {
  columns: readonly CompareColumn[];
  rows: readonly CompareRow[];
  className?: string;
};

/** 두 개 이상의 안을 항목별로 비교하는 표. 화면에서 raw table을 만들지 않도록 여기로 모은다. */
export function CompareTable({ columns, rows, className }: CompareTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-200">
            <th scope="col" className="w-36 py-2.5 pr-4 text-[11px] font-semibold text-zinc-500">
              항목
            </th>
            {columns.map((column) => (
              <th key={column.label} scope="col" className="py-2.5 pr-4 align-bottom">
                <span className="block text-[13px] font-extrabold text-zinc-900">{column.label}</span>
                {column.hint && (
                  <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">
                    {column.hint}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-zinc-100 last:border-0">
              <th scope="row" className="py-2.5 pr-4 align-top text-[11px] font-semibold text-zinc-500">
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td
                  key={`${row.label}-${index}`}
                  className={cn(
                    "py-2.5 pr-4 align-top text-[12px] leading-5",
                    row.favors === index ? "font-bold text-zinc-900" : "text-zinc-600",
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
