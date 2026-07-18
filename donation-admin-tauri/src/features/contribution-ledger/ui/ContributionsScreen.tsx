import { useEffect, useState } from "react";
import { ReceiptText } from "lucide-react";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "../../../shared/ui/DataTable";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { fetchAllContributions } from "../../../entities/contribution/api/contributionApi";
import type { AdminLedgerRow } from "../../../entities/contribution/model/types";

const won = (n: number) => n.toLocaleString("ko-KR") + "원";
const dateFmt = (iso: string) => new Date(iso).toLocaleString("ko-KR");

export function ContributionsScreen({ token }: { token: string }) {
  const [rows, setRows] = useState<AdminLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchAllContributions(token)
      .then((data) => {
        setRows(data);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "후원 내역을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <main className="workspace-page space-y-5">
      <section className="workspace-hero">
        <div className="workspace-hero-mark">
          <ReceiptText size={26} />
        </div>
        <p className="eyebrow">DonationPlatform Admin</p>
        <h1>후원 내역</h1>
        <p>플랫폼 전체 후원 기록(기부 원장)입니다. 후원자·시설·물품·금액을 최신순으로 확인합니다.</p>
      </section>

      <Panel>
        <PanelHeader
          title={`전체 후원 · ${rows.length}건`}
          description={rows.length ? `누적 ${won(total)}` : undefined}
        />

        {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
        {loading ? (
          <p className="text-[13px] text-zinc-500">불러오는 중...</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="아직 후원 내역이 없습니다."
            description="후원자가 참여하면 여기에 표시됩니다."
          />
        ) : (
          <DataTable>
            <DataTableHead>
              <tr>
                <DataTableHeaderCell>후원자</DataTableHeaderCell>
                <DataTableHeaderCell>시설 · 물품</DataTableHeaderCell>
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
                  <DataTableCell>
                    <div className="font-medium text-zinc-900">
                      {c.item.emoji} {c.item.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">{c.facility.name}</div>
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
        )}
      </Panel>
    </main>
  );
}
