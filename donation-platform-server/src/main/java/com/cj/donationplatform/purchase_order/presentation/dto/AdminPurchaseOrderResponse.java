package com.cj.donationplatform.purchase_order.presentation.dto;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;

import java.time.Instant;
import java.time.LocalDate;

/** 관리자 전체 통합구매 목록 항목 — 구매 + 물품·시설 요약. */
public record AdminPurchaseOrderResponse(
        Long id,
        String vendor,
        String vendorUrl,
        Long purchasedAmount,
        Integer quantity,
        String evidenceNo,
        String evidenceFileUrl,
        String courier,
        String trackingNo,
        String shipmentImageUrl,
        LocalDate expectedDeliveryAt,
        Instant shippedAt,
        Instant orderedAt,
        ItemBrief item,
        FacilityBrief facility
) {
    public record ItemBrief(Long id, String name, String emoji, Long goalAmount, String status) {}
    public record FacilityBrief(Long id, String name) {}

    public static AdminPurchaseOrderResponse from(PurchaseOrder po) {
        DonationItem it = po.getDonationItem();
        var f = it.getFacility();
        return new AdminPurchaseOrderResponse(
                po.getId(), po.getVendor(), po.getVendorUrl(), po.getPurchasedAmount(), po.getQuantity(),
                po.getEvidenceNo(), po.getEvidenceFileUrl(),
                po.getCourier(), po.getTrackingNo(), po.getShipmentImageUrl(), po.getExpectedDeliveryAt(),
                po.getShippedAt(), po.getOrderedAt(),
                new ItemBrief(it.getId(), it.getName(), it.getEmoji(), it.getGoalAmount(), it.getStatus().name()),
                new FacilityBrief(f.getId(), f.getName())
        );
    }
}
