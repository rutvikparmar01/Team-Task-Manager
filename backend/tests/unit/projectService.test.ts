import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectTestDb, clearTestDb } from "../testApp";
import * as projectService from "../../src/services/projectService";
import * as taskService from "../../src/services/taskService";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("projectService", () => {
  it("creates and lists projects", async () => {
    await projectService.createProject({ name: "One" });
    await projectService.createProject({ name: "Two" });

    const projects = await projectService.listProjects();
    expect(projects).toHaveLength(2);
  });

  it("computes progress as null when a project has no tasks", async () => {
    const project = await projectService.createProject({ name: "Empty" });
    const progress = await projectService.getProjectProgress(project._id.toString());
    expect(progress).toEqual({ totalTasks: 0, doneTasks: 0, progress: null });
  });

  it("computes progress as the proportion of Done tasks", async () => {
    const project = await projectService.createProject({ name: "Partial" });
    const projectId = project._id.toString();
    const t1 = await taskService.createTask(projectId, { title: "A" });
    await taskService.createTask(projectId, { title: "B" });
    await taskService.createTask(projectId, { title: "C" });
    await taskService.createTask(projectId, { title: "D" });
    await taskService.updateTask(t1._id.toString(), { status: "Done" });

    const progress = await projectService.getProjectProgress(projectId);
    expect(progress).toEqual({ totalTasks: 4, doneTasks: 1, progress: 0.25 });
  });

  it("reports full completion when every task is Done", async () => {
    const project = await projectService.createProject({ name: "Complete" });
    const projectId = project._id.toString();
    const t1 = await taskService.createTask(projectId, { title: "A" });
    await taskService.updateTask(t1._id.toString(), { status: "Done" });

    const progress = await projectService.getProjectProgress(projectId);
    expect(progress).toEqual({ totalTasks: 1, doneTasks: 1, progress: 1 });
  });
});
