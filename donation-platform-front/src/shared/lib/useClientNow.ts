"use client";

import { useEffect, useState } from "react";

/**
 * 마운트 이후의 현재 시각(ms)을 반환한다. 첫 렌더에서는 `null`.
 *
 * 렌더 중 `Date.now()`를 직접 부르면 순수성 규칙에 어긋나고, SSR 결과와
 * 클라이언트 결과가 달라 하이드레이션 불일치가 난다. 남은 시간·상대 시각처럼
 * "지금"이 필요한 표시는 이 훅으로 마운트 후에만 계산한다.
 */
export function useClientNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);
  return now;
}
