# Donation Admin

DonationPlatform 관리자 전용 Tauri 데스크톱 앱입니다.

`towercrane-dev-interview`의 Tauri 2 + Vite + React 구조, 로그인 화면, 사이드바, 헤드바, 창 컨트롤, 업데이트 패널 패턴을 기반으로 만들었습니다.

서버는 `/Users/terecal/milla-pilot/donation-platform-server`를 기준으로 사용합니다. 기본 API URL은 `http://localhost:4301`입니다.

## 개발 실행

```bash
npm install
npm run dev
```

서버 실행:

```bash
npm run server:dev
```

Tauri 앱 실행:

```bash
npm run tauri dev
```

## 현재 메뉴

- 백엔드 DB 메뉴(`/api/menus`) 기반 사이드바
- 후원 관리
- 시스템 관리
- 프로필
- 설정
