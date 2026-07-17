"use client";

import { useEffect, useState } from "react";

/** value가 delay(ms) 동안 안정되면 그 값을 반환. 검색어 등 잦은 입력의 디바운스에 사용. */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
