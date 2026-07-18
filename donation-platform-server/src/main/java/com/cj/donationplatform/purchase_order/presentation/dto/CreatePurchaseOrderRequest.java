package com.cj.donationplatform.purchase_order.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

public record CreatePurchaseOrderRequest(
        @NotBlank
        @Size(max = 200)
        String vendor,

        @Size(max = 500)
        String vendorUrl,

        @NotNull
        @PositiveOrZero
        Long purchasedAmount,

        /** 구매 수량 — 선택 */
        @PositiveOrZero
        Integer quantity,

        @Size(max = 200)
        String evidenceNo,

        @Size(max = 500)
        String evidenceFileUrl,

        @Size(max = 500)
        String note,

        /** null 이면 현재 시각 */
        Instant orderedAt,

        // --- 송장(선택) — 구매 시점에 알면 함께 기록. 채워지면 배송중으로 전환 ---
        @Size(max = 60)
        String courier,

        @Size(max = 60)
        String trackingNo,

        @Size(max = 500)
        String shipmentImageUrl,

        LocalDate expectedDeliveryAt
) {
}
