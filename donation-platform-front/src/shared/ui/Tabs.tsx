"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface TabsProps<T extends string = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: readonly TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** tabpanel과 id를 연결하는 접두사. 한 페이지에 Tabs가 둘 이상이면 서로 다르게 준다. */
  idPrefix?: string;
}

export function Tabs<T extends string = string>({
  items,
  value,
  onValueChange,
  idPrefix = "tabs",
  className,
  ...props
}: TabsProps<T>) {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = React.useState({ left: 0, width: 0, ready: false });

  // active 인디케이터가 위치·너비를 부드럽게 옮기도록 활성 탭의 실측값을 따라간다. (design-system.md §5)
  const syncThumb = React.useCallback(() => {
    const active = refs.current[items.findIndex((item) => item.value === value)];
    if (!active || !listRef.current) return;
    setThumb({ left: active.offsetLeft, width: active.offsetWidth, ready: true });
  }, [items, value]);

  React.useLayoutEffect(syncThumb, [syncThumb]);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    window.addEventListener("resize", syncThumb);
    const observer = new ResizeObserver(syncThumb);
    observer.observe(list);
    refs.current.forEach((button) => button && observer.observe(button));

    return () => {
      window.removeEventListener("resize", syncThumb);
      observer.disconnect();
    };
  }, [syncThumb]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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
        "relative inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-sm",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-1 top-1 rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-all duration-200 ease-out motion-reduce:transition-none",
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
            id={`${idPrefix}-tab-${item.value}`}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            data-active={active}
            className={cn(
              "relative z-10 inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors",
              "text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "data-[active=true]:text-primary data-[active=true]:font-semibold",
            )}
          >
            {Icon ? <Icon className="size-4" /> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  idPrefix?: string;
}

export function TabPanel({ value, idPrefix = "tabs", className, ...props }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      tabIndex={0}
      className={cn("focus-visible:outline-none", className)}
      {...props}
    />
  );
}
