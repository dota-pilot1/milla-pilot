import { useRef, type KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

export type TabItem<T extends string = string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type TabsProps<T extends string = string> = {
  items: readonly TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string = string>({
  items,
  value,
  onValueChange,
  className,
}: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const current = items.findIndex((item) => item.value === value);
    const next = (current + step + items.length) % items.length;
    onValueChange(items[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-sm",
        className,
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const active = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold transition-colors",
              active
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm"
                : "border-transparent bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800",
            )}
          >
            {Icon && <Icon size={15} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
