"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { FACILITY_TYPE_LABEL, type Facility } from "../model/types";

/**
 * 물품 대표 카드 안에 들어가는 시설 한 줄.
 *
 * <p>"이 돈이 누구에게 가는가"는 후원 결정의 핵심 근거라 접거나 숨기지 않는다.
 * 다만 카드를 따로 쓰면 대표 영역과 경쟁하므로, 맥락으로 붙여 한 줄로 보여주고
 * 상세는 시설 페이지로 넘긴다.
 */
export function FacilityInlineSummary({ facility }: { facility: Facility }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
          {facility.avatarInitial || facility.name.charAt(0)}
        </span>
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="font-medium">{facility.name}</span>
          {facility.verified ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <BadgeCheck className="size-3.5" /> 자격확인
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {facility.region ? `${facility.region} · ` : ""}
            {FACILITY_TYPE_LABEL[facility.type]}
          </span>
        </p>
      </div>

      <Link
        href={`/donate/facility?id=${facility.id}`}
        className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        다른 물품 보기 <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
