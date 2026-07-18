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
