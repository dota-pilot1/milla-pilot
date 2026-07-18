package com.cj.donationplatform.contribution.presentation.dto;

import com.cj.donationplatform.contribution.domain.Contribution;
import com.cj.donationplatform.donation_item.domain.DonationItem;
import com.cj.donationplatform.donation_item.domain.ItemCategory;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import com.cj.donationplatform.facility.domain.Facility;

import java.time.Instant;

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
        FacilityBrief facility
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

    public static MyContributionResponse from(Contribution c) {
        DonationItem it = c.getDonationItem();
        Facility f = it.getFacility();
        return new MyContributionResponse(
                c.getId(),
                c.getAmount(),
                c.getStatus().name(),
                c.getCreatedAt(),
                new Item(it.getId(), it.getName(), it.getEmoji(), it.getCategory(),
                        it.getStatus(), it.getGoalAmount(), it.getRaisedAmount(), it.getNote()),
                new FacilityBrief(f.getId(), f.getName(), f.getAvatarInitial(), f.getRegion())
        );
    }
}
