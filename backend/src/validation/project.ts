import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: "Project name is required." })
    .trim()
    .min(1, "Project name is required."),
  description: z.string().trim().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
