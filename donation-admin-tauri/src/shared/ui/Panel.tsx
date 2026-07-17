import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

type PanelHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <section className={cn("rounded-2xl border border-zinc-200 bg-white p-6", className)}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, action, className }: PanelHeaderProps) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-extrabold text-zinc-900">{title}</h2>
        {description && <p className="mt-1 text-[12px] text-zinc-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
