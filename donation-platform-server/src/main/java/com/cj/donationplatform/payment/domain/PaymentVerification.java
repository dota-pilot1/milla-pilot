package com.cj.donationplatform.payment.domain;

import java.time.Instant;

/**
 * 포트원 결제 단건 조회 결과 중 검증에 필요한 값만 추린 것.
 *
 * @param paymentId  우리가 발급해 결제창에 넘긴 식별자
 * @param status     포트원 결제 상태 (PAID / FAILED / CANCELLED / VIRTUAL_ACCOUNT_ISSUED / READY ...)
 * @param amount     실제 결제된 총액 — <b>서버가 만든 금액과 반드시 대조한다</b>
 * @param pgProvider 결제대행사 (kakaopay 등)
 * @param payMethod  결제수단 (EASY_PAY 등)
 * @param receiptUrl 영수증 URL
 * @param paidAt     승인 시각
 */
public record PaymentVerification(
        String paymentId,
        String status,
        long amount,
        String pgProvider,
        String payMethod,
        String receiptUrl,
        Instant paidAt
) {
    public boolean isPaid() {
        return "PAID".equalsIgnoreCase(status);
    }

    /**
     * 되돌릴 수 없이 끝난 상태인가.
     *
     * <p>{@code READY}·{@code PENDING} 등은 "실패"가 아니라 <b>"아직 승인 전"</b>이다.
     * 이를 실패로 취급하면, 확정을 폴링하는 동안 첫 조회에서 후원이 죽어버려
     * 실제 승인이 나도 반영할 수 없게 된다.
     */
    public boolean isTerminallyFailed() {
        return "FAILED".equalsIgnoreCase(status)
                || "CANCELLED".equalsIgnoreCase(status)
                || "CANCELED".equalsIgnoreCase(status);
    }
}
