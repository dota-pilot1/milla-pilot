import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center", className)}>
      <strong className="block text-[13px] font-extrabold text-zinc-800">{title}</strong>
      {description && <p className="mx-auto mt-1 max-w-md text-[12px] text-zinc-500">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
