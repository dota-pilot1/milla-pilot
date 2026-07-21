import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Building2,
  CreditCard,
  Heart,
  Home,
  Landmark,
  LogIn,
  Menu,
  MessageSquare,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import "./detail.css";

const base = "./";

const projectData = {
  winter: {
    category: "겨울 준비",
    title: "따뜻한 외투 지원",
    description: "추운 계절을 준비하는 아이들에게 꼭 맞는 외투를 전합니다.",
    progress: 74,
    color: "coral",
    items: ["패딩 점퍼", "기모 상의", "겨울 운동화"],
    facility: "해솔 지역아동센터",
  },
  school: {
    category: "새 학기 준비",
    title: "책가방과 실내화 채우기",
    description: "새로운 시작에 필요한 기본 준비물을 아이들에게 전달합니다.",
    progress: 56,
    color: "mint",
    items: ["책가방", "실내화", "필통과 학용품"],
    facility: "늘봄 지역아동센터",
  },
  daily: {
    category: "일상 지원",
    title: "아이들의 편안한 하루",
    description: "매일 사용하는 의류와 생활 준비물을 지원합니다.",
    progress: 41,
    color: "sky",
    items: ["운동화", "양말 세트", "편한 상의"],
    facility: "한울 지역아동센터",
  },
};

const productData = [
  { id: "coat", name: "따뜻한 겨울 외투", category: "의류", project: "winter", price: 29000, description: "아이의 겨울 외출을 위한 기본 외투입니다." },
  { id: "sneakers", name: "편안한 이동화", category: "신발", project: "daily", price: 36000, description: "등하교와 야외 활동에 사용하는 운동화입니다." },
  { id: "indoor", name: "가벼운 실내화", category: "신발", project: "school", price: 14000, description: "학교에서 편하게 신을 수 있는 실내화입니다." },
  { id: "backpack", name: "새 학기 책가방", category: "가방", project: "school", price: 42000, description: "교재와 준비물을 담는 새 학기 책가방입니다." },
  { id: "sweatshirt", name: "활동하기 좋은 상의", category: "의류", project: "daily", price: 24000, description: "일상에서 편하게 입을 수 있는 상의입니다." },
];

function go(path) {
  window.location.assign(`${base}${path}`);
}

function DetailHeader({ current = "" }) {
  const nav = [
    ["프로젝트", "projects.html", "projects"],
    ["물품 둘러보기", "items.html", "items"],
    ["참여 방법", "how.html", "how"],
    ["영수증 안내", "receipt.html", "receipt"],
  ];

  return (
    <header className="detail-header">
      <div className="detail-container detail-header__inner">
        <a className="detail-brand" href="../index.html" aria-label="학교매점 메인으로">
          <span className="detail-brand__mark">학교</span>
          <strong>학교매점</strong>
        </a>
        <nav className="detail-nav" aria-label="상세 화면 메뉴">
          {nav.map(([label, href, key]) => <a className={current === key ? "is-active" : ""} href={href} key={href}>{label}</a>)}
        </nav>
        <div className="detail-header__actions">
          <a className="detail-icon-link" href="login.html" aria-label="로그인"><UserRound size={18} /></a>
          <a className="detail-header__cta" href="items.html">물품 선택하기 <ArrowRight size={16} /></a>
        </div>
      </div>
    </header>
  );
}

function PageHeading({ eyebrow, title, description, back = true, children }) {
  return (
    <section className="detail-page-heading">
      {back && <a className="detail-back-link" href="../index.html"><ArrowLeft size={16} /> 메인으로</a>}
      <p className="detail-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </section>
  );
}

function DetailLayout({ children, current }) {
  return <><DetailHeader current={current} /><main className="detail-container detail-page">{children}</main><Footer /></>;
}

function Footer() {
  return <footer className="detail-footer"><div className="detail-container"><strong>학교매점</strong><span>필요한 준비물이 아이들에게 닿도록 연결합니다.</span><a href="../index.html">메인 화면</a></div></footer>;
}

function ProjectTile({ projectKey, compact = false }) {
  const project = projectData[projectKey];
  return (
    <article className={`detail-project-card detail-project-card--${project.color} ${compact ? "is-compact" : ""}`}>
      <div className="detail-project-card__top"><span>{project.category}</span><span className="detail-status">진행 중</span></div>
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <div className="detail-progress-label"><span>준비물 채움 현황</span><strong>{project.progress}%</strong></div>
      <div className="detail-progress" aria-label={`${project.title} 준비물 채움 현황 ${project.progress}%`}><span style={{ width: `${project.progress}%` }} /></div>
      <a className="detail-outline-button" href={`project.html?id=${projectKey}`}>프로젝트 보기 <ArrowRight size={16} /></a>
    </article>
  );
}

function ProjectsPage() {
  return <DetailLayout current="projects"><PageHeading eyebrow="이번 프로젝트" title="필요한 준비물을 확인하고 참여하세요" description="시설의 요청과 준비물 구성을 먼저 살펴본 뒤, 원하는 프로젝트에 참여할 수 있습니다." /><section className="detail-project-grid">{Object.keys(projectData).map((key) => <ProjectTile projectKey={key} key={key} />)}</section><section className="detail-info-band"><PackageCheck size={25} /><div><strong>프로젝트는 시설의 요청을 바탕으로 구성됩니다.</strong><p>물품별 수량과 전달 상태는 프로젝트 화면에서 확인할 수 있습니다.</p></div><a href="items.html">물품 고르기 <ArrowRight size={16} /></a></section></DetailLayout>;
}

function ProjectDetailPage() {
  const id = new URLSearchParams(window.location.search).get("id");
  const project = projectData[id] || projectData.school;
  return <DetailLayout current="projects"><PageHeading eyebrow={project.category} title={project.title} description={project.description}><span className="detail-status detail-status--large">진행 중</span></PageHeading><section className="detail-project-hero"><div className={`detail-project-hero__art detail-project-hero__art--${project.color}`}><Heart size={58} strokeWidth={1.2} /></div><div><p className="detail-label">연결 시설</p><h2>{project.facility}</h2><p>시설에서 요청한 준비물 중 필요한 항목을 선택해 참여할 수 있습니다. 선택한 물품은 장바구니에서 다시 확인됩니다.</p><dl className="detail-stat-list"><div><dt>준비물 채움 현황</dt><dd>{project.progress}%</dd></div><div><dt>요청 물품</dt><dd>{project.items.length}종</dd></div><div><dt>전달 방식</dt><dd>시설 직접 전달</dd></div></dl></div></section><section className="detail-section"><div className="detail-section__heading"><div><p className="detail-eyebrow">필요한 준비물</p><h2>이 프로젝트에 필요한 물품</h2></div><a href={`items.html?project=${id || "school"}`}>모두 선택하기 <ArrowRight size={16} /></a></div><div className="detail-needed-grid">{project.items.map((item, index) => <article key={item}><span>0{index + 1}</span><h3>{item}</h3><p>시설 요청을 확인해 준비한 물품입니다.</p></article>)}</div></section><section className="detail-callout"><div><ReceiptText size={24} /><div><strong>구매와 전달 상태는 참여 내역에서 확인할 수 있습니다.</strong><p>실제 결제와 영수증 발급은 연결 전인 UI 시연 화면입니다.</p></div></div><a className="detail-primary-button" href={`items.html?project=${id || "school"}`}>이 프로젝트 참여하기 <ArrowRight size={16} /></a></section></DetailLayout>;
}

function ItemsPage() {
  const [category, setCategory] = useState("전체");
  const [selected, setSelected] = useState([]);
  const [saved, setSaved] = useState([]);
  const project = new URLSearchParams(window.location.search).get("project");
  const visible = useMemo(() => productData.filter((item) => (category === "전체" || item.category === category) && (!project || item.project === project)), [category, project]);
  function toggleSelection(id) { setSelected((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]); }
  function toggleSaved(id) { setSaved((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]); }
  return <DetailLayout current="items"><PageHeading eyebrow="필요한 물품" title={project ? `${projectData[project]?.title || "프로젝트"}에 필요한 물품` : "직접 고르고 필요한 곳에 보내세요"} description="물품을 선택하면 장바구니에서 선택 내용과 전달 절차를 확인할 수 있습니다." /><section className="detail-filter-panel"><div role="group" aria-label="물품 카테고리">{["전체", "의류", "신발", "가방"].map((item) => <button className={category === item ? "is-selected" : ""} onClick={() => setCategory(item)} type="button" key={item}>{item}</button>)}</div><span>선택한 물품은 이 화면에서만 임시로 표시됩니다.</span></section><section className="detail-product-grid">{visible.map((item) => <article className="detail-product-card" key={item.id}><div className="detail-product-card__visual"><ShoppingBag size={41} strokeWidth={1.25} /><button className={saved.includes(item.id) ? "is-saved" : ""} aria-label={`${item.name} 관심 물품에 담기`} onClick={() => toggleSaved(item.id)} type="button"><Heart size={18} fill={saved.includes(item.id) ? "currentColor" : "none"} /></button></div><div><p className="detail-label">{item.category}</p><h2>{item.name}</h2><p>{item.description}</p><button className={selected.includes(item.id) ? "detail-select-button is-selected" : "detail-select-button"} onClick={() => toggleSelection(item.id)} type="button"><Check size={16} />{selected.includes(item.id) ? "선택 완료" : "물품 선택하기"}</button></div></article>)}</section>{visible.length === 0 && <div className="detail-empty"><Search size={24} /><strong>해당 프로젝트에 연결된 물품이 없습니다.</strong><a href="items.html">전체 물품 보기</a></div>}<aside className="detail-selection-bar"><div><ShoppingBag size={20} /><span>선택한 물품 <strong>{selected.length}개</strong></span></div><a className={selected.length ? "detail-primary-button" : "detail-primary-button is-disabled"} href={selected.length ? `cart.html?items=${selected.join(",")}` : undefined} aria-disabled={!selected.length}>장바구니 확인하기 <ArrowRight size={16} /></a></aside></DetailLayout>;
}

function CartPage() {
  const requested = new URLSearchParams(window.location.search).get("items")?.split(",").filter(Boolean) || ["coat", "backpack"];
  const initial = requested.map((id) => productData.find((item) => item.id === id)).filter(Boolean);
  const [items, setItems] = useState(initial);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentAgreed, setPaymentAgreed] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const formattedTotal = new Intl.NumberFormat("ko-KR").format(total);
  function remove(id) { setItems((previous) => previous.filter((item) => item.id !== id)); }
  function completePayment() { setPaymentCompleted(true); setPaymentOpen(false); }

  return <DetailLayout><PageHeading eyebrow="장바구니" title="선택한 물품을 확인하고 결제하세요" description="가상 결제 화면에서만 결제 흐름을 시연합니다. 실제 청구나 결제 정보 전송은 발생하지 않습니다." /><div className="detail-cart-layout"><section className="detail-cart-list">{items.length ? items.map((item) => <article key={item.id}><div className="detail-cart-icon"><ShoppingBag size={23} /></div><div><p className="detail-label">{item.category} · {projectData[item.project].title}</p><h2>{item.name}</h2><p>{item.description}</p><strong className="detail-item-price">{new Intl.NumberFormat("ko-KR").format(item.price)}원</strong></div><button aria-label={`${item.name} 장바구니에서 삭제`} onClick={() => remove(item.id)} type="button" disabled={paymentCompleted}>삭제</button></article>) : <div className="detail-empty"><ShoppingBag size={24} /><strong>장바구니가 비어 있습니다.</strong><a href="items.html">물품 고르기</a></div>}</section><aside className="detail-order-summary"><p className="detail-label">결제 요약</p><h2>가상 결제 준비</h2><dl><div><dt>선택한 물품</dt><dd>{items.length}개</dd></div><div><dt>결제 금액</dt><dd>{formattedTotal}원</dd></div><div><dt>전달 방식</dt><dd>시설 직접 전달</dd></div><div><dt>상태 확인</dt><dd>참여 내역</dd></div></dl><p>가상 결제는 화면 안에서만 처리됩니다. 실제 카드, 계좌, 간편결제 정보는 입력하거나 전송하지 않습니다.</p><button className="detail-primary-button" disabled={!items.length || paymentCompleted} onClick={() => setPaymentOpen(true)} type="button">{paymentCompleted ? "가상 결제 완료" : "가상 결제 진행하기"} <CreditCard size={16} /></button>{paymentCompleted && <div className="detail-success"><Check size={17} />가상 결제 완료 · 결제 번호 VM-20260721-{items.length}</div>}</aside></div>{paymentOpen && <div className="detail-payment-backdrop" role="presentation"><section className="detail-payment-dialog" aria-labelledby="virtual-payment-title" aria-modal="true" role="dialog"><button className="detail-dialog-close" aria-label="가상 결제 창 닫기" onClick={() => setPaymentOpen(false)} type="button"><X size={19} /></button><p className="detail-eyebrow">가상 결제</p><h2 id="virtual-payment-title">결제수단을 선택하세요</h2><p>실제 결제가 발생하지 않는 화면 시연입니다.</p><div className="detail-payment-amount"><span>결제 예정 금액</span><strong>{formattedTotal}원</strong></div><div className="detail-payment-methods" role="radiogroup" aria-label="가상 결제수단">{[["card", "가상 카드", CreditCard, "테스트 카드 4242로 승인합니다."], ["wallet", "가상 간편결제", WalletCards, "간편결제 승인 화면을 시연합니다."], ["account", "가상 계좌", Landmark, "입금 확인 완료 상태를 시연합니다."]].map(([id, label, Icon, description]) => <label className={paymentMethod === id ? "is-selected" : ""} key={id}><input checked={paymentMethod === id} name="payment-method" onChange={() => setPaymentMethod(id)} type="radio" value={id} /><Icon size={20} /><span><strong>{label}</strong><small>{description}</small></span></label>)}</div><label className="detail-payment-agreement"><input checked={paymentAgreed} onChange={(event) => setPaymentAgreed(event.target.checked)} type="checkbox" /><span>가상 결제이며 실제 청구가 없음을 확인했습니다.</span></label><button className="detail-primary-button detail-payment-submit" disabled={!paymentAgreed} onClick={completePayment} type="button">{formattedTotal}원 가상 결제 승인 <Check size={16} /></button></section></div>}</DetailLayout>;
}

function HowPage() {
  const steps = [[ClipboardCheck, "필요 물품 요청", "시설이 필요한 물품을 목록으로 요청합니다."], [PackageCheck, "프로젝트 공개", "요청 내용과 수량을 확인해 프로젝트로 공개합니다."], [ShoppingBag, "물품 선택", "참여자는 원하는 물품을 장바구니에 담습니다."], [Truck, "전달과 확인", "시설에 전달된 뒤 참여 내역에서 상태를 확인합니다."]];
  const [open, setOpen] = useState(0);
  return <DetailLayout current="how"><PageHeading eyebrow="참여 방법" title="물품 선택부터 전달 확인까지" description="학교매점은 필요한 준비물과 참여자를 자연스럽게 연결하는 흐름을 제공합니다." /><section className="detail-flow-list">{steps.map(([Icon, title, text], index) => <article className={open === index ? "is-open" : ""} key={title}><button onClick={() => setOpen(index)} type="button"><span>0{index + 1}</span><Icon size={22} /><strong>{title}</strong><ChevronDown size={19} /></button>{open === index && <p>{text}</p>}</article>)}</section><section className="detail-notice-grid"><article><CircleHelp size={22} /><h2>물품은 어떻게 전달되나요?</h2><p>선택한 물품은 프로젝트에 연결된 시설로 직접 전달되는 흐름으로 안내됩니다.</p></article><article><ReceiptText size={22} /><h2>참여 내역은 어디서 보나요?</h2><p>영수증 안내 화면에서 구매 접수부터 시설 확인까지의 상태 예시를 볼 수 있습니다.</p></article></section><a className="detail-primary-button detail-wide-cta" href="items.html">물품 선택하러 가기 <ArrowRight size={16} /></a></DetailLayout>;
}

function ReceiptPage() {
  const [searched, setSearched] = useState(false);
  const steps = [[ReceiptText, "구매 접수", "완료"], [Truck, "시설로 전송", "완료"], [PackageCheck, "시설 확인", "진행 중"], [Check, "기부 영수증", "확인 후 처리"]];
  return <DetailLayout current="receipt"><PageHeading eyebrow="영수증과 전달 상태" title="참여 이후의 흐름을 확인하세요" description="구매 접수부터 시설 확인, 영수증 처리까지의 과정을 한곳에서 안내합니다." /><section className="detail-receipt-lookup"><div><p className="detail-label">참여 내역 조회</p><h2>참여 번호로 상태를 확인하세요</h2><p>이 화면은 UI 시연입니다. 실제 참여 내역과 연결되어 있지 않습니다.</p></div><form onSubmit={(event) => { event.preventDefault(); setSearched(true); }}><label htmlFor="participation-id">참여 번호</label><div><input id="participation-id" placeholder="예: HAGGYO-2026-001" /><button type="submit"><Search size={16} />조회</button></div>{searched && <p className="detail-form-notice">시연 화면에서는 예시 상태만 표시됩니다.</p>}</form></section><section className="detail-receipt-card"><div className="detail-receipt-card__heading"><div><p className="detail-label">참여 내역 예시</p><h2>선택한 물품의 진행 상태</h2></div><span className="detail-status detail-status--notice">시설 확인 필요</span></div><ol>{steps.map(([Icon, label, state], index) => <li className={index < 2 ? "is-complete" : index === 2 ? "is-current" : ""} key={label}><span><Icon size={18} /></span><strong>{label}</strong><small>{state}</small></li>)}</ol><p>기부 영수증 발급 여부와 시점은 시설의 확인 및 자격 요건에 따라 달라질 수 있습니다.</p></section><section className="detail-callout"><div><CircleHelp size={24} /><div><strong>참여 내역은 로그인 후 더 정확하게 확인할 수 있습니다.</strong><p>로그인 기능 역시 현재는 화면 시연 상태입니다.</p></div></div><a className="detail-outline-button" href="login.html">로그인 화면 보기 <LogIn size={16} /></a></section></DetailLayout>;
}

function LoginPage() {
  const [submitted, setSubmitted] = useState(false);
  return <DetailLayout><section className="detail-login"><div className="detail-login__intro"><p className="detail-eyebrow">참여 내역 확인</p><h1>로그인하고<br />참여 상태를 확인하세요</h1><p>선택한 물품, 전달 상태, 영수증 안내를 한곳에서 확인할 수 있습니다.</p><a href="receipt.html">영수증 안내 보기 <ArrowRight size={16} /></a></div><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><p className="detail-label">로그인</p><h2>학교매점 계정으로 계속하기</h2><label htmlFor="email">이메일</label><input id="email" type="email" placeholder="name@example.com" required /><label htmlFor="password">비밀번호</label><input id="password" type="password" placeholder="비밀번호를 입력하세요" required /><button className="detail-primary-button" type="submit">로그인 <LogIn size={16} /></button>{submitted && <p className="detail-form-notice">UI 시연 화면이므로 실제 로그인이 진행되지는 않습니다.</p>}<a className="detail-text-action" href="../index.html">계정 없이 메인 화면 둘러보기</a></form></section></DetailLayout>;
}

function MenuPage() {
  const links = [["홈페이지 소개", "homepage-intro.html", Home], ["운영 요소", "operations.html", Building2], ["의견 보내기", "feedback.html", MessageSquare]];
  return <DetailLayout><PageHeading eyebrow="메뉴" title="원하는 항목으로 이동하세요" description="모바일 메뉴에서 사용할 수 있는 전체 이동 경로입니다." /><nav className="detail-menu-list" aria-label="전체 메뉴">{links.map(([label, href, Icon]) => <a href={href} key={href}><span><Icon size={20} />{label}</span><ArrowRight size={18} /></a>)}</nav><a className="detail-back-home" href="../index.html"><Home size={16} />메인 화면으로 돌아가기</a></DetailLayout>;
}

function HomepageIntroPage() {
  return <DetailLayout><PageHeading eyebrow="홈페이지 소개" title="필요한 준비물을 필요한 아이에게" description="학교매점은 시설의 요청과 참여자의 선택을 연결하는 기부 참여 화면입니다." /><section className="detail-intro-hero"><div><Heart size={38} /><h2>선택이 아이의 일상에 닿도록</h2><p>시설이 필요로 하는 준비물을 먼저 확인하고, 참여자가 원하는 물품을 골라 기부할 수 있는 흐름을 안내합니다.</p></div><dl><div><dt>확인</dt><dd>필요 물품과 프로젝트를 살펴봅니다.</dd></div><div><dt>선택</dt><dd>원하는 물품을 장바구니에 담습니다.</dd></div><div><dt>확인</dt><dd>전달 상태와 영수증 안내를 확인합니다.</dd></div></dl></section><section className="detail-notice-grid"><article><ShoppingBag size={22} /><h2>물품 중심 참여</h2><p>프로젝트에 필요한 준비물을 직접 골라 참여하는 흐름을 제공합니다.</p></article><article><ReceiptText size={22} /><h2>상태 안내</h2><p>결제 이후 전달과 확인 절차를 참여 내역 화면에서 안내합니다.</p></article></section><a className="detail-primary-button detail-wide-cta" href="items.html">기부할 물품 고르기 <ArrowRight size={16} /></a></DetailLayout>;
}

function OperationsPage() {
  const operations = [["시설 요청", "시설이 필요한 물품과 수량을 요청합니다."], ["프로젝트 구성", "요청된 물품을 확인해 참여 가능한 프로젝트로 구성합니다."], ["물품 선택", "참여자가 필요한 물품을 선택하고 가상 결제 흐름을 진행합니다."], ["전달 확인", "시설 전달과 확인 상태를 참여 내역에서 안내합니다."]];
  return <DetailLayout><PageHeading eyebrow="운영 요소" title="기부가 연결되는 운영 흐름" description="각 단계는 필요한 준비물과 참여자를 안전하게 연결하기 위한 화면 흐름입니다." /><section className="detail-operation-list">{operations.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{description}</p></div></article>)}</section><section className="detail-info-band"><Building2 size={25} /><div><strong>실제 주문, 재고, 전달 데이터는 아직 연결되지 않았습니다.</strong><p>현재 화면은 운영 과정을 설명하는 UI 시연입니다.</p></div></section></DetailLayout>;
}

function FeedbackPage() {
  const [category, setCategory] = useState("사용 경험");
  const [submitted, setSubmitted] = useState(false);
  return <DetailLayout><PageHeading eyebrow="의견 보내기" title="더 나은 기부 경험을 위한 의견" description="불편했던 점, 필요한 기능, 개선 아이디어를 남겨 주세요." /><section className="detail-feedback-layout"><div className="detail-feedback-intro"><MessageSquare size={29} /><h2>여러분의 의견을 듣습니다</h2><p>제출한 의견은 현재 브라우저 화면에서만 확인됩니다. 외부로 전송되거나 저장되지 않습니다.</p></div><form className="detail-feedback-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><fieldset><legend>의견 유형</legend><div>{["사용 경험", "기능 제안", "오류 제보"].map((item) => <button className={category === item ? "is-selected" : ""} onClick={() => setCategory(item)} type="button" key={item}>{item}</button>)}</div></fieldset><label htmlFor="feedback-message">의견 내용</label><textarea id="feedback-message" placeholder="의견을 입력해 주세요." required rows="6" /><button className="detail-primary-button" type="submit">의견 제출하기 <ArrowRight size={16} /></button>{submitted && <p className="detail-success"><Check size={17} />의견 제출 시연이 완료되었습니다.</p>}</form></section></DetailLayout>;
}

function NotFoundPage() {
  return <DetailLayout><div className="detail-empty detail-empty--page"><Menu size={28} /><strong>요청한 상세 화면을 찾을 수 없습니다.</strong><a href="projects.html">프로젝트 목록으로</a></div></DetailLayout>;
}

const pageName = window.location.pathname.split("/").pop();
const Page = ({
  "projects.html": ProjectsPage,
  "project.html": ProjectDetailPage,
  "items.html": ItemsPage,
  "cart.html": CartPage,
  "how.html": HowPage,
  "receipt.html": ReceiptPage,
  "login.html": LoginPage,
  "menu.html": MenuPage,
  "homepage-intro.html": HomepageIntroPage,
  "operations.html": OperationsPage,
  "feedback.html": FeedbackPage,
})[pageName] || NotFoundPage;

createRoot(document.getElementById("root")).render(<Page />);
