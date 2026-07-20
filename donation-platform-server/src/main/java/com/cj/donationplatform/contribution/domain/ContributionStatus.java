package com.cj.donationplatform.contribution.domain;

/**
 * 후원 참여 상태.
 *
 * <p>결제 흐름: {@link #PENDING} → (포트원 결제창) → {@link #PAID}
 * <br>서버는 프론트의 "결제 성공" 통보를 믿지 않고, 포트원 조회 API로 금액을 대조한 뒤 PAID 로 확정한다.
 *
 * <p>물품 raisedAmount 집계 대상은 {@link #RECORDED}, {@link #PAID} 뿐이다.
 * PENDING 은 모금액에 반영하지 않고, 잔여 계산에서만 "선점"으로 차감한다(동시 결제 초과 방지).
 */
public enum ContributionStatus {

    /** 사전등록 기록 (결제 도입 이전 데이터·시더). 집계 대상. */
    RECORDED,

    /** 결제 대기 — 결제창을 띄운 상태. 만료시각까지 잔여 금액을 선점한다. */
    PENDING,

    /** 결제 완료 — 포트원 조회로 금액 검증됨. 집계 대상. */
    PAID,

    /** 결제 실패 (승인 거절 등). */
    FAILED,

    /** 후원자가 결제창에서 취소. */
    CANCELED,

    /** 만료 — 결제창을 띄우고 제한 시간 내 결제하지 않음. 선점 해제. */
    EXPIRED,

    /** 환불 — 모금 미달 환급, 착오·중복 입금, 마감 전 취소. */
    REFUNDED;

    /** 물품 모금액에 반영되는 상태인가 */
    public boolean countsTowardRaised() {
        return this == RECORDED || this == PAID;
    }

    /** 잔여 금액을 선점 중인 상태인가 (아직 결제 전이지만 다른 후원자가 쓸 수 없음) */
    public boolean holdsRemaining() {
        return this == PENDING;
    }
}
