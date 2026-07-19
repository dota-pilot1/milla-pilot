import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

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
