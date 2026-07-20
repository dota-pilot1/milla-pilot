import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
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
  const listRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState({ left: 0, width: 0, ready: false });

  const syncThumb = () => {
    const current = items.findIndex((item) => item.value === value);
    const activeButton = refs.current[current];
    const list = listRef.current;
    if (!activeButton || !list) return;
    setThumb({ left: activeButton.offsetLeft, width: activeButton.offsetWidth, ready: true });
  };

  useLayoutEffect(() => {
    syncThumb();
  }, [items, value]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const onResize = () => syncThumb();
    window.addEventListener("resize", onResize);

    const observer = new ResizeObserver(onResize);
    observer.observe(list);
    refs.current.forEach((button) => {
      if (button) observer.observe(button);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [items, value]);

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
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "relative inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-sm",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-1 top-1 rounded-lg border border-emerald-200 bg-emerald-50 shadow-sm transition-all duration-250 ease-out",
          thumb.ready ? "opacity-100" : "opacity-0",
        )}
        style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width }}
      />
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
              "relative z-10 inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-[13px] font-semibold transition-colors",
              active
                ? "border-transparent bg-transparent text-emerald-800"
                : "border-transparent bg-transparent text-zinc-500 hover:text-zinc-800",
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
