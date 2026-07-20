package com.cj.donationplatform.contribution.presentation.dto;

import com.cj.donationplatform.contribution.domain.Contribution;
import com.cj.donationplatform.payment.config.PortOneProperties;

import java.time.Instant;

/**
 * 결제 대기 생성 응답 — 프론트가 이 값들로 포트원 결제창을 띄운다.
 * storeId·channelKey 는 브라우저에 노출되는 공개 값이다(비밀값 아님).
 */
public record InitiatePaymentResponse(
        Long contributionId,
        String paymentId,
        String orderName,
        Long amount,
        String storeId,
        String channelKey,
        Instant expiresAt
) {
    public static InitiatePaymentResponse of(Contribution c, PortOneProperties props) {
        return new InitiatePaymentResponse(
                c.getId(),
                c.getPaymentId(),
                c.getDonationItem().getName(),
                c.getAmount(),
                props.storeId(),
                props.channelKey(),
                c.getExpiresAt()
        );
    }
}
