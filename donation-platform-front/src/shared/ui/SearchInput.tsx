"use client";

import { forwardRef } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TextInput } from "./TextInput";

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
  invalid?: boolean;
  onClear?: () => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { className, wrapperClassName, invalid, onClear, type = "search", value, ...props },
    ref,
  ) {
    const hasValue = typeof value === "string" && value.length > 0;

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        <span className="pointer-events-none absolute left-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg bg-primary/10 text-primary">
          <Search className="size-4" strokeWidth={2.2} />
        </span>
        <TextInput
          ref={ref}
          type={type}
          value={value}
          invalid={invalid}
          className={cn(
            "h-10 rounded-xl bg-background pl-11 pr-20 text-sm font-semibold shadow-sm placeholder:font-medium [&::-webkit-search-cancel-button]:appearance-none",
            className,
          )}
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none absolute right-2 top-1/2 inline-flex h-6 -translate-y-1/2 items-center gap-1 rounded-md border bg-background px-1.5 text-[10px] font-bold text-muted-foreground/80 shadow-sm",
            hasValue && onClear && "right-9",
          )}
          aria-hidden="true"
        >
          <CornerDownLeft className="size-3" strokeWidth={2.2} />
          Enter
        </span>
        {hasValue && onClear ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="검색어 지우기"
            onClick={onClear}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  },
);
