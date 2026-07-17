import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type FormSectionProps = {
  children: ReactNode;
  className?: string;
};

export function FormSection({ children, className }: FormSectionProps) {
  return (
    <div className={cn("mb-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5", className)}>
      {children}
    </div>
  );
}
