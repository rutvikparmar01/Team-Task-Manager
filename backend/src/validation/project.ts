import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: "Project name is required." })
    .trim()
    .min(1, "Project name is required.")
    .min(3, "Project name must be at least 3 characters.")
    .max(100, "Project name must be at most 100 characters."),
  description: z.string().trim().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
