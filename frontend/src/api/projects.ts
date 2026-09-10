import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Project, ProjectProgress } from "../types/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient.get<Project[]>("/projects"),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      apiClient.post<Project>("/projects", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useProjectProgress(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "progress"],
    queryFn: () => apiClient.get<ProjectProgress>(`/projects/${projectId}/progress`),
  });
}
