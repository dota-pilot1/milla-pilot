import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../lib/cn";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function parse(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Coords = { left: number; width: number; top?: number; bottom?: number };

/** 공통 날짜 선택기 — value/onChange 는 "YYYY-MM-DD" 문자열. 팝오버는 portal + fixed 로 드로워 밖에 뜬다. */
export function DatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const selected = parse(value);
  const [view, setView] = useState<Date>(() => selected ?? new Date());

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(r.width, 256);
    let left = r.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - 8 - width;
    if (left < 8) left = 8;
    const dropUp = window.innerHeight - r.bottom < 340;
    setCoords(
      dropUp
        ? { left, width, bottom: window.innerHeight - r.top + 4 }
        : { left, width, top: r.bottom + 4 },
    );
  }, []);

  const openPicker = () => {
    if (disabled) return;
    if (selected) setView(selected);
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    place();
    const onScroll = () => place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, place]);

  const cells = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const startPad = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startPad; i += 1) arr.push(null);
    for (let d = 1; d <= days; d += 1) arr.push(new Date(year, month, d));
    return arr;
  }, [view]);

  const label = selected
    ? `${selected.getFullYear()}. ${pad(selected.getMonth() + 1)}. ${pad(selected.getDate())}.`
    : placeholder;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={openPicker}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-left text-sm",
          "focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
          "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400",
          selected ? "text-zinc-900" : "text-zinc-400",
        )}
      >
        <Calendar size={16} className="shrink-0 text-zinc-400" />
        <span className="flex-1 truncate">{label}</span>
        {selected && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="날짜 지우기"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="rounded p-0.5 text-zinc-400 hover:text-red-600"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popRef}
            style={{
              position: "fixed",
              left: coords.left,
              top: coords.top,
              bottom: coords.bottom,
              width: coords.width,
            }}
            className="z-[60] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="이전 달"
                className="rounded-md p-1 text-zinc-600 hover:bg-zinc-100"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-zinc-800">
                {view.getFullYear()}년 {view.getMonth() + 1}월
              </span>
              <button
                type="button"
                aria-label="다음 달"
                className="rounded-md p-1 text-zinc-600 hover:bg-zinc-100"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-zinc-400">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(toStr(d));
                      setOpen(false);
                    }}
                    className={cn(
                      "h-8 rounded-md text-[13px] text-zinc-700 hover:bg-zinc-100",
                      selected && sameDay(d, selected) && "bg-zinc-900 font-semibold text-white hover:bg-zinc-900",
                    )}
                  >
                    {d.getDate()}
                  </button>
                ) : (
                  <div key={i} />
                ),
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
