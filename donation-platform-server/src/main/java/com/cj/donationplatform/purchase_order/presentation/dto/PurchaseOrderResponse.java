package com.cj.donationplatform.purchase_order.presentation.dto;

import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;

import java.time.Instant;
import java.time.LocalDate;

public record PurchaseOrderResponse(
        Long id,
        Long donationItemId,
        String vendor,
        String vendorUrl,
        Long purchasedAmount,
        Integer quantity,
        String evidenceNo,
        String evidenceFileUrl,
        String note,
        String courier,
        String trackingNo,
        String shipmentImageUrl,
        LocalDate expectedDeliveryAt,
        Instant shippedAt,
        Instant orderedAt,
        Instant createdAt
) {
    public static PurchaseOrderResponse from(PurchaseOrder po) {
        return new PurchaseOrderResponse(
                po.getId(),
                po.getDonationItem().getId(),
                po.getVendor(),
                po.getVendorUrl(),
                po.getPurchasedAmount(),
                po.getQuantity(),
                po.getEvidenceNo(),
                po.getEvidenceFileUrl(),
                po.getNote(),
                po.getCourier(),
                po.getTrackingNo(),
                po.getShipmentImageUrl(),
                po.getExpectedDeliveryAt(),
                po.getShippedAt(),
                po.getOrderedAt(),
                po.getCreatedAt()
        );
    }
}
