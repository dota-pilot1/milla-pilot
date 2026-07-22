import { api } from "@/shared/api/axios";
import type { ProjectTask, ProjectTaskPayload, ProjectTaskStatus } from "../model/types";

export const projectTaskApi = {
  getAll: () => api.get<ProjectTask[]>("/api/project-tasks").then((r) => r.data),
  create: (payload: ProjectTaskPayload) =>
    api.post<ProjectTask>("/api/project-tasks", payload).then((r) => r.data),
  update: (id: number, payload: ProjectTaskPayload) =>
    api.patch<ProjectTask>(`/api/project-tasks/${id}`, payload).then((r) => r.data),
  updateStatus: (id: number, status: ProjectTaskStatus) =>
    api.patch<ProjectTask>(`/api/project-tasks/${id}/status`, { status }).then((r) => r.data),
  delete: (id: number) => api.delete<void>(`/api/project-tasks/${id}`).then((r) => r.data),
};
