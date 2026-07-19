import { api } from "@/shared/api/axios";
import type { PublicPurchaseMonitoring, PublicPurchaseOrder, PurchaseOrder } from "../model/types";

export const purchaseOrderApi = {
  /** 물품의 통합구매 조회 — 아직 구매 전이면 서버가 204 → null */
  getByItem: (itemId: number) =>
    api
      .get<PurchaseOrder>(`/api/donation-items/${itemId}/purchase-order`)
      .then((r) => (r.status === 204 ? null : r.data)),
  getPublicAll: () =>
    api.get<PublicPurchaseOrder[]>("/api/public/purchase-orders").then((r) => r.data),
  getPublicMonitoring: () =>
    api
      .get<PublicPurchaseMonitoring[]>("/api/public/purchase-monitoring")
      .then((r) => r.data),
};
