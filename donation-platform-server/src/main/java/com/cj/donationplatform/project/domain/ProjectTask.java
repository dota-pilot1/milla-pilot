package com.cj.donationplatform.project.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "project_tasks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProjectTaskGroup taskGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectTaskStatus status = ProjectTaskStatus.TODO;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private int displayOrder = 0;

    @Column
    private Instant completedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static ProjectTask create(
            ProjectTaskGroup taskGroup,
            String title,
            String description,
            int displayOrder
    ) {
        ProjectTask task = new ProjectTask();
        task.taskGroup = taskGroup;
        task.title = title;
        task.description = description;
        task.displayOrder = displayOrder;
        return task;
    }

    public void update(ProjectTaskGroup taskGroup, String title, String description, int displayOrder) {
        this.taskGroup = taskGroup;
        this.title = title;
        this.description = description;
        this.displayOrder = displayOrder;
    }

    public void changeStatus(ProjectTaskStatus status) {
        this.status = status;
        this.completedAt = status == ProjectTaskStatus.DONE ? Instant.now() : null;
    }
}
