# Step 3 — 후원 목표 금액 초과 방지 (정합성 · 동시성)

**목표:** 물품 목표금액을 **초과 후원**하지 못하게 막고, **동시 후원 레이스**에서도 초과가 발생하지 않도록 보장한다.
정책 근거 → `공통 관리/후원 관련 정책 정리/후원 정책.md`.

> 이 문서는 **구현 계획**(아직 미구현). 실제 착수 시 이 순서대로.

---

## 1. 문제 정의

물품 `raisedAmount(= Σ Contribution)`는 여러 후원자가 동시에 올리는 **공유 카운터**다. 두 종류의 문제가 있다.

1. **단순 초과** — 남은 금액이 12만인데 30만을 후원하면 목표를 넘김.
2. **동시성 레이스(TOCTOU)** — 두 후원자가 동시에 "남은 12만" 체크를 통과하고 둘 다 커밋 → 합계가 목표를 **초과(overshoot)**.

```
남은 = 120,000
[A]  check(100,000 ≤ 120,000) OK ─┐
[B]  check(100,000 ≤ 120,000) OK ─┘  둘 다 통과
[A]  commit +100,000
[B]  commit +100,000  → raised = 200,000 초과 ❌
```

---

## 2. 기획 근거

- **§15 핵심 지표**: "**목표잠금 후 중복구매 0건**", "후원자별 기록 대조 **100%**".
- **F-013**: 공동충당·**목표잠금**·한 번의 통합구매. 목표를 넘겨 모으면 통합구매 정합이 깨짐.
- 즉 초과 0 보장은 "있으면 좋은" 게 아니라 **파일럿 지표 자체**.

---

## 3. 해결 방식 비교

| 방식 | 내용 | 판단 |
|---|---|---|
| **비관적 락** `@Lock(PESSIMISTIC_WRITE)` | 후원 처리 시 물품 행을 잠가 동시 후원을 직렬화 | ✅ **채택** — MVP 트래픽에 단순·확실 |
| 낙관적 락 `@Version` + 재시도 | 충돌 시 예외 → 재시도 루프 | 트래픽 많을 때 유리하나 재시도 로직 부담 |
| 조건부 원자 UPDATE | `UPDATE ... SET raised=raised+:amt WHERE id=:id AND raised+:amt<=goal`, 영향 행 0이면 실패 | 견고하나 상태 전이(LOCKED)·기록 저장과 묶기 번거로움 |

> 채택 이유: 후원 물품당 동시 요청이 폭주하는 서비스가 아니고, 정합성이 지표라 **확실한 직렬화(비관적 락)**가 가장 안전.

---

## 4. 구현 계획

### 4.1 백엔드 (권위 검증)

1. **락 조회 추가** — `DonationItemRepository`
   ```java
   @Lock(LockModeType.PESSIMISTIC_WRITE)
   @Query("select d from DonationItem d where d.id = :id")
   Optional<DonationItem> findByIdForUpdate(@Param("id") Long id);
   ```
2. **`ContributionService.create` 수정** (이미 `@Transactional`)
   - `findById` → **`findByIdForUpdate`** (행 잠금, 트랜잭션 끝까지 유지)
   - 검증 순서:
     - 물품 `RECRUITING` 아니면 → `CONTRIBUTION_NOT_ALLOWED`
     - `long remaining = goalAmount - raisedAmount;`
     - `remaining <= 0` → 이미 목표달성 → 거부
     - **`amount > remaining` → `CONTRIBUTION_EXCEEDS_REMAINING`(신규)**
   - 통과 시 `addRaised(amount)`, `raised >= goal`이면 `markLocked()`
3. **ErrorCode 추가** — `CONTRIBUTION_EXCEEDS_REMAINING(400, "CONTRIB_002", "남은 금액을 초과했습니다.")`
   - 응답에 `remaining`을 함께 주면 프론트가 안내에 활용 가능(선택).

### 4.2 프론트 (UX 가드 — 권위 아님)

- `DonatePanel`
  - **남은 금액을 노출**(이미 있음)하고 입력 `max = remaining`.
  - 프리셋(1/3/5만) 중 **남은 금액 초과 버튼은 비활성** 또는 자동으로 "남은 전액"으로.
  - 서버가 `EXCEEDS_REMAINING` 주면 토스트로 "남은 금액 N까지 가능" 안내.
- ⚠️ 프론트 컷은 UX일 뿐, **막는 건 서버**다.

---

## 5. 엣지 케이스

| 상황 | 기대 동작 |
|---|---|
| 정확히 남은 금액만큼 후원 | 성공 → 목표 도달 → **자동 잠금(LOCKED)** |
| 남은 금액 초과 | 400 `EXCEEDS_REMAINING`, raised 변화 없음 |
| 이미 목표달성 물품 | 400 `NOT_ALLOWED` |
| 동시 2건(합계 초과) | 락으로 직렬화 → 하나 성공, 나머지 남은 0이면 거부 |
| 음수·0 금액 | 400 (기존 `@Positive` + 서비스 검증) |

---

## 6. 테스트 계획

- **단위/통합**: 남은 금액 = 100,000인 물품에
  - 100,001 후원 → 400
  - 100,000 후원 → 200 + status LOCKED
- **동시성**: 같은 물품에 여러 요청 동시 발사(합계 > 목표) → 최종 `raised ≤ goal`, 초과분 요청 400, `Σ Contribution == raised` 검증.

---

## 7. 범위 안 / 밖

| ✅ 이번(Step3) | ⛔ 밖 |
|---|---|
| 초과 후원 서버 차단 | 취소·환불 정합성(차기) |
| 동시성(비관적 락)으로 overshoot 0 | 분산 환경 다중 인스턴스 최적화 |
| 프론트 입력 가드 + 안내 | 실결제 연동 |

---

## 8. 참고

- 정책: `공통 관리/후원 관련 정책 정리/후원 정책.md`
- 선행: `구현 계획/1차 mvp/step2 내 후원 내역 페이지 구현 계획`
