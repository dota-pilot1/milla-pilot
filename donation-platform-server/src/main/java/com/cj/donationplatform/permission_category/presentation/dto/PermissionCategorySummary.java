package com.cj.donationplatform.permission_category.presentation.dto;

import com.cj.donationplatform.permission_category.domain.PermissionCategory;

public record PermissionCategorySummary(Long id, String code, String name) {
    public static PermissionCategorySummary from(PermissionCategory c) {
        return new PermissionCategorySummary(c.getId(), c.getCode(), c.getName());
    }
}
