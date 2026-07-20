import { cn } from "@/shared/lib/utils";

/** 화면 최하단 저작권·버전 표기. 버전을 올릴 때는 이 상수만 수정한다. */
const APP_VERSION = "VER 1.0.0 (BETA)";

/**
 * 사이트 공통 푸터.
 * `tone="chalk"` = 칠판 배경 위(마케팅 표면)용, 기본값은 일반 라이트 화면용.
 */
export function SiteFooter({ tone = "default" }: { tone?: "default" | "chalk" }) {
  const isChalk = tone === "chalk";

  return (
    <footer
      className={cn(
        "border-t border-dashed px-4 pb-6 pt-12 text-center",
        isChalk ? "border-chalk/20" : "border-border",
      )}
    >
      <p className={cn("text-sm", isChalk ? "text-chalk/70" : "text-muted-foreground")}>
        © {new Date().getFullYear()} 기부 플랫폼 [학교] All Rights Reserved.
      </p>
      <p
        className={cn(
          "mt-2 text-xs tracking-[0.15em]",
          isChalk ? "text-chalk/45" : "text-muted-foreground/70",
        )}
      >
        {APP_VERSION}
      </p>
    </footer>
  );
}
