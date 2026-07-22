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
      // 모금 진행률은 화면의 핵심 지표라 굵기 14px + 각진 모서리 4px.
      // 라운드는 px 로 고정한다 — rounded-md 는 --radius(14px) 스케일을 따라가 알약처럼 보인다.
      // 알약형은 0% 근처에서 채움이 동그라미로 뭉쳐 실제보다 많이 찬 것처럼 보인다.
      className={cn(
        "h-3.5 w-full overflow-hidden rounded-[4px]",
        complete || pct >= 100 ? "bg-sky-100 dark:bg-sky-950" : "bg-primary/15",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-[3px] transition-all",
          complete || pct >= 100 ? "bg-sky-500" : "bg-primary",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
