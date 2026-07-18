export type ItemCategory = "LEARNING" | "LIVING" | "HYGIENE";
export type ItemStatus =
  | "RECRUITING"
  | "LOCKED"
  | "BUYING"
  | "SHIPPING"
  | "RECEIVED"
  | "RECEIPTED";

export interface DonationItem {
  id: number;
  facilityId: number;
  name: string;
  category: ItemCategory;
  note: string | null;
  reason: string | null;
  emoji: string | null;
  goalAmount: number;
  raisedAmount: number;
  targetQuantity: number | null;
  status: ItemStatus;
  deadline: string | null;
  displayOrder: number;
}

export const ITEM_CATEGORY_LABEL: Record<ItemCategory, string> = {
  LEARNING: "학습용품",
  LIVING: "생활용품",
  HYGIENE: "위생용품",
};

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  RECRUITING: "모집중",
  LOCKED: "목표달성",
  BUYING: "통합 구매 진행",
  SHIPPING: "배송중",
  RECEIVED: "수령확인",
  RECEIPTED: "영수증 발급",
};

// Badge variant 매핑 (상태색은 Badge 단일 출처)
export const ITEM_STATUS_VARIANT: Record<
  ItemStatus,
  "recruiting" | "locked" | "buying" | "shipping" | "verified"
> = {
  RECRUITING: "recruiting",
  LOCKED: "locked",
  BUYING: "buying",
  SHIPPING: "shipping",
  RECEIVED: "shipping",
  RECEIPTED: "verified",
};
