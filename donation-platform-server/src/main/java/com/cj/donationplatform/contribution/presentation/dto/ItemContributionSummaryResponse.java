package com.cj.donationplatform.contribution.presentation.dto;

import com.cj.donationplatform.contribution.domain.Contribution;

import java.time.Instant;
import java.util.List;

/**
 * 물품별 참여 현황 (후원자 공개용).
 *
 * <p>후원자 실명은 노출하지 않는다 — 개인정보이므로 {@code 홍*동} 형태로 마스킹한다.
 */
public record ItemContributionSummaryResponse(
        long donorCount,
        List<RecentContribution> recent
) {
    public record RecentContribution(
            String donorName,
            Long amount,
            Instant createdAt
    ) {
        static RecentContribution from(Contribution c) {
            return new RecentContribution(mask(c.getDonor().getUsername()), c.getAmount(), c.getCreatedAt());
        }
    }

    public static ItemContributionSummaryResponse of(long donorCount, List<Contribution> recent) {
        return new ItemContributionSummaryResponse(
                donorCount,
                recent.stream().map(RecentContribution::from).toList());
    }

    /** 홍길동 → 홍*동, 김철 → 김*, 김 → * */
    static String mask(String name) {
        if (name == null || name.isBlank()) return "익명";
        String trimmed = name.trim();
        if (trimmed.length() == 1) return "*";
        if (trimmed.length() == 2) return trimmed.charAt(0) + "*";
        return trimmed.charAt(0)
                + "*".repeat(trimmed.length() - 2)
                + trimmed.charAt(trimmed.length() - 1);
    }
}
