package com.cj.donationplatform.contribution.presentation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateContributionRequest(
        @NotNull
        Long donationItemId,

        @NotNull
        @Positive
        Long amount
) {
}
