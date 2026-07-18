import { useEffect, useState } from "react";
import { Drawer } from "../../../shared/ui/Drawer";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "../../../shared/ui/DataTable";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { fetchItemContributions } from "../../../entities/contribution/api/contributionApi";
import type { AdminContribution } from "../../../entities/contribution/model/types";
import type { DonationItem } from "../../../entities/donation-item/model/types";

const won = (n: number) => n.toLocaleString("ko-KR") + "원";
const dateFmt = (iso: string) => new Date(iso).toLocaleString("ko-KR");

export function ContributionLedgerDrawer({
  token,
  item,
  onClose,
}: {
  token: string;
  item: DonationItem | null;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<AdminContribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    setError("");
    fetchItemContributions(token, item.id)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : "후원 내역을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [item, token]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Drawer
      open={item != null}
      title={item ? `${item.name} · 후원 내역` : "후원 내역"}
      description="이 물품에 참여한 후원자 목록(기부 원장)입니다."
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
      {loading ? (
        <p className="text-[13px] text-zinc-500">불러오는 중...</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="아직 후원이 없습니다."
          description="후원자가 참여하면 여기에 표시됩니다."
        />
      ) : (
        <>
          <DataTable>
            <DataTableHead>
              <tr>
                <DataTableHeaderCell>후원자</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">금액</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">일시</DataTableHeaderCell>
              </tr>
            </DataTableHead>
            <tbody>
              {rows.map((c) => (
                <DataTableRow key={c.id}>
                  <DataTableCell>
                    <div className="font-bold text-zinc-900">{c.donor.username}</div>
                    <div className="text-[11px] text-zinc-400">{c.donor.email}</div>
                  </DataTableCell>
                  <DataTableCell className="text-right font-bold text-zinc-900">
                    {won(c.amount)}
                  </DataTableCell>
                  <DataTableCell className="text-right text-zinc-500">
                    {dateFmt(c.createdAt)}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 px-1 pt-3 text-[13px]">
            <span className="text-zinc-500">합계 · {rows.length}명</span>
            <span className="font-bold text-zinc-900">{won(total)}</span>
          </div>
        </>
      )}
    </Drawer>
  );
}
