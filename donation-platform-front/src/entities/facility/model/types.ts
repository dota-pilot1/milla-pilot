export type FacilityType = "ORPHANAGE" | "CHILD_CENTER";
export type FacilityStatus = "RECRUITING" | "BUYING" | "SHIPPING";

export interface Facility {
  id: number;
  code: string;
  name: string;
  region: string | null;
  type: FacilityType;
  description: string | null;
  status: FacilityStatus;
  verified: boolean;
  avatarInitial: string | null;
  displayOrder: number;
}

export const FACILITY_TYPE_LABEL: Record<FacilityType, string> = {
  ORPHANAGE: "아동양육시설",
  CHILD_CENTER: "지역아동센터",
};

export const FACILITY_STATUS_LABEL: Record<FacilityStatus, string> = {
  RECRUITING: "모집중",
  BUYING: "통합 구매 진행",
  SHIPPING: "배송중",
};

// Badge variant 매핑 (상태색은 Badge 단일 출처)
export const FACILITY_STATUS_VARIANT: Record<
  FacilityStatus,
  "recruiting" | "buying" | "shipping"
> = {
  RECRUITING: "recruiting",
  BUYING: "buying",
  SHIPPING: "shipping",
};
