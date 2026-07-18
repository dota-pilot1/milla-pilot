package com.cj.donationplatform.purchase_order.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** 송장 등록(step6) — 택배사·운송장번호(필수) + 송장이미지·배송예정일(선택). */
public record RegisterShipmentRequest(
        @NotBlank(message = "택배사를 선택하세요.") String courier,
        @NotBlank(message = "운송장번호를 입력하세요.") String trackingNo,
        @Size(max = 500) String shipmentImageUrl,
        LocalDate expectedDeliveryAt
) {}
