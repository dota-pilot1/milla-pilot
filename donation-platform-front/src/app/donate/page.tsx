"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, HandCoins, SearchX } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { facilityApi } from "@/entities/facility/api/facilityApi";
import { FacilityCard } from "@/entities/facility/ui/FacilityCard";
import { DonationGuideDialog } from "@/features/donation-guide/ui/DonationGuideDialog";
import {
  EMPTY_FACILITY_FILTERS,
  FacilityFilterBar,
  applyFacilityFilters,
  type FacilityFilters,
} from "@/features/facility-filter/ui/FacilityFilterBar";

export default function DonatePage() {
  const { data: facilities, isLoading, isError } = useQuery({
    queryKey: ["facilities"],
    queryFn: facilityApi.getAll,
  });
  const [filters, setFilters] = useState<FacilityFilters>(EMPTY_FACILITY_FILTERS);

  // 입력은 즉시 표시(filters.query), 실제 필터링은 디바운스된 검색어로 — 키 입력마다 리렌더 방지
  const debouncedQuery = useDebouncedValue(filters.query, 250);
  const visible = useMemo(
    () =>
      facilities
        ? applyFacilityFilters(facilities, { ...filters, query: debouncedQuery })
        : [],
    [facilities, filters, debouncedQuery],
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          icon={HandCoins}
          title="후원하기"
          description="시설이 직접 검수해 올린 준비물 목표에 참여합니다. 시설을 선택하면 지금 필요한 물품을 볼 수 있어요."
          actions={<DonationGuideDialog />}
        />

        {facilities?.length ? (
          <FacilityFilterBar filters={filters} onChange={setFilters} />
        ) : null}

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl border bg-card" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Building2}
            title="시설을 불러오지 못했습니다"
            description="잠시 후 다시 시도해 주세요."
          />
        ) : !facilities?.length ? (
          <EmptyState
            icon={Building2}
            title="후원 가능한 시설이 없습니다"
            description="곧 새로운 시설이 등록됩니다."
          />
        ) : !visible.length ? (
          <EmptyState
            icon={SearchX}
            title="조건에 맞는 시설이 없습니다"
            description="검색어나 필터를 바꿔보세요."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
