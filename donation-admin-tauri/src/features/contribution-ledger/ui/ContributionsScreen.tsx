import { useEffect, useMemo, useRef, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { Download, X } from "lucide-react";
import { Panel } from "../../../shared/ui/Panel";
import { Button } from "../../../shared/ui/Button";
import { AdminDataGrid } from "../../../shared/ui/AdminDataGrid";
import { AdminGridHeader } from "../../../shared/ui/AdminGridHeader";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { SearchInput } from "../../../shared/ui/SearchInput";
import { Select } from "../../../shared/ui/Select";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue";
import { fetchAllContributions } from "../../../entities/contribution/api/contributionApi";
import type { AdminLedgerRow } from "../../../entities/contribution/model/types";

const won = (n: number) => n.toLocaleString("ko-KR") + "원";
const dateFmt = (iso: string) => new Date(iso).toLocaleString("ko-KR");
const searchFieldLabel: Record<SearchField, string> = {
  all: "전체",
  donor: "후원자",
  email: "이메일",
  facility: "시설",
  item: "물품",
};

type LedgerGridRow = {
  id: number;
  donorName: string;
  donorEmail: string;
  facilityName: string;
  itemName: string;
  itemLabel: string;
  amount: number;
  createdAt: string;
};

type SearchField = "all" | "donor" | "email" | "facility" | "item";
type LedgerTextFilterKey = "donorName" | "facilityName" | "itemLabel";
type LedgerRangeFilterKey = "amount" | "createdAt";
type LedgerFilterKey = LedgerTextFilterKey | LedgerRangeFilterKey;
type LedgerFilters = Partial<Record<LedgerTextFilterKey, string>>;
type RangeFilter = { start: string; end: string };

function toLedgerGridRow(row: AdminLedgerRow): LedgerGridRow {
  return {
    id: row.id,
    donorName: row.donor.username,
    donorEmail: row.donor.email,
    facilityName: row.facility.name,
    itemName: row.item.name,
    itemLabel: `${row.item.emoji ? `${row.item.emoji} ` : ""}${row.item.name}`,
    amount: row.amount,
    createdAt: row.createdAt,
  };
}

function includes(value: string | number, query?: string) {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) return true;
  return String(value).toLowerCase().includes(normalized);
}

function isWithinDateRange(iso: string, range: RangeFilter) {
  if (!range.start && !range.end) return true;

  const time = new Date(iso).getTime();
  const start = range.start ? new Date(`${range.start}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
  const end = range.end ? new Date(`${range.end}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;

  return time >= start && time <= end;
}

function isWithinAmountRange(amount: number, range: RangeFilter) {
  if (!range.start && !range.end) return true;

  const min = range.start ? Number(range.start) : Number.NEGATIVE_INFINITY;
  const max = range.end ? Number(range.end) : Number.POSITIVE_INFINITY;

  return amount >= min && amount <= max;
}

function dateLabel(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export function ContributionsScreen({ token, refreshKey = 0 }: { token: string; refreshKey?: number }) {
  const gridRef = useRef<AgGridReact<LedgerGridRow>>(null);
  const [rows, setRows] = useState<AdminLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [query, setQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<LedgerFilters>({});
  const [amountRangeFilter, setAmountRangeFilter] = useState<RangeFilter>({ start: "", end: "" });
  const [dateRangeFilter, setDateRangeFilter] = useState<RangeFilter>({ start: "", end: "" });
  const debouncedQuery = useDebouncedValue(query, 250);

  const load = () => {
    setLoading(true);
    fetchAllContributions(token)
      .then((data) => {
        setRows(data);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "후원 내역을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (refreshKey === 0) return;

    setQuery("");
    setSearchField("all");
    setColumnFilters({});
    setAmountRangeFilter({ start: "", end: "" });
    setDateRangeFilter({ start: "", end: "" });
    gridRef.current?.api.applyColumnState({
      defaultState: { sort: null },
      state: [{ colId: "createdAt", sort: "desc" }],
    });
    load();
  }, [refreshKey]);

  const setColumnFilter = (field: LedgerTextFilterKey, value: string) => {
    setColumnFilters((current) => {
      const next = { ...current };
      if (value.trim()) {
        next[field] = value;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const setRangeFilter = (field: LedgerFilterKey, value: RangeFilter) => {
    if (field === "amount") {
      setAmountRangeFilter(value);
      return;
    }

    if (field === "createdAt") {
      setDateRangeFilter(value);
    }
  };

  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const searchedGridRows = useMemo(() => {
    const searchedRows = normalizedQuery
      ? rows.filter((row) => {
          const targetByField: Record<SearchField, string[]> = {
            all: [row.donor.username, row.donor.email, row.facility.name, row.item.name],
            donor: [row.donor.username],
            email: [row.donor.email],
            facility: [row.facility.name],
            item: [row.item.name],
          };
          const haystack = targetByField[searchField].join(" ").toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : rows;

    return searchedRows.map(toLedgerGridRow);
  }, [rows, normalizedQuery, searchField]);

  const gridRows = useMemo(
    () =>
      searchedGridRows.filter(
        (row) =>
          includes(`${row.donorName} ${row.donorEmail}`, columnFilters.donorName) &&
          includes(row.facilityName, columnFilters.facilityName) &&
          includes(row.itemLabel, columnFilters.itemLabel) &&
          isWithinAmountRange(row.amount, amountRangeFilter) &&
          isWithinDateRange(row.createdAt, dateRangeFilter),
      ),
    [searchedGridRows, columnFilters, amountRangeFilter, dateRangeFilter],
  );

  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const filteredTotal = gridRows.reduce((sum, r) => sum + r.amount, 0);
  const donorCount = new Set(rows.map((row) => row.donor.id)).size;
  const facilityCount = new Set(rows.map((row) => row.facility.id)).size;
  const activeFilterChips = [
    ...(query.trim()
      ? [
          {
            key: "query",
            label: `${searchFieldLabel[searchField]}: ${query.trim()}`,
            onClear: () => setQuery(""),
          },
        ]
      : []),
    ...(columnFilters.donorName
      ? [
          {
            key: "donorName",
            label: `후원자: ${columnFilters.donorName}`,
            onClear: () => setColumnFilter("donorName", ""),
          },
        ]
      : []),
    ...(columnFilters.facilityName
      ? [
          {
            key: "facilityName",
            label: `시설: ${columnFilters.facilityName}`,
            onClear: () => setColumnFilter("facilityName", ""),
          },
        ]
      : []),
    ...(columnFilters.itemLabel
      ? [
          {
            key: "itemLabel",
            label: `물품: ${columnFilters.itemLabel}`,
            onClear: () => setColumnFilter("itemLabel", ""),
          },
        ]
      : []),
    ...(amountRangeFilter.start || amountRangeFilter.end
      ? [
          {
            key: "amount",
            label: `금액: ${amountRangeFilter.start ? won(Number(amountRangeFilter.start)) : "0원"} ~ ${
              amountRangeFilter.end ? won(Number(amountRangeFilter.end)) : "제한 없음"
            }`,
            onClear: () => setAmountRangeFilter({ start: "", end: "" }),
          },
        ]
      : []),
    ...(dateRangeFilter.start || dateRangeFilter.end
      ? [
          {
            key: "createdAt",
            label: `일시: ${dateRangeFilter.start ? dateLabel(dateRangeFilter.start) : "처음"} ~ ${
              dateRangeFilter.end ? dateLabel(dateRangeFilter.end) : "오늘"
            }`,
            onClear: () => setDateRangeFilter({ start: "", end: "" }),
          },
        ]
      : []),
  ];
  const clearAllFilters = () => {
    setQuery("");
    setSearchField("all");
    setColumnFilters({});
    setAmountRangeFilter({ start: "", end: "" });
    setDateRangeFilter({ start: "", end: "" });
  };

  const columnDefs = useMemo<ColDef<LedgerGridRow>[]>(
    () => [
      {
        field: "donorName",
        headerName: "후원자",
        flex: 1.1,
        minWidth: 210,
        pinned: "left",
        headerComponent: AdminGridHeader<LedgerGridRow, LedgerFilterKey>,
        headerComponentParams: {
          fieldKey: "donorName",
          filterValue: columnFilters.donorName ?? "",
          filterPlaceholder: "이름 또는 이메일",
          onFilterChange: setColumnFilter,
        },
        cellRenderer: ({ data }: { data?: LedgerGridRow }) => {
          if (!data) return null;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-[12px] font-extrabold text-zinc-700">
                {data.donorName.charAt(0)}
              </span>
              <div className="min-w-0">
                <div className="truncate font-bold text-zinc-900">{data.donorName}</div>
                <div className="truncate text-[11px] text-zinc-400">{data.donorEmail}</div>
              </div>
            </div>
          );
        },
        valueFormatter: ({ data }) => data?.donorName ?? "",
      },
      {
        field: "facilityName",
        headerName: "시설",
        flex: 1,
        minWidth: 170,
        headerComponent: AdminGridHeader<LedgerGridRow, LedgerFilterKey>,
        headerComponentParams: {
          fieldKey: "facilityName",
          filterValue: columnFilters.facilityName ?? "",
          filterPlaceholder: "시설명 입력",
          onFilterChange: setColumnFilter,
        },
      },
      {
        field: "itemLabel",
        headerName: "물품",
        flex: 1.25,
        minWidth: 230,
        headerComponent: AdminGridHeader<LedgerGridRow, LedgerFilterKey>,
        headerComponentParams: {
          fieldKey: "itemLabel",
          filterValue: columnFilters.itemLabel ?? "",
          filterPlaceholder: "물품명 입력",
          onFilterChange: setColumnFilter,
        },
        cellRenderer: ({ data }: { data?: LedgerGridRow }) => {
          if (!data) return null;
          return (
            <div className="min-w-0">
              <div className="truncate font-bold text-zinc-900">{data.itemLabel}</div>
              <div className="mt-0.5 truncate text-[11px] font-semibold text-zinc-400">
                {data.facilityName}
              </div>
            </div>
          );
        },
        valueFormatter: ({ data }) => data?.itemLabel ?? "",
      },
      {
        field: "amount",
        headerName: "금액",
        width: 150,
        headerComponent: AdminGridHeader<LedgerGridRow, LedgerFilterKey>,
        headerComponentParams: {
          fieldKey: "amount",
          filterVariant: "number-range",
          rangeValue: amountRangeFilter,
          popoverAlign: "right",
          onRangeFilterChange: setRangeFilter,
        },
        valueFormatter: ({ value }) => won(Number(value || 0)),
        cellClass: "font-extrabold text-zinc-950",
      },
      {
        field: "createdAt",
        headerName: "일시",
        width: 220,
        sort: "desc",
        headerComponent: AdminGridHeader<LedgerGridRow, LedgerFilterKey>,
        headerComponentParams: {
          fieldKey: "createdAt",
          filterVariant: "date-range",
          rangeValue: dateRangeFilter,
          popoverAlign: "right",
          onRangeFilterChange: setRangeFilter,
        },
        valueFormatter: ({ value }) => dateFmt(String(value)),
        cellClass: "text-zinc-500",
      },
    ],
    [columnFilters, amountRangeFilter, dateRangeFilter],
  );

  const exportCsv = () => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `donation-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
      columnKeys: ["donorName", "facilityName", "itemLabel", "amount", "createdAt"],
    });
  };

  return (
    <main className="workspace-page space-y-4">
      <Panel className="p-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="text-[15px] font-extrabold text-zinc-900">후원 내역</h2>
              <span className="text-[12px] font-semibold text-zinc-400">
                {rows.length ? `${rows.length}건 · ${won(total)} · 최신순` : "플랫폼 전체 후원 기록"}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={exportCsv}
              disabled={!gridRows.length}
            >
              <Download size={14} /> CSV 다운로드
            </Button>
          </div>
        </div>

        {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
        {loading ? (
          <p className="text-[13px] text-zinc-500">불러오는 중...</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="아직 후원 내역이 없습니다."
            description="후원자가 참여하면 여기에 표시됩니다."
          />
        ) : (
          <div className="space-y-2.5">
            <div className="grid gap-2.5 md:grid-cols-4">
              <LedgerMetric label="누적 후원금" value={won(total)} />
              <LedgerMetric label="검색 결과" value={`${gridRows.length}건`} sub={won(filteredTotal)} />
              <LedgerMetric label="후원자" value={`${donorCount}명`} />
              <LedgerMetric label="참여 시설" value={`${facilityCount}곳`} />
            </div>

            <div className="space-y-2 rounded-xl bg-zinc-50/70 p-2">
              <div className="flex w-full min-w-0 gap-2 md:max-w-xl">
                <Select
                  value={searchField}
                  onChange={(event) => setSearchField(event.target.value as SearchField)}
                  className="h-10 rounded-xl border-zinc-200 bg-white text-[13px] font-bold"
                  wrapperClassName="w-32 shrink-0"
                  aria-label="검색 대상"
                >
                  <option value="all">전체</option>
                  <option value="donor">후원자</option>
                  <option value="email">이메일</option>
                  <option value="facility">시설</option>
                  <option value="item">물품</option>
                </Select>
                <SearchInput
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onClear={() => setQuery("")}
                  placeholder="검색어 입력"
                />
              </div>
              <div className="flex min-w-0 items-start justify-between gap-3 border-t border-zinc-100 pt-2">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  <p className="shrink-0 text-[12px] font-semibold text-zinc-500">
                    {activeFilterChips.length ? `${gridRows.length}건 필터링됨` : "최신 후원순으로 표시"}
                  </p>
                  {activeFilterChips.map((filter) => (
                    <ActiveFilterChip key={filter.key} label={filter.label} onClear={filter.onClear} />
                  ))}
                </div>
                {activeFilterChips.length ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
                    onClick={clearAllFilters}
                  >
                    모두 초기화
                  </button>
                ) : null}
              </div>
            </div>

            <AdminDataGrid<LedgerGridRow>
              gridRef={gridRef}
              rowData={gridRows}
              columnDefs={columnDefs}
              height={520}
              defaultColDef={{ filter: false }}
              getRowId={({ data }) => String(data.id)}
              overlayNoRowsTemplate="표시할 후원 내역이 없습니다."
            />
          </div>
        )}
      </Panel>
    </main>
  );
}

function LedgerMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      <p className="text-[11px] font-extrabold text-zinc-500">{label}</p>
      <p className="mt-0.5 truncate text-[17px] font-extrabold text-zinc-950">{value}</p>
      {sub && <p className="mt-0.5 truncate text-[11px] font-semibold text-zinc-400">{sub}</p>}
    </div>
  );
}

function ActiveFilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-emerald-800">
      <span className="truncate">{label}</span>
      <button
        type="button"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors hover:bg-emerald-200 hover:text-emerald-950"
        aria-label={`${label} 필터 해제`}
        onClick={onClear}
      >
        <X size={10} strokeWidth={2.6} />
      </button>
    </span>
  );
}
