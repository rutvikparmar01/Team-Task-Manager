import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { TeamMember } from "../types/api";

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: () => apiClient.get<TeamMember[]>("/team-members"),
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string }) => apiClient.post<TeamMember>("/team-members", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
  });
}
