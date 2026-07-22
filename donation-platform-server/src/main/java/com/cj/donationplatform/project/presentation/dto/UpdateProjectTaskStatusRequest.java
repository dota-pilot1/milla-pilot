package com.cj.donationplatform.project.presentation.dto;

import com.cj.donationplatform.project.domain.ProjectTaskStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateProjectTaskStatusRequest(
        @NotNull
        ProjectTaskStatus status
) {
}
