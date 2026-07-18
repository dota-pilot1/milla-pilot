package com.cj.donationplatform.contribution.presentation.dto;

import com.cj.donationplatform.contribution.domain.Contribution;
import com.cj.donationplatform.donation_item.domain.DonationItem;

import java.time.Instant;

/**
 * 관리자 전체 후원 내역(기부 원장) 항목 — 후원자·시설·물품·금액·일시.
 * 후원자(성인) 정보는 관리자만 조회한다.
 */
public record AdminLedgerResponse(
        Long id,
        Long amount,
        Instant createdAt,
        Donor donor,
        FacilityBrief facility,
        ItemBrief item
) {
    public record Donor(Long id, String username, String email) {}
    public record FacilityBrief(Long id, String name) {}
    public record ItemBrief(Long id, String name, String emoji) {}

    public static AdminLedgerResponse from(Contribution c) {
        var d = c.getDonor();
        DonationItem it = c.getDonationItem();
        var f = it.getFacility();
        return new AdminLedgerResponse(
                c.getId(),
                c.getAmount(),
                c.getCreatedAt(),
                new Donor(d.getId(), d.getUsername(), d.getEmail()),
                new FacilityBrief(f.getId(), f.getName()),
                new ItemBrief(it.getId(), it.getName(), it.getEmoji())
        );
    }
}
