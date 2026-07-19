package com.cj.donationplatform.purchase_order.presentation.dto;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;

import java.time.Instant;
import java.time.LocalDate;

/** 후원자 공개 통합구매·배송 현황 항목. */
public record PublicPurchaseOrderResponse(
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

    public static PublicPurchaseOrderResponse from(PurchaseOrder po) {
        DonationItem item = po.getDonationItem();
        var facility = item.getFacility();
        return new PublicPurchaseOrderResponse(
                po.getId(),
                po.getVendor(),
                po.getVendorUrl(),
                po.getPurchasedAmount(),
                po.getQuantity(),
                po.getEvidenceNo(),
                po.getEvidenceFileUrl(),
                po.getCourier(),
                po.getTrackingNo(),
                po.getShipmentImageUrl(),
                po.getExpectedDeliveryAt(),
                po.getShippedAt(),
                po.getOrderedAt(),
                new ItemBrief(item.getId(), item.getName(), item.getEmoji(), item.getGoalAmount(), item.getStatus().name()),
                new FacilityBrief(facility.getId(), facility.getName())
        );
    }
}
