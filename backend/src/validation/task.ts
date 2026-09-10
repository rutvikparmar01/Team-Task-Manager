import { z } from "zod";
import { PRIORITIES, STATUSES } from "../models/Task";

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Task title is required." })
    .trim()
    .min(1, "Task title is required."),
  description: z.string().trim().optional(),
  priority: z.enum(PRIORITIES).optional(),
  assigneeId: z.string().trim().min(1).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    status: z.enum(STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    assigneeId: z.string().trim().min(1).nullable().optional(),
  })
  .refine((body) => body.status !== undefined || body.priority !== undefined || body.assigneeId !== undefined, {
    message: "At least one of status, priority, or assigneeId is required.",
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskFilterSchema = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
