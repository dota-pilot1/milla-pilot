export type ItemCategory = "LEARNING" | "LIVING" | "HYGIENE";
export type ItemStatus = "RECRUITING" | "LOCKED" | "BUYING" | "SHIPPING";

export type DonationItem = {
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
};

export type CreateDonationItemInput = {
  facilityId: number;
  name: string;
  category: ItemCategory;
  note: string;
  reason: string;
  emoji: string;
  goalAmount: number;
  raisedAmount: number;
  targetQuantity: number | null;
  status: ItemStatus;
  deadline: string | null;
  displayOrder: number;
};

export type UpdateDonationItemInput = Omit<CreateDonationItemInput, "facilityId">;

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
};
