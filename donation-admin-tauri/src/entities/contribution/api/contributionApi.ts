import { apiRequest } from "../../../shared/api/client";
import type { AdminContribution, AdminLedgerRow } from "../model/types";

/** 물품별 기부 원장 (관리자) */
export function fetchItemContributions(token: string, itemId: number) {
  return apiRequest<AdminContribution[]>(`/api/contributions/by-item/${itemId}`, {
    token,
  });
}

/** 전체 후원 내역 (관리자 모니터링) */
export function fetchAllContributions(token: string) {
  return apiRequest<AdminLedgerRow[]>("/api/contributions", { token });
}
