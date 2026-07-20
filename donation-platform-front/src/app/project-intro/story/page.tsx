"use client";

import { cn } from "@/shared/lib/utils";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ChalkTitleBanner } from "@/widgets/brand-intro";
import { BrandLogo } from "@/shared/ui/BrandLogo";
import { PageShell } from "@/shared/ui/PageShell";

/** 설립 스토리 — 키아(KIAH) 4가지 약속. 분필색은 칠판 위에서만(design-system.md §6-2). */
const KIAH_PROMISES = [
  { letter: "K", en: "KINDNESS", ko: "따뜻함", desc: "동정이 아닌 존중의 나눔을 실천합니다.", color: "text-chalk-yellow" },
  { letter: "I", en: "INTEGRITY", ko: "투명성", desc: "100% 온전히 전달하며 오용을 원천 차단합니다.", color: "text-chalk-pink" },
  { letter: "A", en: "ACCURACY", ko: "정확성", desc: "시설에 꼭 필요한 물품을 정확히 매칭합니다.", color: "text-chalk-sky" },
  { letter: "H", en: "HOME", ko: "공간 존중", desc: "아이들의 사생활과 존엄을 최우선으로 보호합니다.", color: "text-chalk" },
] as const;

export default function IntroStoryPage() {
  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <ChalkTitleBanner tag="STORY" title="학교 설립 스토리" accent="yellow" />

          {/* 스토리 패널 — 사진 + 본문 + 인용 */}
          <section className="relative overflow-hidden rounded-3xl bg-chalkboard px-5 py-10 ring-1 ring-chalkboard-line sm:px-10 sm:py-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.28))]"
            />

            <div className="relative mx-auto max-w-4xl rounded-2xl bg-chalk/[0.04] p-6 ring-1 ring-chalkboard-line sm:p-8">
              <div className="grid items-center gap-8 sm:grid-cols-[230px_1fr]">
                <figure className="relative mx-auto w-full max-w-[240px]">
                  {/* 실제 스토리 사진이 준비되면 이 타일만 <Image>로 교체 */}
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-chalk ring-1 ring-chalk/30">
                    <BrandLogo variant="mark" size="xl" className="h-28" />
                  </div>
                  <figcaption className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-chalkboard px-3.5 py-1 font-display text-xs text-chalk-yellow ring-1 ring-chalk-yellow/50">
                    아이들에게 전해지는 따뜻한 온기
                  </figcaption>
                </figure>
                <div className="space-y-4 text-sm leading-7 text-chalk/85">
                  <p>
                    어린 시절 고아로 자라며 세상의 차가움을 겪었지만, 이른 나이에 사업을 시작해
                    자산가가 된 &lsquo;학교&rsquo; 이사장은 지난 20여 년간 보이지 않는 곳에서 수많은
                    아동보육시설(협력교실)에 묵묵히 기부해왔습니다.
                  </p>
                  <p>
                    아이들이 건강하게 성장하는 모습을 보며 얻은 벅찬 보람과 선한 영향력을 더 많은
                    사람들과 나누고 연대하기 위해 기부 플랫폼 &lsquo;학교&rsquo;를 시작합니다.
                  </p>
                </div>
              </div>
              <div aria-hidden className="my-6 border-t border-dashed border-chalk/25" />
              <p className="font-display text-lg leading-relaxed text-chalk-yellow">
                ✎ &ldquo;아이들이 자라서 또 다른 선한 나무가 되도록, 우리는 그들의 가장 든든한
                등받이가 되어줄 것입니다.&rdquo;
              </p>
            </div>

            {/* 키아(KIAH) 네이밍 + 4가지 약속 */}
            <div aria-hidden className="relative mx-auto mt-12 max-w-4xl border-t border-dashed border-chalk/20" />
            <div className="relative mt-10 text-center">
              <h2 className="font-display text-2xl text-chalk-pink">
                기부회원의 이름, &lsquo;키아(KIAH)&rsquo;
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-chalk/80">
                우리 플랫폼의 기부회원은 <b className="font-semibold text-chalk">&lsquo;키아(KIAH)&rsquo;</b>라고
                부릅니다. 소설 속 조용한 후원자 &lsquo;키다리 아저씨&rsquo;를 줄인 이름으로, 얼굴을
                드러내지 않고 필요한 것을 조용히 채워주던 그 따뜻한 마음을 잇습니다. 그리고 그 네
                글자는 학교가 지키는 네 가지 약속이 되었습니다.
              </p>
            </div>

            <div className="relative mx-auto mt-7 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {KIAH_PROMISES.map((item) => (
                <div
                  key={item.letter}
                  className="rounded-2xl bg-chalk/[0.03] px-4 py-5 text-center ring-1 ring-chalkboard-line"
                >
                  <span className={cn("font-display text-4xl font-bold", item.color)}>{item.letter}</span>
                  <p className={cn("mt-2 text-[11px] font-semibold tracking-[0.2em]", item.color)}>{item.en}</p>
                  <p className="mt-1 font-display text-lg text-chalk">{item.ko}</p>
                  <p className="mt-2 text-xs leading-5 text-chalk/70">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="relative mx-auto mt-8 max-w-2xl text-center font-display text-lg text-chalk/85">
              그래서 학교의 기부회원은 <span className="text-chalk-yellow">키아(KIAH)</span> — 조용히,
              그러나 따뜻하게 아이들의 곁을 채우는 사람들입니다.
            </p>
          </section>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
