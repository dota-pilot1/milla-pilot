package com.cj.donationplatform.contribution.presentation.dto;

import com.cj.donationplatform.contribution.domain.Contribution;
import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemCategory;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.facility.domain.Facility;
import com.cj.donationplatform.purchase_order.domain.PurchaseOrder;

import java.time.Instant;
import java.time.LocalDate;

/**
 * 내 후원 내역 항목 — 내 참여 + 물품 진행(단계·진행률) + 시설 요약.
 * 프론트에서 facility 기준으로 그룹핑한다.
 */
public record MyContributionResponse(
        Long contributionId,
        Long myAmount,
        String status,
        Instant createdAt,
        Item item,
        FacilityBrief facility,
        PurchaseOrderBrief purchaseOrder
) {
    public record Item(
            Long id,
            String name,
            String emoji,
            ItemCategory category,
            ItemStatus status,
            Long goalAmount,
            Long raisedAmount,
            String note
    ) {}

    public record FacilityBrief(
            Long id,
            String name,
            String avatarInitial,
            String region
    ) {}

    public record PurchaseOrderBrief(
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
        public static PurchaseOrderBrief from(PurchaseOrder po) {
            if (po == null) {
                return null;
            }
            return new PurchaseOrderBrief(
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

    public static MyContributionResponse from(Contribution c) {
        return from(c, null);
    }

    public static MyContributionResponse from(Contribution c, PurchaseOrder purchaseOrder) {
        DonationItem it = c.getDonationItem();
        Facility f = it.getFacility();
        return new MyContributionResponse(
                c.getId(),
                c.getAmount(),
                c.getStatus().name(),
                c.getCreatedAt(),
                new Item(it.getId(), it.getName(), it.getEmoji(), it.getCategory(),
                        it.getStatus(), it.getGoalAmount(), it.getRaisedAmount(), it.getNote()),
                new FacilityBrief(f.getId(), f.getName(), f.getAvatarInitial(), f.getRegion()),
                PurchaseOrderBrief.from(purchaseOrder)
        );
    }
}
