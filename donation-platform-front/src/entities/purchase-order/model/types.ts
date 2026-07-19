import type { ItemStatus } from "@/entities/donation-item/model/types";

export interface PurchaseOrder {
  id: number;
  donationItemId: number;
  vendor: string;
  vendorUrl: string | null;
  purchasedAmount: number;
  quantity: number | null;
  evidenceNo: string | null;
  evidenceFileUrl: string | null;
  note: string | null;
  courier: string | null;
  trackingNo: string | null;
  shipmentImageUrl: string | null;
  expectedDeliveryAt: string | null;
  shippedAt: string | null;
  orderedAt: string | null;
  createdAt: string;
}

export interface PublicPurchaseOrder {
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
  item: {
    id: number;
    name: string;
    emoji: string | null;
    goalAmount: number;
    status: ItemStatus;
  };
  facility: {
    id: number;
    name: string;
  };
}

export type PublicPurchasePhase =
  | "PENDING_PURCHASE"
  | "PURCHASE_COMPLETED"
  | "SHIPPING"
  | "RECEIVED";

export interface PublicPurchaseMonitoring {
  itemId: number;
  purchaseOrderId: number | null;
  phase: PublicPurchasePhase;
  vendor: string | null;
  vendorUrl: string | null;
  purchasedAmount: number | null;
  quantity: number | null;
  evidenceNo: string | null;
  evidenceFileUrl: string | null;
  courier: string | null;
  trackingNo: string | null;
  shipmentImageUrl: string | null;
  expectedDeliveryAt: string | null;
  shippedAt: string | null;
  orderedAt: string | null;
  item: {
    id: number;
    name: string;
    emoji: string | null;
    goalAmount: number;
    raisedAmount: number;
    status: ItemStatus;
  };
  facility: {
    id: number;
    name: string;
  };
}
