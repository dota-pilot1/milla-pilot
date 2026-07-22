package com.cj.donationplatform.project.presentation;

import com.cj.donationplatform.project.application.ProjectTaskService;
import com.cj.donationplatform.project.presentation.dto.CreateProjectTaskRequest;
import com.cj.donationplatform.project.presentation.dto.ProjectTaskResponse;
import com.cj.donationplatform.project.presentation.dto.UpdateProjectTaskRequest;
import com.cj.donationplatform.project.presentation.dto.UpdateProjectTaskStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-tasks")
@RequiredArgsConstructor
@Tag(name = "ProjectTask", description = "프로젝트 관리 할 일 CRUD")
public class ProjectTaskController {

    private final ProjectTaskService projectTaskService;

    @GetMapping
    @Operation(summary = "프로젝트 할 일 목록 조회")
    public List<ProjectTaskResponse> list() {
        return projectTaskService.findAll().stream().map(ProjectTaskResponse::from).toList();
    }

    @PostMapping
    @Operation(summary = "프로젝트 할 일 등록")
    public ResponseEntity<ProjectTaskResponse> create(@Valid @RequestBody CreateProjectTaskRequest req) {
        ProjectTaskResponse created = ProjectTaskResponse.from(projectTaskService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "프로젝트 할 일 수정")
    public ProjectTaskResponse update(@PathVariable Long id, @Valid @RequestBody UpdateProjectTaskRequest req) {
        return ProjectTaskResponse.from(projectTaskService.update(id, req));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "프로젝트 할 일 완료 상태 변경")
    public ProjectTaskResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectTaskStatusRequest req
    ) {
        return ProjectTaskResponse.from(projectTaskService.updateStatus(id, req.status()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "프로젝트 할 일 삭제")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectTaskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
