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

describe("taskService", () => {
  it("defaults priority to Medium and status to Todo on creation", async () => {
    const project = await projectService.createProject({ name: "Demo" });
    const task = await taskService.createTask(project._id.toString(), { title: "Task" });
    expect(task.priority).toBe("Medium");
    expect(task.status).toBe("Todo");
  });

  it("treats updating status to its current value as a no-op", async () => {
    const project = await projectService.createProject({ name: "Demo" });
    const created = await taskService.createTask(project._id.toString(), { title: "Task" });
    const updated = await taskService.updateTask(created._id.toString(), { status: "Todo" });
    expect(updated.status).toBe("Todo");
  });

  it("allows moving status backward from Done to Todo", async () => {
    const project = await projectService.createProject({ name: "Demo" });
    const created = await taskService.createTask(project._id.toString(), { title: "Task" });
    await taskService.updateTask(created._id.toString(), { status: "Done" });
    const reverted = await taskService.updateTask(created._id.toString(), { status: "Todo" });
    expect(reverted.status).toBe("Todo");
  });
});
