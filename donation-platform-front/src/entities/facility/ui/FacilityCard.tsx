"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import {
  ArrowRight,
  Building2,
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
          "flex h-full min-h-72 flex-col overflow-hidden p-0 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md group-active:translate-y-0 group-active:scale-[0.99]",
          pending && "border-primary/50 bg-background shadow-md ring-2 ring-ring/25",
        )}
      >
        <div className="flex items-start gap-3 border-b bg-card p-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary ring-1 ring-primary/15">
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
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          {facility.description ? (
            <p className="min-h-10 line-clamp-2 text-sm leading-5 text-foreground/80">
              {facility.description}
            </p>
          ) : (
            <p className="min-h-10 text-sm leading-5 text-foreground/80">
              지금 필요한 물품과 진행 상황을 확인할 수 있습니다.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border bg-background px-3 text-xs font-semibold text-foreground/75 shadow-sm">
              <Building2 className="size-3.5 text-primary" />
              {FACILITY_TYPE_LABEL[facility.type]}
            </span>
            {facility.verified ? (
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full border bg-background px-3 text-xs font-semibold text-foreground/75 shadow-sm">
                <ShieldCheck className="size-3.5 text-primary" />
                자격 확인
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end border-t bg-background px-5 py-4">
          <span
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "min-w-36 shadow-sm",
            )}
          >
            {pending ? "여는 중" : "상세 보기"}
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
