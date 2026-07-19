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
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

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
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn("flex items-center gap-1 border-b border-border", className)}
      {...props}
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
            id={`${idPrefix}-tab-${item.value}`}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            data-active={active}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              "border-transparent text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "data-[active=true]:border-primary data-[active=true]:text-foreground",
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
