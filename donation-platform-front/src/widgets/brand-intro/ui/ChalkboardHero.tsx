"use client";

import Link from "next/link";
import { Gift, HandCoins, Heart, MoveRight, School } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * 파일럿(donaschool.ai.studio) 패밀리룩 검증용 칠판 히어로.
 * 칠판·분필·CTA 고정 토큰(globals.css)과 font-display(Gaegu)만 사용 — 마케팅 표면 전용.
 */
export function ChalkboardHero({ onShowStory }: { onShowStory: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-chalkboard px-6 py-16 text-center shadow-lg ring-1 ring-chalkboard-line sm:px-12 sm:py-20">
      {/* 칠판 비네트 — 가장자리를 살짝 어둡게 눌러 깊이감 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.28))]"
      />
      <p className="relative font-display text-xl text-chalk/75 sm:text-2xl">
        어디에 쓰였는지 모르는 깜깜이 기부?
      </p>
      <h2 className="mx-auto mt-4 max-w-5xl break-keep font-display text-5xl font-bold leading-[1.2] text-chalk sm:text-[3.5rem]">
        <span className="block text-cta">마음을 잇는 기부 플랫폼 &lsquo;학교&rsquo;는</span>
        <span className="mt-2 block">기부자와 아동양육시설을 직접 연결하여</span>
        <span className="mt-2 block text-chalk-yellow">투명하게 전달합니다.</span>
      </h2>

      {/* 기부자 → 기부 물품 → 시설 흐름 */}
      <div className="mx-auto mt-12 flex w-fit items-center gap-8 rounded-2xl px-10 py-8 ring-1 ring-chalkboard-line sm:gap-12">
        <HeroFlowNode icon={HandCoins} label="기부자" sub="(키다리)" className="text-chalk-yellow ring-chalk-yellow/60" />
        <MoveRight className="size-6 shrink-0 text-chalk/50" aria-hidden />
        <HeroFlowNode icon={Gift} label="기부 물품" sub="(준비물)" className="text-chalk-pink ring-chalk-pink/60" />
        <MoveRight className="size-6 shrink-0 text-chalk/50" aria-hidden />
        <HeroFlowNode icon={School} label="아동양육시설" sub="(협력교실)" className="text-chalk-sky ring-chalk-sky/60" />
      </div>

      <p className="mx-auto mt-9 max-w-xl text-base leading-7 text-chalk/80">
        아이들에게 꼭 필요한 준비물(기부 물품)을 여러 기부자들이 함께 채우고,
        <br className="hidden sm:block" />
        아이들에게 전달되는 전 과정을 명확하게 확인하세요.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/donate"
          className="inline-flex h-14 items-center gap-2.5 rounded-xl bg-cta px-8 font-display text-lg text-cta-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Heart className="size-5 fill-current" />
          후원하러 가기
        </Link>
        <button
          type="button"
          onClick={onShowStory}
          className="inline-flex h-14 items-center rounded-xl px-8 font-display text-lg text-chalk ring-1 ring-chalk/40 transition-colors hover:bg-chalk/10"
        >
          학교 설립 스토리
        </button>
      </div>
    </section>
  );
}

function HeroFlowNode({
  icon: Icon,
  label,
  sub,
  className,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className={cn("flex size-16 items-center justify-center rounded-full ring-2", className)}>
        <Icon className="size-7" />
      </span>
      <span className="font-display text-base leading-none text-chalk">{label}</span>
      <span className="font-display text-xs leading-none text-chalk/60">{sub}</span>
    </div>
  );
}
