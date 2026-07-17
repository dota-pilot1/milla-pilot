package com.cj.donationplatform.user.presentation.dto;

import com.cj.donationplatform.role.presentation.dto.RoleSummary;
import com.cj.donationplatform.user.domain.User;

import java.util.List;

public record UserSummary(Long id, String email, String username, RoleSummary role, List<String> permissions) {
    public static UserSummary from(User u) {
        List<String> permCodes = u.getRole().getPermissions()
                .stream().map(p -> p.getCode()).toList();
        return new UserSummary(u.getId(), u.getEmail(), u.getUsername(), RoleSummary.from(u.getRole()), permCodes);
    }
}
