import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const statusBadgeVariants = cva(
  "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-[11px] font-extrabold leading-none",
  {
    variants: {
      tone: {
        neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        info: "border-sky-200 bg-sky-50 text-sky-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        danger: "border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return <span className={cn(statusBadgeVariants({ tone }), className)}>{children}</span>;
}
