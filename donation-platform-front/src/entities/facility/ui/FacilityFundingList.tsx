import Link from "next/link";
import { ArrowRight, MapPin, Package, WalletCards } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Progress } from "@/shared/ui/Progress";
import { buttonVariants } from "@/shared/ui/Button";
import { formatKRW, pctOf } from "@/shared/lib/format";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_STATUS_VARIANT,
  FACILITY_TYPE_LABEL,
  type Facility,
} from "../model/types";

export interface FacilityFundingSummary {
  facility: Facility;
  itemCount: number;
  goal: number;
  raised: number;
}

export function FacilityFundingList({ rows }: { rows: FacilityFundingSummary[] }) {
  const leading = rows[0];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">시설별 후원 현황</h2>
          <p className="mt-1 text-sm text-foreground/75">
            시설마다 필요한 물품과 모금 진행 상황을 비교해 볼 수 있습니다.
          </p>
        </div>
        {leading ? (
          <Badge variant="default" className="w-fit">
            현재 최다 참여 {leading.facility.name}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {rows.map((row) => (
          <FacilityFundingCard key={row.facility.id} row={row} />
        ))}
      </div>
    </section>
  );
}

function FacilityFundingCard({ row }: { row: FacilityFundingSummary }) {
  const { facility, itemCount, goal, raised } = row;
  const progress = pctOf(raised, goal);
  const remaining = Math.max(goal - raised, 0);
  const complete = goal > 0 && raised >= goal;

  return (
    <Card className="p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
          {facility.avatarInitial ?? facility.name.charAt(0)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate font-semibold">{facility.name}</h3>
            <Badge variant={FACILITY_STATUS_VARIANT[facility.status]}>
              {FACILITY_STATUS_LABEL[facility.status]}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {facility.region ?? "지역 미정"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Package className="size-3.5" />
              {FACILITY_TYPE_LABEL[facility.type]} · 물품 {itemCount}종
            </span>
          </div>
        </div>

        <span className="shrink-0 text-xl font-bold tracking-tight">{progress}%</span>
      </div>

      <div className="mt-4 space-y-2">
        <Progress value={progress} complete={complete} className="h-2.5" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatKRW(raised)} 참여</span>
          <span>목표 {formatKRW(goal)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <WalletCards className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium">
              {complete ? "목표 금액을 채웠어요" : `${formatKRW(remaining)} 남음`}
            </p>
            <p className="text-xs text-muted-foreground">시설 전용 후원 물품 기준</p>
          </div>
        </div>
        <Link
          href={`/donate/facility?id=${facility.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
          aria-label={`${facility.name} 필요 물품 보기`}
        >
          물품 보기
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
