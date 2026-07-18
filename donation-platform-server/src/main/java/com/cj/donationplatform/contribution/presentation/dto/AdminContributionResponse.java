package com.cj.donationplatform.contribution.presentation.dto;

import com.cj.donationplatform.contribution.domain.Contribution;

import java.time.Instant;

/**
 * 관리자용 기부 원장 항목 — 후원자·금액·일시.
 * 후원자(성인) 정보는 관리자만 조회. 공개 웹에 노출하지 않는다.
 */
public record AdminContributionResponse(
        Long id,
        Long amount,
        Instant createdAt,
        Donor donor
) {
    public record Donor(Long id, String username, String email) {}

    public static AdminContributionResponse from(Contribution c) {
        var d = c.getDonor();
        return new AdminContributionResponse(
                c.getId(),
                c.getAmount(),
                c.getCreatedAt(),
                new Donor(d.getId(), d.getUsername(), d.getEmail())
        );
    }
}
