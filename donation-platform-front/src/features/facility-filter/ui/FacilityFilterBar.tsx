"use client";

import { Search } from "lucide-react";
import { TextInput } from "@/shared/ui/TextInput";
import { Chip } from "@/shared/ui/Chip";
import { Card } from "@/shared/ui/Card";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_TYPE_LABEL,
  type Facility,
  type FacilityStatus,
  type FacilityType,
} from "@/entities/facility/model/types";

export interface FacilityFilters {
  query: string;
  status: FacilityStatus | null;
  type: FacilityType | null;
}

export const EMPTY_FACILITY_FILTERS: FacilityFilters = {
  query: "",
  status: null,
  type: null,
};

/** 필터 조건으로 시설 목록을 좁힌다 (클라이언트 사이드). */
export function applyFacilityFilters(list: Facility[], f: FacilityFilters) {
  const q = f.query.trim().toLowerCase();
  return list.filter((facility) => {
    if (f.status && facility.status !== f.status) return false;
    if (f.type && facility.type !== f.type) return false;
    if (q) {
      const haystack = `${facility.name} ${facility.region ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function FacilityFilterBar({
  filters,
  onChange,
}: {
  filters: FacilityFilters;
  onChange: (next: FacilityFilters) => void;
}) {
  const allActive = filters.status === null && filters.type === null;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            className="h-10 pl-9"
            placeholder="시설명·지역 검색"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip
            active={allActive}
            onClick={() => onChange({ ...filters, status: null, type: null })}
          >
            전체
          </Chip>
          {(Object.keys(FACILITY_STATUS_LABEL) as FacilityStatus[]).map((status) => (
            <Chip
              key={status}
              active={filters.status === status}
              onClick={() =>
                onChange({ ...filters, status: filters.status === status ? null : status })
              }
            >
              {FACILITY_STATUS_LABEL[status]}
            </Chip>
          ))}
          {(Object.keys(FACILITY_TYPE_LABEL) as FacilityType[]).map((type) => (
            <Chip
              key={type}
              active={filters.type === type}
              onClick={() => onChange({ ...filters, type: filters.type === type ? null : type })}
            >
              {FACILITY_TYPE_LABEL[type]}
            </Chip>
          ))}
        </div>
      </div>
    </Card>
  );
}
