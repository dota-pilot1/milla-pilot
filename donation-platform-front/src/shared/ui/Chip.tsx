import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      data-active={active}
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        "data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}
