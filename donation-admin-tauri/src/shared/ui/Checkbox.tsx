import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled, ...props }, ref) => (
    <span
      className={cn(
        "relative inline-flex h-5 w-5 shrink-0 align-middle",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-[5px] disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none flex h-5 w-5 items-center justify-center rounded-[5px] border-2 border-zinc-500 bg-white text-white shadow-sm transition-colors",
          "peer-checked:border-emerald-600 peer-checked:bg-emerald-600",
          "peer-indeterminate:border-emerald-600 peer-indeterminate:bg-emerald-600",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/25 peer-focus-visible:ring-offset-2",
          "after:hidden after:h-2.5 after:w-1.5 after:-translate-y-px after:rotate-45 after:border-b-2 after:border-r-2 after:border-white peer-checked:after:block peer-indeterminate:after:hidden",
          "before:hidden before:h-0.5 before:w-2.5 before:rounded-full before:bg-white peer-indeterminate:before:block",
        )}
      />
    </span>
  ),
);

Checkbox.displayName = "Checkbox";
