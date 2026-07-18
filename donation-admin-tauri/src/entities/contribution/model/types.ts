export interface AdminContribution {
  id: number;
  amount: number;
  createdAt: string;
  donor: {
    id: number;
    username: string;
    email: string;
  };
}

/** 전체 후원 내역 행 (후원자 + 시설 + 물품) */
export interface AdminLedgerRow {
  id: number;
  amount: number;
  createdAt: string;
  donor: { id: number; username: string; email: string };
  facility: { id: number; name: string };
  item: { id: number; name: string; emoji: string | null };
}
