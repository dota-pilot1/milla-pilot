import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ItemStatus } from "@/entities/donation-item/model/types";

// 이행 흐름 단계 = 후원자 화면 타임라인 (기획 §8)
const STAGES: { status: ItemStatus; label: string }[] = [
  { status: "RECRUITING", label: "모집중" },
  { status: "LOCKED", label: "목표달성" },
  { status: "BUYING", label: "통합구매" },
  { status: "SHIPPING", label: "배송중" },
  { status: "RECEIVED", label: "수령확인" },
  { status: "RECEIPTED", label: "영수증" },
];

export function StatusTimeline({
  status,
  className,
  compact = false,
}: {
  status: ItemStatus;
  className?: string;
  compact?: boolean;
}) {
  const current = Math.max(
    0,
    STAGES.findIndex((s) => s.status === status),
  );

  return (
    <ol className={cn("flex items-start", className)}>
      {STAGES.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        const reached = done || active;
        return (
          <li
            key={stage.status}
            className={cn("flex flex-1 flex-col items-center", compact ? "gap-1" : "gap-1.5")}
          >
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-0.5 flex-1",
                  i === 0 ? "opacity-0" : reached ? "bg-primary" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full border font-bold transition-colors",
                  compact ? "size-5 text-[9px]" : "size-6 text-[10px]",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-background text-primary"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className={compact ? "size-3" : "size-3.5"} /> : i + 1}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1",
                  i === STAGES.length - 1 ? "opacity-0" : done ? "bg-primary" : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "text-center leading-tight",
                compact ? "text-[10px]" : "text-[11px]",
                active
                  ? "font-semibold text-foreground"
                  : done
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60",
              )}
            >
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
