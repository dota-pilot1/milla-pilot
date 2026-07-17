export const formatKRW = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 달성률 0~100 (목표 0이면 0) */
export const pctOf = (raised: number, goal: number) =>
  goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
