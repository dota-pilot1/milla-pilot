import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

// 페이지 셸 세로 여백은 design-system.md 2절 기준 py-8. 화면별로 줄이지 않는다.
const pageShellVariants = cva("mx-auto w-full px-4 py-8 sm:px-6 lg:px-8", {
  variants: {
    width: {
      content: "max-w-4xl",
      default: "max-w-6xl",
      wide: "max-w-7xl",
    },
  },
  defaultVariants: {
    width: "default",
  },
});

export type PageShellProps = ComponentPropsWithoutRef<"main"> &
  VariantProps<typeof pageShellVariants>;

export function PageShell({ className, width, ...props }: PageShellProps) {
  return <main className={cn(pageShellVariants({ width }), className)} {...props} />;
}
