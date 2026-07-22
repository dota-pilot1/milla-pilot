package com.cj.donationplatform.project.infrastructure;

import com.cj.donationplatform.project.domain.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {

    void deleteByTitleIn(Collection<String> titles);

    List<ProjectTask> findAllByOrderByStatusAscTaskGroupAscDisplayOrderAscIdAsc();
}
