package com.cj.donationplatform.facility.presentation.dto;

import com.cj.donationplatform.facility.domain.FacilityStatus;
import com.cj.donationplatform.facility.domain.FacilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFacilityRequest(
        @NotBlank
        @Size(max = 100)
        String code,

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 100)
        String region,

        @NotNull
        FacilityType type,

        @Size(max = 500)
        String description,

        /** null 이면 RECRUITING 으로 설정 */
        FacilityStatus status,

        boolean verified,

        @Size(max = 4)
        String avatarInitial,

        int displayOrder
) {
}
