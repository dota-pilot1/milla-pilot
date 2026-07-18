export interface PendingPurchaseItem {
  itemId: number;
  name: string;
  emoji: string | null;
  goalAmount: number;
  raisedAmount: number;
  facility: { id: number; name: string };
}

export type ItemStatus =
  | "RECRUITING"
  | "LOCKED"
  | "BUYING"
  | "SHIPPING"
  | "RECEIVED"
  | "RECEIPTED";

export interface AdminPurchaseOrder {
  id: number;
  vendor: string;
  vendorUrl: string | null;
  purchasedAmount: number;
  quantity: number | null;
  evidenceNo: string | null;
  evidenceFileUrl: string | null;
  courier: string | null;
  trackingNo: string | null;
  shipmentImageUrl: string | null;
  expectedDeliveryAt: string | null;
  shippedAt: string | null;
  orderedAt: string | null;
  item: { id: number; name: string; emoji: string | null; goalAmount: number; status: ItemStatus };
  facility: { id: number; name: string };
}

export interface CreatePurchaseOrderInput {
  vendor: string;
  vendorUrl?: string;
  purchasedAmount: number;
  quantity?: number | null;
  evidenceNo?: string;
  evidenceFileUrl?: string;
  note?: string;
  orderedAt?: string | null;
  // 송장(선택) — 구매 시점에 알면 함께
  courier?: string;
  trackingNo?: string;
  shipmentImageUrl?: string;
  expectedDeliveryAt?: string | null;
}
