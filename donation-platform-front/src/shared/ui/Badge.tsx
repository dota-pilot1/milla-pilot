import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

// 상태 구분색은 이 파일이 단일 출처. (design-system.md 6절)
// 페이지·피처에서는 palette 직접 사용 금지 — 반드시 이 Badge variant를 쓴다.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-none",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground",
        // 도메인 상태색
        recruiting:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        buying:
          "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
        shipping:
          "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        verified: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
        locked: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
