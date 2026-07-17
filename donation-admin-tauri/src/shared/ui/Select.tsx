import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export function Select({ className, wrapperClassName, disabled, ...props }: SelectProps) {
  return (
    <span className={cn("relative block w-full", wrapperClassName)}>
      <select
        disabled={disabled}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-white px-3 pr-10 text-sm text-zinc-900 shadow-none",
          "focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
          "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400",
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500",
          disabled && "text-zinc-400",
        )}
      />
    </span>
  );
}
