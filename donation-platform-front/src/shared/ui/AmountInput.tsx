"use client";

import * as React from "react";
import { TextInput } from "./TextInput";
import { cn } from "@/shared/lib/utils";

const krw = new Intl.NumberFormat("ko-KR");

export interface AmountInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
}

/**
 * 금액 입력 — 콤마 포맷 + 숫자만 허용.
 * 값이 0이면 빈 값으로 표시해 지울 수 있게 한다(숫자 controlled input의 "0이 안 지워지는" 문제 해결).
 */
export function AmountInput({
  value,
  onChange,
  className,
  placeholder = "금액 입력",
  ...rest
}: AmountInputProps) {
  return (
    <div className={cn("relative", className)}>
      <TextInput
        inputMode="numeric"
        placeholder={placeholder}
        value={value === 0 ? "" : krw.format(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "");
          onChange(digits === "" ? 0 : Number(digits));
        }}
        className="pr-8 text-right"
        {...rest}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        원
      </span>
    </div>
  );
}
