import { apiRequest } from "../../../shared/api/client";
import type {
  AdminPurchaseOrder,
  CreatePurchaseOrderInput,
  PendingPurchaseItem,
} from "../model/types";

/** 통합구매 대기 물품(목표달성) */
export function fetchPendingPurchases(token: string) {
  return apiRequest<PendingPurchaseItem[]>("/api/purchase-orders/pending", { token });
}

/** 전체 통합구매 목록 */
export function fetchPurchaseOrders(token: string) {
  return apiRequest<AdminPurchaseOrder[]>("/api/purchase-orders", { token });
}

/** 통합구매 실행 */
export function createPurchaseOrder(
  token: string,
  itemId: number,
  body: CreatePurchaseOrderInput,
) {
  return apiRequest(`/api/donation-items/${itemId}/purchase-order`, {
    method: "POST",
    token,
    body,
  });
}

/** 송장 등록(1회) — 택배사·운송장번호 + (선택) 송장이미지·배송예정일 (step6) */
export function registerShipment(
  token: string,
  id: number,
  body: {
    courier: string;
    trackingNo: string;
    shipmentImageUrl?: string;
    expectedDeliveryAt?: string | null;
  },
) {
  return apiRequest(`/api/purchase-orders/${id}/shipment`, {
    method: "PATCH",
    token,
    body,
  });
}

/** 시설 수령확인 — 사람 1클릭 (step6 §8) */
export function confirmReceived(token: string, itemId: number) {
  return apiRequest(`/api/donation-items/${itemId}/receive`, {
    method: "POST",
    token,
  });
}
