import { Menu, UserRound } from "lucide-react";
import Button from "../../shared/ui/Button";
import logo from "../../../도안/haggyo-logo.png";

const navigation = [
  ["기부하기", "./detail/projects.html"],
  ["물품 둘러보기", "./detail/items.html"],
  ["참여 방법", "./detail/how.html"],
  ["영수증 안내", "./detail/receipt.html"],
];

const mobileMenuItems = [
  ["홈페이지 소개", "./detail/homepage-intro.html"],
  ["운영 요소", "./detail/operations.html"],
  ["의견 보내기", "./detail/feedback.html"],
];

export default function SiteHeader({ onPrimaryAction, onLogin }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#top" aria-label="학교매점 홈">
          <img src={logo} alt="학교 - 마음을 잇는 기부 플랫폼" />
          <span>학교매점</span>
        </a>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {navigation.map(([label, href]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <Button variant="ghost" className="login-link" aria-label="로그인" onClick={onLogin}>
            <UserRound size={18} aria-hidden="true" />
            <span>로그인</span>
          </Button>
          <Button onClick={onPrimaryAction}>프로젝트 참여하기</Button>
          <details className="mobile-menu">
            <summary aria-label="메뉴 열기">
              <Menu size={22} aria-hidden="true" />
            </summary>
            <nav aria-label="추가 메뉴">
              {mobileMenuItems.map(([label, href]) => (
                <a href={href} key={href}>{label}</a>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
