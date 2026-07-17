import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "min-h-20 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-none",
        "placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
        "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400",
        className,
      )}
      {...props}
    />
  );
}
