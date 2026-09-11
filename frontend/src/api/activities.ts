import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Activity } from "../types/api";

export function useTaskActivities(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["tasks", taskId, "activities"],
    queryFn: () => apiClient.get<Activity[]>(`/tasks/${taskId}/activities`),
    enabled,
  });
}
