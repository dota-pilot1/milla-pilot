import Link from "next/link";
import { ArrowRight, HandHeart, Megaphone, School } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ChalkAccent } from "../model/sections";
import { CHALK_ACCENT_RING, CHALK_ACCENT_TEXT } from "../model/accent";

interface MembershipTile {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  accent: ChalkAccent;
  cta: { label: string; href: string } | null;
  /** cta가 없을 때 대신 보여줄 상태 문구 */
  note?: string;
}

const MEMBERSHIP_TILES: readonly MembershipTile[] = [
  {
    icon: HandHeart,
    tag: "KIAH",
    title: "기부자 (키아)",
    description:
      "시설이 올린 물품에 참여해 아이들에게 꼭 필요한 것을 함께 채웁니다. 조용히 곁을 지키는 키다리 아저씨입니다.",
    accent: "yellow",
    cta: { label: "기부자로 가입하기", href: "/register" },
  },
  {
    icon: School,
    tag: "FACILITY",
    title: "기부처 (협력교실)",
    description:
      "아이들에게 필요한 물품을 학교에 알리고, 모금부터 수령확인까지 같은 화면에서 진행 상황을 확인합니다.",
    accent: "sky",
    cta: null,
    note: "운영팀 확인 후 등록",
  },
  {
    icon: Megaphone,
    tag: "AMBASSADOR",
    title: "앰배서더 (홍보대사)",
    description:
      "더 많은 기부자에게 학교를 알리고 연결하는 파트너입니다. 참여 방식과 혜택을 준비하고 있습니다.",
    accent: "pink",
    cta: null,
    note: "준비 중",
  },
];

/** 파일럿의 "함께하는 사람들" 구성을 참고해, 우리 실제 회원 유형 기준으로 새로 쓴 섹션. */
export function MembershipSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-chalkboard px-5 py-14 ring-1 ring-chalkboard-line sm:px-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.28))]"
      />

      <div className="relative text-center">
        <p className="font-display text-lg text-cta">함께하는 사람들 (Memberships)</p>
        <h2 className="mx-auto mt-2 max-w-2xl break-keep font-display text-3xl leading-snug text-chalk sm:text-4xl">
          세 가지 연대가 모여 하나의 나눔 교실이 됩니다.
        </h2>
        <div
          aria-hidden
          className="mx-auto mt-6 h-px w-56 bg-gradient-to-r from-transparent via-chalk/40 to-transparent"
        />
      </div>

      <div className="relative mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MEMBERSHIP_TILES.map((tile) => (
          <article
            key={tile.title}
            className="flex flex-col gap-4 rounded-2xl border border-dashed border-chalk/25 bg-chalk/[0.03] p-6 transition-colors hover:bg-chalk/[0.06]"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl bg-chalk/[0.06] ring-1",
                  CHALK_ACCENT_RING[tile.accent],
                  CHALK_ACCENT_TEXT[tile.accent],
                )}
              >
                <tile.icon className="size-5" />
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] ring-1",
                  CHALK_ACCENT_RING[tile.accent],
                  CHALK_ACCENT_TEXT[tile.accent],
                )}
              >
                {tile.tag}
              </span>
            </div>

            <h3 className={cn("font-display text-2xl", CHALK_ACCENT_TEXT[tile.accent])}>{tile.title}</h3>

            <p className="flex-1 text-sm leading-7 text-chalk/75">{tile.description}</p>

            {tile.cta ? (
              <Link
                href={tile.cta.href}
                className="group inline-flex items-center gap-1.5 font-display text-base text-chalk transition-colors hover:text-cta"
              >
                {tile.cta.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <span className="inline-flex w-fit items-center rounded-full bg-chalk/10 px-3 py-1 text-xs font-medium text-chalk/60">
                {tile.note}
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
