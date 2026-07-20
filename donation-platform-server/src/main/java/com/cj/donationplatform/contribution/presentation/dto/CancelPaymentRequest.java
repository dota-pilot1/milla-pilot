package com.cj.donationplatform.contribution.presentation.dto;

import jakarta.validation.constraints.NotBlank;

/** 결제창 이탈·실패 통보 — 선점을 즉시 해제하기 위한 요청 */
public record CancelPaymentRequest(
        @NotBlank
        String paymentId,

        String reason
) {
}
