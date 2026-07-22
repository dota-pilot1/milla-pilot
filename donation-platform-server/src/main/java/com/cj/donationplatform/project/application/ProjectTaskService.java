package com.cj.donationplatform.project.application;

import com.cj.donationplatform.common.exception.BusinessException;
import com.cj.donationplatform.common.exception.ErrorCode;
import com.cj.donationplatform.project.domain.ProjectTask;
import com.cj.donationplatform.project.infrastructure.ProjectTaskRepository;
import com.cj.donationplatform.project.presentation.dto.CreateProjectTaskRequest;
import com.cj.donationplatform.project.presentation.dto.UpdateProjectTaskRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectTaskService {

    private final ProjectTaskRepository projectTaskRepository;

    @Transactional(readOnly = true)
    public List<ProjectTask> findAll() {
        return projectTaskRepository.findAllByOrderByStatusAscTaskGroupAscDisplayOrderAscIdAsc();
    }

    @Transactional(readOnly = true)
    public ProjectTask getById(Long id) {
        return projectTaskRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_TASK_NOT_FOUND));
    }

    @Transactional
    public ProjectTask create(CreateProjectTaskRequest req) {
        return projectTaskRepository.save(ProjectTask.create(
                req.taskGroup(),
                req.title(),
                req.description(),
                req.displayOrder()
        ));
    }

    @Transactional
    public ProjectTask update(Long id, UpdateProjectTaskRequest req) {
        ProjectTask task = getById(id);
        task.update(req.taskGroup(), req.title(), req.description(), req.displayOrder());
        return task;
    }

    @Transactional
    public ProjectTask updateStatus(Long id, com.cj.donationplatform.project.domain.ProjectTaskStatus status) {
        ProjectTask task = getById(id);
        task.changeStatus(status);
        return task;
    }

    @Transactional
    public void delete(Long id) {
        projectTaskRepository.delete(getById(id));
    }
}
