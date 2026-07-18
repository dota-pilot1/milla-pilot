import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { Button } from "./Button";

type DrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  onOpenChange: (open: boolean) => void;
};

const DRAWER_ANIMATION_MS = 220;
const DRAWER_OPEN_DELAY_MS = 20;

export function Drawer({ open, title, description, children, footer, className, onOpenChange }: DrawerProps) {
  const [present, setPresent] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      const timer = window.setTimeout(() => setVisible(true), DRAWER_OPEN_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setPresent(false), DRAWER_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  if (!present || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-zinc-950/30 transition-opacity duration-200 ease-out motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="드로워 닫기"
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={cn(
          "relative z-10 grid h-full w-[520px] max-w-[calc(100vw-32px)] grid-rows-[auto_minmax(0,1fr)_auto] border-l border-zinc-200 bg-white shadow-2xl",
          "transition-transform duration-200 ease-out motion-reduce:transition-none",
          visible ? "translate-x-0" : "translate-x-full",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5">
          <div className="min-w-0">
            <h2 id="drawer-title" className="text-[17px] font-extrabold text-zinc-950">
              {title}
            </h2>
            {description && <p className="mt-1 text-[12px] leading-5 text-zinc-500">{description}</p>}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="닫기" onClick={() => onOpenChange(false)}>
            <X size={16} />
          </Button>
        </header>
        <div className="min-h-0 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}
