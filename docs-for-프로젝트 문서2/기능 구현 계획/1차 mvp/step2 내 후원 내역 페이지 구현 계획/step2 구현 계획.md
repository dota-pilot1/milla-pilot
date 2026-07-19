# Step 2 — 후원 참여 기록 + 내 후원 내역 + 상태 타임라인

**목표:** 후원하기가 **실제로 기록**되고, 후원자가 **내 후원 내역 + 진행 단계**를 확인하는 루프 완성.
결제는 없음(MVP=가상 리허설). 상세 규칙 → `공통 관리/후원 관련 정책 정리/후원 정책.md`.

> Step1(후원하기 조회)에서 표시용이던 `raisedAmount`를 **실제 후원 기록(Σ Contribution)**으로 전환.

---

## 구현 순서 (완료)

```
① 백엔드 Contribution + 상태 6단계  →  ② 시더 정리(0 시작·후원자·시연)
 →  ③ StatusTimeline  →  ④ 후원하기 실기록  →  ⑤ 내 후원 내역
```

---

## ① 백엔드 (Spring DDD)

- `contribution/` 도메인 (기부 원장, F-014)
  - `domain/Contribution.java` (물품 FK, 후원자 FK, 금액, status)
  - `domain/ContributionStatus.java` — `RECORDED` (결제 없이 기록. 차기: PAID/REFUNDED)
  - `infrastructure/ContributionRepository.java` — `findMineWithItemAndFacility`
  - `application/ContributionService.java` — 생성 시 `raisedAmount += 금액`, **목표 도달 시 자동 잠금(LOCKED)**
  - `presentation/ContributionController.java` — `POST /api/contributions`, `GET /api/contributions/me`
  - `dto/` — Create / Response / MyContributionResponse(물품·시설 요약 포함)
- `donation_item`
  - `ItemStatus` **6단계** 확장: RECRUITING · LOCKED · BUYING · SHIPPING · **RECEIVED** · **RECEIPTED**
  - `DonationItem`: `addRaised()` · `markLocked()` · `resetProgress()` — `raisedAmount = Σ Contribution` 유지
- `ErrorCode`: `CONTRIBUTION_NOT_ALLOWED`
- 인증: 후원 API는 로그인 필요(`@AuthenticationPrincipal`), 공개 조회는 GET permitAll 유지

## ② 시더 (데이터 정합성)

- `DonorUserSeeder`(@Order 6) — 후원자 **10명** (`donor01~10@test.com` / `test1234`, ROLE_DONOR)
- `FacilitySeeder` — 물품 **0원·RECRUITING**에서 시작 (하드코딩 진행값 제거)
- `ContributionSeeder`(@Order 7) — **첫 실행에만**: 기존 진행값 0 리셋 + 시연용 후원 몇 건
  - 햇살시설 물품0(42만/70% 진행중), 물품1(70만/**목표달성 자동잠금**), 나머지 0
  - 후원 데이터가 이미 있으면(테스트 시작 후) **건드리지 않음**

## ③ 프론트 — StatusTimeline

- `shared/ui/StatusTimeline.tsx` — 6단계 이행 타임라인(현재 단계까지 채움). 단계·색 단일 출처.

## ④ 프론트 — 후원하기 실기록

- `entities/contribution` (types + api: `create`, `getMine`)
- `features/donate/DonatePanel` — 토스트 → **실제 POST**
  - 비로그인 시 `/login` 유도, 성공 시 물품·내역 쿼리 invalidate
- `app/donate/items/[id]` — 진행률 아래 **StatusTimeline** 추가

## ⑤ 프론트 — 내 후원 내역

- `app/my-donations` — `RequireAuth` + 조회
- `features/my-donations/MyDonationsList` — **시설별 아코디언**
  - 시설별: 내 후원 합계 · 물품별(나의 후원 금액 / 총액·목표 진행률 / **진행 단계 타임라인**)

---

## 상태 6단계 (= 타임라인)

```
모집중(RECRUITING) → 목표달성(LOCKED) → 통합구매(BUYING)
→ 배송중(SHIPPING) → 수령확인(RECEIVED) → 영수증(RECEIPTED)
```
단계 전환 주체 = 시설/구매자. **MVP는 관리자(Tauri)가 물품 상태를 수동 전환** → 후원자 타임라인에 반영.

---

## 테스트 계정

| 계정 | 비번 | 역할 |
|---|---|---|
| `donor01@test.com` ~ `donor10@test.com` | `test1234` | 후원자(ROLE_DONOR) |

**테스트 흐름:** donor 로그인 → 물품 상세 후원하기 → "후원 기록됨" → `/my-donations`에서 내 후원 + 타임라인 → 여러 donor로 한 물품 채우면 목표 도달 시 자동 잠금.

---

## 범위 안 / 밖

| ✅ 이번(Step2) | ⛔ 다음 |
|---|---|
| 후원 참여 기록(결제 없이) | 실결제(PG) — 전문가 검토 관문 뒤 |
| raisedAmount = Σ Contribution | 취소·환불·초과입력 정합성 |
| 내 후원 내역 + 상태 타임라인 | 관리자용 상태 전환 흐름 UI, 통합구매·배송추적 |
| 자동 목표 잠금 | 영수증 발급·감사 메시지 |

---

## 검증 상태

- 백엔드 `BUILD SUCCESSFUL`, 웹 `tsc 0`.
- 재시작 후 시더 동작 확인(햇살시설 42만/70%, 겨울내복 70만/목표달성, 나머지 0), donor01 로그인 확인.

## 참고

- 정책: `공통 관리/후원 관련 정책 정리/후원 정책.md`
- 이전: `step1 후원하기 관련 구현 계획`
