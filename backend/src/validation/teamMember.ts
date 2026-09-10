import { z } from "zod";

export const createTeamMemberSchema = z.object({
  name: z
    .string({ required_error: "Team member name is required." })
    .trim()
    .min(1, "Team member name is required."),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
