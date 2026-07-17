# Step 1 — 후원하기 페이지 구현 계획

**목표:** `후원하기 → 시설물 목록 → 클릭 → 후원 구매 물품 목록` 을 만든다.
데이터는 **Tauri 앱에서 CRUD**, 화면은 **웹에서 출력**. 결제·후원참여는 이번 범위 밖.

> 구조: Spring(DDD) 공유 백엔드 + Tauri(관리) + 웹(출력). 기존 `role`/`menu` 도메인을 템플릿으로 복제.
> DB 상세 → `디비 설계 계획 및 erd/` 참고.

---

## 진행 순서 (의존성 순)

```
① DB/백엔드  →  ② Tauri CRUD  →  ③ 웹 엔티티·API  →  ④ 웹 후원하기 페이지
```

---

## ① 백엔드 (Spring DDD) — `role` 도메인 복제

**테이블 2개:** `facilities` 1 : N `donation_items`

- [ ] `facility/` 도메인
  - [ ] `domain/Facility.java` (엔티티)
  - [ ] `infrastructure/FacilityRepository.java`
  - [ ] `application/FacilityService.java`
  - [ ] `presentation/FacilityController.java` + `dto/`
- [ ] `donation_item/` 도메인 (FK → facility)
  - [ ] `domain/DonationItem.java`
  - [ ] `infrastructure/DonationItemRepository.java`
  - [ ] `application/DonationItemService.java`
  - [ ] `presentation/DonationItemController.java` + `dto/`
- [ ] `config/FacilitySeeder.java` — 샘플 데이터(목업 4개 시설)
- [ ] 엔드포인트 2결 분리
  - 공개 조회(웹): `GET /api/facilities`, `GET /api/facilities/{id}`, `GET /api/facilities/{id}/items`
  - 관리 CRUD(Tauri): `POST/PUT/DELETE /api/admin/facilities`, `.../donation-items`

## ② Tauri 관리 앱 — CRUD

- [ ] `entities/facility`, `entities/donation-item` (타입 + API)
- [ ] `features/facility-management` (시설물 생성·수정·삭제)
- [ ] `features/donation-item-management` (시설별 물품 관리)
- [ ] `pages/` + 헤더 메뉴 추가 (MenuSeeder + 라우팅)

## ③ 웹 front — 엔티티·API (읽기 전용)

- [ ] `entities/facility`, `entities/donation-item` (타입 + queryFn)
- [ ] `shared/api/axios` 로 공개 조회 엔드포인트 연결

## ④ 웹 후원하기 페이지

- [ ] `pages/donate` — 시설물 목록 (`with claude.html` 목업이 디자인 기준)
- [ ] `pages/donate-facility-detail` — 물품 목록
- [ ] 헤더 메뉴 "후원하기" 추가

---

## 라우트 맵

| 화면 | 웹 라우트 | 데이터 |
|---|---|---|
| 시설물 목록 | `/donate` | `GET /api/facilities` |
| 물품 목록 | `/donate/facilities/{id}` | `GET /api/facilities/{id}/items` |
| (차기) 물품 상세 | `/donate/items/{id}` | — |

---

## 이번 범위 안 / 밖

| ✅ 이번 스텝 | ⛔ 다음 스텝 |
|---|---|
| 시설물 CRUD (Tauri) | 후원 참여(Contribution)·결제 |
| 물품 CRUD (Tauri) | 목표 잠금·통합구매·배송추적 |
| 시설·물품 목록 조회 출력 (웹) | 내 후원 내역 `/my-donations` |

> `raised_amount`(모인금액)은 이번엔 **표시용 필드**. 실제 결제 스텝에서 `Σ Contribution` 으로 대체.

---

## 기획안 제약 (UI 반영)

- 아동 정보 0노출 — 품목 중심 (F-005·F-020)
- 후원금 시설 전용계좌 직접 귀속 안내
- 진행률 = 실제 구매 총액 기준 (추상 모금 목표 금지, F-013)
- "100% 전달" 등 보장 문구 금지 (D-003 미결)
- 사전등록·리허설 단계 배너 상시 (F-012·F-016)

---

## 참고 소스

- 디자인 기준: `../후원하기 페이지 기본 with claude.html` (인터랙티브 목업 v2)
- 원본 계획서: `../후원하기 페이지 기본 with gpt.html`
- DB 설계: `디비 설계 계획 및 erd/디비 설계 컨셉.html`, `erd.mmd`
