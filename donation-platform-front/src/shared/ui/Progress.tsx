import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0~100 */
  value?: number;
  /** 목표 달성(100%) 시 색을 다르게 */
  complete?: boolean;
}

export function Progress({ value = 0, complete, className, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          complete || pct >= 100 ? "bg-sky-500" : "bg-primary",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
