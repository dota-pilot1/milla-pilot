package com.cj.donationplatform.facility.presentation.dto;

import com.cj.donationplatform.facility.domain.Facility;
import com.cj.donationplatform.facility.domain.FacilityStatus;
import com.cj.donationplatform.facility.domain.FacilityType;

public record FacilityResponse(
        Long id,
        String code,
        String name,
        String region,
        FacilityType type,
        String description,
        FacilityStatus status,
        boolean verified,
        String avatarInitial,
        int displayOrder
) {
    public static FacilityResponse from(Facility f) {
        return new FacilityResponse(
                f.getId(), f.getCode(), f.getName(), f.getRegion(), f.getType(),
                f.getDescription(), f.getStatus(), f.isVerified(),
                f.getAvatarInitial(), f.getDisplayOrder()
        );
    }
}
