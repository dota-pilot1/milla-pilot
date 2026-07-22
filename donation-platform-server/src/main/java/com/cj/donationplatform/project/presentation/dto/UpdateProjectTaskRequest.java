package com.cj.donationplatform.project.presentation.dto;

import com.cj.donationplatform.project.domain.ProjectTaskGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateProjectTaskRequest(
        @NotNull
        ProjectTaskGroup taskGroup,

        @NotBlank
        @Size(max = 120)
        String title,

        @Size(max = 500)
        String description,

        int displayOrder
) {
}
