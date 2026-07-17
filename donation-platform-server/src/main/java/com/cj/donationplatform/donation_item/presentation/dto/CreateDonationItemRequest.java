package com.cj.donationplatform.donation_item.presentation.dto;

import com.cj.donationplatform.donation_item.domain.ItemCategory;
import com.cj.donationplatform.donation_item.domain.ItemStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateDonationItemRequest(
        @NotNull
        Long facilityId,

        @NotBlank
        @Size(max = 150)
        String name,

        @NotNull
        ItemCategory category,

        @Size(max = 150)
        String note,

        @Size(max = 1000)
        String reason,

        @Size(max = 10)
        String emoji,

        @NotNull
        @PositiveOrZero
        Long goalAmount,

        @PositiveOrZero
        Long raisedAmount,

        Integer targetQuantity,

        /** null 이면 RECRUITING 으로 설정 */
        ItemStatus status,

        LocalDate deadline,

        int displayOrder
) {
}
