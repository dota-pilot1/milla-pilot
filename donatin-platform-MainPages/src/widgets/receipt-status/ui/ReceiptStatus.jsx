import { Check, FileText, PackageCheck, Send } from "lucide-react";
import Badge from "../../../shared/ui/Badge";
import Button from "../../../shared/ui/Button";

const steps = [
  { label: "구매영수증 발행", icon: FileText, state: "complete" },
  { label: "시설로 전송", icon: Send, state: "complete" },
  { label: "시설 확인", icon: PackageCheck, state: "current" },
  { label: "기부영수증 처리", icon: Check, state: "pending" },
];

export default function ReceiptStatus({ onViewHistory }) {
  return (
    <section className="receipt-section" id="receipt" aria-labelledby="receipt-title">
      <div className="receipt-intro">
        <p className="kicker">참여 후에도 한눈에</p>
        <h2 id="receipt-title">영수증과 전달 상태를<br />차분히 확인하세요</h2>
        <p>구매영수증이 시설에 전달된 뒤, 시설의 확인 절차를 거쳐 기부영수증이 처리됩니다.</p>
        <Button variant="outline" onClick={onViewHistory}>내 참여 내역 보기</Button>
      </div>
      <div className="receipt-card">
        <div className="receipt-card__header">
          <div>
            <p className="eyebrow">참여 내역 예시</p>
            <h3>선택한 물품의 진행 상태</h3>
          </div>
          <Badge tone="notice">시설 확인 필요</Badge>
        </div>
        <ol className="receipt-timeline">
          {steps.map(({ label, icon: Icon, state }, index) => (
            <li className={`receipt-step receipt-step--${state}`} key={label}>
              <span className="receipt-step__line" aria-hidden="true" />
              <span className="receipt-step__icon"><Icon size={20} aria-hidden="true" /></span>
              <strong>{label}</strong>
              <small>{index < 2 ? "완료" : index === 2 ? "진행 중" : "확인 후 처리"}</small>
            </li>
          ))}
        </ol>
        <p className="receipt-disclaimer">기부영수증 발급 여부와 시점은 시설의 확인 절차 및 자격에 따라 달라질 수 있습니다.</p>
      </div>
    </section>
  );
}
