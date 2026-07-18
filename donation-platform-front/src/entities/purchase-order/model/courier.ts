/**
 * 택배사 레지스트리 (step6 Phase1).
 * id = tracker.delivery carrier id — 집계 딥링크(단일 조회 페이지)로 전 택배사 커버.
 * 개별 택배사 API를 붙이지 않는다(계획 §3).
 */
export interface Courier {
  id: string;
  label: string;
}

export const COURIERS: Courier[] = [
  { id: "kr.cjlogistics", label: "CJ대한통운" },
  { id: "kr.epost", label: "우체국택배" },
  { id: "kr.hanjin", label: "한진택배" },
  { id: "kr.lotte", label: "롯데택배" },
  { id: "kr.logen", label: "로젠택배" },
  { id: "kr.kdexp", label: "경동택배" },
];

export const courierLabel = (id: string | null) =>
  COURIERS.find((c) => c.id === id)?.label ?? id ?? "택배사";

/** 통합 배송조회 딥링크 — 새 탭/드로워로 연다. */
export const trackingUrl = (courier: string, trackingNo: string) =>
  `https://tracker.delivery/#/${courier}/${trackingNo}`;
