import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_STATUS_VARIANT,
  FACILITY_TYPE_LABEL,
  type Facility,
} from "../model/types";

export function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link href={`/donate/facilities/${facility.id}`} className="group block h-full">
      <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-primary/40">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
            {facility.avatarInitial || facility.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{facility.name}</h3>
            <p className="text-xs text-muted-foreground">
              {facility.region} · {FACILITY_TYPE_LABEL[facility.type]}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>

        {facility.description ? (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {facility.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {facility.verified ? <Badge variant="verified">✓ 자격확인</Badge> : null}
          <Badge variant={FACILITY_STATUS_VARIANT[facility.status]}>
            {FACILITY_STATUS_LABEL[facility.status]}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
