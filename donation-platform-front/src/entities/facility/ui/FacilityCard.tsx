"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Loader2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { buttonVariants } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_STATUS_VARIANT,
  FACILITY_TYPE_LABEL,
  type Facility,
  type FacilityStatus,
} from "../model/types";

function shouldShowPending(event: MouseEvent<HTMLAnchorElement>) {
  return !(
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

const STATUS_HELP: Record<FacilityStatus, string> = {
  RECRUITING: "지금 필요한 준비물을 고르고 함께 채울 수 있어요.",
  BUYING: "모인 후원으로 시설별 통합 구매가 진행 중이에요.",
  SHIPPING: "구매된 물품이 시설로 이동하고 있어요.",
};

const STATUS_TITLE: Record<FacilityStatus, string> = {
  RECRUITING: "함께 채우는 중",
  BUYING: "구매 진행 중",
  SHIPPING: "배송 이동 중",
};

const ACTION_LABEL: Record<FacilityStatus, string> = {
  RECRUITING: "함께 채우기",
  BUYING: "진행 보기",
  SHIPPING: "진행 보기",
};

const STATUS_ICON = {
  RECRUITING: ShoppingBag,
  BUYING: PackageCheck,
  SHIPPING: Truck,
} satisfies Record<FacilityStatus, typeof ShoppingBag>;

export function FacilityCard({ facility }: { facility: Facility }) {
  const [pending, setPending] = useState(false);
  const StatusIcon = STATUS_ICON[facility.status];

  return (
    <Link
      href={`/donate/facility?id=${facility.id}`}
      onClick={(event) => {
        if (shouldShowPending(event)) setPending(true);
      }}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${facility.name} 필요 물품 보기`}
      aria-busy={pending}
    >
      <Card
        className={cn(
          "relative flex h-full min-h-72 flex-col overflow-hidden p-5 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md group-active:translate-y-0 group-active:scale-[0.99]",
          pending && "border-primary/50 bg-muted/20 shadow-md ring-2 ring-ring/25",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary/70" />

        <div className="flex items-start gap-3 pt-1">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base font-bold text-primary ring-1 ring-primary/10">
            <StatusIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate font-semibold">{facility.name}</h3>
            </div>
            <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{facility.region ?? "지역 미정"}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={FACILITY_STATUS_VARIANT[facility.status]} className="h-7 px-3">
              {FACILITY_STATUS_LABEL[facility.status]}
            </Badge>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
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

          <div className="mt-5 space-y-3 rounded-xl bg-muted/45 p-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-background px-3 text-xs font-semibold text-foreground/75 shadow-sm">
                <Building2 className="size-3.5 text-primary" />
                {FACILITY_TYPE_LABEL[facility.type]}
              </span>
              {facility.verified ? (
                <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-background px-3 text-xs font-semibold text-foreground/75 shadow-sm">
                  <ShieldCheck className="size-3.5 text-primary" />
                  자격 확인
                </span>
              ) : null}
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-background p-3 text-sm shadow-sm">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-sm">
                <StatusIcon className="size-3.5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-primary">{STATUS_TITLE[facility.status]}</p>
                <p className="mt-0.5 leading-5 text-foreground/80">{STATUS_HELP[facility.status]}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
          <span className="min-w-0 truncate text-xs font-medium text-foreground/70">
            시설 준비물 목표
          </span>
          <span
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "min-w-36 shadow-sm",
            )}
          >
            {pending ? "여는 중" : ACTION_LABEL[facility.status]}
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </span>
        </div>
      </Card>
    </Link>
  );
}
