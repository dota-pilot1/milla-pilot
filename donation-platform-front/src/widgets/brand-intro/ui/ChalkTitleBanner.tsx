import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ChalkAccent } from "../model/sections";
import { CHALK_ACCENT_TEXT } from "../model/accent";

/** 프로젝트 소개 상세 페이지 공통 상단 배너 — 태그·타이틀·소개 허브로 돌아가는 링크. */
export function ChalkTitleBanner({
  tag,
  title,
  accent,
  subtitle,
}: {
  tag: string;
  title: string;
  accent: ChalkAccent;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-chalkboard px-6 py-14 text-center ring-1 ring-chalkboard-line sm:px-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.28))]"
      />
      <Link
        href="/project-intro"
        className="relative inline-flex items-center gap-1.5 text-sm text-chalk/70 transition-colors hover:text-chalk"
      >
        <ArrowLeft className="size-3.5" />
        프로젝트 소개로 돌아가기
      </Link>

      <p className={cn("relative mt-6 font-display text-sm font-semibold tracking-[0.3em]", CHALK_ACCENT_TEXT[accent])}>
        {tag}
      </p>
      <h1 className="relative mx-auto mt-3 max-w-3xl font-display text-4xl text-chalk sm:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="relative mx-auto mt-4 max-w-xl text-sm leading-6 text-chalk/75">{subtitle}</p>
      ) : null}
    </section>
  );
}
