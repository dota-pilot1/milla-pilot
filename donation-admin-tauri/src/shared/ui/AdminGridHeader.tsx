import type { IHeaderParams } from "ag-grid-community";
import { ArrowUpDown, CalendarDays, ChevronLeft, ChevronRight, ChevronUp, ListFilter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { Input } from "./Input";
import { Select } from "./Select";

type AdminGridHeaderProps<TData, TField extends string> = IHeaderParams<TData> & {
  fieldKey: TField;
  filterVariant?: "text" | "date-range" | "number-range";
  filterValue?: string;
  rangeValue?: { start: string; end: string };
  filterPlaceholder?: string;
  popoverAlign?: "left" | "right";
  onFilterChange?: (field: TField, value: string) => void;
  onRangeFilterChange?: (field: TField, value: { start: string; end: string }) => void;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  const date = parseDateInput(value);
  if (!date) return "";
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}.`;
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells: Array<{ value: string; label: number; outside: boolean }> = [];

  for (let i = firstDay.getDay(); i > 0; i -= 1) {
    const date = new Date(year, month, 1 - i);
    cells.push({ value: toDateInput(date), label: date.getDate(), outside: true });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    cells.push({ value: toDateInput(date), label: day, outside: false });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month + 1, nextDay);
    cells.push({ value: toDateInput(date), label: date.getDate(), outside: true });
    nextDay += 1;
  }

  return cells;
}

export function AdminGridHeader<TData, TField extends string>({
  displayName,
  enableSorting,
  column,
  api,
  setSort: applySort,
  fieldKey,
  filterVariant = "text",
  filterValue = "",
  rangeValue = { start: "", end: "" },
  filterPlaceholder = "필터 입력",
  popoverAlign = "left",
  onFilterChange,
  onRangeFilterChange,
}: AdminGridHeaderProps<TData, TField>) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState(column.getSort());
  const [inputValue, setInputValue] = useState(filterValue);
  const [dateRange, setDateRange] = useState(rangeValue);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = parseDateInput(rangeValue.start || rangeValue.end) ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [isComposing, setIsComposing] = useState(false);
  const debouncedInputValue = useDebouncedValue(inputValue, 250);
  const isRangeFilter = filterVariant === "date-range" || filterVariant === "number-range";
  const hasFilter =
    isRangeFilter
      ? Boolean(dateRange.start || dateRange.end)
      : inputValue.trim().length > 0;

  useEffect(() => {
    const syncSort = () => setCurrentSort(column.getSort());
    api.addEventListener("sortChanged", syncSort);
    return () => api.removeEventListener("sortChanged", syncSort);
  }, [api, column]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [open]);

  useEffect(() => {
    setInputValue(filterValue);
  }, [filterValue]);

  useEffect(() => {
    setDateRange(rangeValue);
    const date = parseDateInput(rangeValue.start || rangeValue.end);
    if (date) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [rangeValue.start, rangeValue.end]);

  useEffect(() => {
    if (!onFilterChange || isComposing || debouncedInputValue === filterValue) return;
    onFilterChange(fieldKey, debouncedInputValue);
  }, [debouncedInputValue, fieldKey, filterValue, isComposing, onFilterChange]);

  const updateDateRange = (nextRange: { start: string; end: string }) => {
    setDateRange(nextRange);
    onRangeFilterChange?.(fieldKey, nextRange);
  };

  const clearFilter = () => {
    if (isRangeFilter) {
      const emptyRange = { start: "", end: "" };
      updateDateRange(emptyRange);
      return;
    }

    setInputValue("");
    onFilterChange?.(fieldKey, "");
  };

  const selectRangeDate = (value: string) => {
    setDateRange((current) => {
      let nextRange: { start: string; end: string };

      if (!current.start || current.end) {
        nextRange = { start: value, end: "" };
      } else if (value < current.start) {
        nextRange = { start: value, end: current.start };
      } else {
        nextRange = { ...current, end: value };
      }

      onRangeFilterChange?.(fieldKey, nextRange);
      return nextRange;
    });
  };

  const applyQuickRange = (type: "today" | "week" | "month" | "quarter") => {
    const today = new Date();
    if (type === "today") {
      const value = toDateInput(today);
      setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      updateDateRange({ start: value, end: value });
      return;
    }

    if (type === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      setVisibleMonth(new Date(start.getFullYear(), start.getMonth(), 1));
      updateDateRange({ start: toDateInput(start), end: toDateInput(today) });
      return;
    }

    if (type === "quarter") {
      const start = new Date(today);
      start.setMonth(today.getMonth() - 3);
      setVisibleMonth(new Date(start.getFullYear(), start.getMonth(), 1));
      updateDateRange({ start: toDateInput(start), end: toDateInput(today) });
      return;
    }

    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setVisibleMonth(start);
    updateDateRange({ start: toDateInput(start), end: toDateInput(end) });
  };

  const handleSort = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!enableSorting) return;

    const nextSort = column.getSort() === "asc" ? "desc" : "asc";
    applySort(nextSort, false);
    setCurrentSort(nextSort);
  };

  return (
    <div className="relative flex h-full w-full min-w-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="min-w-0 truncate text-left font-extrabold text-zinc-800">
          {displayName}
        </span>

        {enableSorting ? (
          <button
            type="button"
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-md border border-transparent bg-transparent text-zinc-400 outline-none transition-colors",
              "hover:border-zinc-200 hover:bg-white/80 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-900/15",
              currentSort && "border-zinc-200 bg-white text-zinc-900 shadow-[0_1px_0_rgba(15,23,42,0.03)]",
            )}
            aria-label={`${displayName} 정렬 전환`}
            onClick={handleSort}
          >
            {currentSort ? (
              <ChevronUp
                size={14}
                strokeWidth={2.3}
                className={cn(
                  "transition-transform duration-200 ease-out",
                  currentSort === "desc" && "rotate-180",
                )}
              />
            ) : (
              <ArrowUpDown size={13} strokeWidth={2.1} />
            )}
          </button>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onFilterChange || onRangeFilterChange ? (
          <div ref={popoverRef} className="relative shrink-0">
            <button
              type="button"
              className={cn(
                "grid size-7 place-items-center rounded-lg border border-transparent bg-white/60 text-zinc-400 outline-none transition-colors",
                "hover:border-zinc-200 hover:bg-white hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-900/15",
                hasFilter && "border-emerald-200 bg-emerald-50/80 text-emerald-700 shadow-[0_1px_0_rgba(15,23,42,0.03)]",
              )}
              aria-label={`${displayName} 필터`}
              aria-expanded={open}
              onClick={(event) => {
                event.stopPropagation();
                setOpen((value) => !value);
              }}
            >
              <ListFilter size={14} />
            </button>

            {open ? (
              <div
                className={cn(
                  "absolute top-full z-50 mt-3 rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.16)]",
                  filterVariant === "date-range" ? "w-[340px] p-3" : filterVariant === "number-range" ? "w-[300px] p-3" : "w-64",
                  popoverAlign === "right" ? "right-0" : "left-0",
                )}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <span className="text-[11px] font-extrabold text-zinc-500">
                    {displayName} 필터
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-[11px] font-extrabold transition-colors",
                        hasFilter
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                      )}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        clearFilter();
                      }}
                    >
                      초기화
                    </button>
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                      aria-label="필터 닫기"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpen(false);
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
                {filterVariant === "date-range" ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                        <p className="text-[10px] font-extrabold text-zinc-400">시작</p>
                        <p className="mt-0.5 text-[12px] font-extrabold text-zinc-900">
                          {formatDateLabel(dateRange.start) || "선택"}
                        </p>
                      </div>
                      <span className="text-[12px] font-bold text-zinc-400">~</span>
                      <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                        <p className="text-[10px] font-extrabold text-zinc-400">종료</p>
                        <p className="mt-0.5 text-[12px] font-extrabold text-zinc-900">
                          {formatDateLabel(dateRange.end) || "선택"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        ["today", "오늘"],
                        ["week", "최근 7일"],
                        ["month", "이번 달"],
                        ["quarter", "최근 3개월"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className="h-7 rounded-lg bg-zinc-50 px-2 text-[11px] font-extrabold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                          onClick={() => applyQuickRange(value as "today" | "week" | "month" | "quarter")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
                            aria-label="이전 달"
                            onClick={() =>
                              setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                            }
                          >
                            <ChevronLeft size={16} strokeWidth={2.4} />
                          </button>
                          <button
                            type="button"
                            className="grid size-8 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
                            aria-label="다음 달"
                            onClick={() =>
                              setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                            }
                          >
                            <ChevronRight size={16} strokeWidth={2.4} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-zinc-400" />
                          <Select
                            value={String(visibleMonth.getFullYear())}
                            wrapperClassName="w-[82px]"
                            className="h-8 rounded-lg border-zinc-200 bg-white py-0 pl-2 pr-7 text-[12px] font-extrabold"
                            aria-label="연도 선택"
                            onChange={(event) =>
                              setVisibleMonth((current) => new Date(Number(event.target.value), current.getMonth(), 1))
                            }
                          >
                            {Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - 3 + index).map((year) => (
                              <option key={year} value={year}>
                                {year}년
                              </option>
                            ))}
                          </Select>
                          <Select
                            value={String(visibleMonth.getMonth())}
                            wrapperClassName="w-[66px]"
                            className="h-8 rounded-lg border-zinc-200 bg-white py-0 pl-2 pr-7 text-[12px] font-extrabold"
                            aria-label="월 선택"
                            onChange={(event) =>
                              setVisibleMonth((current) => new Date(current.getFullYear(), Number(event.target.value), 1))
                            }
                          >
                            {Array.from({ length: 12 }, (_, month) => (
                              <option key={month} value={month}>
                                {month + 1}월
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-0.5 text-center">
                        {weekdays.map((weekday) => (
                          <span key={weekday} className="py-1.5 text-[10px] font-extrabold text-zinc-400">
                            {weekday}
                          </span>
                        ))}
                        {getCalendarDays(visibleMonth).map((day) => {
                          const selected = day.value === dateRange.start || day.value === dateRange.end;
                          const today = day.value === toDateInput(new Date());
                          const inRange =
                            dateRange.start &&
                            dateRange.end &&
                            day.value > dateRange.start &&
                            day.value < dateRange.end;

                          return (
                            <button
                              key={day.value}
                              type="button"
                              className={cn(
                                "grid h-8 place-items-center rounded-lg border border-transparent bg-transparent text-[12px] font-extrabold transition-colors",
                                day.outside ? "text-zinc-300" : "text-zinc-700",
                                today && !selected && !inRange && "border-zinc-300 text-zinc-950",
                                inRange && "border-emerald-50 bg-emerald-50 text-emerald-700",
                                selected && "border-emerald-600 bg-emerald-600 text-white shadow-sm",
                                !selected && !inRange && "hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950",
                              )}
                              onClick={() => selectRangeDate(day.value)}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : filterVariant === "number-range" ? (
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <label className="block rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                      <span className="text-[10px] font-extrabold text-zinc-400">최소</span>
                      <div className="mt-1 flex items-center gap-1">
                        <Input
                          autoFocus
                          inputMode="numeric"
                          value={dateRange.start}
                          placeholder="0"
                          className="h-7 border-0 bg-transparent p-0 text-[13px] font-extrabold shadow-none focus:ring-0"
                          onChange={(event) =>
                            updateDateRange({
                              ...dateRange,
                              start: event.target.value.replace(/[^\d]/g, ""),
                            })
                          }
                        />
                        <span className="text-[11px] font-bold text-zinc-400">원</span>
                      </div>
                    </label>
                    <span className="text-[12px] font-bold text-zinc-400">~</span>
                    <label className="block rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                      <span className="text-[10px] font-extrabold text-zinc-400">최대</span>
                      <div className="mt-1 flex items-center gap-1">
                        <Input
                          inputMode="numeric"
                          value={dateRange.end}
                          placeholder="제한 없음"
                          className="h-7 border-0 bg-transparent p-0 text-[13px] font-extrabold shadow-none focus:ring-0"
                          onChange={(event) =>
                            updateDateRange({
                              ...dateRange,
                              end: event.target.value.replace(/[^\d]/g, ""),
                            })
                          }
                        />
                        <span className="text-[11px] font-bold text-zinc-400">원</span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <Input
                    autoFocus
                    value={inputValue}
                    placeholder={filterPlaceholder}
                    className="h-9 rounded-lg border-zinc-200 bg-zinc-50/80 px-2.5 text-[13px] font-semibold shadow-none focus:bg-white"
                    onChange={(event) => setInputValue(event.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={(event) => {
                      setIsComposing(false);
                      setInputValue(event.currentTarget.value);
                    }}
                  />
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
