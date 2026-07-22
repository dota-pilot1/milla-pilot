"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
          invalid
            ? "border-destructive/60 focus:ring-destructive/40"
            : "border-input focus:ring-ring",
          className,
        )}
        {...rest}
      />
    );
  },
);
