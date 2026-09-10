import { Router } from "express";
import { createProjectSchema } from "../validation/project";
import * as projectService from "../services/projectService";

export const projectsRouter = Router();

projectsRouter.get("/", async (_req, res, next) => {
  try {
    const projects = await projectService.listProjects();
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const input = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(input);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:projectId/progress", async (req, res, next) => {
  try {
    const progress = await projectService.getProjectProgress(req.params.projectId);
    res.status(200).json(progress);
  } catch (err) {
    next(err);
  }
});
