import type { ItemCategory, ItemStatus } from "@/entities/donation-item/model/types";
import type { PurchaseOrder } from "@/entities/purchase-order/model/types";

export interface MyContribution {
  contributionId: number;
  myAmount: number;
  status: string;
  createdAt: string;
  item: {
    id: number;
    name: string;
    emoji: string | null;
    category: ItemCategory;
    status: ItemStatus;
    goalAmount: number;
    raisedAmount: number;
    note: string | null;
  };
  facility: {
    id: number;
    name: string;
    avatarInitial: string | null;
    region: string | null;
  };
  purchaseOrder: PurchaseOrder | null;
}

/** 물품별 참여 현황 (공개) — donorName 은 서버에서 마스킹된 값이다 */
export interface ItemContributionSummary {
  donorCount: number;
  recent: {
    donorName: string;
    amount: number;
    createdAt: string;
  }[];
}
