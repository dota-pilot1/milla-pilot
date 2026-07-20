import type { ChalkAccent } from "./sections";

/** 분필 강조색 3종 → 유틸 클래스. 칠판 위에서만 쓴다(design-system.md §6-2). */
export const CHALK_ACCENT_TEXT: Record<ChalkAccent, string> = {
  yellow: "text-chalk-yellow",
  pink: "text-chalk-pink",
  sky: "text-chalk-sky",
};

export const CHALK_ACCENT_RING: Record<ChalkAccent, string> = {
  yellow: "ring-chalk-yellow/50",
  pink: "ring-chalk-pink/50",
  sky: "ring-chalk-sky/50",
};
