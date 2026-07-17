package com.cj.donationplatform.donation_item.presentation.dto;

import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemCategory;
import com.cj.donationplatform.donation_item.domain.ItemStatus;

import java.time.LocalDate;

public record DonationItemResponse(
        Long id,
        Long facilityId,
        String name,
        ItemCategory category,
        String note,
        String reason,
        String emoji,
        Long goalAmount,
        Long raisedAmount,
        Integer targetQuantity,
        ItemStatus status,
        LocalDate deadline,
        int displayOrder
) {
    public static DonationItemResponse from(DonationItem it) {
        return new DonationItemResponse(
                it.getId(), it.getFacility().getId(), it.getName(), it.getCategory(),
                it.getNote(), it.getReason(), it.getEmoji(), it.getGoalAmount(),
                it.getRaisedAmount(), it.getTargetQuantity(), it.getStatus(),
                it.getDeadline(), it.getDisplayOrder()
        );
    }
}
