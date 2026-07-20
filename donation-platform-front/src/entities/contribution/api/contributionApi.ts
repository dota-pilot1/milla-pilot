import { api } from "@/shared/api/axios";
import type { ItemContributionSummary, MyContribution } from "../model/types";

export interface CreateContributionBody {
  donationItemId: number;
  amount: number;
}

/** 결제 확정 응답 */
export interface ConfirmedContribution {
  id: number;
  donationItemId: number;
  amount: number;
  status: string;
  receiptUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

/** 결제 대기 생성 응답 — 이 값으로 포트원 결제창을 띄운다 */
export interface InitiatePaymentResponse {
  contributionId: number;
  paymentId: string;
  orderName: string;
  amount: number;
  storeId: string;
  channelKey: string;
  expiresAt: string;
}

export const contributionApi = {
  create: (body: CreateContributionBody) =>
    api.post("/api/contributions", body).then((r) => r.data),
  getMine: () =>
    api.get<MyContribution[]>("/api/contributions/me").then((r) => r.data),

  /** 물품별 참여 현황 (공개) — 후원자 수·최근 참여 */
  getItemSummary: (itemId: number) =>
    api
      .get<ItemContributionSummary>(`/api/contributions/by-item/${itemId}/summary`)
      .then((r) => r.data),

  /** ① 결제 대기 생성 — 잔여 금액을 선점하고 결제창 파라미터를 받는다 */
  initiatePayment: (body: CreateContributionBody) =>
    api
      .post<InitiatePaymentResponse>("/api/contributions/payments/initiate", body)
      .then((r) => r.data),

  /** ③ 결제 확정 — 서버가 포트원에 조회해 금액을 대조한 뒤 후원을 확정한다 */
  confirmPayment: (paymentId: string) =>
    api
      .post<ConfirmedContribution>("/api/contributions/payments/confirm", { paymentId })
      .then((r) => r.data),

  /** 결제창 이탈·실패 통보 — 선점을 즉시 해제한다 */
  cancelPayment: (paymentId: string, reason?: string) =>
    api.post("/api/contributions/payments/cancel", { paymentId, reason }).then((r) => r.data),
};
