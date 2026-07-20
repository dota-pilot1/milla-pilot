package com.cj.donationplatform.contribution.presentation.dto;

import com.cj.donationplatform.contribution.domain.Contribution;

import java.time.Instant;

public record ContributionResponse(
        Long id,
        Long donationItemId,
        Long amount,
        String status,
        String receiptUrl,
        Instant paidAt,
        Instant createdAt
) {
    public static ContributionResponse from(Contribution c) {
        return new ContributionResponse(
                c.getId(),
                c.getDonationItem().getId(),
                c.getAmount(),
                c.getStatus().name(),
                c.getReceiptUrl(),
                c.getPaidAt(),
                c.getCreatedAt()
        );
    }
}
