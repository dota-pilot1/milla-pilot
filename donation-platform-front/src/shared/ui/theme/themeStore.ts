"use client";

import { Store } from "@tanstack/react-store";

/**
 * 테마 5종. 무채색 default 는 커머스 톤이 아니라 제거했고,
 * mint(학교와 중복)·peach(코랄과 중복)·lavender 도 정리했다.
 * 저장된 값이 목록에 없으면 {@link DEFAULT_THEME} 로 되돌아간다.
 */
export const THEME_COLORS = [
  { id: "haggyo", label: "학교", color: "#2e7d6e" },
  { id: "coral", label: "코랄", color: "#ff7043" },
  { id: "amber", label: "앰버", color: "#f59e0b" },
  { id: "sky", label: "스카이", color: "#38bdf8" },
  { id: "rose", label: "로즈", color: "#ec4899" },
] as const;

export type ThemeColorId = (typeof THEME_COLORS)[number]["id"];

const STORAGE_KEY = "theme-color";

/** 기본 테마 = 학교 브랜드 */
export const DEFAULT_THEME: ThemeColorId = "haggyo";

function isValidColor(v: string | null): v is ThemeColorId {
  return !!v && THEME_COLORS.some((t) => t.id === v);
}

function readInitial(): ThemeColorId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidColor(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export const themeColorStore = new Store<{ color: ThemeColorId }>({
  color: DEFAULT_THEME,
});

export const themeColorActions = {
  hydrate() {
    const next = readInitial();
    themeColorStore.setState({ color: next });
    applyToDom(next);
  },
  set(next: ThemeColorId) {
    themeColorStore.setState({ color: next });
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyToDom(next);
  },
};

function applyToDom(color: ThemeColorId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", color);
}
