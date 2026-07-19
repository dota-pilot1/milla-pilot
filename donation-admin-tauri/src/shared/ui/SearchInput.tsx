import { CornerDownLeft, Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  onClear?: () => void;
};

export function SearchInput({ className, value, onClear, ...props }: SearchInputProps) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <span className="pointer-events-none absolute left-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg bg-zinc-100 text-zinc-500">
        <Search size={15} strokeWidth={2.2} />
      </span>
      <input
        type="search"
        value={value}
        className={cn(
          "h-10 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-20 text-[13px] font-semibold text-zinc-900 shadow-sm outline-none transition-colors",
          "placeholder:font-medium placeholder:text-zinc-400 hover:border-zinc-300 hover:bg-white",
          "focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10",
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 inline-flex h-6 -translate-y-1/2 items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 text-[10px] font-extrabold text-zinc-400",
          hasValue && onClear && "right-9",
        )}
        aria-hidden="true"
      >
        <CornerDownLeft size={11} strokeWidth={2.2} />
        Enter
      </span>
      {hasValue && onClear ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
          aria-label="검색어 지우기"
          onClick={onClear}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
