import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Priority, Status, Task, TaskFilter } from "../types/api";

export function useProjectTasks(projectId: string, filter: TaskFilter = {}) {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.priority) params.set("priority", filter.priority);
  const qs = params.toString();

  return useQuery({
    queryKey: ["projects", projectId, "tasks", filter],
    queryFn: () => apiClient.get<Task[]>(`/projects/${projectId}/tasks${qs ? `?${qs}` : ""}`),
    enabled: Boolean(projectId),
  });
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  assigneeId?: string;
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      apiClient.post<Task>(`/projects/${projectId}/tasks`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "progress"] });
    },
  });
}

export interface UpdateTaskInput {
  status?: Status;
  priority?: Priority;
  assigneeId?: string | null;
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...input }: UpdateTaskInput & { taskId: string }) =>
      apiClient.patch<Task>(`/tasks/${taskId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "progress"] });
    },
  });
}
