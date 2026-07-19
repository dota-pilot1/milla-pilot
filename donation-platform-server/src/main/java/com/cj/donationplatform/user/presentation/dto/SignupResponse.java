package com.cj.donationplatform.user.presentation.dto;

import com.cj.donationplatform.role.presentation.dto.RoleSummary;
import com.cj.donationplatform.user.domain.User;

import java.time.Instant;

public record SignupResponse(
        Long id,
        String email,
        String username,
        String phoneNumber,
        RoleSummary role,
        Instant createdAt
) {
    public static SignupResponse from(User u) {
        return new SignupResponse(u.getId(), u.getEmail(), u.getUsername(), u.getPhoneNumber(), RoleSummary.from(u.getRole()), u.getCreatedAt());
    }
}
