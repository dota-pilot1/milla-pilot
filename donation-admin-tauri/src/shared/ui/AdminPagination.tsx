import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./Button";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  currentCount: number;
  loading?: boolean;
  selectedCount?: number;
  onPageChange: (page: number) => void;
};

function getPageButtons(page: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index);

  if (page <= 2) return [0, 1, 2, 3, totalPages - 1];
  if (page >= totalPages - 3) return [0, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
  return [0, page - 1, page, page + 1, totalPages - 1];
}

export function AdminPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  currentCount,
  loading = false,
  selectedCount = 0,
  onPageChange,
}: AdminPaginationProps) {
  const hasPages = totalPages > 0;
  const safePage = hasPages ? Math.min(page, totalPages - 1) : 0;
  const start = totalElements === 0 ? 0 : safePage * pageSize + 1;
  const end = totalElements === 0 ? 0 : Math.min(safePage * pageSize + currentCount, totalElements);
  const pageButtons = getPageButtons(safePage, totalPages);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold text-zinc-500">
        <span className="text-zinc-800">
          {start.toLocaleString("ko-KR")}-{end.toLocaleString("ko-KR")}
        </span>
        <span>/ {totalElements.toLocaleString("ko-KR")}명</span>
        {selectedCount > 0 && (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
            {selectedCount.toLocaleString("ko-KR")}개 선택
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-md"
          onClick={() => onPageChange(0)}
          disabled={loading || !hasPages || safePage === 0}
          aria-label="첫 페이지"
        >
          <ChevronFirst size={15} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-md"
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          disabled={loading || !hasPages || safePage === 0}
          aria-label="이전 페이지"
        >
          <ChevronLeft size={15} />
        </Button>

        <div className="flex items-center gap-1 px-1">
          {pageButtons.map((pageNumber, index) => {
            const previous = pageButtons[index - 1];
            const showGap = previous != null && pageNumber - previous > 1;

            return (
              <div key={pageNumber} className="flex items-center gap-1">
                {showGap && <span className="px-1 text-[12px] font-bold text-zinc-400">...</span>}
                <button
                  type="button"
                  className={cn(
                    "grid size-8 place-items-center rounded-md text-[12px] font-extrabold transition-colors",
                    pageNumber === safePage
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:bg-white hover:text-zinc-900",
                  )}
                  onClick={() => onPageChange(pageNumber)}
                  disabled={loading || pageNumber === safePage}
                >
                  {pageNumber + 1}
                </button>
              </div>
            );
          })}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-md"
          onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
          disabled={loading || !hasPages || safePage >= totalPages - 1}
          aria-label="다음 페이지"
        >
          <ChevronRight size={15} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 rounded-md"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={loading || !hasPages || safePage >= totalPages - 1}
          aria-label="마지막 페이지"
        >
          <ChevronLast size={15} />
        </Button>
      </div>
    </div>
  );
}
