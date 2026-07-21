import { ArrowRight, CheckCircle2, ClipboardCheck, HeartHandshake, ReceiptText, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";
import mark from "../../도안/haggyo-mark.png";
import ProjectCard from "../entities/project/ui/ProjectCard";
import ProductCatalog from "../features/catalog/ui/ProductCatalog";
import Badge from "../shared/ui/Badge";
import Button from "../shared/ui/Button";
import Progress from "../shared/ui/Progress";
import ReceiptStatus from "../widgets/receipt-status/ui/ReceiptStatus";
import SiteHeader from "../widgets/site-header/SiteHeader";

const flow = [
  { number: "01", icon: ClipboardCheck, title: "필요 물품 제출", text: "시설이 필요한 물품을 장바구니처럼 담아 요청합니다." },
  { number: "02", icon: ShieldCheck, title: "프로젝트 발행", text: "운영팀이 품목과 수량을 확인한 뒤 프로젝트로 공개합니다." },
  { number: "03", icon: ShoppingBag, title: "물품 선택 · 결제", text: "원하는 물품을 선택해 학교매점에서 결제합니다." },
  { number: "04", icon: Truck, title: "전달 · 확인", text: "물품이 시설에 도착하면 전달 상태를 확인할 수 있습니다." },
];

export default function App() {
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const selectionCount = selectedProductIds.length;
  function moveToItems() {
    window.location.assign("./detail/items.html");
  }

  function moveToHow() {
    window.location.assign("./detail/how.html");
  }

  function moveToProject(projectId = "school") {
    window.location.assign(`./detail/project.html?id=${projectId}`);
  }

  function moveToCart() {
    window.location.assign(`./detail/cart.html?items=${selectedProductIds.join(",")}`);
  }

  return (
    <div id="top" className="app-shell">
      <div className="prototype-banner" role="status">
        <span>UI 시연 화면</span>
        실제 결제·재고·영수증 데이터는 아직 연결되지 않았습니다.
      </div>
      <SiteHeader
        onPrimaryAction={moveToItems}
        onLogin={() => window.location.assign("./detail/login.html")}
      />
      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__content">
              <Badge tone="brand">함께하는 준비물 기부</Badge>
              <p className="kicker">학교 플랫폼과 함께하는 협력 매점</p>
              <h1>필요한 준비물을,<br /><em>필요한 아이에게</em></h1>
              <p className="hero__description">시설이 요청한 물품을 직접 선택하고 결제하면, 필요한 준비물이 아이들에게 전달됩니다.</p>
              <div className="hero__actions">
                <Button onClick={moveToItems}>물품 선택하기 <ArrowRight size={18} aria-hidden="true" /></Button>
                <Button variant="outline" onClick={moveToHow}>참여 방법 보기</Button>
              </div>
              <ul className="trust-list" aria-label="학교매점 이용 안내">
                <li><CheckCircle2 size={20} aria-hidden="true" /><span><strong>필요한 물품만</strong> 시설 요청 기준으로 안내</span></li>
                <li><CheckCircle2 size={20} aria-hidden="true" /><span><strong>결제부터 전달까지</strong> 상태를 차례로 확인</span></li>
              </ul>
            </div>
            <aside className="hero-project" aria-label="대표 프로젝트 안내">
              <div className="hero-project__topline">
                <Badge tone="info">진행 중</Badge>
                <span>대표 프로젝트</span>
              </div>
              <div className="hero-project__title-wrap">
                <img src={mark} alt="" />
                <div>
                  <p className="eyebrow">새 학기 준비</p>
                  <h2>아이들의 새 학기<br />준비물을 함께 채워요</h2>
                </div>
              </div>
              <p>필요한 의류, 신발, 가방을 골라 참여할 수 있습니다.</p>
              <div className="hero-project__progress">
                <div><span>준비물 채움 현황</span><strong>68%</strong></div>
                <Progress value={68} label="대표 프로젝트 준비물 채움 현황 68%" />
              </div>
              <div className="hero-project__footer">
                <span><HeartHandshake size={17} aria-hidden="true" /> 함께 채우는 중</span>
                <Button variant="ghost" onClick={() => moveToProject("school")}>자세히 보기 <ArrowRight size={16} aria-hidden="true" /></Button>
              </div>
            </aside>
          </div>
        </section>

        <div className="container page-content">
          <section className="section" id="projects" aria-labelledby="projects-title">
            <div className="section-heading section-heading--split">
              <div>
                <p className="kicker">이번 프로젝트</p>
                <h2 id="projects-title">지금 함께 채울 준비물이에요</h2>
                <p>필요한 이유와 물품 구성을 먼저 확인한 뒤 참여할 수 있습니다.</p>
              </div>
              <Badge tone="neutral">시연 데이터</Badge>
            </div>
            <div className="project-grid">
              <ProjectCard category="겨울 준비" title="따뜻한 외투 지원" description="추운 계절을 준비하는 아이들의 외투를 채워요." progress={74} tone="coral" onSelect={() => moveToProject("winter")} />
              <ProjectCard category="새 학기 준비" title="책가방과 실내화 채우기" description="새로운 시작에 필요한 기본 준비물을 모아요." progress={56} tone="mint" onSelect={() => moveToProject("school")} />
              <ProjectCard category="일상 지원" title="아이들의 편안한 하루" description="매일 사용하는 의류와 생활 준비물을 지원해요." progress={41} tone="sky" onSelect={() => moveToProject("daily")} />
            </div>
          </section>

          <ProductCatalog onSelectionChange={setSelectedProductIds} />

          <section className="selection-summary" aria-live="polite">
            <div><ShoppingBag size={21} aria-hidden="true" /><span>선택한 물품 <strong>{selectionCount}개</strong></span></div>
            <Button onClick={moveToCart} disabled={selectionCount === 0}>장바구니 확인하기</Button>
          </section>

          <section className="how-section" id="how-it-works" aria-labelledby="how-title">
            <div className="how-section__intro">
              <p className="kicker">참여 방법</p>
              <h2 id="how-title">어떻게 진행되나요?</h2>
              <p>학교매점은 물품이 필요한 곳과 참여자를 자연스럽게 연결합니다.</p>
            </div>
            <ol className="flow-grid">
              {flow.map(({ number, icon: Icon, title, text }) => (
                <li key={number}>
                  <span className="flow-number">{number}</span>
                  <span className="flow-icon"><Icon size={25} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <ReceiptStatus onViewHistory={() => window.location.assign("./detail/receipt.html")} />

          <section className="closing-cta">
            <div>
              <p className="kicker">작은 선택이 만드는 변화</p>
              <h2>필요한 준비물을 함께 채워주세요.</h2>
              <p>한 사람의 선택이 아이의 일상을 조금 더 든든하게 만듭니다.</p>
            </div>
            <Button onClick={moveToItems}>물품 선택하기 <ArrowRight size={18} aria-hidden="true" /></Button>
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>학교매점</span>
          <p>학교 플랫폼과 함께하는 협력 매점 · UI 시연 화면</p>
          <a href="#top">맨 위로</a>
        </div>
      </footer>
    </div>
  );
}
