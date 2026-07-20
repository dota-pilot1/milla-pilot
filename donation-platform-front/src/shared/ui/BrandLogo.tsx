import Image from "next/image";
import { cn } from "@/shared/lib/utils";

type BrandLogoVariant = "lockup" | "mark";

const sizeClass = {
  sm: "h-7",
  md: "h-9",
  lg: "h-12",
  xl: "h-16",
} as const;

type BrandLogoProps = {
  /** lockup = 심볼 + 워드마크, mark = 심볼만 */
  variant?: BrandLogoVariant;
  size?: keyof typeof sizeClass;
  className?: string;
  priority?: boolean;
};

/**
 * 서비스 브랜드 로고. 배경이 투명한 PNG라 라이트/다크 모두에서 그대로 쓴다.
 * 높이만 지정하고 너비는 비율로 따라간다.
 */
export function BrandLogo({
  variant = "lockup",
  size = "md",
  className,
  priority,
}: BrandLogoProps) {
  const isMark = variant === "mark";

  return (
    <Image
      src={isMark ? "/haggyo-mark.png" : "/haggyo-logo.png"}
      alt="학교 — 마음을 잇는 기부 플랫폼"
      width={isMark ? 256 : 600}
      height={isMark ? 240 : 259}
      priority={priority}
      className={cn("w-auto object-contain", sizeClass[size], className)}
    />
  );
}
