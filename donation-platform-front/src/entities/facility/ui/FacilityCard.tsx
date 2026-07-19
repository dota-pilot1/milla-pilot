import Link from "next/link";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { buttonVariants } from "@/shared/ui/Button";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_STATUS_VARIANT,
  FACILITY_TYPE_LABEL,
  type Facility,
} from "../model/types";

export function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link
      href={`/donate/facility?id=${facility.id}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${facility.name} 필요 물품 보기`}
    >
      <Card className="flex h-full flex-col p-5 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md group-active:translate-y-0 group-active:scale-[0.99]">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
            {facility.avatarInitial || facility.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{facility.name}</h3>
            <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{facility.region ?? "지역 미정"}</span>
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          {facility.description ? (
            <p className="min-h-10 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {facility.description}
            </p>
          ) : (
            <p className="min-h-10 text-sm leading-5 text-muted-foreground">
              시설별 준비물 목표를 확인할 수 있습니다.
            </p>
          )}

          <div className="mt-5 rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex min-h-6 flex-wrap items-center gap-1.5">
              <Badge variant="muted" className="h-6 px-2">
                {FACILITY_TYPE_LABEL[facility.type]}
              </Badge>
              {facility.verified ? (
                <Badge variant="verified" className="h-6 px-2">
                  ✓ 자격확인
                </Badge>
              ) : null}
              <Badge variant={FACILITY_STATUS_VARIANT[facility.status]} className="h-6 px-2">
                {FACILITY_STATUS_LABEL[facility.status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            준비물 목표로 이동
          </span>
          <span className={buttonVariants({ variant: "outline", size: "sm" })}>
            필요 물품 보기
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
