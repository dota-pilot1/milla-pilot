import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/shared/ui/PageShell";

export default function FacilityDonateLoading() {
  return (
    <PageShell>
      <div className="space-y-6">
        <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> 시설 목록으로
        </div>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="size-14 shrink-0 animate-pulse rounded-2xl bg-muted" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-7 w-52 animate-pulse rounded-md bg-muted" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-36 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
          <div className="mt-4 h-2.5 animate-pulse rounded-full bg-muted" />
        </section>

        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border bg-card" />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
