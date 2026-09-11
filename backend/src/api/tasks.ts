import { Router } from "express";
import { createTaskSchema, taskFilterSchema, updateTaskSchema } from "../validation/task";
import * as taskService from "../services/taskService";
import * as activityService from "../services/activityService";

export const tasksRouter = Router();

tasksRouter.get("/projects/:projectId/tasks", async (req, res, next) => {
  try {
    const filter = taskFilterSchema.parse(req.query);
    const tasks = await taskService.listTasksByProject(req.params.projectId, filter);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

tasksRouter.post("/projects/:projectId/tasks", async (req, res, next) => {
  try {
    const input = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(req.params.projectId, input);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch("/tasks/:taskId", async (req, res, next) => {
  try {
    const input = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(req.params.taskId, input);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.get("/tasks/:taskId/activities", async (req, res, next) => {
  try {
    await taskService.getTaskOrThrow(req.params.taskId);
    const activities = await activityService.listActivitiesForTask(req.params.taskId);
    res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
});
