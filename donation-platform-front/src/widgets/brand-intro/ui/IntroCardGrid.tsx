import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { INTRO_SECTIONS } from "../model/sections";
import { CHALK_ACCENT_RING, CHALK_ACCENT_TEXT } from "../model/accent";

/** 프로젝트 소개 허브의 카드 그리드 — 카드마다 /project-intro/{slug} 상세 페이지로 연결된다. */
export function IntroCardGrid() {
  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {INTRO_SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <Link
            key={section.slug}
            href={`/project-intro/${section.slug}`}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-chalkboard p-6 ring-1 ring-chalkboard-line transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl ring-1",
                  CHALK_ACCENT_RING[section.accent],
                  CHALK_ACCENT_TEXT[section.accent],
                )}
              >
                <Icon className="size-5" />
              </span>
              {!section.ready ? (
                <span className="rounded-full bg-chalk/10 px-2.5 py-1 text-[11px] font-semibold text-chalk/60">
                  준비 중
                </span>
              ) : null}
            </div>

            <div>
              <p
                className={cn(
                  "font-display text-xs font-semibold tracking-[0.25em]",
                  CHALK_ACCENT_TEXT[section.accent],
                )}
              >
                {section.tag}
              </p>
              <h3 className="mt-1.5 font-display text-2xl text-chalk">{section.title}</h3>
            </div>

            <p className="text-sm leading-6 text-chalk/75">{section.summary}</p>

            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-chalk/90 transition-transform group-hover:translate-x-0.5">
              {section.ctaLabel}
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        );
      })}
    </section>
  );
}
