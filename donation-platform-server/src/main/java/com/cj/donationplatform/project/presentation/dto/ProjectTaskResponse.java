package com.cj.donationplatform.project.presentation.dto;

import com.cj.donationplatform.project.domain.ProjectTask;
import com.cj.donationplatform.project.domain.ProjectTaskGroup;
import com.cj.donationplatform.project.domain.ProjectTaskStatus;

import java.time.Instant;

public record ProjectTaskResponse(
        Long id,
        ProjectTaskGroup taskGroup,
        ProjectTaskStatus status,
        String title,
        String description,
        int displayOrder,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProjectTaskResponse from(ProjectTask task) {
        return new ProjectTaskResponse(
                task.getId(),
                task.getTaskGroup(),
                task.getStatus(),
                task.getTitle(),
                task.getDescription(),
                task.getDisplayOrder(),
                task.getCompletedAt(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
