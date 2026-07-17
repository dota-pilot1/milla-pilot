import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, hint, error, className, children }: FormFieldProps) {
  return (
    <label className={cn("grid gap-2 text-[13px]", className)} htmlFor={htmlFor}>
      <span className="text-[11px] font-bold text-zinc-500">{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] font-semibold text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-zinc-400">{hint}</span>
      ) : null}
    </label>
  );
}
