import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  /**
   * "hero" = 마케팅 표면(소개 페이지 등) 전용으로 타이틀·설명을 크게 강조.
   * 기본값(데이터/CRUD 화면 표준, design-system.md §3)은 바꾸지 않는다.
   */
  size?: "default" | "hero";
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  size = "default",
}: PageHeaderProps) {
  const isHero = size === "hero";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        {Icon ? (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15",
              isHero ? "size-14" : "size-11",
            )}
          >
            <Icon className={isHero ? "size-6" : "size-5"} />
          </span>
        ) : null}
        <div className="min-w-0 space-y-1.5">
          <h1
            className={cn(
              "text-foreground tracking-tight",
              isHero ? "text-4xl font-extrabold sm:text-5xl" : "text-2xl font-bold",
            )}
          >
            {title}
          </h1>
          {/* 페이지 바닥(--page) 위에 놓이므로 흰 카드 안보다 대비를 한 단 올린다.
              muted-foreground 는 카드 안 보조 텍스트용. */}
          {description ? (
            <p
              className={cn(
                "max-w-2xl text-foreground/75",
                isHero ? "text-lg leading-7" : "text-sm leading-6",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
