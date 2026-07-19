package com.cj.donationplatform.purchase_order.presentation.dto;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;

import java.time.Instant;
import java.time.LocalDate;

/** 후원자 공개 구매·배송 모니터링 항목 — 구매 대기와 구매 이후 단계를 함께 표현한다. */
public record PublicPurchaseMonitoringResponse(
        Long itemId,
        Long purchaseOrderId,
        String phase,
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
    public record ItemBrief(
            Long id,
            String name,
            String emoji,
            Long goalAmount,
            Long raisedAmount,
            String status
    ) {}

    public record FacilityBrief(Long id, String name) {}

    public static PublicPurchaseMonitoringResponse pending(DonationItem item) {
        var facility = item.getFacility();
        return new PublicPurchaseMonitoringResponse(
                item.getId(),
                null,
                "PENDING_PURCHASE",
                null,
                null,
                null,
                item.getTargetQuantity(),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                itemBrief(item),
                new FacilityBrief(facility.getId(), facility.getName())
        );
    }

    public static PublicPurchaseMonitoringResponse from(PurchaseOrder po) {
        DonationItem item = po.getDonationItem();
        var facility = item.getFacility();
        return new PublicPurchaseMonitoringResponse(
                item.getId(),
                po.getId(),
                phase(item.getStatus()),
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
                itemBrief(item),
                new FacilityBrief(facility.getId(), facility.getName())
        );
    }

    private static ItemBrief itemBrief(DonationItem item) {
        return new ItemBrief(
                item.getId(),
                item.getName(),
                item.getEmoji(),
                item.getGoalAmount(),
                item.getRaisedAmount(),
                item.getStatus().name()
        );
    }

    private static String phase(ItemStatus status) {
        return switch (status) {
            case SHIPPING -> "SHIPPING";
            case RECEIVED, RECEIPTED -> "RECEIVED";
            default -> "PURCHASE_COMPLETED";
        };
    }
}
