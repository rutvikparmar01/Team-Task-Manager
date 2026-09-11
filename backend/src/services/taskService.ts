import { TaskModel } from "../models/Task";
import { NotFoundError } from "../errors";
import { getProjectOrThrow } from "./projectService";
import { assertTeamMemberExists } from "./teamMemberService";
import * as activityService from "./activityService";
import type { CreateTaskInput, TaskFilterInput, UpdateTaskInput } from "../validation/task";

export async function createTask(projectId: string, input: CreateTaskInput) {
  await getProjectOrThrow(projectId);
  if (input.assigneeId) {
    await assertTeamMemberExists(input.assigneeId);
  }
  const task = await TaskModel.create({
    projectId,
    title: input.title,
    description: input.description,
    priority: input.priority ?? "Medium",
    assigneeId: input.assigneeId ?? null,
  });
  await activityService.recordActivity(task._id.toString(), "TaskCreated");
  return task;
}

export async function listTasksByProject(projectId: string, filter: TaskFilterInput) {
  await getProjectOrThrow(projectId);
  const query: Record<string, unknown> = { projectId };
  if (filter.status) query.status = filter.status;
  if (filter.priority) query.priority = filter.priority;
  return TaskModel.find(query).sort({ createdAt: 1 });
}

export async function getTaskOrThrow(taskId: string) {
  const task = await TaskModel.findById(taskId);
  if (!task) {
    throw new NotFoundError(`Task ${taskId} not found.`);
  }
  return task;
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const task = await getTaskOrThrow(taskId);

  const previousStatus = task.status;
  const previousPriority = task.priority;
  const previousAssigneeId = task.assigneeId ? task.assigneeId.toString() : null;

  if (input.status !== undefined) {
    task.status = input.status;
  }
  if (input.priority !== undefined) {
    task.priority = input.priority;
  }
  if (input.assigneeId !== undefined) {
    if (input.assigneeId === null) {
      task.assigneeId = undefined;
    } else {
      await assertTeamMemberExists(input.assigneeId);
      task.assigneeId = input.assigneeId as unknown as typeof task.assigneeId;
    }
  }

  await task.save();

  // One activity per field that actually changed — not one combined record — per
  // spec FR-003/FR-004 treating status and priority as separate activity categories, and
  // skipping any field that's a no-op (set to the value it already had).
  if (input.status !== undefined && input.status !== previousStatus) {
    await activityService.recordActivity(taskId, "StatusChanged", {
      fromStatus: previousStatus,
      toStatus: input.status,
    });
  }
  if (input.priority !== undefined && input.priority !== previousPriority) {
    await activityService.recordActivity(taskId, "PriorityChanged", {
      fromPriority: previousPriority,
      toPriority: input.priority,
    });
  }
  if (input.assigneeId !== undefined && input.assigneeId !== previousAssigneeId) {
    await activityService.recordActivity(taskId, "AssigneeChanged", {
      assigneeId: input.assigneeId,
    });
  }

  return task;
}
