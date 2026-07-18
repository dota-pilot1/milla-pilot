package com.cj.donationplatform.purchase_order.presentation.dto;

import com.cj.donationplatform.donation_item.domain.DonationItem;

/** 통합구매 대기 물품 — 목표달성(LOCKED) 상태, 아직 구매 안 됨. */
public record PendingPurchaseItemResponse(
        Long itemId,
        String name,
        String emoji,
        Long goalAmount,
        Long raisedAmount,
        FacilityBrief facility
) {
    public record FacilityBrief(Long id, String name) {}

    public static PendingPurchaseItemResponse from(DonationItem it) {
        var f = it.getFacility();
        return new PendingPurchaseItemResponse(
                it.getId(), it.getName(), it.getEmoji(),
                it.getGoalAmount(), it.getRaisedAmount(),
                new FacilityBrief(f.getId(), f.getName())
        );
    }
}
