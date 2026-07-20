package com.cj.donationplatform.contribution.presentation.dto;

import jakarta.validation.constraints.NotBlank;

/** 결제 확정 요청 — 금액은 받지 않는다. 서버가 포트원에 직접 조회해 대조한다. */
public record ConfirmPaymentRequest(
        @NotBlank
        String paymentId
) {
}
